'use client' // <-- IMPORTANT: This tells Next.js: "Run this code in the BROWSER, not the server."

import { ClerkProvider } from '@clerk/nextjs'; // Importing Clerk's main component

export default function AppClerkProvider({
  children, // 'children' is whatever content is INSIDE this provider (your whole app)
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider> {/* Clerk wraps your app. It adds "context" so other components can talk to it */}
      {children}
    </ClerkProvider>
  );
}