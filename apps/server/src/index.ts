import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { processDocument } from "./lib/ingest";
import { runAgent } from "./lib/agent";
import { requireAuth } from "./lib/auth";
import { StrictAuthProp } from '@clerk/clerk-sdk-node';
import { PrismaClient } from "@prisma/client";

dotenv.config();

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 8000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post("/api/auth/sync", requireAuth, async (req, res) : Promise<any> => {
  const { userId } = req.auth;
  const { email, name } = req.body;

  try {
    const user = await prisma.user.upsert({
      where: { id: userId }, 
      update: { email, name },
      create: { id: userId, email, name },
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Sync failed:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});

// Ingest Route
app.post("/api/ingest", upload.single("file"), async (req, res) : Promise<any> => {
  try {
    const file = req.file;
    const { workspaceId } = req.body;
    if (!file || !workspaceId) return res.status(400).json({ error: "No file" });

    await processDocument(file.buffer, workspaceId,file.originalname, prisma);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ingest failed" });
  }
});

app.get("/api/messages/:workspaceId", requireAuth, async (req, res) : Promise<any> => {
  try {
    const { workspaceId } = req.params;
    
    // Fetch last 50 messages for this workspace
    const messages = await prisma.message.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" }, // Oldest first for chat UI
      take: 50 
    });
    
    res.json(messages);
  } catch (error) {
    console.error("History fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Agent Chat Route

app.post("/api/chat", requireAuth, async (req, res) : Promise<any> => {
  const { userId } = req.auth;
  const { message, workspaceId } = req.body;

  if (!message || !workspaceId) return res.status(400).json({ error: "Missing data" });

  try {
    await prisma.message.create({
      data: {
        content: message,
        role: "user",
        workspaceId,
        userId: userId,
      }
    });

    console.log(`Agent received task: ${message}`);

    const agentResponse = await runAgent(message, workspaceId);
    
    await prisma.message.create({
      data: {
        content: agentResponse,
        role: "ai",
        workspaceId,
      }
    });

    res.json({ response: agentResponse });

  } catch (error) {
    console.error("Agent failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/workspaces", requireAuth, async (req, res) : Promise<any> => {
  const { userId } = req.auth;
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
});


app.post("/api/workspaces", requireAuth, async (req, res) : Promise<any> => {
  const { userId } = req.auth;
  const { name } = req.body;

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        members: {
          create: { userId, role: "ADMIN" } 
        }
      }
    });
    res.json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

app.get("/api/workspaces/:workspaceId/documents", requireAuth, async (req, res) : Promise<any> => {
  const { workspaceId } = req.params;
  const docs = await prisma.document.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(docs);
});

app.get("/api/workspaces/:id", requireAuth, async (req, res) : Promise<any> => {
  const { id } = req.params;
  const { userId } = req.auth;

  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: id,
        members: {
          some: { userId }
        }
      },
      select: { name: true } 
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or access denied" });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});