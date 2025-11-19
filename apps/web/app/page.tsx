import UploadModal from "@/components/upload-modal";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">TeamGPT Ingestion Engine</h1>
      <div className="w-full max-w-md">
        {/* We hardcode a workspace ID for testing Phase 2 */}
        <UploadModal workspaceId="workspace-test-1" />
      </div>
    </main>
  );
}