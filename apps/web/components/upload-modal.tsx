"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function UploadModal({ workspaceId }: { workspaceId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceId", workspaceId);

    try {
      const res = await fetch("http://localhost:8000/api/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Document ingested and vectorized.");
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-8 border-dashed border-2 border-gray-200 flex flex-col items-center justify-center gap-4">
      <div className="bg-blue-50 p-4 rounded-full">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>

      <div className="text-center">
        <h3 className="font-semibold text-lg">Upload Knowledge</h3>
        <p className="text-sm text-gray-500">PDFs only (Max 10MB)</p>
      </div>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
        "
      />

      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ingesting...
          </>
        ) : (
          "Start Ingestion"
        )}
      </Button>
    </Card>
  );
}
