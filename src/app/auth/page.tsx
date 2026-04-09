"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

function AuthInner() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(modeParam === "signup" ? false : true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    const supabase = createClient();
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the confirmation link!");
      }
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email first to reset your password.");
      return;
    }
    const supabase = createClient();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth`
          : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Password reset email sent. Check your inbox.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#005d90]/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#005d90]/5 blur-[120px]" />

      <main className="w-full max-w-5xl grid md:grid-cols-2 rounded-[2rem] overflow-hidden bg-white shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] relative z-10 border border-slate-100">
        {/* Brand Side */}
        <section className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#005d90] to-[#0077b6] text-white">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-2xl font-bold tracking-tight">
                GrantMe
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Your Academic
              <br />
              Funding Partner.
            </h1>
            <p className="text-blue-100/80 text-lg max-w-xs pt-4 font-light leading-relaxed">
              Access AI-powered grant discovery built for Canadian university
              students. Your workspace for academic funding success.
            </p>
          </div>

          <div />
        </section>

        {/* Form Side */}
        <section className="p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-6">
              <span className="text-2xl font-bold tracking-tight text-[#005d90]">
                GrantMe
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-[#0f172a] mb-2">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-[#475569]">
              {isLogin
                ? "Enter your credentials to access your dashboard."
                : "Start discovering grants tailored to your research."}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="text-xs font-bold uppercase tracking-widest text-slate-500"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#005d90] transition-colors" />
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#005d90]/10 focus:bg-white focus:border-[#005d90] transition-all placeholder:text-slate-400 text-[#0f172a] font-medium"
                  id="email"
                  type="email"
                  placeholder="name@university.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-slate-500"
                  htmlFor="password"
                >
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-[#005d90] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#005d90] transition-colors" />
                <input
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#005d90]/10 focus:bg-white focus:border-[#005d90] transition-all placeholder:text-slate-400 text-[#0f172a] font-medium"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#005d90]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#005d90] text-white font-semibold rounded-xl shadow-[0_15px_30px_-10px_rgba(0,93,144,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(0,93,144,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-600">
            {isLogin ? "New to GrantMe? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-[#005d90] font-bold hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 w-full px-6 flex justify-end items-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
        <div>© 2026 GrantMe</div>
      </footer>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#005d90] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthInner />
    </Suspense>
  );
}
