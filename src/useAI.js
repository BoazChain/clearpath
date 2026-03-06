const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

export async function askAI(systemPrompt, userMessage, history = []) {
  if (!OPENAI_KEY) throw new Error("Missing VITE_OPENAI_KEY in .env");

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 1024, temperature: 0.75 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function streamAI(systemPrompt, userMessage, history = [], onChunk) {
  if (!OPENAI_KEY) throw new Error("Missing VITE_OPENAI_KEY in .env");

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 1024, temperature: 0.75, stream: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter(l => l.startsWith("data: ") && l !== "data: [DONE]");
    for (const line of lines) {
      try {
        const json = JSON.parse(line.slice(6));
        const token = json.choices?.[0]?.delta?.content || "";
        if (token) { full += token; onChunk(full); }
      } catch {}
    }
  }

  return full;
}

export function buildUserContext({ days, cravings, journal, messages, mood, gratitude, intention }) {
  const moodLabels = ["Struggling", "Hard", "Neutral", "Okay", "Good", "Thriving"];

  const recentCravings = cravings.slice(0, 10).map(c =>
    `- ${c.trigger} (intensity ${c.intensity}/10)${c.overcome ? " (overcome)" : ""}${c.note ? `: "${c.note}"` : ""}`
  ).join("\n");

  const recentJournal = journal.slice(0, 5).map(j =>
    `- "${j.text.slice(0, 200)}"`
  ).join("\n");

  const recentMessages = messages.slice(0, 5).map(m =>
    `- From ${m.from}: "${m.text.slice(0, 150)}"`
  ).join("\n");

  return `
USER CONTEXT:
- Sober for ${days} day${days !== 1 ? "s" : ""}
- Today's mood: ${mood !== null ? moodLabels[mood] : "not logged"}
- Today's intention: ${intention || "not set"}
- Gratitude today: ${gratitude.filter(Boolean).join(", ") || "none logged"}

RECENT CRAVINGS (last 10):
${recentCravings || "None logged"}

RECENT JOURNAL ENTRIES (last 5):
${recentJournal || "None written"}

MESSAGES FROM SUPPORTERS (last 5):
${recentMessages || "None yet"}
`.trim();
}

export function insightSystemPrompt(context) {
  return `
You are ClearPath's AI insight engine. A warm, grounded, non-clinical recovery companion.
You have access to this person's sobriety data and speak to them directly, personally, and with care.
Never be preachy, never lecture. Be honest, specific, and human.
Format your response as a short daily insight: 2-3 paragraphs max.
Notice patterns, celebrate small wins, and offer one concrete suggestion for tomorrow.
Do not use bullet points. Write in flowing, warm prose.

${context}
`.trim();
}

export function companionSystemPrompt(context) {
  return `
You are the ClearPath companion. A warm, thoughtful recovery support AI.
You know this person's journey intimately through their logged data. You are NOT a therapist,
but you are a deeply empathetic, informed presence who listens well and responds with care.
Keep responses concise (3-5 sentences usually). Never be preachy. Never diagnose.
If they seem to be in crisis, gently encourage professional support or a crisis line (988 in the US).
Speak naturally, like a trusted friend who happens to know their story.

${context}
`.trim();
}
