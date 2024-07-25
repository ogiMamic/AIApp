import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);

    const document = await prisma.document.create({
      data: {
        name: body.name,
        description: body.description,
        content: body.anweisungen,
      },
    });

    const { messages } = body;
    console.log("==========");
    console.log(messages);

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    return new NextResponse(JSON.stringify(document), { status: 200 });
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
    return new NextResponse("Failed to delete document", { status: 500 });
  }
}
