import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { processDocument } from "./lib/ingest";
import { runAgent } from "./lib/agent";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Ingest Route
app.post("/api/ingest", upload.single("file"), async (req, res) : Promise<any> => {
  try {
    const file = req.file;
    const { workspaceId } = req.body;
    if (!file || !workspaceId) return res.status(400).json({ error: "No file" });

    await processDocument(file.buffer, workspaceId);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ingest failed" });
  }
});

// Agent Chat Route
app.post("/api/chat", async (req, res) => {
  const { message, workspaceId } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message received." });
  }

  try {
    const reply = await runAgent(message, workspaceId);
    return res.json({ reply });
  } catch (err) {
    console.error("Chat Route Error:", err);
    return res.json({ reply: "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});