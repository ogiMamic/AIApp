import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages, agent, threadId: clientThreadId } = body;

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

    let threadId = clientThreadId;

    // Create or retrieve thread
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    } else {
      try {
        await openai.beta.threads.retrieve(threadId);
      } catch (error) {
        if (error.status === 404) {
          const thread = await openai.beta.threads.create();
          threadId = thread.id;
        } else {
          throw error;
        }
      }
    }

    // Add user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messages[messages.length - 1].content,
    });

    // Run the Assistant
    let run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Poll for the status of the run
    while (
      run.status !== "completed" &&
      run.status !== "failed" &&
      run.status !== "cancelled"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (run.status !== "completed") {
      return new NextResponse(
        `Assistant run did not complete successfully, status: ${run.status}`,
        { status: 500 }
      );
    }

    // List the messages in the thread
    const responseMessages = await openai.beta.threads.messages.list(threadId);
    const conversation = responseMessages.data.reverse().map((message) => ({
      role: message.role,
      content:
        message.content
          ?.map((item) =>
            "text" in item ? item.text?.value : "Non-text content available"
          )
          .join(" ") || "No content available",
    }));

    return NextResponse.json({ conversation, threadId });
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
