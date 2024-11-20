import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    console.log("Starting POST request processing");
    const { userId } = getAuth(req);
    if (!userId) {
      console.log("Unauthorized: No user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const {
      messages,
      agent,
      threadId: clientThreadId,
      openAIFileId,
      vectorStoreId,
      fileAnalysis,
    } = body;

    if (!messages || messages.length === 0) {
      console.log("No messages provided");
      return new NextResponse("Messages are required", { status: 400 });
    }

    const assistantId = agent.id;
    if (!assistantId) {
      console.log("No assistant ID provided");
      return new NextResponse("Assistant ID is missing", { status: 400 });
    }

    let threadId = clientThreadId;
    console.log("Initial threadId:", threadId);

    // Create or retrieve thread
    if (!threadId) {
      console.log("Creating new thread");
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    } else {
      try {
        console.log("Retrieving existing thread");
        await openai.beta.threads.retrieve(threadId);
      } catch (error) {
        console.error("Error retrieving thread:", error);
        if (error.status === 404) {
          console.log("Thread not found, creating new one");
          const thread = await openai.beta.threads.create();
          threadId = thread.id;
        } else {
          throw error;
        }
      }
    }
    console.log("Final threadId:", threadId);

    // Add user message to the thread
    console.log("Adding user message to thread");
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messages[messages.length - 1].content,
      file_ids: openAIFileId ? [openAIFileId] : undefined,
    });

    // Prepare run parameters
    const runParams: any = {
      assistant_id: assistantId,
      model: "gpt-4-turbo-preview",
      tools: [{ type: "file_search" }],
    };

    if (vectorStoreId) {
      console.log("Adding vector store to run parameters");
      runParams.tool_resources = {
        file_search: {
          vector_store_ids: [vectorStoreId],
        },
      };
    }

    if (fileAnalysis) {
      console.log("Adding file analysis instructions");
      runParams.instructions = `${agent.instructions}\n\nPlease analyze the uploaded file and provide insights based on its content. Use the vector store with ID ${vectorStoreId} for efficient retrieval.`;
    }

    console.log("Run parameters:", JSON.stringify(runParams, null, 2));

    // Run the Assistant
    console.log("Creating assistant run");
    let run = await openai.beta.threads.runs.create(threadId, runParams);
    console.log("Initial run status:", run.status);

    // Poll for the status of the run
    let pollCount = 0;
    const maxPolls = 60; // 1 minute timeout
    while (
      run.status !== "completed" &&
      run.status !== "failed" &&
      run.status !== "cancelled" &&
      pollCount < maxPolls
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await openai.beta.threads.runs.retrieve(threadId, run.id);
      console.log(`Poll ${pollCount + 1}: Run status: ${run.status}`);
      pollCount++;
    }

    if (run.status !== "completed") {
      console.log(`Run did not complete. Final status: ${run.status}`);
      return new NextResponse(
        `Assistant run did not complete successfully, status: ${run.status}`,
        { status: 500 }
      );
    }

    // List the messages in the thread
    console.log("Retrieving conversation messages");
    const responseMessages = await openai.beta.threads.messages.list(threadId);
    console.log(
      "Raw response messages:",
      JSON.stringify(responseMessages, null, 2)
    );

    const conversation = responseMessages.data.reverse().map((message) => ({
      role: message.role,
      content:
        message.content
          ?.map((item) =>
            "text" in item ? item.text?.value : "Non-text content available"
          )
          .join(" ") || "No content available",
    }));

    console.log(
      "Processed conversation:",
      JSON.stringify(conversation, null, 2)
    );

    // Retrieve usage information
    const runSteps = await openai.beta.threads.runs.steps.list(
      threadId,
      run.id
    );
    let totalTokens = 0;
    runSteps.data.forEach((step) => {
      if (step.step_details && "tool_calls" in step.step_details) {
        step.step_details.tool_calls.forEach((toolCall) => {
          if (
            "function" in toolCall &&
            toolCall.function.name === "completion" &&
            toolCall.function.output
          ) {
            const output = JSON.parse(toolCall.function.output);
            if (output.usage && output.usage.total_tokens) {
              totalTokens += output.usage.total_tokens;
            }
          }
        });
      }
    });

    console.log("Total tokens used:", totalTokens);

    try {
      await prisma.users.update({
        where: { Id: userId },
        data: {
          Used_Tokens: {
            increment: totalTokens,
          },
        },
      });
      console.log(`Updated token usage for user ${userId}`);
    } catch (dbError) {
      console.error("Error updating token usage in database:", dbError);
      // Ovde možete odlučiti da li želite da prekinete izvršavanje ili da nastavite uprkos grešci
    }

    return NextResponse.json({ conversation, threadId, totalTokens });
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse(`Internal error: ${error.message}`, {
      status: 500,
    });
  }
}
