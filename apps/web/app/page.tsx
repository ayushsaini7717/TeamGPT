"use client";

import UploadModal from "@/components/upload-modal";
import ChatInterface from "@/components/chat-interface";
import Collaborators from "@/components/collaborators";
import LiveCursors from "@/components/cursor/live-cursors"; 
import { RoomProvider, useMyPresence } from "@/liveblocks.config";

export default function Home() {
  const WORKSPACE_ID = "workspace-test-1";

  return (
    <RoomProvider 
      id={WORKSPACE_ID} 
      initialPresence={{ cursor: null, isTyping: false }}
      //@ts-ignore
      initialStorage={() => ({})}
    >
      {/* We isolate the tracking logic in a wrapper component to use the hook */}
      <WorkspaceContent workspaceId={WORKSPACE_ID} />
    </RoomProvider>
  );
}

// ✅ Create a sub-component so we can use 'useMyPresence' inside RoomProvider
function WorkspaceContent({ workspaceId }: { workspaceId: string }) {
  const [myPresence, updateMyPresence] = useMyPresence();

  // 🖱️ Track mouse movement across the entire window
  const handlePointerMove = (e: React.PointerEvent) => {
    // Subtracting window scroll if you have scrolling, 
    // but for fixed screen e.clientX is fine.
    // To be precise relative to the page:
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
      {/* 🖱️ The Live Cursors Layer */}
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