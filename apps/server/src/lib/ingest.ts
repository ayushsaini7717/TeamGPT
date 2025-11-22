import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
//@ts-ignore
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Document } from "langchain/document";

dotenv.config();

export async function processDocument(
  fileBuffer: Buffer,
  workspaceId: string,
  filename: string,
  prisma: PrismaClient
) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  console.log(`Starting PDF extraction...`);

  // @ts-ignore
  const blob = new Blob([fileBuffer], { type: "application/pdf" });
  const loader = new WebPDFLoader(blob);

  const rawDocs = await loader.load();
  console.log(`Extracted ${rawDocs.length} pages.`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(rawDocs);
  console.log(`Split into ${splitDocs.length} chunks.`);

  const finalDocs = splitDocs.map((chunk, idx) => {
    return new Document({
      pageContent: chunk.pageContent,
      metadata: {
        ...chunk.metadata,        
        workspaceId,
        source: filename,          
        chunkIndex: idx,
        sourceId: `${filename}::${idx}`,
      },
    });
  });


  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GEMINI_API_KEY,
  });

  await PineconeStore.fromDocuments(finalDocs, embeddings, {
    pineconeIndex: index,
    namespace: workspaceId,
  });

  await prisma.document.create({
    data: {
      name: filename,
      workspaceId,
      url: "local",
    },
  });

  console.log("Storage Complete via Gemini + Pinecone!");

  return finalDocs.length;
}
