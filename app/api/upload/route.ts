import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_CHUNK_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!req.body) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const formData = await req.formData();

    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const totalSize = buffer.length;
    const chunks = Math.ceil(totalSize / MAX_CHUNK_SIZE);

    console.log(`File size: ${totalSize} bytes, Chunks: ${chunks}`);

    const openAIFileIds = [];
    for (let i = 0; i < chunks; i++) {
      const start = i * MAX_CHUNK_SIZE;
      const end = Math.min(start + MAX_CHUNK_SIZE, totalSize);
      const chunkBuffer = buffer.slice(start, end);

      try {
        console.log(`Uploading chunk ${i + 1}/${chunks}`);
        const openAIFile = await openai.files.create({
          file: chunkBuffer,
          purpose: "assistants",
        });
        openAIFileIds.push(openAIFile.id);
        console.log(
          `Uploaded chunk ${i + 1}/${chunks}, File ID: ${openAIFile.id}`
        );
      } catch (error) {
        console.error(`Error uploading chunk ${i + 1}/${chunks}:`, error);
        throw error;
      }
    }

    console.log("All chunks uploaded successfully");

    // Create vector store
    let vectorStore;
    try {
      vectorStore = await openai.beta.vectorStores.create({
        name: `VectorStore_${file.name}`,
        file_ids: openAIFileIds,
      });
      console.log("Vector store created:", vectorStore.id);
    } catch (error) {
      console.error("Error creating vector store:", error);
      throw error;
    }

    // Poll for vector store readiness
    try {
      await pollVectorStoreReadiness(vectorStore.id);
      console.log("Vector store is ready");
    } catch (error) {
      console.error("Error polling vector store readiness:", error);
      throw error;
    }

    return NextResponse.json(
      {
        openAIFileIds: openAIFileIds,
        vectorStoreId: vectorStore.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Internal error", details: error.message },
      { status: 500 }
    );
  }
}

async function pollVectorStoreReadiness(
  vectorStoreId: string,
  maxAttempts = 30,
  interval = 5000
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const vectorStore = await openai.beta.vectorStores.retrieve(
        vectorStoreId
      );
      if (vectorStore.status === "completed") {
        return;
      }
      console.log(
        `Vector store status: ${vectorStore.status}, attempt ${
          attempt + 1
        }/${maxAttempts}`
      );
    } catch (error) {
      console.error(
        `Error checking vector store status, attempt ${
          attempt + 1
        }/${maxAttempts}:`,
        error
      );
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`Vector store not ready after ${maxAttempts} attempts`);
}
