import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const MAX_CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_RETRIES = 3;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!req.body) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const formData = await req.formData();

    const file = formData.get("file") as File;
    if (!file) {
      console.log("nema fajla nikakvog");
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
          const chunk = buffer.subarray(start, end);
          const blob = new Blob([chunk]);
          const chunkFile = new File([blob], `chunk_${i + 1}_${file.name}`, {
            type: "application/octet-stream",
          });
          const openAIFile = await openai.files.create({
            file: chunkFile,
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

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const fileContent = buffer.toString("utf-8");
    const embeddingVector = await embeddings.embedQuery(fileContent);

    // Save file information to database
    try {
      const { data: savedFile, error } = await supabase
        .from("test_tabela")
        .insert({
          content: fileContent,
          metadata: JSON.stringify({
            name: file.name,
            openAIFileIds: openAIFileIds,
            vectorStoreId: vectorStore.id,
            size: totalSize,
          }),
          embedding: embeddingVector,
          userId: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      if (!savedFile) {
        throw new Error("File was not saved to the database");
      }

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
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal error", details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Internal error", details: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
