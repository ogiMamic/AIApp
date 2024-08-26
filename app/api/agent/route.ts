import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { name, instructions, tools, tool_resources, model } =
      await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const assistant = await openai.beta.assistants.create({
      name,
      instructions,
      tools,
      tool_resources,
      model,
    });

    return NextResponse.json({ success: true, assistant });
  } catch (error) {
    console.error("Error creating assistant:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
