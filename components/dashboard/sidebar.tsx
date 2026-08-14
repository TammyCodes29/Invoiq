"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 md:w-64">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="flex h-16 items-center justify-center gap-3 border-b border-zinc-800 px-3 md:justify-start md:px-6"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <WalletCards className="size-5" />
        </span>

        <span className="hidden text-lg font-bold text-white md:inline">
            Invoiq
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 md:px-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start",
                isActive
                  ? "bg-blue-500/15 text-blue-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon className="size-5 shrink-0" />

              <span className="hidden md:inline">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User account */}
      <div className="flex items-center justify-center gap-3 border-t border-zinc-800 p-4 md:justify-start">
        <UserButton />

        <div className="hidden md:block">
          <p className="text-sm font-medium text-white">Account</p>
          <p className="text-xs text-zinc-500">Profile and sign out</p>
        </div>
      </div>
    </aside>
  );
}