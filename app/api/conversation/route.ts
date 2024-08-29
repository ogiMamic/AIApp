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
    const { messages, agent, threadId: clientThreadId } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages || messages.length === 0) {
      console.error("No messages provided");
      return new NextResponse("Messages are required", { status: 400 });
    }

    const assistantId = agent.openai_assistant_id;
    if (!assistantId) {
      console.error("Agent or Assistant ID is missing");
      return new NextResponse("Assistant ID is missing", { status: 400 });
    }

    let threadId = clientThreadId;

    // Step 1: Create a thread only if threadId does not exist
    if (!threadId) {
      console.log("Creating a thread...");
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    } else {
      console.log("Using existing thread ID:", threadId);
    }

    // Step 2: Add user message to the thread
    console.log("Adding user message to the thread...");
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messages[messages.length - 1].content,
    });

    // Step 3: Run the Assistant
    console.log("Running the assistant with ID:", assistantId);
    let run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    console.log("Initial Assistant run response:", run);

    // Step 4: Polling for the status of the run
    while (
      run.status !== "completed" &&
      run.status !== "failed" &&
      run.status !== "cancelled"
    ) {
      console.log(`Current run status: ${run.status}, waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before polling again

      // Fetch the latest run status
      run = await openai.beta.threads.runs.retrieve(threadId, run.id);
      console.log("Updated run status:", run.status);
    }

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
    const conversation = responseMessages.data.reverse().map((message) => {
      console.log("Message structure:", message);
      return {
        role: message.role,
        content:
          message.content
            ?.map((item) => {
              if ("text" in item) {
                return item.text?.value;
              } else {
                return "Non-text content available";
              }
            })
            .join(" ") || "No content available",
      };
    });

    console.log("Conversation completed successfully:", conversation);
    // return NextResponse.json(conversation);
    return NextResponse.json({ conversation, threadId });
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
