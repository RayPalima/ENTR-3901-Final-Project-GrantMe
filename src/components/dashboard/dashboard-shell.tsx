"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  ShieldCheck,
  Bookmark,
  LogOut,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "Profile", icon: GraduationCap },
  { href: "/dashboard/workflow", label: "Search", icon: FileText },
  { href: "/dashboard/results", label: "Results", icon: ShieldCheck },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
];

export function DashboardShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("grantme_sidebar_collapsed");
      if (saved === "1") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    async function loadName() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();
      const first = data?.first_name?.trim() ?? "";
      const last = data?.last_name?.trim() ?? "";
      const name = `${first} ${last}`.trim();
      if (name) {
        setFullName(name);
      }
    }
    loadName();
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("grantme_sidebar_collapsed", next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* SideNavBar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-slate-100 flex-col px-3 space-y-2 hidden lg:flex transition-[width] duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <div className="py-6 px-2">
          <div className={`flex items-center mb-6 ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="h-10 w-10 bg-[#0077b6] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#005d90]/20 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <Link
                  href="/dashboard"
                  className="text-xs uppercase tracking-widest font-semibold text-blue-900 hover:text-[#005d90] transition-colors"
                >
                  GrantMe
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end mb-6">
            <button
              type="button"
              onClick={toggleCollapsed}
              className={`p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all active:scale-95 ${
                collapsed ? "mx-auto" : ""
              }`}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
                    collapsed ? "justify-center px-0" : "px-3 gap-4"
                  } ${
                    isActive
                      ? "bg-slate-50 text-blue-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span
                    className={`flex items-center justify-center flex-shrink-0 ${
                      collapsed ? "w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  {!collapsed && (
                    <span className="text-xs uppercase tracking-widest font-semibold">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pb-8 px-2 space-y-1">
          <form action={signOut}>
            <button
              type="submit"
              className={`flex items-center px-3 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all w-full ${
                collapsed ? "justify-center" : "gap-3"
              }`}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && (
                <span className="text-xs uppercase tracking-widest font-semibold">
                  Logout
                </span>
              )}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`px-8 pb-12 min-h-screen bg-white transition-[margin] duration-200 ${
          collapsed ? "lg:ml-[76px]" : "lg:ml-64"
        } pt-10`}
      >
        <div className="flex justify-end mb-6">
          <div className="relative inline-block text-left">
            <details className="group">
              <summary className="list-none flex items-center gap-2 cursor-pointer">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-[#0077b6] flex items-center justify-center text-white text-xs font-bold">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden md:inline-block">
                  {fullName || userEmail}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white shadow-lg border border-slate-100 py-2 z-20">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-xs uppercase tracking-widest font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Go to Profile
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-xs uppercase tracking-widest font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </details>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
