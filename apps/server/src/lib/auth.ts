import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

export const requireAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error("Auth Error:", error);
    return { error: "Unauthenticated" };
  }
});