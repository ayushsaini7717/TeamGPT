import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
// 1. Import LiveList (or LiveMap/LiveObject)
import { LiveList, LiveObject } from "@liveblocks/client";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_KEY!,
});

// --- PRESENCE (Cursors & Selection) ---
type Presence = {
  cursor: { x: number; y: number } | null;
  isTyping: boolean; // Example: Show "Alice is typing..."
};

// --- STORAGE (Shared Data) ---
// 2. Define the shape of a single item
type SharedNote = {
  id: string;
  text: string;
  author: string;
};

// 3. Define the root Storage
type Storage = {
  // A shared list of notes that everyone can edit
  notes: LiveList<LiveObject<SharedNote>>;
  
  // A simple shared version number
  version: number;
};

// --- USER META (Identity) ---
type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
    avatar?: string;
  };
};

export const {
  RoomProvider,
  useOthers,
  useMyPresence,
  useSelf,
  useStorage,   // <--- You'll use this to read storage
  useMutation,  // <--- You'll use this to write to storage
} = createRoomContext<Presence, Storage, UserMeta>(client);