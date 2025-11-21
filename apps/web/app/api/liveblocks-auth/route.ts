import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: "sk_...", // ⚠️ Get your SECRET KEY from Liveblocks Dashboard
});

export async function POST(request: NextRequest) {
  const { room } = await request.json();

  // Fake random user for now
  const userIndex = Math.floor(Math.random() * 4);
  const names = ["Alice", "Bob", "Charlie", "Diana"];

  const user = {
    id: `user-${Math.random()}`,
    info: {
      name: names[userIndex],
      color: "#D583F0",
      avatar: "https://liveblocks.io/avatars/avatar-1.png",
    },
  };

  const session = liveblocks.prepareSession(user.id, { userInfo: user.info });
  session.allow(room, session.FULL_ACCESS);
  const { body, status } = await session.authorize();

  return new NextResponse(body, { status });
}