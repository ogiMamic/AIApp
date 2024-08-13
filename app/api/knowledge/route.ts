import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/lib/supabaseClient";
import { supabaseS3Client } from "@/lib/supabaseS3Client";
import { decode } from "base64-arraybuffer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Check if the request has a form data
    if (!req.body) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Read the request body as form data
    const formData = await req.formData();

    console.log("formData log start");
    console.log(formData);
    console.log("formData log end");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const anweisungen = formData.get("anweisungen") as string;
    console.log("formData log");
    console.log(formData);
    const file = formData.get("file") as File;
    const base64 = formData.get("base64") as string;

    console.log("base64", base64);
    try {
      const fileName = file.name;

      //upload base64 to supabase storage
      const base641 = base64.split("base64,")[1];

      var { data, error } = await supabase.storage
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
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
    }

    // AI Documents
    if (!name) {
      console.log("name =>  ", name);
      console.log("description =>  ", description);
      console.log("anweisungen =>  ", anweisungen);

      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        name,
        description,
        content: anweisungen,
        // fileUrl: rest.data?.fullPath,
      },
    });

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
