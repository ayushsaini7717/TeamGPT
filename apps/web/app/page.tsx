"use client";

import { useState, useEffect } from "react";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Ensure you have this shadcn component
import { Plus, ArrowRight, Loader2, Lock } from "lucide-react";
import DbSync from "@/components/db-sync";

type Workspace = { id: string; name: string; createdAt: string };

export default function Dashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Workspaces (Only if signed in)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    const fetchWorkspaces = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:8000/api/workspaces", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setWorkspaces(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [isLoaded, isSignedIn, getToken]);

  // 2. Secure Create Function
  const createWorkspace = async () => {
    // 🔒 Security Check: Stop execution if not signed in
    if (!isSignedIn) {
        alert("You must be signed in to create a workspace.");
        return;
    }

    const name = prompt("Enter workspace name:");
    if (!name) return;

    try {
        const token = await getToken();
        const res = await fetch("http://localhost:8000/api/workspaces", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ name })
        });
        
        if (!res.ok) throw new Error("Failed to create");

        const newWorkspace = await res.json();
        router.push(`/workspace/${newWorkspace.id}`);
    } catch (error) {
        alert("Failed to create workspace. Please try again.");
    }
  };

  // 3. Handle Loading State (Spinner)
  if (!isLoaded) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
    );
  }

  // 4. Handle Signed Out State (Landing Page)
  if (!isSignedIn) {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4">
                <Lock className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome to TeamGPT</h1>
            <p className="mb-8 text-gray-500 max-w-md">
                Secure, collaborative AI workspaces for your team. Please sign in to access your dashboard.
            </p>
            <SignInButton mode="modal">
                <Button size="lg" className="font-semibold">
                    Sign In to Continue
                </Button>
            </SignInButton>
        </div>
    );
  }

  // 5. Handle Signed In State (Dashboard)
  return (
    <div className="min-h-screen bg-gray-50 p-12">
      <DbSync />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Workspaces</h1>
            <p className="text-gray-500">Manage your team knowledge bases.</p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

        {loading ? (
          <Loader2 className="animate-spin mx-auto mt-20 text-blue-600" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Card */}
            <button 
                onClick={createWorkspace} 
                className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors bg-white/50 hover:bg-blue-50"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-semibold">Create New</span>
            </button>

            {/* Existing Workspaces */}
            {workspaces.map((ws) => (
              <Card 
                key={ws.id} 
                onClick={() => router.push(`/workspace/${ws.id}`)}
                className="h-40 p-6 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500 flex flex-col justify-between group bg-white"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700 truncate">
                    {ws.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {new Date(ws.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-end">
                   <ArrowRight className="text-gray-300 group-hover:text-blue-500" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}