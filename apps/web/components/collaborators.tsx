"use client";

// import { useOthers, useMyPresence } from "../../liveblocks.config";
import { useOthers, useMyPresence } from "@liveblocks/react";

// Helper to generate consistent colors from names
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

export default function Collaborators() {
  const others = useOthers();
  const [myPresence, updateMyPresence] = useMyPresence();

  const handlePointerMove = (e: React.PointerEvent) => {
    updateMyPresence({
      cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) }
    });
  };

  return (
    <div 
      onPointerMove={handlePointerMove}
      className="flex items-center gap-2 mb-4 p-2 bg-white rounded-full border shadow-sm w-fit"
    >
      <span className="text-xs font-bold text-gray-400 ml-2 mr-2">
        LIVE
      </span>

      <div className="relative w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-100">
        Me
      </div>

      {others.map(({ connectionId, info }) => (
        <div
          key={connectionId}
          className="relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ring-2 ring-gray-100"
          style={{ backgroundColor: stringToColor(info?.name || "Anon") }}
          title={info?.name || "Anonymous"}
        >
          {info?.name?.charAt(0) || "A"}
        </div>
      ))}

      {others.length === 0 && (
        <span className="text-xs text-gray-400 pr-2">
          Waiting for team...
        </span>
      )}
    </div>
  );
}