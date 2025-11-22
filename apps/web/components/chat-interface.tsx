"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs"; 
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function ChatInterface({ workspaceId }: { workspaceId: string }) {
  const { getToken } = useAuth(); // Get the token function
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load History on Mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:8000/api/messages/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` } // ✅ Send Token
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    // Optimistic Update
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessages((prev) => [...prev, { role: "ai", content: "Thinking..." }]);
    setIsLoading(true);

    try {
      const token = await getToken(); // ✅ Get fresh token
      
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // ✅ Send Token
        },
        body: JSON.stringify({ message: userMessage, workspaceId }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Update UI with real answer
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

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto mt-8 bg-white shadow-xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot className="w-12 h-12 mb-2 opacity-20" />
            <p>Ask me anything about your documents!</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-lg ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-800 border border-gray-200"
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-bold uppercase">
                {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
                {msg.role}
              </div>
              
              <div className="text-sm leading-relaxed">
                 {msg.content === "Thinking..." && isLoading ? (
                   <span className="flex items-center gap-2 text-gray-500 italic">
                     <Loader2 className="h-3 w-3 animate-spin" /> Agent is researching...
                   </span>
                 ) : (
                   /* ✅ RENDER MARKDOWN HERE */
                   <div className="prose prose-sm max-w-none dark:prose-invert break-words">
                     <ReactMarkdown>{msg.content}</ReactMarkdown>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask a question..." 
            disabled={isLoading} 
            className="bg-white"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </form>
    </Card>
  );
}
// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Send, Bot, User } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";

// type Message = {
//   role: "user" | "ai";
//   content: string;
// };

// export default function ChatInterface({ workspaceId }: { workspaceId: string }) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim() || isLoading) return;

//     const userMessage = input;
//     setInput("");

//     setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
//     setIsLoading(true);

//     // Add empty AI bubble
//     setMessages((prev) => [...prev, { role: "ai", content: "Thinking..." }]);

//     try {
//       const response = await fetch("http://localhost:8000/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           message: userMessage,
//           workspaceId,
//         }),
//       });

//       const data = await response.json();

//       setMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].content = data.reply || "No response.";
//         return updated;
//       });
//     } catch (error) {
//       console.error("Chat error:", error);

//       setMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].content = "Error contacting server.";
//         return updated;
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto mt-8">
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">

//         {messages.length === 0 && (
//           <div className="text-center text-gray-500 mt-20">
//             <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
//             <p>Ask me anything about your uploaded documents!</p>
//           </div>
//         )}

//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//           >
//             <div
//               className={`max-w-[80%] p-3 rounded-lg ${
//                 msg.role === "user"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-800"
//               }`}
//             >
//               <div className="flex items-center gap-2 mb-1">
//                 {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
//                 <span className="text-xs opacity-70 uppercase font-bold">
//                   {msg.role}
//                 </span>
//               </div>
//               <p className="text-sm leading-relaxed whitespace-pre-wrap">
//                 {msg.content}
//               </p>
//             </div>
//           </div>
//         ))}

//         <div ref={messagesEndRef} />

//       </div>

//       <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg">
//         <div className="flex gap-2">
//           <Input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Ask a question..."
//             disabled={isLoading}
//           />
//           <Button type="submit" disabled={isLoading}>
//             <Send size={18} />
//           </Button>
//         </div>
//       </form>
//     </Card>
//   );
// }
