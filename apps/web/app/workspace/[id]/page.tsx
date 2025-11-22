"use client";

import { useParams } from "next/navigation"; 
import UploadModal from "@/components/upload-modal";
import ChatInterface from "@/components/chat-interface";
import { UserButton } from "@clerk/nextjs";
import { RoomProvider } from "@/liveblocks.config";
import DocumentList from "@/components/document-list";

export default function WorkspacePage() {
  // ✅ Get ID from URL (e.g. /workspace/123 -> 123)
  const params = useParams();
  const workspaceId = params.id as string;

  return (
    <RoomProvider id={workspaceId} initialPresence={{ cursor: null }}>
      <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
        {/* Header */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-8">
           <h1 className="text-2xl font-bold text-blue-900">Workspace: {workspaceId}</h1>
           <UserButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          <div className="lg:col-span-1">
            <UploadModal workspaceId={workspaceId} />
            <DocumentList workspaceId={workspaceId} />
          </div>
          <div className="lg:col-span-2">
            <ChatInterface workspaceId={workspaceId} />
          </div>
        </div>
      </main>
    </RoomProvider>
  );
}