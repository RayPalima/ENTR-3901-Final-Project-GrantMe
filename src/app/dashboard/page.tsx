"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

interface ProfileData {
  age: string;
  gender: string;
  university: string;
  degreeLevel: string;
  fieldOfStudy: string;
  researchFocus: string;
  fundingNeeded: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    age: "",
    gender: "",
    university: "",
    degreeLevel: "",
    fieldOfStudy: "",
    researchFocus: "",
    fundingNeeded: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile({
          age: data.age?.toString() ?? "",
          gender: data.gender ?? "",
          university: data.university ?? "",
          degreeLevel: data.degree_level ?? "",
          fieldOfStudy: data.field_of_study ?? "",
          researchFocus: data.research_focus ?? "",
          fundingNeeded: data.funding_needed ?? "",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  function updateField(field: keyof ProfileData, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  const filledCount = Object.values(profile).filter((v) => v.trim() !== "").length;
  const totalFields = Object.keys(profile).length;
  const completionPercent = Math.round((filledCount / totalFields) * 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const payload = {
      user_id: user.id,
      age: profile.age ? parseInt(profile.age) : null,
      gender: profile.gender || null,
      university: profile.university || null,
      degree_level: profile.degreeLevel || null,
      field_of_study: profile.fieldOfStudy || null,
      research_focus: profile.researchFocus || null,
      funding_needed: profile.fundingNeeded || null,
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
      setSaving(false);
      return;
    }

    localStorage.setItem("grantme_profile", JSON.stringify(profile));
    setSaving(false);
    router.push("/dashboard/workflow");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005d90] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-[#005d90] uppercase tracking-[0.2em] mb-2 block">
            Researcher Profile
          </span>
          <h1 className="text-4xl md:text-[3.5rem] font-bold text-slate-900 leading-none tracking-tight mb-4">
            Grant Eligibility Profile
          </h1>
          <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">
            Complete your academic and research profile to unlock our AI-driven
            grant matching engine. Our agents query the Canadian Federal Grant
            Database to find real funding for your research.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            {/* Personal & Academic Info */}
            <section className="bg-white rounded-[2rem] p-8 tonal-depth border border-slate-100/80 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#007c95]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Personal &amp; Academic Details
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[0.75rem] font-medium text-slate-500 uppercase tracking-wider">
                    Age
                  </label>
                  <input
                    type="number"
                    min="16"
                    max="99"
                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#005d90]/30 transition-all"
                    placeholder="e.g. 22"
                    value={profile.age}
                    onChange={(e) => updateField("age", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.75rem] font-medium text-slate-500 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 focus:ring-2 focus:ring-[#005d90]/30 transition-all"
                    value={profile.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[0.75rem] font-medium text-slate-500 uppercase tracking-wider">
                    University
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#005d90]/30 transition-all"
                    placeholder="e.g. University of Toronto"
                    value={profile.university}
                    onChange={(e) => updateField("university", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.75rem] font-medium text-slate-500 uppercase tracking-wider">
                    Degree Level
                  </label>
                  <select
                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 focus:ring-2 focus:ring-[#005d90]/30 transition-all"
                    value={profile.degreeLevel}
                    onChange={(e) => updateField("degreeLevel", e.target.value)}
                  >
                    <option value="">Select degree level</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                    <option value="Post-Doctoral">Post-Doctoral</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Research Details */}
            <section className="bg-white rounded-[2rem] p-8 tonal-depth border border-slate-100/80 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#005d90]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Research &amp; Funding Details
                </h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[0.75rem] font-medium text-slate-500 uppercase tracking-wider">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#005d90]/30 transition-all"
                    placeholder="e.g. Computer Science, Biomedical Engineering"
                    value={profile.fieldOfStudy}
                    onChange={(e) => updateField("fieldOfStudy", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.75rem] font-medium text-slate-500 uppercase tracking-wider">
                    Research / Project Focus
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#005d90]/30 transition-all"
                    placeholder="Briefly describe your research topic or project focus..."
                    rows={4}
                    value={profile.researchFocus}
                    onChange={(e) => updateField("researchFocus", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.75rem] font-medium text-slate-500 uppercase tracking-wider">
                    Funding Needed (CAD)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#005d90]/30 transition-all"
                    placeholder="e.g. $5,000 — $25,000"
                    value={profile.fundingNeeded}
                    onChange={(e) => updateField("fundingNeeded", e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 tonal-depth border border-slate-100/80 shadow-sm sticky top-24">
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#005d90] uppercase tracking-widest mb-6">
                  Profile Strength
                </h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-[#0077b6]">
                      Academic
                    </span>
                    <span className="text-xs font-semibold inline-block text-[#005d90]">
                      {completionPercent}%
                    </span>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
                    <div
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#005d90] transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-5 h-5 text-[#005d90] flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-slate-600">
                    Complete all fields to unlock the full AI agent workflow.
                    Our Program Scout queries the{" "}
                    <span className="font-bold text-[#005d90]">
                      Canadian Federal Grant Database
                    </span>{" "}
                    to find real grants and scholarships matching your field of
                    study and degree level.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || completionPercent < 50}
                className="w-full py-5 bg-gradient-to-r from-[#005d90] to-[#0077b6] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-[#005d90]/30 hover:-translate-y-1 transition-all active:scale-95 group disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Profile &amp; Find Grants
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-500 mt-4 px-4">
                By continuing, you agree to our terms and the AI querying of
                Canadian government grant databases on your behalf.
              </p>
            </div>

            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 h-48">
              <div className="absolute inset-0 bg-gradient-to-br from-[#005d90]/30 to-transparent" />
              <div className="relative z-10 flex flex-col h-full justify-center">
                <Sparkles className="w-6 h-6 text-blue-400 mb-3" />
                <h4 className="text-white text-lg font-bold mb-2">
                  Live Grant Data
                </h4>
                <p className="text-slate-300 text-sm leading-snug">
                  Powered by GrantData.ca — 4M+ real federal grants, research
                  awards, and scholarships updated monthly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
