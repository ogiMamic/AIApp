import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { Readable } from "stream";

const prisma = new PrismaClient();
const upload = multer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await new Promise((resolve, reject) => {
      const form = new multiparty.Form();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { name, description, anweisungen } = formData.fields;
    const file = formData.files.file[0];

    if (!name || !description || !anweisungen) {
      return new NextResponse("Invalid input", { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        name: name[0],
        description: description[0],
        content: anweisungen[0],
      },
    });

    return new NextResponse(JSON.stringify(document), { status: 200 });
  } catch (error) {
    console.log("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET() {
  try {
    const documents = await prisma.document.findMany();
    return new NextResponse(JSON.stringify(documents), { status: 200 });
  } catch (error) {
    console.error("[GET_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const deletedDocument = await prisma.document.delete({
      where: {
        id,
      },
    });

    return new NextResponse(JSON.stringify(deletedDocument), { status: 200 });
  } catch (error) {
    console.log("[DELETE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
