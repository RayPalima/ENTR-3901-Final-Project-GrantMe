"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, Trash2, Loader2 } from "lucide-react";

type SavedGrant = {
  id: string;
  grant_record_id: string;
  grant_name: string | null;
  department: string | null;
  agreement_value: number | null;
  agreement_type: string | null;
  start_date: string | null;
  grant_data: unknown;
  created_at: string;
};

function formatDepartment(raw: string | null | undefined): string {
  if (!raw) return "—";
  const cleaned = raw.replace(/\s+,/g, ",").replace(/\s{2,}/g, " ").trim();
  const schoolOfMatch = cleaned.match(/^(.*?),\s*School of$/i);
  if (schoolOfMatch?.[1]) {
    return `School of ${schoolOfMatch[1].trim()}`;
  }
  return cleaned;
}

type DraftResult = {
  format: "full_proposal" | "cheat_sheet";
  content: Record<string, string>;
};

function DraftPreview({ draft }: { draft: DraftResult }) {
  if (draft.format === "full_proposal") {
    const proposalSections = [
      { title: "Introduction", value: draft.content.introduction },
      { title: "Research / Project Objectives", value: draft.content.objectives },
      { title: "Methodology / Approach", value: draft.content.methodology },
      { title: "Budget / Use of Funds", value: draft.content.budget },
    ];
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Saved AI Proposal</h3>
        {proposalSections.map((section) => (
          <div key={section.title} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">{section.title}</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{section.value || "—"}</p>
          </div>
        ))}
      </div>
    );
  }

  const cheatSections = [
    { title: "Personal Objective", value: draft.content.personalObjective },
    { title: "Research / Project Focus", value: draft.content.researchFocus },
    { title: "Proposed Methodology / Action Plan", value: draft.content.methodology },
    { title: "Academic Qualifications & Leadership", value: draft.content.qualifications },
    { title: "Use of Funds", value: draft.content.useOfFunds },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Saved AI Cheat Sheet</h3>
      {cheatSections.map((section) => (
        <div key={section.title} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">{section.title}</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{section.value || "—"}</p>
        </div>
      ))}
    </div>
  );
}

export default function SavedGrantsPage() {
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [items, setItems] = useState<SavedGrant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [items]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_grants")
        .select(
          "id, grant_record_id, grant_name, department, agreement_value, agreement_type, start_date, grant_data, created_at"
        )
        .eq("user_id", user.id);

      if (!error && data) {
        setItems(data as SavedGrant[]);
        if (data.length > 0) {
          setSelectedId((data[0] as SavedGrant).id);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function removeSaved(item: SavedGrant) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setRemovingId(item.id);
    try {
      const { error } = await supabase
        .from("saved_grants")
        .delete()
        .eq("user_id", user.id)
        .eq("grant_record_id", item.grant_record_id);
      if (error) return;
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setSelectedId((prev) => (prev === item.id ? null : prev));
    } finally {
      setRemovingId(null);
    }
  }

  const selected = sorted.find((item) => item.id === selectedId) ?? null;
  const selectedPayload = selected?.grant_data as
    | { kind?: "eligible" | "ineligible"; data?: { grant?: Record<string, unknown>; reasons?: string[]; applicationFormat?: string; draft?: unknown } }
    | undefined;
  const selectedGrant = (selectedPayload?.data?.grant ?? {}) as Record<string, unknown>;
  const selectedDraft = (selectedPayload?.data?.draft ?? null) as DraftResult | null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005d90] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#005d90]/10 flex items-center justify-center text-[#005d90]">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Saved Grants</h1>
            <p className="text-slate-600">Your bookmarked grants will appear here.</p>
          </div>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="bg-slate-50 rounded-[2rem] p-16 text-center border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-[#005d90]/10 flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-8 h-8 text-[#005d90]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No saved grants yet</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Go to Results and click the bookmark icon to save grants you want to keep.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`text-left bg-white border rounded-[1.5rem] p-6 shadow-sm transition-all ${
                  selectedId === item.id
                    ? "border-[#005d90] ring-2 ring-[#005d90]/15"
                    : "border-slate-200 hover:border-[#005d90]/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#005d90] mb-2">
                      Saved
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      {item.grant_name || item.department || "Grant"}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDepartment(item.department)} {item.agreement_type ? `— ${item.agreement_type}` : ""}
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600">
                        ID: {item.grant_record_id}
                      </span>
                      {typeof item.agreement_value === "number" && (
                        <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600">
                          ${item.agreement_value.toLocaleString()}
                        </span>
                      )}
                      {item.start_date && (
                        <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600">
                          Start: {item.start_date}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSaved(item);
                    }}
                    disabled={removingId === item.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-60"
                    aria-label="Remove saved grant"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <section className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Grant Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Name</p>
                  <p className="text-sm font-semibold text-slate-900">{String(selectedGrant.program_en ?? selected.grant_name ?? "—")}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Department</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDepartment(String(selectedGrant.department ?? selected.department ?? ""))}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Record ID</p>
                  <p className="text-sm font-semibold text-slate-900">{selected.grant_record_id}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Agreement Value</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {typeof selected.agreement_value === "number" ? `$${selected.agreement_value.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>

              {selectedPayload?.kind === "ineligible" && Array.isArray(selectedPayload?.data?.reasons) && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Ineligibility Reasons</p>
                  <ul className="space-y-2">
                    {selectedPayload.data.reasons.map((reason, idx) => (
                      <li key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-sm text-slate-700">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDraft && (
                <div className="mb-6">
                  <DraftPreview draft={selectedDraft} />
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

