import { GoogleGenerativeAI } from "@google/generative-ai";
import { webSearchTool, createVectorTool } from "./tools";

export async function runAgent(query: string, workspaceId: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const tools = [
    {
      functionDeclarations: [
        {
          name: "web_search",
          description: "Search the live internet",
          parameters: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"],
          },
        },
        {
          name: "search_workspace_documents",
          description: "Search PDFs and documents inside this workspace",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
              workspaceId: { type: "string" },
            },
            required: ["query", "workspaceId"],
          },
        },
      ],
    },
  ];

  const model = genAI.getGenerativeModel({
    model: "models/gemini-2.5-flash",
    // @ts-ignore
    tools,
  });

  const history: any[] = [];

  function sanitizeHistory() {
    return history.map((m) => ({
      role: m.role === "assistant" ? "model" : m.role === "tool" ? "user" : m.role,
      parts: m.parts.map((p: any) => ({ text: typeof p.text === "string" ? p.text : JSON.stringify(p) })),
    }));
  }

  async function continueAssistant() {
    const cleanHistory = sanitizeHistory();

    const response = await model.generateContent({
      systemInstruction: `
You MUST include inline source citations if the tool returns workspace document results.

FORMAT:
• Single source: [Source: filename.pdf]
• Multiple: [Sources: file1.pdf; file2.pdf]
• NEVER invent filenames.
• Read the 'source' fields from the vector_search_result.

Do NOT call tools in this step — summarize using the tool output.`,
      contents: cleanHistory,
    });

    const text = response.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
    history.push({ role: "assistant", parts: [{ text }] });
    return text;
  }

  async function step(userInput: string) {
    const messages = sanitizeHistory().concat([{ role: "user", parts: [{ text: userInput }] }]);

    const response = await model.generateContent({
      systemInstruction: `
You are an AI agent with access to workspace documents.

RULES:
1. If the question asks anything about PDFs, files, notes → ALWAYS call search_workspace_documents.
2. NEVER ask the user for workspaceId — you already have it.
3. When using workspace documents, ALWAYS cite the source filenames.
4. Format citations EXACTLY like: [Source: filename.pdf].
5. Only use filenames the vector tool returns.`,
      contents: messages,
    });

    const part = response.response?.candidates?.[0]?.content?.parts?.[0];

    if (part?.functionCall) {
      const { name, args } = part.functionCall;

      let result;
      if (name === "web_search") {
        //@ts-ignore
        result = await webSearchTool(args.query);
      } else if (name === "search_workspace_documents") {
        //@ts-ignore
        result = await createVectorTool(workspaceId)(args.query);
      }

      history.push({ role: "assistant", parts: [part] });
      history.push({ role: "tool", parts: [{ text: JSON.stringify(result) }] });

      return continueAssistant();
    }

    const text = part?.text ?? "No response.";
    history.push({ role: "assistant", parts: [{ text }] });
    return text;
  }

  try {
    const output = await step(query);
    return output;
  } catch (err) {
    console.error("AGENT FAILED:", err);
    return "Agent error.";
  }
}
