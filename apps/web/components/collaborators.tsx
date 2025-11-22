"use client";

// ✅ Import from your config to share the same Room context
import { useOthers } from "@/liveblocks.config";

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

  return (
    <div className="flex items-center gap-[-8px] mb-0 p-1.5 bg-white rounded-full border shadow-sm">
      <span className="text-[10px] font-bold text-green-500 ml-2 mr-2 animate-pulse">
        ● LIVE
      </span>

      {/* Me (Optional: You can remove this if you only want to see others) */}
      <div className="relative w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold z-30 ring-1 ring-gray-200">
        Me
      </div>

      {/* Other Users */}
      {others.map(({ connectionId, info }) => (
        <div
          key={connectionId}
          className="relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold -ml-3 shadow-sm transition-all hover:scale-110 z-20"
          style={{ backgroundColor: stringToColor(info?.name || "Anon") }}
          title={info?.name || "Anonymous"}
        >
          {info?.name?.charAt(0) || "A"}
        </div>
      ))}

      {others.length === 0 && (
        <span className="text-xs text-gray-400 ml-2 pr-2">
          Waiting...
        </span>
      )}
    </div>
  );
}