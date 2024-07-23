import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);
    const prisma = new PrismaClient();
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

    return new NextResponse(JSON.stringify({}), { status: 200 });
  } catch (error) {
    console.log("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const prisma = new PrismaClient();
  const documents = await prisma.document.findMany();
  return new NextResponse(JSON.stringify(documents), { status: 200 });
}
