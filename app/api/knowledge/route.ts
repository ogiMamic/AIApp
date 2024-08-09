import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import supabase from "@/lib/supabaseClient";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Read the request body as form data
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const anweisungen = formData.get("anweisungen") as string;
    console.log("formData log");
    console.log(formData);
    const file = formData.get("file") as File;

    if (!name) {
      console.log("name =>  ", name);
      console.log("description =>  ", description);
      console.log("anweisungen =>  ", anweisungen);

      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from("AI Documents") // Your bucket name
      .upload(`public/${name}`, file);

    console.log("ogi123");
    console.log(name, description, anweisungen);
    console.log("ogi345");

    if (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const { publicUrl } = supabase.storage
      .from("AI Documents")
      .getPublicUrl(`public/${name}`);

    const document = await prisma.document.create({
      data: {
        name,
        description,
        content: anweisungen,
        fileUrl: publicUrl,
      },
    });
    console.log("ogi567");

    return NextResponse.json(document, { status: 200 });
  } catch (error) {
    console.error("[POST_ERROR]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const documents = await prisma.document.findMany();
    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error("[GET_ERROR]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedDocument = await prisma.document.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedDocument, { status: 200 });
  } catch (error) {
    console.log("[DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
