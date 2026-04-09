import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import type { GrantResult } from "@/app/api/grants/route";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AcademicProfile {
  age: string;
  gender: string;
  university: string;
  degreeLevel: string;
  fieldOfStudy: string;
  researchFocus: string;
  fundingNeeded: string;
}

interface ResearchResult {
  grant: GrantResult;
  liveRequirements: string[];
  applicationFormat: "document_upload" | "online_portal";
  serpSnippets: string[];
}

interface EligibilityResult {
  grant: GrantResult;
  eligible: boolean;
  reasons: string[];
  researchData: ResearchResult;
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractJSON(text: string): unknown | null {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // noop
  }

  const braceMatch = cleaned.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {
      // noop
    }
  }

  const bracketMatch = cleaned.match(/\[[\s\S]*\]/);
  if (bracketMatch) {
    try {
      return JSON.parse(bracketMatch[0]);
    } catch {
      // noop
    }
  }

  return null;
}

function ts() {
  return new Date().toISOString();
}

// ── Agent 1: Program Scout (GrantData.ca API) ──────────────────────────────────

async function agentProgramScout(
  profile: AcademicProfile,
  baseUrl: string,
  debug: AgentDebugEntry[]
): Promise<GrantResult[]> {
  const params = new URLSearchParams();
  if (profile.fieldOfStudy) params.set("field", profile.fieldOfStudy);
  if (profile.university) params.set("university", profile.university);

  const url = `${baseUrl}/api/grants?${params.toString()}`;

  const res = await fetch(url);
  const data = await res.json();

  const grants = (data.results ?? []) as GrantResult[];

  debug.push({
    agent: "Program Scout",
    input: `GET ${url}`,
    rawOutput: JSON.stringify(data, null, 2).slice(0, 3000),
    parsed: {
      count: grants.length,
      grants: grants.map((g) => ({
        program: g.program_en,
        department: g.department,
        value: g.agreement_value,
      })),
    },
    status: data.error ? "error" : "success",
    error: data.error,
    timestamp: ts(),
  });

  if (data.error) {
    throw new Error(data.error);
  }

  return grants;
}

// ── Agent 2: Deep Researcher (SERP API) ────────────────────────────────────────

async function agentDeepResearcher(
  grants: GrantResult[],
  debug: AgentDebugEntry[]
): Promise<ResearchResult[]> {
  const serpKey = process.env.SERP_API_KEY;
  const results: ResearchResult[] = [];

  for (const grant of grants) {
    let serpSnippets: string[] = [];
    let applicationFormat: "document_upload" | "online_portal" = "online_portal";
    let liveRequirements: string[] = [];

    const searchName = grant.program_en || grant.department;
    let rawLLMOutput = "";
    let debugStatus: AgentDebugEntry["status"] = "success";
    let debugError: string | undefined;

    if (serpKey) {
      try {
        const query = encodeURIComponent(
          `"${searchName}" Canada grant eligibility requirements application how to apply 2024 2025`
        );
        const serpRes = await fetch(
          `https://serpapi.com/search.json?q=${query}&api_key=${serpKey}&num=5`
        );
        if (serpRes.ok) {
          const serpData = await serpRes.json();
          serpSnippets = (serpData.organic_results ?? [])
            .slice(0, 5)
            .map((r: { snippet?: string }) => r.snippet ?? "")
            .filter(Boolean);
        } else {
          debugError = `SERP API returned ${serpRes.status}`;
        }
      } catch (e) {
        debugError = `SERP API exception: ${e instanceof Error ? e.message : String(e)}`;
        console.warn("[Agent 2] SERP API failed for:", searchName, e);
      }
    } else {
      debugError = "No SERP_API_KEY configured";
    }

    if (serpSnippets.length > 0) {
      try {
        const { text } = await generateText({
          model: getModel(),
          system: `You analyze search results about Canadian government grants and scholarships. Extract eligibility requirements and determine the application format. Respond ONLY with valid JSON, no markdown: {"requirements": ["req1", "req2"], "format": "document_upload" or "online_portal"}. Use "document_upload" if the grant requires a formal written proposal, personal statement, or PDF submission. Use "online_portal" if it uses an online application form.`,
          prompt: `Grant Program: ${searchName}\nDepartment: ${grant.department}\nSearch Results:\n${serpSnippets.join("\n\n")}\n\nExtract the eligibility requirements and application format.`,
        });
        rawLLMOutput = text;
        const parsed = extractJSON(text);
        if (parsed && typeof parsed === "object" && parsed !== null) {
          const obj = parsed as Record<string, unknown>;
          liveRequirements = (obj.requirements as string[]) ?? [];
          applicationFormat = obj.format === "document_upload" ? "document_upload" : "online_portal";
        } else {
          debugStatus = "fallback";
          debugError = `Could not parse LLM JSON. Raw: ${text.slice(0, 500)}`;
          liveRequirements = [`Government of Canada ${searchName} grant program`];
        }
      } catch (e) {
        debugStatus = "error";
        debugError = `LLM error: ${e instanceof Error ? e.message : String(e)}`;
        liveRequirements = [`Government of Canada ${searchName} grant program`];
      }
    } else {
      debugStatus = serpSnippets.length === 0 && !debugError ? "fallback" : "error";
      liveRequirements = [
        "Canadian citizen, permanent resident, or studying at a Canadian institution",
        `Relevant to ${grant.department} sector`,
        `Agreement type: ${grant.agreement_type}`,
      ];
    }

    debug.push({
      agent: "Deep Researcher",
      grantName: searchName,
      input: `SERP search: "${searchName}" eligibility requirements`,
      rawOutput: rawLLMOutput || `SERP snippets: ${serpSnippets.length} found`,
      parsed: { liveRequirements, applicationFormat, serpSnippetCount: serpSnippets.length },
      status: debugStatus,
      error: debugError,
      timestamp: ts(),
    });

    results.push({ grant, liveRequirements, applicationFormat, serpSnippets });
  }

  return results;
}

// ── Agent 3: Gatekeeper (LLM eligibility check) ───────────────────────────────

async function agentGatekeeper(
  profile: AcademicProfile,
  researchResults: ResearchResult[],
  debug: AgentDebugEntry[]
): Promise<EligibilityResult[]> {
  const results: EligibilityResult[] = [];

  for (const research of researchResults) {
    const grantName = research.grant.program_en || research.grant.department;
    const prompt = `Student Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- University: ${profile.university}
- Degree Level: ${profile.degreeLevel}
- Field of Study: ${profile.fieldOfStudy}
- Research/Project Focus: ${profile.researchFocus}
- Funding Needed: ${profile.fundingNeeded}

Grant Program: ${grantName}
Department: ${research.grant.department}
Agreement Value: $${research.grant.agreement_value?.toLocaleString()}
Agreement Type: ${research.grant.agreement_type}

Eligibility Requirements Found:
${research.liveRequirements.map((r) => `- ${r}`).join("\n")}

${research.serpSnippets.length > 0 ? `Web Research Context:\n${research.serpSnippets.slice(0, 3).join("\n")}` : ""}

Evaluate whether this university student is eligible for this grant. Be strict about degree level matching. Be reasonable about field matching (related fields should count).`;

    let rawText = "";

    try {
      const { text } = await generateText({
        model: getModel(),
        system: `You are an eligibility evaluator for Canadian academic grants. Determine if a university student qualifies. You MUST respond with ONLY valid JSON, no markdown fences, no extra text. Format: {"eligible": true, "reasons": []} if eligible, or {"eligible": false, "reasons": ["specific reason 1", "specific reason 2"]} if not. Reasons must explain exactly why they don't qualify.`,
        prompt,
      });

      rawText = text;
      console.log(`[Agent 3] Raw response for "${grantName}":`, text.slice(0, 500));

      const parsed = extractJSON(text);

      if (parsed && typeof parsed === "object" && parsed !== null) {
        const obj = parsed as Record<string, unknown>;
        const eligible = obj.eligible === true;
        const reasons = Array.isArray(obj.reasons) ? (obj.reasons as string[]) : [];

        debug.push({
          agent: "Gatekeeper",
          grantName,
          input: prompt.slice(0, 500),
          rawOutput: rawText,
          parsed: { eligible, reasons },
          status: "success",
          timestamp: ts(),
        });

        results.push({
          grant: research.grant,
          eligible,
          reasons,
          researchData: research,
        });
      } else {
        console.error(`[Agent 3] Failed to parse JSON for "${grantName}". Raw:`, text);

        const lowerText = text.toLowerCase();
        const likelyEligible =
          lowerText.includes('"eligible": true') ||
          lowerText.includes('"eligible":true') ||
          (lowerText.includes("eligible") && !lowerText.includes("ineligible") && !lowerText.includes("not eligible"));

        debug.push({
          agent: "Gatekeeper",
          grantName,
          input: prompt.slice(0, 500),
          rawOutput: rawText,
          parsed: { fallbackParse: true, likelyEligible },
          status: "fallback",
          error: "JSON parse failed, used text heuristic",
          timestamp: ts(),
        });

        results.push({
          grant: research.grant,
          eligible: likelyEligible,
          reasons: likelyEligible ? [] : [`Could not fully parse eligibility. Raw AI response: "${text.slice(0, 300)}"`],
          researchData: research,
        });
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`[Agent 3] Gatekeeper exception for "${grantName}":`, errMsg);

      debug.push({
        agent: "Gatekeeper",
        grantName,
        input: prompt.slice(0, 500),
        rawOutput: rawText || "(no response)",
        parsed: null,
        status: "error",
        error: errMsg,
        timestamp: ts(),
      });

      results.push({
        grant: research.grant,
        eligible: false,
        reasons: [`Eligibility evaluation failed: ${errMsg}`],
        researchData: research,
      });
    }
  }

  return results;
}

// ── Agent 4: The Drafter ───────────────────────────────────────────────────────

async function agentDrafter(
  profile: AcademicProfile,
  eligibleGrants: EligibilityResult[],
  debug: AgentDebugEntry[]
): Promise<DraftResult[]> {
  const drafts: DraftResult[] = [];

  for (const result of eligibleGrants) {
    const format = result.researchData.applicationFormat;
    const grantName = result.grant.program_en || result.grant.department;

    if (format === "document_upload") {
      try {
        const { text } = await generateText({
          model: getModel(),
          system: `You are an expert academic grant proposal writer. Generate a compelling, well-structured academic proposal for a Canadian university student. Respond with ONLY valid JSON, no markdown fences. Keys: "introduction", "objectives", "methodology", "budget". Each 150-300 words.`,
          prompt: `Write a full academic grant proposal for a student applying to "${grantName}" (Value: $${result.grant.agreement_value?.toLocaleString()}).

Student Profile:
- University: ${profile.university}
- Degree Level: ${profile.degreeLevel}
- Field of Study: ${profile.fieldOfStudy}
- Research/Project Focus: ${profile.researchFocus}
- Funding Needed: ${profile.fundingNeeded}

Sections:
1. "introduction" - Student and research context
2. "objectives" - Clear research/project objectives
3. "methodology" - Proposed methodology or approach
4. "budget" - Justified use of funds breakdown`,
        });

        const parsed = extractJSON(text);
        if (parsed && typeof parsed === "object") {
          const content = parsed as ProposalContent;
          debug.push({
            agent: "The Drafter",
            grantName,
            input: `Full proposal for "${grantName}"`,
            rawOutput: text.slice(0, 1000),
            parsed: { format: "full_proposal", sections: Object.keys(content) },
            status: "success",
            timestamp: ts(),
          });
          drafts.push({ grantId: result.grant.record_id, grantName, format: "full_proposal", content });
        } else {
          throw new Error(`JSON parse failed. Raw: ${text.slice(0, 300)}`);
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        debug.push({
          agent: "The Drafter",
          grantName,
          input: `Full proposal for "${grantName}"`,
          rawOutput: errMsg,
          parsed: null,
          status: "error",
          error: errMsg,
          timestamp: ts(),
        });
        drafts.push({
          grantId: result.grant.record_id, grantName, format: "full_proposal",
          content: { introduction: `Error generating proposal: ${errMsg}`, objectives: "", methodology: "", budget: "" },
        });
      }
    } else {
      try {
        const { text } = await generateText({
          model: getModel(),
          system: `You are an expert academic grant writer. Generate copy-paste-ready portal answers for a Canadian university student. Respond with ONLY valid JSON, no markdown fences. Keys: "personalObjective" (max 100 words), "researchFocus" (max 250 words), "methodology" (max 250 words), "qualifications" (max 150 words), "useOfFunds" (max 200 words). STRICTLY respect every word limit.`,
          prompt: `Write portal-ready answers for a student applying to "${grantName}" (Value: $${result.grant.agreement_value?.toLocaleString()}).

Student Profile:
- University: ${profile.university}
- Degree Level: ${profile.degreeLevel}
- Field of Study: ${profile.fieldOfStudy}
- Research/Project Focus: ${profile.researchFocus}
- Funding Needed: ${profile.fundingNeeded}

Sections with STRICT word limits:
1. "personalObjective" - Personal Objective/Statement (MAX 100 words)
2. "researchFocus" - Research/Project Focus (MAX 250 words)
3. "methodology" - Proposed Methodology/Action Plan (MAX 250 words)
4. "qualifications" - Academic Qualifications & Leadership (MAX 150 words)
5. "useOfFunds" - Use of Funds (MAX 200 words)`,
        });

        const parsed = extractJSON(text);
        if (parsed && typeof parsed === "object") {
          const content = parsed as CheatSheetContent;
          debug.push({
            agent: "The Drafter",
            grantName,
            input: `Cheat sheet for "${grantName}"`,
            rawOutput: text.slice(0, 1000),
            parsed: { format: "cheat_sheet", sections: Object.keys(content) },
            status: "success",
            timestamp: ts(),
          });
          drafts.push({ grantId: result.grant.record_id, grantName, format: "cheat_sheet", content });
        } else {
          throw new Error(`JSON parse failed. Raw: ${text.slice(0, 300)}`);
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        debug.push({
          agent: "The Drafter",
          grantName,
          input: `Cheat sheet for "${grantName}"`,
          rawOutput: errMsg,
          parsed: null,
          status: "error",
          error: errMsg,
          timestamp: ts(),
        });
        drafts.push({
          grantId: result.grant.record_id, grantName, format: "cheat_sheet",
          content: { personalObjective: `Error: ${errMsg}`, researchFocus: "", methodology: "", qualifications: "", useOfFunds: "" },
        });
      }
    }
  }

  return drafts;
}

// ── Main Workflow Orchestrator ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const debug: AgentDebugEntry[] = [];

  try {
    const { profile } = (await request.json()) as { profile: AcademicProfile };

    if (!profile || !profile.fieldOfStudy || !profile.degreeLevel) {
      return NextResponse.json(
        { error: "Incomplete profile. Please fill in Field of Study and Degree Level." },
        { status: 400 }
      );
    }

    const baseUrl = request.nextUrl.origin;

    // Agent 1: Program Scout
    const grants = await agentProgramScout(profile, baseUrl, debug);

    if (grants.length === 0) {
      return NextResponse.json({
        success: true,
        results: { totalGrantsFound: 0, eligible: [], ineligible: [] },
        debug,
      });
    }

    // Agent 2: Deep Researcher
    const researchResults = await agentDeepResearcher(grants, debug);

    // Agent 3: Gatekeeper (Eligibility Fork)
    const eligibilityResults = await agentGatekeeper(profile, researchResults, debug);
    const eligible = eligibilityResults.filter((r) => r.eligible);
    const ineligible = eligibilityResults.filter((r) => !r.eligible);

    // Agent 4: The Drafter (Format Fork) — only for eligible
    let drafts: DraftResult[] = [];
    if (eligible.length > 0) {
      drafts = await agentDrafter(profile, eligible, debug);
    }

    return NextResponse.json({
      success: true,
      results: {
        totalGrantsFound: grants.length,
        eligible: eligible.map((e) => ({
          grant: e.grant,
          applicationFormat: e.researchData.applicationFormat,
          draft: drafts.find((d) => d.grantId === e.grant.record_id),
        })),
        ineligible: ineligible.map((e) => ({
          grant: e.grant,
          reasons: e.reasons,
        })),
      },
      debug,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[Workflow Error]", error);
    return NextResponse.json(
      { error: `Workflow error: ${errMsg}`, debug },
      { status: 500 }
    );
  }
}
