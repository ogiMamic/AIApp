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
    try {
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
    } catch (dbError) {
      console.error("Database error:", dbError);
      // If database operation fails, we should clean up the created vector store
      try {
        await openai.beta.vectorStores.del(vectorStore.id);
      } catch (cleanupError) {
        console.error("Error cleaning up vector store:", cleanupError);
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Internal error", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
