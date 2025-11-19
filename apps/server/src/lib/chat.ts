import { Pinecone } from "@pinecone-database/pinecone";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

async function optimizeQuery(rawQuery: string, history: Message[]): Promise<string> {
  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash", 
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0,
    });

    const historyText = history
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const rewriterPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a Query Reformulator for a RAG (Retrieval Augmented Generation) system.
        
        Your Goal:
        The user is asking a follow-up question. The search engine does NOT have access to conversation history.
        You must rewrite the user's question to be a "Standalone Question" that contains all necessary context (replacing pronouns like "it", "that", "the previous one" with the actual nouns from history).
        
        Conversation History:
        {history}
        
        Current User Input: {question}
        
        Rules:
        1. If the user says "Explain it", and history was about "Node.js", output "Explain Node.js".
        2. Remove conversational fillers.
        3. Do NOT answer the question. ONLY output the rewritten query.`
      ],
      ["human", "{question}"],
    ]);

    const chain = rewriterPrompt.pipe(llm).pipe(new StringOutputParser());
    
    // Pass history and current query
    const refinedQuery = await chain.invoke({ 
      question: rawQuery,
      history: historyText || "No history." 
    });
    
    console.log(`Contextual Rewrite: "${rawQuery}" -> "${refinedQuery}"`);
    return refinedQuery;

  } catch (error) {
    console.error("Optimization failed", error);
    return rawQuery;
  }
}

export async function chatWithDocument(query: string, workspaceId: string, history: Message[] = []) {
  const optimizedQuery = await optimizeQuery(query, history);

  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
  
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", 
    apiKey: process.env.GEMINI_API_KEY,
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: workspaceId,
  });

  const results = await vectorStore.similaritySearch(optimizedQuery, 4);
  const context = results.map((r) => r.pageContent).join("\n\n");

  console.log("Found Context size:", context.length);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", 
    apiKey: process.env.GEMINI_API_KEY,
    streaming: true,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system", 
      `You are a helpful AI assistant.
      
      Context:
      {context}
      
      Answer the user's question based on the context above.`
    ],
    ["human", "{question}"], 
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  return chain.stream({
    context: context,
    question: query, 
  });
}