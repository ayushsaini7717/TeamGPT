"use client";

import UploadModal from "@/components/upload-modal";
import ChatInterface from "@/components/chat-interface";
import Collaborators from "@/components/collaborators";
import LiveCursors from "@/components/cursor/live-cursors"; 
import { RoomProvider, useMyPresence } from "@/liveblocks.config";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import DbSync from "@/components/db-sync";

export default function Home() {
  const WORKSPACE_ID = "workspace-test-1";

  return (
    <RoomProvider 
      id={WORKSPACE_ID} 
      initialPresence={{ cursor: null, isTyping: false }}
      //@ts-ignore
      initialStorage={() => ({})}
    >
      <WorkspaceContent workspaceId={WORKSPACE_ID} />
    </RoomProvider>
  );
}

function WorkspaceContent({ workspaceId }: { workspaceId: string }) {
  const [myPresence, updateMyPresence] = useMyPresence();

  const handlePointerMove = (e: React.PointerEvent) => {
    updateMyPresence({
      cursor: { 
        x: Math.round(e.pageX), 
        y: Math.round(e.pageY) 
      }
    });
  };

  const handlePointerLeave = () => {
    updateMyPresence({ cursor: null });
  };

  return (
    <main 
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative flex min-h-screen flex-col items-center p-12 bg-gray-50 overflow-hidden"
    >
      <DbSync />
      {/* 🔐 Auth Buttons */}
      <div className="absolute top-4 right-4 flex gap-3">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <a
            href="/sign-in"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
          >
            Sign In
          </a>
          <a
            href="/sign-up"
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium shadow hover:bg-gray-300 transition"
          >
            Sign Up
          </a>
        </SignedOut>
      </div>

      {/* 🖱️ Live cursors */}
      <LiveCursors />

      <div className="w-full max-w-6xl flex justify-between items-center mb-8 z-10">
        <div>
          <h1 className="text-4xl font-bold text-blue-900">TeamGPT</h1>
          <p className="text-gray-600">AI Knowledge Workspace</p>
        </div>
        <Collaborators />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl z-10">
        <div className="lg:col-span-1">
          <UploadModal workspaceId={workspaceId} />
        </div>

        <div className="lg:col-span-2">
          <ChatInterface workspaceId={workspaceId} />
        </div>
      </div>
    </main>
  );
}
