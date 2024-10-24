import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_RETRIES = 3;
const MAX_TOKENS_PER_REQUEST = 8000; // Slightly less than the 8192 limit to be safe

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

    // Create a temporary file with a valid extension
    const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.txt`);
    fs.writeFileSync(tempFilePath, buffer);

    const openAIFileIds = [];
    for (let i = 0; i < chunks; i++) {
      const start = i * MAX_CHUNK_SIZE;
      const end = Math.min(start + MAX_CHUNK_SIZE, totalSize);

      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          console.log(`Uploading chunk ${i + 1}/${chunks}`);
          const openAIFile = await openai.files.create({
            file: fs.createReadStream(tempFilePath, { start, end }),
            purpose: "assistants",
          });
          openAIFileIds.push(openAIFile.id);
          console.log(
            `Uploaded chunk ${i + 1}/${chunks}, File ID: ${openAIFile.id}`
          );
          break; // Success, exit retry loop
        } catch (error) {
          console.error(`Error uploading chunk ${i + 1}/${chunks}:`, error);
          retries++;
          if (retries >= MAX_RETRIES) {
            throw error; // Max retries reached, throw error
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        }
      }
    }

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    console.log("All chunks uploaded successfully");

    // Create embeddings in chunks
    const text = buffer.toString("utf-8");
    const textChunks = chunkText(text, MAX_TOKENS_PER_REQUEST);
    const embeddings = [];

    for (let i = 0; i < textChunks.length; i++) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: textChunks[i],
      });
      embeddings.push(...embeddingResponse.data.map((e) => e.embedding));
      console.log(`Processed embedding chunk ${i + 1}/${textChunks.length}`);
    }

    // Combine embeddings (you might want to implement a more sophisticated method)
    const combinedEmbedding = embeddings
      .reduce((acc, curr) => {
        return acc.map((val, idx) => val + curr[idx]);
      })
      .map((val) => val / embeddings.length);

    // Create vector store
    let vectorStore;
    try {
      vectorStore = await openai.beta.vectorStores.create({
        name: `VectorStore_${file.name}`,
        custom_data: {
          file_ids: openAIFileIds,
          embedding: combinedEmbedding,
        },
      });
      console.log("Vector store created:", vectorStore.id);
    } catch (error) {
      console.error("Error creating vector store:", error);
      if (error instanceof OpenAI.APIError) {
        console.error(
          "OpenAI API Error:",
          error.status,
          error.message,
          error.code
        );
      }
      throw error;
    }

    // Save file information to database
    const savedFile = await prisma.file.create({
      data: {
        name: file.name,
        openAIFileIds: openAIFileIds,
        vectorStoreId: vectorStore.id,
        size: totalSize,
        uploadedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        fileId: savedFile.id,
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

function chunkText(text: string, maxTokens: number): string[] {
  // This is a simple implementation. You might want to use a more sophisticated tokenizer.
  const words = text.split(" ");
  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    if ((currentChunk + word).length > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += word + " ";
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
