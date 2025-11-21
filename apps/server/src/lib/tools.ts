import { tavily } from "@tavily/core";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
// @ts-ignore
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";


export async function webSearchTool(query: string) {
  try {
    console.log("Tavily Web Search:", query);

    const client = tavily({ apiKey: process.env.TAVILY_API_KEY! });

    const result = await client.search(query, {
      maxResults: 3,
      includeAnswer: true,
    });

    return {
      type: "web_search_result",
      query,
      data: result,
    };
  } catch (err: any) {
    console.error("Web Search Error:", err);
    return {
      type: "error",
      error: "web_search_failed",
      message: err.message || String(err),
    };
  }
}


export function createVectorTool(workspaceId: string) {
  return async function vectorTool(query: string) {
    try {
      console.log("Vector DB Search:", query);

      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

      const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        apiKey: process.env.GEMINI_API_KEY!,
      });

      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
        namespace: workspaceId,
      });

      const results = await vectorStore.similaritySearch(query, 4);

      return {
        type: "vector_search_result",
        query,
        results,
      };
    } catch (err: any) {
      console.error("Vector Search Error:", err);
      return {
        type: "error",
        error: "vector_search_failed",
        message: err.message || String(err),
      };
    }
  };
}
