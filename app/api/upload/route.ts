import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/lib/supabaseClient";
import { decode } from "base64-arraybuffer";
import { writeFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!req.body) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const formData = await req.formData();

    console.log("formData log start");
    console.log(formData);
    console.log("formData log end");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const anweisungen = formData.get("anweisungen") as string;
    const file = formData.get("file") as File;
    const base64 = formData.get("base64") as string;
    const knowledgeId = formData.get("knowledgeId") as string;

    console.log("base64", base64);

    let fileUrl = "";
    if (file) {
      try {
        const fileName = file.name;
        const base641 = base64.split("base64,")[1];

        const { data, error } = await supabase.storage
          .from("AI Documents")
          .upload(fileName, decode(base641), {
            cacheControl: "3600",
            contentType: file.type,
            upsert: true,
          });
        if (error) {
          console.error("Error uploading file: ", error);
        } else {
          console.log("File uploaded successfully: ", data);
          fileUrl = data.path;
        }

        // Also save file locally
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const path = join(process.cwd(), "public", "uploads", file.name);
        await writeFile(path, buffer);
        console.log(`File also saved locally to ${path}`);
      } catch (error) {
        console.error("Error handling file: ", error);
      }
    }

    if (!name) {
      console.log("name =>  ", name);
      console.log("description =>  ", description);
      console.log("anweisungen =>  ", anweisungen);
      console.log("knowledgeId =>  ", knowledgeId);

      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Check if it's an agent creation/update or document creation
    if (knowledgeId) {
      // Agent creation or update
      const agentData = {
        name,
        description,
        anweisungen,
        knowledgeId,
      };

      let agent;
      if (formData.get("id")) {
        // Update existing agent
        agent = await prisma.agent.update({
          where: { id: formData.get("id") as string },
          data: agentData,
        });
      } else {
        // Create new agent
        agent = await prisma.agent.create({
          data: agentData,
        });
      }

      return NextResponse.json(agent, { status: 200 });
    } else {
      // Document creation
      const document = await prisma.document.create({
        data: {
          name,
          description,
          content: anweisungen,
          fileUrl: fileUrl,
        },
      });

      return NextResponse.json(document, { status: 200 });
    }
  } catch (error) {
    console.error("[POST_ERROR]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    if (type === "agents") {
      const agents = await prisma.agent.findMany();
      return NextResponse.json(agents, { status: 200 });
    } else {
      const documents = await prisma.document.findMany();
      return NextResponse.json(documents, { status: 200 });
    }
  } catch (error) {
    console.error("[GET_ERROR]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { id, type } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (type === "agent") {
      const deletedAgent = await prisma.agent.delete({
        where: {
          id,
        },
      });
      return NextResponse.json(deletedAgent, { status: 200 });
    } else {
      const deletedDocument = await prisma.document.delete({
        where: {
          id,
        },
      });
      return NextResponse.json(deletedDocument, { status: 200 });
    }
  } catch (error) {
    console.log("[DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export function OPTIONS(req: NextRequest): NextResponse {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return NextResponse.json({}, { headers });
}
