import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
//@ts-ignore
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
// import { Pinecone } from "@pinecone-database/pinecone";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import dotenv from "dotenv";

dotenv.config();

export async function processDocument(fileBuffer: Buffer, workspaceId: string) {
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
  //@ts-ignore
  const docsWithMetadata = rawDocs.map(doc => {
    doc.metadata = { ...doc.metadata, workspaceId: workspaceId };
    return doc;
  });

  const splitDocs = await splitter.splitDocuments(docsWithMetadata);

  console.log(`Split into ${splitDocs.length} chunks.`);

  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
  
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", 
    apiKey: process.env.GEMINI_API_KEY
  });
  await PineconeStore.fromDocuments(splitDocs, embeddings, {
    pineconeIndex: index,
    namespace: workspaceId, 
  });

  console.log("Storage Complete via Gemini!");
  return splitDocs.length;
}