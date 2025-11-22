"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, FileText, CheckCircle2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function UploadModal({ workspaceId }: { workspaceId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        if (droppedFile.size > 10 * 1024 * 1024) {
          toast.error("File size must be less than 10MB");
          return;
        }
        setFile(droppedFile);
      } else {
        toast.error("Only PDF files are allowed");
      }
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

      toast.success("Document ingested and vectorized successfully!");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
          isDragging
            ? "border-emerald-400 bg-emerald-50/50 scale-[1.02]"
            : file
            ? "border-emerald-300 bg-emerald-50/30"
            : "border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-emerald-300 hover:bg-emerald-50/20"
        }`}
      >
        <div className="p-8 flex flex-col items-center justify-center gap-4">
          <div className={`relative transition-all duration-300 ${file ? "scale-110" : ""}`}>
            <div className={`absolute inset-0 rounded-full blur-xl opacity-30 transition-all ${
              file ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
            }`}></div>
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg transition-all ${
              file 
                ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}>
              {file ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <Upload className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg text-gray-800 mb-1">
              {file ? "File Ready to Upload" : "Upload Your Document"}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 justify-center">
              <Sparkles size={12} className="text-amber-500" />
              PDF files only • Max 10MB
            </p>
          </div>

          {!file ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer w-full"
              >
                <div className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 hover:from-emerald-50 hover:to-teal-50 border border-gray-200 hover:border-emerald-300 transition-all text-center group">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 flex items-center justify-center gap-2">
                    <Upload size={16} className="group-hover:scale-110 transition-transform" />
                    Choose File or Drag & Drop
                  </span>
                </div>
              </label>
            </>
          ) : (
            <div className="w-full space-y-3">
              <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-md">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    disabled={isUploading}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start AI Ingestion
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-emerald-700 font-semibold text-lg flex items-center gap-2">
              <Upload className="w-6 h-6 animate-bounce" />
              Drop your file here
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      {/* <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Sparkles size={16} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-900 mb-1">
              AI-Powered Document Processing
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your documents will be vectorized using advanced RAG technology for intelligent search and retrieval.
            </p>
          </div>
        </div>
      </div> */}
    </Card>
  );
}