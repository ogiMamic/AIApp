import { NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";

const VALID_MODELS = ["gpt-3.5-turbo", "gpt-4-turbo-preview", "gpt-4"];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agents = await prismadb.agent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.log("[AGENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const content = await request.json();
    const {
      action,
      agentId,
      name,
      description,
      instructions,
      message,
      model,
      knowledgeId,
    } = content;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      ["generate", "create", "update"].includes(action) &&
      !VALID_MODELS.includes(model)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid model specified" },
        { status: 400 }
      );
    }

    switch (action) {
      case "generate":
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: instructions || "You are a helpful assistant.",
            },
            { role: "user", content: message },
          ],
        });

        return NextResponse.json({
          success: true,
          response: completion.choices[0].message.content,
        });

      case "create":
        const newAssistant = await openai.beta.assistants.create({
          name,
          description,
          instructions,
          model,
          tools: [{ type: "code_interpreter" }, { type: "file_search" }],
        });

        const agent = await prismadb.agent.create({
          data: {
            name,
            description,
            instructions,
            openai_assistant_id: newAssistant.id,
          },
        });

        return NextResponse.json({ success: true, agent });

      case "update":
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: "Agent ID is required for update" },
            { status: 400 }
          );
        }

        const existingAgent = await prismadb.agent.findUnique({
          where: { id: agentId },
        });

        if (!existingAgent) {
          return NextResponse.json(
            { success: false, error: "Agent not found" },
            { status: 404 }
          );
        }

        const updatedAssistant = await openai.beta.assistants.update(
          existingAgent.openai_assistant_id,
          {
            name,
            description,
            instructions,
            model,
          }
        );

        const updatedAgent = await prismadb.agent.update({
          where: { id: agentId },
          data: {
            name,
            description,
            instructions,
            openai_assistant_id: updatedAssistant.id,
          },
        });

        return NextResponse.json({
          success: true,
          agent: updatedAgent,
        });

      case "list":
        const agents = await prismadb.agent.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });

        return NextResponse.json({
          success: true,
          agents,
        });

      case "delete":
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: "Agent ID is required for deletion" },
            { status: 400 }
          );
        }

        try {
          const agentToDelete = await prismadb.agent.findUnique({
            where: { id: agentId },
          });

          if (!agentToDelete) {
            return NextResponse.json(
              { success: false, error: "Agent not found" },
              { status: 404 }
            );
          }

          if (agentToDelete.openai_assistant_id) {
            await openai.beta.assistants.del(agentToDelete.openai_assistant_id);
          }

          await prismadb.agent.delete({
            where: { id: agentId },
          });

          return NextResponse.json({
            success: true,
            message: "Agent deleted successfully",
          });
        } catch (deleteError) {
          console.error("Error deleting agent:", deleteError);
          return NextResponse.json(
            {
              success: false,
              error: `Failed to delete agent: ${deleteError.message}`,
            },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in agent API:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
