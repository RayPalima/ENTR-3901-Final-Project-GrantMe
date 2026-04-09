import { NextRequest, NextResponse } from "next/server";

export interface GrantResult {
  record_id: string;
  recipient_legal_name?: string;
  researcher_name?: string;
  institution?: string;
  department: string;
  agreement_value?: number;
  award_amount?: number;
  program_en: string;
  program_fr?: string;
  agreement_type?: string;
  start_date?: string;
  fiscal_year?: string;
  keywords?: string;
  description_en?: string;
}

export interface GrantAPIResponse {
  entity_type: string;
  count: number;
  results: GrantResult[];
}

const RAPIDAPI_HOST = "grantdata-canadian-government-grants-api.p.rapidapi.com";

function buildHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "x-rapidapi-key": apiKey,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

async function fetchWithTimeout(url: string, headers: Record<string, string>, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const field = searchParams.get("field") ?? "";
  const university = searchParams.get("university") ?? "";

  const apiKey = process.env.GRANTDATA_API_KEY;
  const baseUrl = process.env.GRANTDATA_BASE_URL ?? `https://${RAPIDAPI_HOST}`;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GrantData API key not configured. Add GRANTDATA_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  const headers = buildHeaders(apiKey);
  const allResults: GrantResult[] = [];
  const errors: string[] = [];

  // Strategy 1: /research_grant — NSERC/SSHRC grants by topic (most relevant for students)
  if (field) {
    try {
      const params = new URLSearchParams({
        q: field,
        issued_after: "2022-01-01",
        sort_by: "value",
        sort_order: "desc",
        limit: "3",
      });
      const url = `${baseUrl}/research_grant?${params.toString()}`;
      console.log("[Program Scout] Trying /research_grant:", url);

      const res = await fetchWithTimeout(url, headers);
      if (res.ok) {
        const data = await res.json();
        const grants = (data.results ?? []) as GrantResult[];
        console.log(`[Program Scout] /research_grant returned ${grants.length} results`);
        allResults.push(...grants);
      } else {
        const errText = await res.text();
        console.warn("[Program Scout] /research_grant failed:", res.status, errText);
        errors.push(`/research_grant: ${res.status}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("[Program Scout] /research_grant error:", msg);
      errors.push(`/research_grant: ${msg}`);
    }
  }

  // Strategy 2: /recipient/{university} — grants already awarded to the student's university
  if (university && allResults.length < 3) {
    try {
      const encoded = encodeURIComponent(university);
      const params = new URLSearchParams({
        sort_by: "value",
        sort_order: "desc",
        limit: "3",
      });
      const url = `${baseUrl}/recipient/${encoded}?${params.toString()}`;
      console.log("[Program Scout] Trying /recipient:", url);

      const res = await fetchWithTimeout(url, headers);
      if (res.ok) {
        const data = await res.json();
        if (data.top_departments) {
          const recipientGrants = (data.top_departments ?? []).slice(0, 3).map(
            (dept: { department: string; count: number; total_value: number }, i: number) => ({
              record_id: `recipient-${i}`,
              department: dept.department,
              program_en: `${dept.department} Awards at ${university}`,
              agreement_value: Math.round(dept.total_value / dept.count),
              agreement_type: "grant",
              recipient_legal_name: university,
              start_date: new Date().toISOString().slice(0, 10),
            })
          );
          console.log(`[Program Scout] /recipient returned ${recipientGrants.length} department summaries`);
          allResults.push(...recipientGrants);
        }
      } else {
        console.warn("[Program Scout] /recipient failed:", res.status);
        errors.push(`/recipient: ${res.status}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("[Program Scout] /recipient error:", msg);
      errors.push(`/recipient: ${msg}`);
    }
  }

  // Deduplicate and limit to 3
  const seen = new Set<string>();
  const unique = allResults.filter((g) => {
    const key = g.record_id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);

  // Normalize fields so downstream agents get consistent data
  const normalized: GrantResult[] = unique.map((g) => ({
    ...g,
    agreement_value: g.agreement_value ?? g.award_amount ?? 0,
  }));

  if (normalized.length === 0 && errors.length > 0) {
    return NextResponse.json(
      { error: `No grants found. API errors: ${errors.join("; ")}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    entity_type: "grant",
    count: normalized.length,
    results: normalized,
  } satisfies GrantAPIResponse);
}
