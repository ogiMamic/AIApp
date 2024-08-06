import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Proveri da li je zahtev multipart/form-data
    const contentType = req.headers.get("content-type");
    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const anweisungen = formData.get("anweisungen") as string;

      if (!name || !description || !anweisungen) {
        return new NextResponse("Invalid input", { status: 400 });
      }

      const document = await prisma.document.create({
        data: {
          name,
          description,
          content: anweisungen,
        },
      });

      return new NextResponse(JSON.stringify(document), { status: 200 });
    }

    return new NextResponse("Unsupported Media Type", { status: 415 });
  } catch (error) {
    console.log("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const documents = await prisma.document.findMany();
  return new NextResponse(JSON.stringify(documents), { status: 200 });
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const deletedDocument = await prisma.document.delete({
      where: {
        id: id,
      },
    });

    return new NextResponse(JSON.stringify(deletedDocument), { status: 200 });
  } catch (error) {
    console.log("[DELETE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
