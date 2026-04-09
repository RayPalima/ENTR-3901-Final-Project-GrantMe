"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Copy,
  Rocket,
  CheckCircle2,
  FileText,
  ClipboardList,
  TrendingUp,
  Check,
  GraduationCap,
  BookOpen,
  Award,
  DollarSign,
  Bug,
  ChevronDown,
  ChevronRight,
  Search,
  BarChart3,
  Shield,
} from "lucide-react";

interface GrantResult {
  record_id: string;
  recipient_legal_name: string;
  department: string;
  agreement_value: number;
  program_en: string;
  agreement_type: string;
  start_date: string;
}

interface ProposalContent {
  introduction: string;
  objectives: string;
  methodology: string;
  budget: string;
}

interface CheatSheetContent {
  personalObjective: string;
  researchFocus: string;
  methodology: string;
  qualifications: string;
  useOfFunds: string;
}

interface DraftResult {
  grantId: string;
  grantName: string;
  format: "full_proposal" | "cheat_sheet";
  content: ProposalContent | CheatSheetContent;
}

interface EligibleResult {
  grant: GrantResult;
  applicationFormat: string;
  draft?: DraftResult;
}

interface IneligibleResult {
  grant: GrantResult;
  reasons: string[];
}

interface WorkflowResults {
  totalGrantsFound: number;
  eligible: EligibleResult[];
  ineligible: IneligibleResult[];
}

interface AgentDebugEntry {
  agent: string;
  grantName?: string;
  input: string;
  rawOutput: string;
  parsed: unknown;
  status: "success" | "error" | "fallback";
  error?: string;
  timestamp: string;
}

// ── Shared Components ──────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 bg-slate-50 text-[#005d90] border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-bold hover:scale-105 active:scale-95 transition-all"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

// ── Proposal Preview ───────────────────────────────────────────────────────────

function ProposalPreview({ draft }: { draft: DraftResult }) {
  const content = draft.content as ProposalContent;
  const sections = [
    { label: "I. Introduction", text: content.introduction },
    { label: "II. Research / Project Objectives", text: content.objectives },
    { label: "III. Methodology / Approach", text: content.methodology },
    { label: "IV. Budget / Use of Funds", text: content.budget },
  ];

  return (
    <div className="bg-white rounded-xl document-shadow p-8 md:p-12 border border-slate-100">
      <div className="border-b-[3px] border-slate-100 pb-8 flex justify-between items-start mb-10">
        <div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl mb-4 flex items-center justify-center border border-slate-100">
            <FileText className="w-6 h-6 text-[#005d90]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Academic Grant Proposal</h2>
          <p className="text-slate-500 text-sm">{draft.grantName}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-900 text-sm">GrantMe AI Draft</p>
          <p className="text-xs text-slate-400 italic">Auto-Generated</p>
        </div>
      </div>
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.label}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-widest text-[#005d90] font-bold">{section.label}</h3>
              <CopyButton text={section.text} />
            </div>
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{section.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

// ── Cheat Sheet Preview ────────────────────────────────────────────────────────

function CheatSheetPreview({ draft }: { draft: DraftResult }) {
  const content = draft.content as CheatSheetContent;
  const sections = [
    { label: "Personal Objective / Statement", icon: GraduationCap, text: content.personalObjective, limit: 100 },
    { label: "Research / Project Focus", icon: BookOpen, text: content.researchFocus, limit: 250 },
    { label: "Proposed Methodology / Action Plan", icon: ClipboardList, text: content.methodology, limit: 250 },
    { label: "Academic Qualifications & Leadership", icon: Award, text: content.qualifications, limit: 150 },
    { label: "Use of Funds", icon: DollarSign, text: content.useOfFunds, limit: 200 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#005d90] font-semibold tracking-widest text-[10px] uppercase mb-1">
            <span className="w-8 h-[2px] bg-[#005d90]" />
            Application Assets
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0f172a]">Student&apos;s Grant Cheat Sheet</h2>
          <p className="text-[#475569] text-sm mt-1">{draft.grantName}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-[#005d90]" />
          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-tighter">AI Optimized</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 hover:border-[#005d90]/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-[#005d90]" />
              <h3 className="text-xl font-bold text-[#0f172a]">Personal Objective</h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Max 100 Words</span>
          </div>
          <CopyButton text={content.personalObjective} />
        </div>
        <div className="bg-slate-50 p-6 rounded-xl text-[#475569] leading-relaxed text-lg italic border-l-4 border-[#005d90]">
          &ldquo;{content.personalObjective}&rdquo;
        </div>
        <div className="mt-3 flex justify-end">
          <span className="text-[10px] font-mono text-[#005d90] font-bold">
            {content.personalObjective.split(/\s+/).filter(Boolean).length} / 100 WORDS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.slice(1).map((section) => {
          const Icon = section.icon;
          const wordCount = section.text.split(/\s+/).filter(Boolean).length;
          return (
            <div key={section.label} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-[#005d90]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-[#005d90]" />
                    <h3 className="text-sm font-bold text-[#0f172a]">{section.label}</h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Max {section.limit} Words</span>
                </div>
                <CopyButton text={section.text} />
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-[#475569] text-sm leading-relaxed whitespace-pre-wrap min-h-[120px]">
                {section.text}
              </div>
              <div className="mt-3 flex justify-end">
                <span className="text-[10px] font-mono text-[#005d90] font-bold">{wordCount} / {section.limit} WORDS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Ineligible Alert ───────────────────────────────────────────────────────────

function IneligibleAlert({ result }: { result: IneligibleResult }) {
  const grantName = result.grant.program_en || result.grant.department;
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
      <div className="bg-slate-900 p-6 flex items-start gap-4">
        <div className="w-12 h-12 bg-[#ffdad6] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10">
          <AlertTriangle className="w-6 h-6 text-[#ba1a1a]" />
        </div>
        <div className="flex-1">
          <span className="inline-block px-3 py-1 bg-[#ffdad6] text-[#93000a] rounded-full text-[10px] font-bold tracking-widest uppercase mb-2">
            Ineligible
          </span>
          <h3 className="text-lg font-bold text-white mb-1">{grantName}</h3>
          <p className="text-slate-300 text-sm">
            {result.grant.department} — ${result.grant.agreement_value?.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="p-6">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Why you don&apos;t qualify:</h4>
        <div className="space-y-2">
          {result.reasons.map((reason, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl border-l-4 border-[#ba1a1a] flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#ba1a1a] mt-0.5 flex-shrink-0" />
              <p className="text-slate-700 text-sm">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Agent Debug Panel ──────────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, typeof Search> = {
  "Program Scout": Search,
  "Deep Researcher": BarChart3,
  "Gatekeeper": Shield,
  "The Drafter": FileText,
};

const STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  error: "bg-red-50 text-red-700 border-red-200",
  fallback: "bg-amber-50 text-amber-700 border-amber-200",
};

function DebugEntry({ entry }: { entry: AgentDebugEntry }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = AGENT_ICONS[entry.agent] ?? Bug;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-[#005d90]/10 flex items-center justify-center text-[#005d90] flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{entry.agent}</span>
            {entry.grantName && (
              <span className="text-xs text-slate-500 truncate max-w-[200px]">— {entry.grantName}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">{entry.timestamp}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[entry.status]}`}>
          {entry.status}
        </span>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Input</h4>
            <pre className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto">
              {entry.input}
            </pre>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Raw AI Output</h4>
            <pre className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto font-mono">
              {entry.rawOutput || "(empty)"}
            </pre>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parsed Result</h4>
            <pre className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto font-mono">
              {JSON.stringify(entry.parsed, null, 2)}
            </pre>
          </div>

          {entry.error && (
            <div>
              <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Error</h4>
              <pre className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-100 whitespace-pre-wrap">
                {entry.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentDebugPanel({ debug }: { debug: AgentDebugEntry[] }) {
  const agentNames = ["Program Scout", "Deep Researcher", "Gatekeeper", "The Drafter"];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <Bug className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Agent Debug Trace</h2>
          <p className="text-sm text-slate-500">{debug.length} entries across {agentNames.filter((a) => debug.some((d) => d.agent === a)).length} agents</p>
        </div>
      </div>

      {agentNames.map((agentName) => {
        const entries = debug.filter((d) => d.agent === agentName);
        if (entries.length === 0) return null;
        const Icon = AGENT_ICONS[agentName] ?? Bug;
        const allSuccess = entries.every((e) => e.status === "success");
        const hasError = entries.some((e) => e.status === "error");

        return (
          <div key={agentName}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-[#005d90]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{agentName}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                allSuccess ? "bg-emerald-50 text-emerald-700" : hasError ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
              }`}>
                {entries.length} {entries.length === 1 ? "call" : "calls"}
              </span>
            </div>
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <DebugEntry key={i} entry={entry} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Results Page ──────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [results, setResults] = useState<WorkflowResults | null>(null);
  const [debug, setDebug] = useState<AgentDebugEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>("eligible");

  useEffect(() => {
    const stored = localStorage.getItem("grantme_results");
    if (stored) {
      try { setResults(JSON.parse(stored)); } catch { /* empty */ }
    }
    const debugStored = localStorage.getItem("grantme_debug");
    if (debugStored) {
      try { setDebug(JSON.parse(debugStored)); } catch { /* empty */ }
    }
  }, []);

  if (!results) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-2">Grant Results</h1>
          <p className="text-slate-600 max-w-lg leading-relaxed">Results from your latest AI agent workflow will appear here.</p>
        </div>
        <div className="bg-slate-50 rounded-[2rem] p-16 text-center border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-[#005d90]/10 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-[#005d90]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No Results Yet</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            Complete your Academic &amp; Research Profile and run the AI Agent Workflow to see matched grants, eligibility results, and generated proposals here.
          </p>
          <a href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-[#005d90] to-[#0077b6] text-white font-semibold rounded-xl shadow-lg shadow-[#005d90]/20 hover:translate-y-[-1px] transition-all active:scale-95">
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">Grant Results</h1>
          <p className="text-slate-600 max-w-lg leading-relaxed">
            {results.totalGrantsFound} grants found. {results.eligible.length} eligible, {results.ineligible.length} ineligible.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("grantme_results");
            localStorage.removeItem("grantme_debug");
            setResults(null);
            setDebug([]);
          }}
          className="px-6 py-2.5 bg-slate-50 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
        >
          Clear Results
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab("eligible")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "eligible" ? "bg-[#005d90] text-white shadow-lg shadow-[#005d90]/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
        >
          Eligible ({results.eligible.length})
        </button>
        <button
          onClick={() => setActiveTab("ineligible")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "ineligible" ? "bg-[#ba1a1a] text-white shadow-lg shadow-red-500/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
        >
          Ineligible ({results.ineligible.length})
        </button>
        {debug.length > 0 && (
          <button
            onClick={() => setActiveTab("debug")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "debug" ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
          >
            <Bug className="w-3.5 h-3.5" />
            Agent Debug ({debug.length})
          </button>
        )}
      </div>

      {/* Eligible Tab */}
      {activeTab === "eligible" && (
        <div className="space-y-12">
          {results.eligible.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-12 text-center border border-slate-100">
              <p className="text-slate-500">No eligible grants found. Try adjusting your profile or field of study.</p>
            </div>
          ) : (
            results.eligible.map((result) => {
              const grantName = result.grant.program_en || result.grant.department;
              return (
                <div key={result.grant.record_id} className="space-y-6">
                  <div className="bg-gradient-to-br from-[#005d90] to-[#0077b6] rounded-xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-[#005d90]/10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">
                          Eligible — {result.applicationFormat === "document_upload" ? "Full Proposal" : "Portal Cheat Sheet"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{grantName}</h3>
                      <p className="text-blue-100 text-sm mt-1">{result.grant.department} — {result.grant.agreement_type}</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      ${result.grant.agreement_value?.toLocaleString()}
                    </div>
                  </div>
                  {result.draft && (
                    result.draft.format === "full_proposal"
                      ? <ProposalPreview draft={result.draft} />
                      : <CheatSheetPreview draft={result.draft} />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Ineligible Tab */}
      {activeTab === "ineligible" && (
        <div className="space-y-6">
          {results.ineligible.length === 0 ? (
            <div className="bg-emerald-50 rounded-xl p-12 text-center border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
              <p className="text-emerald-700 font-semibold">Great news — you&apos;re eligible for all matched grants.</p>
            </div>
          ) : (
            results.ineligible.map((result) => (
              <IneligibleAlert key={result.grant.record_id} result={result} />
            ))
          )}
        </div>
      )}

      {/* Debug Tab */}
      {activeTab === "debug" && debug.length > 0 && (
        <AgentDebugPanel debug={debug} />
      )}
    </div>
  );
}
