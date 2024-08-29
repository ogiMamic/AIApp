import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    console.log("Body:", body);
    const { messages, agent } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages || messages.length === 0) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const assistantId = agent.openai_assistant_id;

    if (!assistantId) {
      return new NextResponse("Assistant ID is missing", { status: 400 });
    }

    // Step 1: Create a thread
    console.log("Creating a thread...");

    const thread = await openai.beta.threads.create();
    const threadId = thread.id;

    // Step 2: Add user message to the thread
    console.log("Adding user message to the thread...");

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messages[0].content,
    });

    console.log("Running the assistant with ID:", agent.openai_assistant_id);

    const run = await openai.beta.threads.createAndRun({
      assistant_id: agent.openai_assistant_id,
    });

    console.log("Assistant run response:", run);

    if (run.status !== "completed") {
      console.error(`Assistant run status: ${run.status}`);

      return new NextResponse(
        `Assistant run did not complete successfully, status: ${run.status}`,
        {
          status: 500,
        }
      );
    }

    // Step 5: List the messages in the thread
    console.log("Listing messages in the thread...");

    const responseMessages = await openai.beta.threads.messages.list(threadId);
    const conversation = responseMessages.data.reverse().map((message) => ({
      role: message.role,
      content: message.content[0].text.value,
    }));

    console.log("Conversation completed successfully:", conversation);

    return NextResponse.json(conversation);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
