"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

type Doc = { id: string; name: string; createdAt: string };

export default function DocumentList({ workspaceId }: { workspaceId: string }) {
  const { getToken } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:8000/api/workspaces/${workspaceId}/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setDocs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
    // Poll every 5 seconds to see new uploads
    const interval = setInterval(fetchDocs, 5000);
    return () => clearInterval(interval);
  }, [workspaceId, getToken]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border h-fit">
      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
        <FileText size={18} /> Knowledge Base
      </h3>
      
      {loading ? (
        <Loader2 className="animate-spin text-gray-400 mx-auto" />
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No documents yet.</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li key={doc.id} className="text-sm p-2 bg-gray-50 rounded flex items-center gap-2 truncate text-gray-600">
              <FileText size={14} className="text-blue-500 shrink-0" />
              <span className="truncate">{doc.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}