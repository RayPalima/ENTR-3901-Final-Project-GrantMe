import Link from "next/link";
import {
  Sparkles,
  FileText,
  Search,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-white text-[#0f172a] selection:bg-[#0077b6] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 h-16">
        <span className="text-2xl font-bold tracking-tight text-blue-900">GrantMe</span>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm tracking-wide font-medium text-slate-600 hover:text-blue-800 transition-colors">Features</a>
          <a href="#stats" className="text-sm tracking-wide font-medium text-slate-600 hover:text-blue-800 transition-colors">Results</a>
          <Link href="/auth?mode=signup" className="text-sm tracking-wide font-medium text-slate-600 hover:text-blue-800 transition-colors">Get Started</Link>
        </div>
        <Link href="/auth" className="px-5 py-2 rounded-xl bg-gradient-to-br from-[#005d90] to-[#0077b6] text-white font-semibold text-sm shadow-lg shadow-[#005d90]/20 hover:translate-y-[-1px] transition-all active:scale-95">
          Sign In
        </Link>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden px-8 py-24 md:py-32 flex flex-col items-center justify-center min-h-[80vh] bg-white">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0077b6]/5 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#007c95]/5 rounded-full blur-[100px] -ml-48 -mb-48" />
          </div>
          <div className="relative z-10 max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 text-[#005d90] text-[10px] uppercase tracking-widest font-bold">
              <Sparkles className="w-3 h-3 mr-2" />
              AI-Powered Grant Discovery
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Turn Your Research Into{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#005d90] to-[#0077b6]">Funded Reality.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#475569] max-w-2xl mx-auto leading-relaxed">
              GrantMe helps Canadian university students automatically find
              government, institutional, and academic grants, and generates
              either full proposals or copy-pasteable portal answers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-br from-[#005d90] to-[#0077b6] text-white font-semibold text-lg shadow-xl shadow-[#005d90]/20 hover:translate-y-[-2px] transition-all active:scale-95">
                Find Grants
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-100 text-[#005d90] font-semibold text-lg hover:bg-slate-200 transition-all active:scale-95">
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="px-8 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-white border border-slate-100 rounded-xl p-8 shadow-sm flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#005d90]/10 flex items-center justify-center text-[#005d90]">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold">Precision Grant Matching</h3>
                <p className="text-[#475569] leading-relaxed">
                  Our AI agents query live grant APIs to find funding programs
                  matching your field of study and degree level.
                </p>
              </div>
              <div className="mt-8 rounded-xl overflow-hidden bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Top Opportunities</span>
                  <span className="text-xs font-medium text-[#005d90]">Live Scan</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-bold">NSERC</div>
                      <span className="text-sm font-medium">Discovery Research Grant</span>
                    </div>
                    <span className="text-sm font-bold text-[#0077b6]">$35,000</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-cyan-100 flex items-center justify-center text-cyan-800 text-xs font-bold">SSHRC</div>
                      <span className="text-sm font-medium">Insight Development Grant</span>
                    </div>
                    <span className="text-sm font-bold text-[#0077b6]">$75,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 bg-[#0077b6] rounded-xl p-8 text-white flex flex-col justify-between shadow-lg shadow-[#0077b6]/10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">AI Draft Generator</h3>
                <p className="text-white/80 leading-relaxed">
                  Our AI generates full academic proposals or copy-paste-ready
                  portal answers with strict word limits — in minutes, not weeks.
                </p>
              </div>
              <div className="mt-8 flex justify-end">
                <ShieldCheck className="w-16 h-16 text-white/30" />
              </div>
            </div>

            <div className="md:col-span-4 bg-slate-50 border border-slate-100 rounded-xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Smart Eligibility Check</h3>
                <p className="text-[#475569] text-sm">
                  Our Gatekeeper agent evaluates your profile against live
                  requirements and tells you exactly why you do or don&apos;t
                  qualify — before you waste time applying.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400" />
                </div>
                <span className="text-xs font-medium text-[#475569]">Built for Canadian students</span>
              </div>
            </div>

            <div className="md:col-span-8 bg-slate-50 relative rounded-xl overflow-hidden min-h-[300px] border border-slate-100">
              <div className="absolute inset-0 bg-gradient-to-br from-[#005d90]/5 to-[#007c95]/5" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-center max-w-md">
                <BookOpen className="w-10 h-10 text-[#005d90] mb-4" />
                <h3 className="text-2xl font-bold mb-4">Built for the next generation of researchers.</h3>
                <p className="text-[#475569] mb-6">
                  From undergrad research to doctoral dissertations, we provide
                  the AI-powered backbone for your academic funding journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="py-24 bg-white border-y border-slate-50">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-[#005d90]">4M+</p>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Grant Records</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-[#005d90]">$7.9B</p>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">NSERC Funded</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-[#005d90]">4</p>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">AI Agents</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="px-8 py-24 bg-white">
          <div className="max-w-5xl mx-auto bg-[#0f172a] rounded-2xl p-12 text-center relative overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#005d90] rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#007c95] rounded-full blur-[80px]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stop searching, start researching.</h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Join the platform where funding meets focus. Get started for free today.
            </p>
            <Link href="/auth?mode=signup" className="bg-[#0077b6] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#005d90] transition-all shadow-lg shadow-black/20 inline-block">
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-8 py-12 border-t border-slate-100 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <span className="text-xl font-bold tracking-tight text-blue-900">GrantMe</span>
        <p className="text-xs font-medium text-slate-400">© 2026 GrantMe. All rights reserved.</p>
      </footer>
    </div>
  );
}
