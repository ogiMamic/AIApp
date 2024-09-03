import { NextResponse } from "next/server";
import OpenAI from "openai";

const VALID_MODELS = ["gpt-3.5-turbo", "gpt-4-turbo-preview", "gpt-4"];

export async function POST(request: Request) {
  try {
    const content = await request.json();
    const { action, agentId, name, description, instructions, message, model } =
      content;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Validate the model for all actions that require it
    if (
      ["generate", "test", "create", "update"].includes(action) &&
      !VALID_MODELS.includes(model)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid model specified" },
        { status: 400 }
      );
    }

    if (action === "generate" || action === "test") {
      // Use the OpenAI API to get a response
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
    } else if (action === "create" || action === "update") {
      let assistant;
      if (action === "update" && agentId) {
        // Update existing assistant
        assistant = await openai.beta.assistants.update(agentId, {
          name,
          description,
          instructions,
          model,
        });
      } else {
        // Create a new assistant
        assistant = await openai.beta.assistants.create({
          name,
          description,
          instructions,
          model,
        });
      }

      return NextResponse.json({ success: true, assistant });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in agent API:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
