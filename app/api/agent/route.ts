import { NextResponse } from "next/server";
import OpenAI from "openai";

const VALID_MODELS = ["gpt-3.5-turbo", "gpt-4-turbo-preview", "gpt-4"];

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const assistants = await openai.beta.assistants.list({
      limit: 100, // Прилагодите по потреби
    });

    return NextResponse.json({
      success: true,
      agents: assistants.data,
    });
  } catch (error) {
    console.error("Error fetching agents:", error);

    let errorMessage = "An unknown error occurred while fetching agents";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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

        // Here you would typically save the assistant details to your database
        // For example: await saveAssistantToDatabase(newAssistant);

        return NextResponse.json({ success: true, assistant: newAssistant });

      case "update":
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: "Agent ID is required for update" },
            { status: 400 }
          );
        }

        const updatedAssistant = await openai.beta.assistants.update(agentId, {
          name,
          description,
          instructions,
          model,
        });

        // Here you would typically update the assistant details in your database
        // For example: await updateAssistantInDatabase(updatedAssistant);

        return NextResponse.json({
          success: true,
          assistant: updatedAssistant,
        });

      case "list":
        const assistants = await openai.beta.assistants.list({
          limit: 100, // Adjust as needed
        });

        return NextResponse.json({
          success: true,
          assistants: assistants.data,
        });

      case "delete":
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: "Agent ID is required for deletion" },
            { status: 400 }
          );
        }

        try {
          await openai.beta.assistants.del(agentId);

          // Here you would typically delete the assistant from your database
          // For example: await deleteAssistantFromDatabase(agentId);

          return NextResponse.json({
            success: true,
            message: "Assistant deleted successfully",
          });
        } catch (deleteError) {
          console.error("Error deleting assistant:", deleteError);

          let errorMessage =
            "An unknown error occurred while deleting the assistant";

          if (deleteError instanceof Error) {
            errorMessage = deleteError.message;
          } else if (typeof deleteError === "string") {
            errorMessage = deleteError;
          }

          return NextResponse.json(
            {
              success: false,
              error: `Failed to delete assistant: ${errorMessage}`,
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

    let errorMessage = "An unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
