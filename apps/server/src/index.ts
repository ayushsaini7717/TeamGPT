import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { processDocument } from "./lib/ingest.js";
import { chatWithDocument } from "./lib/chat.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());


app.post("/api/ingest", upload.single("file"), async (req, res) : Promise<any> => {
  try {
    const file = req.file;
    const { workspaceId } = req.body;

    if (!file || !workspaceId) {
      return res.status(400).json({ error: "Missing file or workspaceId" });
    }

    console.log(`Starting ingestion for workspace: ${workspaceId}`);

    const count = await processDocument(file.buffer, workspaceId);

    res.json({ 
      success: true, 
      message: `Ingested ${count} chunks into workspace ${workspaceId}` 
    });

  } catch (error) {
    console.error("Ingestion failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/api/chat", async (req, res) : Promise<any> => {
  try {
    const { message, workspaceId, history } = req.body;

    if (!message || !workspaceId) {
      return res.status(400).json({ error: "Missing message or workspaceId" });
    }

    console.log(`Chatting in workspace: ${workspaceId}`);
    
    const stream = await chatWithDocument(message, workspaceId, history || []);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error("Chat failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});






app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});