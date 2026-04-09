"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BarChart3,
  Shield,
  FileText,
  Play,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

type AgentStatus = "idle" | "active" | "complete" | "error";

interface AgentState {
  scout: AgentStatus;
  researcher: AgentStatus;
  gatekeeper: AgentStatus;
  drafter: AgentStatus;
}

const agents = [
  {
    key: "scout" as const,
    name: "Program Scout",
    description: "Queries GrantData.ca for real federal grants matching your field of study.",
    icon: Search,
  },
  {
    key: "researcher" as const,
    name: "Deep Researcher",
    description: "Uses SERP API to find live eligibility requirements and application formats.",
    icon: BarChart3,
  },
  {
    key: "gatekeeper" as const,
    name: "Gatekeeper",
    description: "Evaluates your profile against live requirements. Routes eligible/ineligible.",
    icon: Shield,
  },
  {
    key: "drafter" as const,
    name: "The Drafter",
    description: "Generates academic proposals or Student's Grant Cheat Sheets.",
    icon: FileText,
  },
];

export default function WorkflowPage() {
  const router = useRouter();
  const [agentStates, setAgentStates] = useState<AgentState>({
    scout: "idle",
    researcher: "idle",
    gatekeeper: "idle",
    drafter: "idle",
  });
  const [hasProfile, setHasProfile] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ agent: string; message: string; time: string }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("grantme_profile");
    if (stored) setHasProfile(true);
  }, []);

  function addLog(agent: string, message: string) {
    setLogs((prev) => [
      { agent, message, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  }

  function getStatusBadge(status: AgentStatus) {
    switch (status) {
      case "idle":
        return (
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Idle
          </span>
        );
      case "active":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-[#005d90]/5 rounded-full">
            <Loader2 className="w-3 h-3 text-[#005d90] animate-spin" />
            <span className="text-[10px] text-[#005d90] font-bold">PROCESSING</span>
          </span>
        );
      case "complete":
        return (
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> COMPLETE
          </span>
        );
      case "error":
        return (
          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> ERROR
          </span>
        );
    }
  }

  function getTrackerNodeClass(status: AgentStatus) {
    switch (status) {
      case "complete":
        return "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20";
      case "active":
        return "bg-[#005d90] text-white shadow-lg shadow-[#005d90]/20 animate-pulse";
      case "error":
        return "bg-red-500 text-white";
      default:
        return "bg-slate-100 text-slate-500";
    }
  }

  function getBarWidth(currentKey: keyof AgentState, nextKey: keyof AgentState) {
    if (agentStates[nextKey] === "complete") return "w-full";
    if (agentStates[nextKey] === "active") return "w-1/2";
    if (agentStates[currentKey] === "complete") return "w-full";
    return "w-0";
  }

  async function handleRunWorkflow() {
    setRunning(true);
    setError(null);
    setLogs([]);

    const stored = localStorage.getItem("grantme_profile");
    if (!stored) {
      setError("No profile found. Please complete your profile first.");
      setRunning(false);
      return;
    }
    const profile = JSON.parse(stored);

    // Animate Agent 1
    setAgentStates({ scout: "active", researcher: "idle", gatekeeper: "idle", drafter: "idle" });
    addLog("Program Scout", "Querying GrantData.ca federal grant database...");

    await new Promise((r) => setTimeout(r, 500));
    addLog("Program Scout", `Searching grants for ${profile.fieldOfStudy || "your field"} with funding ≥ $${Number(profile.fundingNeeded || 5000).toLocaleString()}...`);

    try {
      // Animate sequentially while the actual API does the work
      const animateAndCall = async () => {
        // The real API call runs all 4 agents server-side
        const res = await fetch("/api/workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
        });
        return res.json();
      };

      // Start the API call
      const apiPromise = animateAndCall();

      // Animate through the stages while waiting
      await new Promise((r) => setTimeout(r, 2000));
      setAgentStates({ scout: "complete", researcher: "active", gatekeeper: "idle", drafter: "idle" });
      addLog("Program Scout", "Found matching federal grant programs from GrantData.ca.");
      addLog("Deep Researcher", "Running SERP API search for live eligibility requirements...");

      await new Promise((r) => setTimeout(r, 3000));
      setAgentStates({ scout: "complete", researcher: "complete", gatekeeper: "active", drafter: "idle" });
      addLog("Deep Researcher", "Eligibility requirements and application formats extracted.");
      addLog("Gatekeeper", "Evaluating your academic profile against live requirements...");

      await new Promise((r) => setTimeout(r, 3000));
      setAgentStates({ scout: "complete", researcher: "complete", gatekeeper: "complete", drafter: "active" });
      addLog("Gatekeeper", "Eligibility fork complete — routing eligible grants to Drafter.");
      addLog("The Drafter", "Generating academic proposals and cheat sheets...");

      // Wait for the actual API result
      const data = await apiPromise;

      if (data.error) {
        throw new Error(data.error);
      }

      setAgentStates({ scout: "complete", researcher: "complete", gatekeeper: "complete", drafter: "complete" });
      addLog("The Drafter", "All drafts generated successfully.");

      // Store results and debug traces, then navigate
      localStorage.setItem("grantme_results", JSON.stringify(data.results));
      if (data.debug) {
        localStorage.setItem("grantme_debug", JSON.stringify(data.debug));
      }

      await new Promise((r) => setTimeout(r, 1000));
      router.push("/dashboard/results");
    } catch (e) {
      console.error("Workflow error:", e);
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      setAgentStates((prev) => {
        const newState = { ...prev };
        for (const key of Object.keys(newState) as (keyof AgentState)[]) {
          if (newState[key] === "active") newState[key] = "error";
        }
        return newState;
      });
      setRunning(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-xs font-semibold text-[#005d90] tracking-widest uppercase mb-2">
            Workflow Analysis
          </p>
          <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">
            AI Multi-Agent <span className="text-[#005d90]">Orchestration</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <span className={`w-2 h-2 rounded-full ${running ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`} />
          <span className="text-xs font-semibold text-slate-600">
            {running ? "Agents Running" : "System Ready"}
          </span>
        </div>
      </header>

      {/* Grant Status Tracker */}
      <section className="bg-white border border-slate-100 p-10 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#005d90]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          {agents.map((agent, i) => (
            <div key={agent.key} className="contents">
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${getTrackerNodeClass(agentStates[agent.key])}`}>
                  <agent.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-tighter text-[#0f172a]">
                  {agent.name}
                </span>
                {getStatusBadge(agentStates[agent.key])}
              </div>
              {i < agents.length - 1 && (
                <div className="hidden md:block h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-[#005d90] rounded-full transition-all duration-700 ${getBarWidth(agent.key, agents[i + 1].key)}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-red-900">Workflow Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Run Button */}
      {!running && agentStates.drafter !== "complete" && (
        <div className="flex justify-center">
          <button
            onClick={handleRunWorkflow}
            disabled={!hasProfile || running}
            className="px-10 py-4 bg-gradient-to-br from-[#005d90] to-[#0077b6] text-white font-bold text-lg rounded-xl shadow-xl shadow-[#005d90]/20 hover:translate-y-[-2px] transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Play className="w-5 h-5" />
            {hasProfile ? "Run AI Agent Workflow" : "Complete Your Profile First"}
          </button>
        </div>
      )}

      {/* Agent Cards + Live Feed */}
      <div className="grid grid-cols-12 gap-6">
        {/* Agent Grid */}
        <div className="col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agents.map((agent) => {
            const status = agentStates[agent.key];
            const isActive = status === "active";
            const isComplete = status === "complete";
            return (
              <div
                key={agent.key}
                className={`bg-white p-5 rounded-xl border transition-all shadow-sm ${
                  isActive
                    ? "border-[#005d90]/20 border-l-4 border-l-[#005d90] shadow-md ring-1 ring-[#005d90]/5"
                    : isComplete
                      ? "border-slate-100 border-l-4 border-l-emerald-500"
                      : "border-slate-100 border-l-4 border-l-slate-300 opacity-75"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isComplete ? "bg-emerald-50 text-emerald-700" :
                    isActive ? "bg-[#005d90]/5 text-[#005d90]" :
                    "bg-slate-50 text-slate-500"
                  }`}>
                    <agent.icon className="w-4 h-4" />
                  </div>
                  {getStatusBadge(status)}
                </div>
                <h3 className="text-sm font-bold text-[#0f172a] mb-1">{agent.name}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{agent.description}</p>
                {isActive && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                    <div className="bg-[#005d90] h-full rounded-full w-2/3 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Intelligence Feed */}
        <div className="col-span-12 lg:col-span-7 bg-slate-50 border border-slate-100 rounded-xl p-6 min-h-[300px] flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-blue-900 mb-1">Active Intelligence Stream</h2>
              <p className="text-sm text-[#475569]">Live feeds from the agent pipeline</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px]">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Click &ldquo;Run AI Agent Workflow&rdquo; to begin...
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-[#005d90]/5 flex items-center justify-center text-[#005d90] flex-shrink-0">
                    <Search className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-[#005d90] uppercase">{log.agent}</span>
                      <span className="text-[10px] text-slate-400">{log.time}</span>
                    </div>
                    <p className="text-xs text-[#0f172a] font-medium">{log.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
