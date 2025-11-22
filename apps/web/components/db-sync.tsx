"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function DbSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;
      try {
        const token = await getToken();
        await fetch("http://localhost:8000/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
          }),
        });
        console.log("✅ Synced with Backend DB");
      } catch (err) {
        console.error("Sync failed", err);
      }
    };
    syncUser();
  }, [isLoaded, user, getToken]);

  return null;
}