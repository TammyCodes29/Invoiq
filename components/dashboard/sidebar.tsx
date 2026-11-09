"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState, useSyncExternalStore } from "react";
import {
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

function subscribeToHydration() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userButtonReady = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );

  function renderUserButton() {
    return userButtonReady ? (
      <UserButton />
    ) : (
      <span aria-hidden="true" className="size-8 rounded-full bg-[#31574c]" />
    );
  }

  function renderNavigation(onNavigate?: () => void) {
    return navigation.map((item) => {
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
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-[#f4f6f1] text-[#1b483d]"
              : "text-[#c2d2ca] hover:bg-white/10 hover:text-white"
          )}
        >
          <Icon className="size-5 shrink-0" />
          <span>{item.name}</span>
        </Link>
      );
    });
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#31574c] bg-[#183d33] px-4 text-white md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#c4e6d3] text-[#183d33]">
            <WalletCards className="size-4" />
          </span>
          <span className="font-bold text-white">Invoiq</span>
        </Link>

        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              className="text-[#d5e4dc] hover:bg-white/10 hover:text-white"
            >
              <Menu />
            </Button>
          </DialogTrigger>
          <DialogContent className="left-auto right-0 top-0 h-dvh w-[min(18rem,85vw)] max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-[#31574c] bg-[#183d33] p-0 text-white data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-top-0">
            <DialogTitle className="flex h-16 items-center gap-3 border-b border-white/10 px-6 text-lg font-bold">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#c4e6d3] text-[#183d33]">
                <WalletCards className="size-5" />
              </span>
              Invoiq
            </DialogTitle>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {renderNavigation(() => setMobileMenuOpen(false))}
            </nav>
            <div className="flex items-center gap-3 border-t border-white/10 p-4">
              {renderUserButton()}
              <div>
                <p className="text-sm font-medium text-white">Account</p>
                <p className="text-xs text-[#a9c0b4]">Profile and sign out</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#31574c] bg-[#183d33] text-white md:flex">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="flex h-16 items-center justify-center gap-3 border-b border-white/10 px-3 md:justify-start md:px-6"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#c4e6d3] text-[#183d33]">
          <WalletCards className="size-5" />
        </span>

        <span className="hidden text-lg font-bold text-white md:inline">
            Invoiq
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {renderNavigation()}
      </nav>

      {/* User account */}
      <div className="flex items-center justify-center gap-3 border-t border-white/10 p-4 md:justify-start">
        {renderUserButton()}

        <div className="hidden md:block">
          <p className="text-sm font-medium text-white">Account</p>
          <p className="text-xs text-[#a9c0b4]">Profile and sign out</p>
        </div>
      </div>
    </aside>
    </>
  );
}