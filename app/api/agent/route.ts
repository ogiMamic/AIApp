import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const content: {
      name: string;
      instructions: string;
      description?: string;
      id?: string;
      tools?: any[];
      tool_resources?: any[];
      model: string;
    } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Proveri da li asistent već postoji, ako postoji ažuriraj ga, ako ne, kreiraj novog
    let assistant;
    if (content.id) {
      // Update existing assistant
      assistant = await openai.beta.assistants.update(content.id, {
        name: content.name,
        description: content.description,
        instructions: content.instructions,
        model: content.model,
      });
    } else {
      // Create a new assistant
      assistant = await openai.beta.assistants.create({
        name: content.name,
        description: content.description,
        instructions: content.instructions,
        model: content.model,
      });
    }

    return NextResponse.json({ success: true, assistant });
  } catch (error) {
    console.error("Error creating assistant:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
