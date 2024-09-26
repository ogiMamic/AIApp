import { NextResponse } from "next/server";
import OpenAI from "openai";

const VALID_MODELS = ["gpt-3.5-turbo", "gpt-4-turbo-preview", "gpt-4"];

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

    // Validate the model for all actions that require it
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

      case "create":
        // Create a new assistant
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

        // Update existing assistant
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
        // Fetch the list of assistants
        const assistants = await openai.beta.assistants.list({
          limit: 100, // Adjust as needed
        });

        return NextResponse.json({
          success: true,
          assistants: assistants.data,
        });

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
