"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Sparkles, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs"; 
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function ChatInterface({ workspaceId }: { workspaceId: string }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:8000/api/messages/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` } 
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };
    loadHistory();
  }, [workspaceId, getToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    
    // Optimistic Update
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessages((prev) => [...prev, { role: "ai", content: "Thinking..." }]);
    setIsLoading(true);

    try {
      const token = await getToken(); 
      
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMessage, workspaceId }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = data.response;
        return newMessages;
      });

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "Error: Could not reach the Agent.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestedQuestions = [
    "Summarize the key points from our documents",
    "What are the main topics discussed?",
    "Find information about...",
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 scroll-smooth custom-scrollbar min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full blur-xl sm:blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg sm:shadow-xl">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1.5 sm:mb-2">
              AI-Powered Document Assistant
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 text-center max-w-md px-4">
              Ask questions about your documents and get intelligent answers powered by RAG technology
            </p>
            
            <div className="space-y-2 w-full max-w-md px-4">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-1.5">
                <Zap size={11} className="text-amber-500" />
                Suggested Questions
              </p>
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-violet-50 hover:to-purple-50 border border-gray-200 hover:border-violet-300 transition-all text-xs sm:text-sm text-gray-700 hover:text-violet-700 group"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={13} className="text-gray-400 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                    <span className="line-clamp-2">{question}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
          >
            <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-md ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                  : "bg-gradient-to-br from-violet-500 to-purple-600"
              }`}>
                {msg.role === "user" ? (
                  <User size={14} className="text-white sm:w-4 sm:h-4" />
                ) : (
                  <Bot size={14} className="text-white sm:w-4 sm:h-4" />
                )}
              </div>

              <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm" 
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                }`}>
                  <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide mb-1 sm:mb-1.5 opacity-70">
                    {msg.role === "user" ? "You" : "AI Assistant"}
                  </div>
                  
                  <div className="text-xs sm:text-sm leading-relaxed">
                    {msg.content === "Thinking..." && isLoading ? (
                      <span className="flex items-center gap-2 text-gray-500 italic">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> 
                        <span className="animate-pulse text-xs">Analyzing documents...</span>
                      </span>
                    ) : (
                      <div className={`prose prose-xs sm:prose-sm max-w-none break-words ${
                        msg.role === "user" ? "prose-invert" : ""
                      }`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
                
                <span className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 sm:mt-1 px-1">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm flex-shrink-0">
        <div className="p-2.5 sm:p-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about your documents..." 
                disabled={isLoading} 
                className="bg-white border-gray-300 focus:border-violet-400 focus:ring-violet-400 rounded-lg sm:rounded-xl pr-10 sm:pr-12 py-2 sm:py-2.5 text-xs sm:text-sm shadow-sm transition-all resize-none"
              />
              {input.length > 0 && (
                <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-gray-400">
                  {input.length}
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="h-9 sm:h-10 w-9 sm:w-10 p-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 px-0.5">
            <p className="text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1">
              <Sparkles size={10} className="text-violet-400 sm:w-3 sm:h-3" />
              Powered by RAG
            </p>
            {messages.length > 0 && (
              <p className="text-[10px] sm:text-[11px] text-gray-400">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}