import UploadModal from "@/components/upload-modal";
import ChatInterface from "@/components/chat-interface";

export default function Home() {
  // Hardcoded for dev
  const WORKSPACE_ID = "workspace-test-1";

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <h1 className="text-4xl font-bold mb-2 text-blue-900">TeamGPT</h1>
      <p className="text-gray-600 mb-8">AI Knowledge Workspace</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Left Sidebar: Upload */}
        <div className="lg:col-span-1">
          <UploadModal workspaceId={WORKSPACE_ID} />
        </div>

        {/* Right Area: Chat */}
        <div className="lg:col-span-2">
          <ChatInterface workspaceId={WORKSPACE_ID} />
        </div>
      </div>
    </main>
  );
}