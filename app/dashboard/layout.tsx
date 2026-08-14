import type { ReactNode } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
import { syncUserToDatabase } from "@/lib/user-sync";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email =
    clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    console.warn("DashboardLayout: authenticated Clerk user has no email address; skipping DB sync", userId);
  } else {
    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ");

    try {
      try {
        await syncUserToDatabase(userId, email, fullName || undefined)
      } catch (error) {
        console.error("DashboardLayout: failed to sync user to DB", error)
        // Don't crash the layout over a sync failure
        // The user is authenticated, let them in
      };
    } catch (err) {
      console.error("DashboardLayout: failed to sync user to DB", err);
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl p-5 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}