import { GoogleGenerativeAI } from "@google/generative-ai";
import { webSearchTool, createVectorTool } from "./tools";

export async function runAgent(query: string, workspaceId: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const tools = [
    {
      functionDeclarations: [
        {
          name: "web_search",
          description: "Search the live internet for external information.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" }
            },
            required: ["query"]
          }
        },
        {
          name: "search_workspace_documents",
          description: "Search PDFs, notes, and documents inside the workspace.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
              workspaceId: { type: "string" }
            },
            required: ["query", "workspaceId"]
          }
        }
      ]
    }
  ];

  const model = genAI.getGenerativeModel({
    model: "models/gemini-2.5-flash",
    // @ts-ignore
    tools
  });

  const history: any[] = [];


  function sanitizeHistory() {
    return history.map((msg) => {
      let role = msg.role;

      if (role === "assistant") role = "model";
      if (role === "tool") role = "user";

      return {
        role,
        parts: msg.parts.map((p: any) => {
          if (typeof p?.text === "string") return { text: p.text };
          if (p.functionCall) return { text: JSON.stringify(p.functionCall) };
          return { text: JSON.stringify(p) };
        })
      };
    });
  }

  
  async function continueAssistant(): Promise<string> {
    const cleanHistory = sanitizeHistory();

    const response = await model.generateContent({
      systemInstruction: `
        Continue your answer using the tool result.
        Do NOT call another tool now.
      `,
      contents: cleanHistory
    });

    const part = response.response?.candidates?.[0]?.content?.parts?.[0];
    const text = part?.text ?? "No response.";

    history.push({ role: "assistant", parts: [{ text }] });

    console.log("Final Answer:", text);
    return text;
  }

  async function step(userInput: string): Promise<string> {

    const messages = sanitizeHistory().concat([
      { role: "user", parts: [{ text: userInput }] }
    ]);


    const response = await model.generateContent({
      systemInstruction: `
        You are an AI Agent with access to workspace documents and the internet.

        TOOLS YOU HAVE:
        • search_workspace_documents — use this to search workspace PDFs, notes, files.
        • web_search — use this to search the internet for external knowledge.

        RULES:
        • If the question mentions "workspace", "PDF", "document", "file", "notes",
          or anything internal → ALWAYS call search_workspace_documents.
        • NEVER ask the user for workspaceId. YOU ALREADY HAVE IT: ${workspaceId}.
        • If the info is NOT in the workspace, then use web_search.
        • Never answer from memory when tool data is available.
        • Use one tool per turn. Then finish the answer normally.
      `,
      contents: messages
    });

    const part = response.response?.candidates?.[0]?.content?.parts?.[0];

    // TOOL CALL?
    if (part?.functionCall) {
      const { name, args } = part.functionCall;

      console.log("Tool Call: ", name, args);

      let result;

      if (name === "web_search") {
        //@ts-ignore
        result = await webSearchTool(args.query);
      }

      if (name === "search_workspace_documents") {
        const vTool = createVectorTool(workspaceId);
        //@ts-ignore
        result = await vTool(args.query);
      }

      history.push({ role: "assistant", parts: [part] });

      history.push({
        role: "tool",
        parts: [{ text: JSON.stringify(result) }]
      });

      return continueAssistant();
    }

    const text = part?.text ?? "No response.";

    history.push({ role: "assistant", parts: [{ text }] });

    return text;
  }

  try {
    const output = await step(query);
    return output;
  } catch (e) {
    console.error("AGENT FAILED:", e);
    return "Agent encountered an error.";
  }
}
