import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;


const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);


const MAX_CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds


async function checkFileStatus(fileId: string): Promise<boolean> {
  try {
    const file = await openai.files.retrieve(fileId);
    console.log(`File status for ${fileId}:`, file.status);
    return file.status === 'processed';
  } catch (error) {
    console.error(`Error checking file status for ${fileId}:`, error);
    return false;
  }
}


async function waitForFileProcessing(fileId: string, maxRetries = 5): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const isProcessed = await checkFileStatus(fileId);
    if (isProcessed) return true;
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }
  return false;
}


export async function POST(req: NextRequest): Promise<NextResponse> {
  const uploadChunk = async (chunk: Buffer, retries = 0) => {
    try {
      const blob = new Blob([chunk]);
      const chunkFile = new File([blob], `chunk_${uuidv4()}.txt`);  
      return await openai.files.create({ file: chunkFile, purpose: "assistants" });
    } catch (error) {
      console.error(`Error uploading chunk (attempt ${retries + 1}):`, error);
      if (retries < MAX_RETRIES) {
        console.log(`Retrying upload chunk: Attempt ${retries + 1}`);
        return await uploadChunk(chunk, retries + 1);
      }
      throw error;
    }
  };


  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    if (!req.body) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }


    const formData = await req.formData();  


    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file provided" }, { status: 400 });
    }


    const buffer = Buffer.from(await file.arrayBuffer());
    const totalSize = buffer.length;
    const chunks = Math.ceil(totalSize / MAX_CHUNK_SIZE);


    console.log(`File size: ${totalSize} bytes, Chunks: ${chunks}`);


    const openAIFileIds = [];
    for (let i = 0; i < chunks; i++) {
      const start = i * MAX_CHUNK_SIZE;
      const end = Math.min(start + MAX_CHUNK_SIZE, totalSize);


      console.log(`Uploading chunk ${i + 1}/${chunks}`);
      const chunk = buffer.subarray(start, end);
      try {
        const openAIFile = await uploadChunk(chunk);
        openAIFileIds.push(openAIFile.id);
        console.log(`Uploaded chunk ${i + 1}/${chunks}, File ID: ${openAIFile.id}`);
      } catch (error) {
        console.error(`Error uploading chunk ${i + 1}/${chunks}:`, error);
        throw error;
      }
    }


    console.log("All chunks uploaded successfully");
    console.log("OpenAI File IDs:", openAIFileIds);


    // Čekanje da svi fajlovi budu obrađeni
    const processingResults = await Promise.all(openAIFileIds.map(fileId => waitForFileProcessing(fileId)));
    
    if (processingResults.every(result => result)) {
      console.log("All files have been processed successfully");
    } else {
      console.warn("Some files were not processed in time:", openAIFileIds);
    }


    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });


    const fileContent = buffer.toString('utf-8');
    const embeddingVector = await embeddings.embedQuery(fileContent);
    console.log("Embedding Vector length:", embeddingVector.length);


    // Save file information to database
    try {
      const fileName = file.name;
      const fileSize = file.size;
      const formattedSize = formatFileSize(fileSize);
      const currentTimestamp = new Date().toISOString();
    
      console.log("Supabase insert data:", {
        content: fileContent.substring(0, 100) + "...", // Prikazuje prvih 100 karaktera
        metadata: JSON.stringify({
          name: fileName,
          openAIFileIds: openAIFileIds,
          size: totalSize,
        }),
        embedding: `[${embeddingVector.slice(0, 5).join(", ")}...]`, // Prikazuje prvih 5 elemenata
        userId: userId,
        Name: fileName,
        Size_in_kilobytes: formattedSize,
        Last_edited: currentTimestamp
      });


      const { data: savedFile, error } = await supabase
        .from('test_tabela')
        .insert({
          content: fileContent,
          metadata: JSON.stringify({
            name: fileName,
            openAIFileIds: openAIFileIds,
            size: totalSize,
          }),
          embedding: embeddingVector,
          userId: userId,
          Name: fileName,
          Size_in_kilobytes: formattedSize,
          Last_edited: currentTimestamp
        })
        .select()
        .single();


      if (error) {
        console.error("Detaljna Supabase greška:", error);
        return NextResponse.json(
          {
            success: false,
            openAIFileIds: openAIFileIds,
            error: `File uploaded to OpenAI but not saved to database. Error: ${error.message}`,
            details: error
          },
          { status: 207 } // Partial Content
        );
      }


      if (!savedFile) {
        console.error("Fajl nije sačuvan u bazi, ali nije prijavljena greška.");
        throw new Error("File was not saved to the database");
      }


      return NextResponse.json(
        {
          success: true,
          fileId: savedFile.id,
          openAIFileIds: openAIFileIds,
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Detaljna greška baze podataka:", dbError);
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


function formatFileSize(bytes: number): string {
  return (bytes / 1024).toFixed(2);
}

