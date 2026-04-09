"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import {
  FolderOpen,
  FileText,
  ShieldCheck,
  Users,
  BarChart3,
  HelpCircle,
  LogOut,
  Bell,
  Settings,
  Plus,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Workspace", icon: FolderOpen },
  { href: "/dashboard/workflow", label: "AI Agents", icon: FileText },
  { href: "/dashboard/results", label: "Results", icon: ShieldCheck },
];

const sidebarItems = [
  { href: "/dashboard", label: "Workspace", icon: FolderOpen },
  { href: "/dashboard/workflow", label: "AI Agents", icon: FileText },
  { href: "/dashboard/results", label: "Results", icon: ShieldCheck },
  { href: "#", label: "Team", icon: Users },
  { href: "#", label: "Analytics", icon: BarChart3 },
];

export function DashboardShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 h-16">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold tracking-tight text-blue-900">
            GrantMe
          </span>
          <div className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm tracking-wide font-medium transition-colors ${
                  pathname === item.href
                    ? "text-blue-700 border-b-2 border-blue-600 pb-1"
                    : "text-slate-600 hover:text-blue-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all active:scale-95">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden bg-[#0077b6] flex items-center justify-center text-white text-xs font-bold">
            {userEmail.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-64 pt-16 bg-white border-r border-slate-100 flex-col px-4 space-y-2 hidden lg:flex">
        <div className="py-6 px-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-[#0077b6] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#005d90]/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-blue-900">
                University Portal
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Grant Workspace
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full py-3 bg-gradient-to-br from-[#005d90] to-[#0077b6] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#005d90]/10 mb-8 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            New Grant Application
          </Link>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
                    isActive
                      ? "bg-slate-50 text-blue-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-semibold">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pb-8 px-2 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              Help Center
            </span>
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-semibold">
                Logout
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 px-8 pb-12 min-h-screen bg-white">
        {children}
      </main>
    </div>
  );
}
