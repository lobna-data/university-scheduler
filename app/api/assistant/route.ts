const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SYS = `You are SchedulAI, a scheduling assistant for university staff.
You receive the current scheduling data (teachers, modules, groups, rooms, sessions) as JSON, plus a staff request.

Answer in the SAME language as the staff request (English or French). Be concise and practical.

Respond with ONE JSON object only, no markdown fences:
{
  "reply": "your answer to the staff member",
  "action": null
}

To actually CHANGE the schedule, set "action" to one of these (only when the request clearly asks for a change):
- {"type":"move","sessionId":"...","day":"Monday","slot":"09:30–11:00"}
- {"type":"assign_room","sessionId":"...","roomId":"..."}
- {"type":"delete_session","sessionId":"..."}

Rules:
- Use ONLY ids that exist in the provided data. Never invent sessions, rooms or ids.
- "day" must be one of settings.days and "slot" one of settings.slots (copy them exactly, including the dash character).
- To find a class, match teacher/module/group names from the data.
- When asked for a free room, first check sessions at that time and pick an unused room with enough capacity and the right type (lab vs classroom), then use assign_room.
- If the request is ambiguous (which class, which day/time), do NOT set an action — explain what you need in "reply".
- If asked a question (analysis, counts, problems), just answer in "reply" with action null.`;

function looseJson(text: string): unknown {
  const t = text.trim();
  try { return JSON.parse(t); } catch { /* try extraction */ }
  const start = t.indexOf('{'), end = t.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(t.slice(start, end + 1)); } catch { /* repair */ }
  }
  try { return JSON.parse(t.replace(/,\s*([}\]])/g, '$1')); } catch { return null; }
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json({
      reply: 'AI assistant is not configured yet. Add GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables, then redeploy. (Local: create a .env.local file with GEMINI_API_KEY=...)',
    }, { status: 503 });
  }

  let question = '', context = '';
  try {
    const body = await req.json();
    question = String(body?.question ?? '');
    context = String(body?.context ?? '');
  } catch { /* ignore */ }
  if (!question) return Response.json({ reply: 'Missing question.' }, { status: 400 });

  const payload = {
    systemInstruction: { parts: [{ text: SYS }] },
    contents: [{ role: 'user', parts: [{ text: `CURRENT SCHEDULE DATA (JSON):\n${context}\n\nSTAFF REQUEST: ${question}` }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  };

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      return Response.json({ reply: `Gemini request failed (${res.status}): ${detail}` }, { status: 502 });
    }
    const data = await res.json();
    const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p?.text ?? '')
      .join('');
    const parsed = looseJson(text) as { reply?: unknown; action?: unknown } | null;
    if (!parsed || typeof parsed !== 'object') {
      return Response.json({ reply: text.slice(0, 800) || 'The assistant returned an empty answer.' });
    }
    const reply = typeof parsed.reply === 'string' ? parsed.reply : String(parsed.reply ?? '');
    const a = parsed.action as Record<string, string> | null | undefined;
    let action: unknown = null;
    if (a && typeof a === 'object' && typeof a.type === 'string') {
      if (a.type === 'move' && a.sessionId && a.day && a.slot) action = { type: 'move', sessionId: a.sessionId, day: a.day, slot: a.slot };
      else if (a.type === 'assign_room' && a.sessionId && a.roomId) action = { type: 'assign_room', sessionId: a.sessionId, roomId: a.roomId };
      else if (a.type === 'delete_session' && a.sessionId) action = { type: 'delete_session', sessionId: a.sessionId };
    }
    return Response.json({ reply: reply || '…', action });
  } catch {
    return Response.json({ reply: 'Could not reach the AI provider. Check the server logs / network.' }, { status: 502 });
  }
}
