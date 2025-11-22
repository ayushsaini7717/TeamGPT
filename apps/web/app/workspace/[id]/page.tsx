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
import { 
  MousePointer2, 
  EyeOff, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  Users,
  Menu,
  X,
  Zap
} from "lucide-react";

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
  const [showDocsMobile, setShowDocsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myPresence, updateMyPresence] = useMyPresence();

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:8000/api/workspaces/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWorkspaceName(data.name);
        } else setWorkspaceName("Unknown Workspace");
      } catch {
        setWorkspaceName("Unknown Workspace");
      }
    };
    load();
  }, [workspaceId, getToken]);

  const handleCopy = () => {
    navigator.clipboard.writeText(workspaceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main
      onPointerMove={(e: React.PointerEvent) =>
        updateMyPresence({ cursor: { x: Math.round(e.pageX), y: Math.round(e.pageY) } })
      }
      onPointerLeave={() => updateMyPresence({ cursor: null })}
      className="relative flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-0 -left-8 w-48 h-48 md:w-80 md:h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-10 -right-8 w-48 h-48 md:w-80 md:h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-12 left-20 w-48 h-48 md:w-80 md:h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-6000" />
      </div>

      {showCursors && <LiveCursors />}

      <header className="z-30 w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex-shrink-0">
        <div className="max-w-full h-full">
          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg border border-white/40 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg blur-md opacity-50 animate-pulse"></div>
                  <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Sparkles className="text-white" size={18} />
                  </div>
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 truncate">
                    {workspaceName}
                  </h1>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs bg-blue-50/70 hover:bg-blue-100/80 px-2 py-0.5 sm:py-1 rounded-full border border-blue-200/60 transition-all w-fit"
                  >
                    <span className="hidden sm:inline text-blue-600/70">ID:</span>
                    <span className="font-mono font-semibold text-blue-700">{workspaceId.slice(0, 8)}...</span>
                    {copied ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <Copy size={12} className="text-blue-500/70" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden lg:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCursors(!showCursors)}
                    className={`h-8 text-xs bg-white/80 backdrop-blur-sm border transition-all ${
                      showCursors
                        ? "border-green-300 text-green-700 hover:bg-green-50"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {showCursors ? (
                      <>
                        <MousePointer2 size={14} className="mr-1.5" />
                        <span className="hidden xl:inline">Live Cursors</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} className="mr-1.5" />
                        <span className="hidden xl:inline">Off</span>
                      </>
                    )}
                  </Button>

                  <div className="h-6 w-px bg-gray-300"></div>

                  <Collaborators />
                </div>

                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/80 border border-gray-200 shadow-sm hover:shadow transition-all"
                >
                  {showMobileMenu ? <X size={16} /> : <Menu size={16} />}
                </button>

                <UserButton />
              </div>
            </div>

            {showMobileMenu && (
              <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 space-y-2 animate-slideDown">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Live Cursors</span>
                  <button
                    onClick={() => setShowCursors(!showCursors)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      showCursors
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {showCursors ? "ON" : "OFF"}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Collaborators</span>
                  <Collaborators />
                </div>

                <button
                  onClick={() => {
                    setShowDocsMobile(!showDocsMobile);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-300 transition-all"
                >
                  <span className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <FileText size={14} />
                    Documents Panel
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showDocsMobile && (
        <div className="lg:hidden px-3 sm:px-4 pb-2 flex-shrink-0 z-20 animate-slideDown">
          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg border border-white/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                  <FileText className="text-white" size={14} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Documents</h3>
              </div>
              <button
                onClick={() => setShowDocsMobile(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <UploadModal workspaceId={workspaceId} />

            <div className="mt-2 max-h-[30vh] overflow-y-auto custom-scrollbar">
              <DocumentList workspaceId={workspaceId} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 overflow-hidden">
        <div className="max-w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <aside className="hidden lg:flex lg:col-span-1 flex-col overflow-hidden h-full">
            <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg border border-white/40 p-4 flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                  <FileText className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Documents</h3>
                  <p className="text-[10px] text-gray-500">Upload & Manage</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <UploadModal workspaceId={workspaceId} />
              </div>

              <div className="mt-3 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                <DocumentList workspaceId={workspaceId} />
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Zap size={11} className="text-amber-500" />
                    AI-Powered RAG
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    Collaborative
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <section className="col-span-1 lg:col-span-2 flex flex-col overflow-hidden h-full">
            <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg border border-white/40 p-3 sm:p-4 flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-violet-400 rounded-lg blur-md opacity-40 animate-pulse"></div>
                    <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                      <Sparkles className="text-white" size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">AI Assistant</h3>
                    <p className="text-[10px] text-gray-500">RAG Technology</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatInterface workspaceId={workspaceId} />
              </div>

              <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 flex items-center justify-between gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowDocsMobile(!showDocsMobile)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-300 transition-all"
                >
                  <FileText size={14} className="text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">Docs</span>
                </button>
                
                <button
                  onClick={() => setShowCursors(!showCursors)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    showCursors
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {showCursors ? <MousePointer2 size={14} className="text-green-600" /> : <EyeOff size={14} className="text-gray-600" />}
                  <span className={`text-xs font-medium ${showCursors ? "text-green-700" : "text-gray-700"}`}>
                    Cursors
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </main>
  );
}