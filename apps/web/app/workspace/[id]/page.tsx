"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import UploadModal from "@/components/upload-modal";
import ChatInterface from "@/components/chat-interface";
import { UserButton, useAuth } from "@clerk/nextjs";
import { RoomProvider, useMyPresence } from "@/liveblocks.config"; 
import DocumentList from "@/components/document-list";
import Collaborators from "@/components/collaborators";
import LiveCursors from "@/components/cursor/live-cursors"; 
import { Button } from "@/components/ui/button";
// ✅ 1. Import Copy and Check icons
import { MousePointer2, EyeOff, Copy, Check } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.id as string;

  return (
    <RoomProvider id={workspaceId} initialPresence={{ cursor: null }}>
      <WorkspaceContent workspaceId={workspaceId} />
    </RoomProvider>
  );
}

function WorkspaceContent({ workspaceId }: { workspaceId: string }) {
  const { getToken } = useAuth();
  const [showCursors, setShowCursors] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("Loading...");
  const [myPresence, updateMyPresence] = useMyPresence();
  
  // ✅ 2. State for copy feedback
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWorkspaceName = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:8000/api/workspaces/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWorkspaceName(data.name);
        } else {
          setWorkspaceName("Unknown Workspace");
        }
      } catch (error) {
        console.error("Failed to fetch workspace name");
      }
    };
    fetchWorkspaceName();
  }, [workspaceId, getToken]);

  // ✅ 3. Handle Copy Logic
  const handleCopy = () => {
    navigator.clipboard.writeText(workspaceId); // Copy FULL ID
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    updateMyPresence({
      cursor: { x: Math.round(e.pageX), y: Math.round(e.pageY) }
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
      {showCursors && <LiveCursors />}

      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 z-10">
         <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-900">
              {workspaceName}
            </h1>
            
            {/* ✅ 4. CLICKABLE ID BUTTON */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] px-3 py-1 h-7 rounded-full font-mono flex items-center gap-2 transition-all border border-blue-100"
            >
              <span>ID: {workspaceId.slice(0, 8)}...</span>
              {copied ? (
                <Check size={12} className="text-green-600" />
              ) : (
                <Copy size={12} className="opacity-50" />
              )}
            </Button>
         </div>
         
         <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCursors(!showCursors)}
              className="bg-white text-xs h-8 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
            >
              {showCursors ? (
                <>
                  <MousePointer2 size={14} className="mr-2 text-green-600" />
                  Cursors: ON
                </>
              ) : (
                <>
                  <EyeOff size={14} className="mr-2 text-gray-400" />
                  Cursors: OFF
                </>
              )}
            </Button>

            <div className="h-6 w-px bg-gray-300 mx-1" /> 

            <Collaborators />
            <UserButton />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl z-10">
        <div className="lg:col-span-1 space-y-6">
          <UploadModal workspaceId={workspaceId} />
          <DocumentList workspaceId={workspaceId} />
        </div>
        <div className="lg:col-span-2">
          <ChatInterface workspaceId={workspaceId} />
        </div>
      </div>
    </main>
  );
}