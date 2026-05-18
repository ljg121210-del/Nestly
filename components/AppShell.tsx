"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Home,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Search,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";

type Role = "customer" | "provider" | "admin";

export function AppShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const [open, setOpen] = useState(false);

  const dashboardHref =
    role === "provider" ? "/provider" : role === "admin" ? "/admin" : "/customer";

  const searchHref = role === "provider" ? "/provider/search" : "/customer/search";
  const requestHref = role === "provider" ? "/provider/requests" : "/contact";

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: dashboardHref, label: "Dashboard", icon: LayoutDashboard },
    {
      href: requestHref,
      label: role === "provider" ? "Requests" : "Request Help",
      icon: BriefcaseBusiness,
    },
    {
      href: searchHref,
      label: role === "provider" ? "Search Jobs" : "Search Providers",
      icon: Search,
    },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <main className="min-h-screen bg-nestly-soft text-nestly-ink">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Logo />

          <nav className="hidden items-center gap-6 text-sm font-black md:flex">
            {links.slice(1).map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-nestly-green">
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full bg-nestly-ink text-white md:hidden"
            aria-label="Open menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-black/5 bg-white px-5 py-4 md:hidden">
            <div className="grid gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl bg-nestly-soft px-4 py-4 text-sm font-black"
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <section className="mx-auto max-w-7xl px-5 py-6">{children}</section>
    </main>
  );
}
