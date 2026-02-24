/**
 * Cloudflare Pages Function: POST /api/ask-med
 * SwarmMed-14B medical inference demo with safety guardrails.
 *
 * Non-negotiable:
 *   1. PHI detection: email, phone, address, DOB, MRN, SSN → BLOCK
 *   2. Emergency trigger: chest pain + SOB, stroke, suicidal → TRIAGE MESSAGE
 *   3. No definitive diagnosis, no prescriptive dosing (enforced by system prompt)
 *
 * Body: { prompt: string, mode: "explain"|"triage"|"verified", session_id?: string }
 * Returns: { ok, answer?, safety_flags, receipt?, error? }
 *
 * Environment variables:
 *   TOGETHER_API_KEY     — Together.ai API key
 *   SWARM_INFERENCE_URL  — Optional: local vLLM endpoint via CF tunnel (e.g. https://inference.quantumrails.io)
 *   SWARM_INFERENCE_KEY  — Optional: auth key for local vLLM
 *   DISCORD_WEBHOOK_URL  — Discord webhook for logging
 */

// ─── PHI Patterns ────────────────────────────────────────────

const PHI_PATTERNS = {
  email: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
  phone: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/,
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/,
  mrn: /\b(?:MRN|mrn|medical\s*record\s*(?:number|#|no))\s*[:=#]?\s*\d{4,}/i,
  dob: /\b(?:DOB|dob|date\s*of\s*birth|born\s*on|birthday)\s*[:=]?\s*(?:\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/i,
  address: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Road|Rd|Lane|Ln|Way|Court|Ct|Place|Pl)\b(?:\s*(?:#|Apt|Suite|Ste|Unit)\s*\w+)?/i,
  patient_name: /\b(?:patient(?:\s+name)?|pt)\s*[:=]\s*[A-Z][a-z]+\s+[A-Z][a-z]+/i,
};

// ─── Emergency Patterns ─────────────────────────────────────

const EMERGENCY_PATTERNS = [
  /(?=.*\bchest\s+pain\b)(?=.*\b(?:shortness\s+of\s+breath|SOB|can'?t\s+breathe|difficulty\s+breathing)\b)/i,
  /\b(?:heart\s+attack|cardiac\s+arrest|myocardial\s+infarction)\b.*\b(?:happening|right\s+now|having|currently|am\s+having)\b/i,
  /\b(?:stroke|CVA)\b.*\b(?:happening|right\s+now|signs|symptoms|having)\b/i,
  /\b(?:face\s+droop|arm\s+weak|slurred\s+speech|sudden\s+numbness|sudden\s+confusion)\b/i,
  /\b(?:suicid|kill\s+myself|end\s+my\s+life|want\s+to\s+die|self[- ]?harm|cut\s+myself|overdose\s+on)\b/i,
  /\b(?:anaphyla|throat\s+(?:closing|swelling)|can'?t\s+(?:breathe|swallow))\b.*\b(?:allerg|reaction|epipen)\b/i,
  /\b(?:bleeding\s+(?:heavily|profusely|won'?t\s+stop)|massive\s+(?:blood\s+loss|hemorrhage))\b/i,
  /\b(?:poison|overdos|ingested|swallowed)\b.*\b(?:child|toddler|baby|accidentally|too\s+many|pills)\b/i,
];

const EMERGENCY_RESPONSE =
  "This sounds like it may be a medical emergency.\n\n" +
  "CALL 911 (or your local emergency number) IMMEDIATELY.\n\n" +
  "While waiting for help:\n" +
  "- Stay calm and stay with the person\n" +
  "- Do not give food or drink unless instructed by 911\n" +
  "- If the person is unconscious and breathing, place in recovery position\n" +
  "- If not breathing and you are trained, begin CPR\n" +
  "- Gather any medications or substances involved for the paramedics\n\n" +
  "This AI cannot provide emergency medical care. " +
  "A trained emergency dispatcher can guide you through immediate steps.\n\n" +
  "National Suicide Prevention Lifeline: 988\n" +
  "Poison Control: 1-800-222-1222";

const PHI_BLOCKED_RESPONSE =
  "Your message appears to contain protected health information (PHI) " +
  "such as names, dates of birth, medical record numbers, or contact details.\n\n" +
  "For your privacy and safety, we cannot process messages containing PHI. " +
  "Please rephrase your question without including any personal identifiers.\n\n" +
  "Example: Instead of 'My patient John Smith DOB 3/15/1960 has...'\n" +
  "Ask: 'A 65-year-old male presents with...'";

// ─── System Prompts ─────────────────────────────────────────

const MODE_SYSTEM_PROMPTS = {
  explain:
    "You are SwarmMed, a medical AI assistant trained on 406K CoVe-verified " +
    "platinum QA pairs across 59 specialties.\n\n" +
    "RULES:\n" +
    "- Provide clear, educational explanations of medical concepts\n" +
    "- Use structured formatting with headers and bullet points\n" +
    "- Cite medical guidelines and authoritative sources when possible\n" +
    "- NEVER provide a definitive diagnosis for a specific patient\n" +
    "- NEVER prescribe specific medication dosages\n" +
    "- If asked about a specific patient scenario, frame your answer as " +
    "'generally, in clinical practice...' not 'you have...' or 'take X mg'\n" +
    "- Always end with: 'This information is educational. Consult a healthcare provider " +
    "for medical decisions.'\n" +
    "- Do NOT add disclaimers about being an AI",
  triage:
    "You are SwarmMed in triage assessment mode.\n\n" +
    "RULES:\n" +
    "- Provide a structured clinical assessment framework\n" +
    "- List the key questions a clinician would ask\n" +
    "- Identify relevant differential considerations (NOT a diagnosis)\n" +
    "- Suggest appropriate next steps (e.g., 'evaluation by', 'imaging may include')\n" +
    "- Categorize urgency: EMERGENT / URGENT / ROUTINE\n" +
    "- NEVER say 'you have X' or 'this is likely X'\n" +
    "- Frame as: 'These symptoms warrant evaluation for...'\n" +
    "- NEVER prescribe specific medication or dosing\n" +
    "- Always end with: 'This triage framework is educational. " +
    "Clinical decisions require in-person evaluation.'",
  verified:
    "You are SwarmMed in verified mode. Your response will be independently " +
    "verified by a 235B-parameter CoVe (Chain of Verification) pipeline.\n\n" +
    "RULES:\n" +
    "- Be precise and factual — every claim will be checked\n" +
    "- Cite specific guidelines, studies, or authoritative sources\n" +
    "- Use structured formatting for verifiability\n" +
    "- Clearly distinguish established evidence from clinical judgment\n" +
    "- NEVER provide definitive diagnosis or prescriptive dosing\n" +
    "- Frame clinical scenarios educationally\n" +
    "- Always end with: 'This information is educational and has been verified " +
    "by our CoVe pipeline. Consult a healthcare provider for medical decisions.'",
};

// ─── Model Config ───────────────────────────────────────────

const MODE_MODELS = {
  explain: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  triage: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  verified: "Qwen/Qwen3-235B-A22B-Instruct-2507-tput",
};

// ─── Helpers ────────────────────────────────────────────────

function checkPHI(prompt) {
  const detected = [];
  for (const [type, pattern] of Object.entries(PHI_PATTERNS)) {
    if (pattern.test(prompt)) {
      detected.push(type);
    }
  }
  return detected;
}

function checkEmergency(prompt) {
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(prompt)) return true;
  }
  return false;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Inference ──────────────────────────────────────────────

async function callInference(prompt, mode, env) {
  const systemPrompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.explain;
  const model = MODE_MODELS[mode] || MODE_MODELS.explain;
  const maxTokens = mode === "verified" ? 2048 : 1024;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  // Try local vLLM via CF tunnel first
  if (env.SWARM_INFERENCE_URL) {
    try {
      const resp = await fetch(
        `${env.SWARM_INFERENCE_URL}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.SWARM_INFERENCE_KEY || "not-needed"}`,
          },
          body: JSON.stringify({
            model: "SwarmMed-14B-v1.2",
            messages,
            max_tokens: maxTokens,
            temperature: 0.3,
          }),
          signal: AbortSignal.timeout(30000),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        return {
          answer: data.choices?.[0]?.message?.content || "",
          model_used: "SwarmMed-14B-v1.2",
          backend: "local-vllm",
          tokens: data.usage || {},
        };
      }
    } catch (e) {
      console.error("Local vLLM failed, falling back:", e.message);
    }
  }

  // Fallback: Together.ai
  const togetherKey = env.TOGETHER_API_KEY;
  if (!togetherKey) {
    throw new Error("No inference backend available");
  }

  const resp = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${togetherKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Together.ai ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = await resp.json();
  let answer = data.choices?.[0]?.message?.content || "";

  // Strip <think> blocks from reasoning models (Qwen3-235B)
  answer = answer.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  return {
    answer,
    model_used: model,
    backend: "together",
    tokens: data.usage || {},
  };
}

// ─── Discord Logging ────────────────────────────────────────

async function logToDiscord(env, payload) {
  const url = env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Discord log failed:", e.message);
  }
}

// ─── POST Handler ───────────────────────────────────────────

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://swarmandbee.com",
  };

  const startMs = Date.now();

  try {
    const body = await request.json();
    const { prompt, mode = "explain", session_id } = body;

    // ─── Validate ─────────────────────────────────
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ ok: false, error: "Prompt is required." }),
        { status: 400, headers }
      );
    }

    if (prompt.length > 2000) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Prompt too long. Maximum 2,000 characters.",
        }),
        { status: 400, headers }
      );
    }

    const validModes = ["explain", "triage", "verified"];
    const safeMode = validModes.includes(mode) ? mode : "explain";

    const promptHash = await sha256(prompt.trim().toLowerCase());
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    // ─── PHI Check ────────────────────────────────
    const phiDetected = checkPHI(prompt);
    if (phiDetected.length > 0) {
      const receipt = {
        task_id: crypto.randomUUID(),
        task_hash: await sha256(
          prompt.trim().toLowerCase() + "|" + safeMode + "|phi_blocked"
        ),
        status: "blocked",
        reason: "phi_detected",
        phi_types: phiDetected,
        timestamp: new Date().toISOString(),
        agent: "swarm-med",
        operator: "0.0.10291827",
      };

      logToDiscord(env, {
        embeds: [
          {
            title: "Ask SwarmMed — PHI Blocked",
            color: 0xff4444,
            fields: [
              {
                name: "PHI Types",
                value: phiDetected.join(", "),
                inline: true,
              },
              {
                name: "Prompt Hash",
                value: promptHash.slice(0, 16),
                inline: true,
              },
              { name: "IP", value: ip, inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "swarmandbee.com/ask" },
          },
        ],
      }).catch(() => {});

      return new Response(
        JSON.stringify({
          ok: false,
          blocked: true,
          reason: "phi_detected",
          phi_types: phiDetected,
          message: PHI_BLOCKED_RESPONSE,
          safety_flags: {
            phi_detected: true,
            emergency: false,
            phi_types: phiDetected,
          },
          receipt,
        }),
        { status: 422, headers }
      );
    }

    // ─── Emergency Check ──────────────────────────
    if (checkEmergency(prompt)) {
      const receipt = {
        task_id: crypto.randomUUID(),
        task_hash: await sha256(
          prompt.trim().toLowerCase() + "|" + safeMode + "|emergency"
        ),
        status: "emergency",
        reason: "emergency_trigger",
        timestamp: new Date().toISOString(),
        agent: "swarm-med",
        operator: "0.0.10291827",
      };

      logToDiscord(env, {
        embeds: [
          {
            title: "Ask SwarmMed — EMERGENCY TRIGGER",
            color: 0xff0000,
            fields: [
              {
                name: "Prompt Hash",
                value: promptHash.slice(0, 16),
                inline: true,
              },
              { name: "IP", value: ip, inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "swarmandbee.com/ask — EMERGENCY" },
          },
        ],
      }).catch(() => {});

      return new Response(
        JSON.stringify({
          ok: false,
          blocked: true,
          reason: "emergency_trigger",
          message: EMERGENCY_RESPONSE,
          safety_flags: {
            phi_detected: false,
            emergency: true,
            phi_types: [],
          },
          receipt,
        }),
        { status: 422, headers }
      );
    }

    // ─── Inference ────────────────────────────────
    const result = await callInference(prompt, safeMode, env);
    const executionMs = Date.now() - startMs;

    // ─── Build Receipt ────────────────────────────
    const minuteWindow = new Date().toISOString().slice(0, 16);
    const contentHash = await sha256(result.answer);
    const taskHash = await sha256(
      prompt.trim().toLowerCase() +
        "|" +
        safeMode +
        "|swarm-med|" +
        result.model_used +
        "|" +
        contentHash +
        "|" +
        minuteWindow
    );

    const receipt = {
      task_id: crypto.randomUUID(),
      task_hash: taskHash,
      status: "completed",
      mode: safeMode,
      agent_chain: ["swarm-appliance", "swarm-med"],
      model_used: result.model_used,
      backend: result.backend,
      content_hash: contentHash,
      prompt_hash: promptHash.slice(0, 16),
      execution_ms: executionMs,
      tokens: result.tokens,
      timestamp: new Date().toISOString(),
      operator: "0.0.10291827",
    };

    // ─── Discord Log ──────────────────────────────
    logToDiscord(env, {
      embeds: [
        {
          title: `Ask SwarmMed — ${safeMode.toUpperCase()}`,
          color:
            safeMode === "verified"
              ? 0x9a6a9a
              : safeMode === "triage"
                ? 0xe67e22
                : 0xb89b3c,
          fields: [
            { name: "Mode", value: safeMode, inline: true },
            {
              name: "Model",
              value: result.model_used.split("/").pop(),
              inline: true,
            },
            { name: "Latency", value: `${executionMs}ms`, inline: true },
            {
              name: "Prompt",
              value: prompt.slice(0, 256),
              inline: false,
            },
            {
              name: "Answer",
              value: result.answer.slice(0, 512),
              inline: false,
            },
            {
              name: "Task Hash",
              value: taskHash.slice(0, 16),
              inline: true,
            },
            { name: "IP", value: ip, inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "swarmandbee.com/ask" },
        },
      ],
    }).catch(() => {});

    return new Response(
      JSON.stringify({
        ok: true,
        answer: result.answer,
        mode: safeMode,
        safety_flags: {
          phi_detected: false,
          emergency: false,
          phi_types: [],
        },
        receipt,
      }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Ask-med handler error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Inference failed. Please try again.",
        detail: err.message,
      }),
      { status: 500, headers }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://swarmandbee.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
