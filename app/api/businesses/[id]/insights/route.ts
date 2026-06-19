import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { summarizeSession } from '@/lib/insights';

export const runtime = 'nodejs';

// Cap how many sessions we summarize per request so a first open stays fast and
// cheap. Older un-summarized sessions get picked up on the next visit.
const SUMMARIZE_BATCH = 20;

interface SessionRow {
  id: number;
  summary: string | null;
  topics: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const businessId = parseInt(id);

  const biz = await query<{ id: number; name: string }>(
    'SELECT id, name FROM businesses WHERE id = $1 AND user_id = $2',
    [businessId, parseInt(session.user.id)]
  );
  if (biz.rows.length === 0) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  // Plan drives feature gating on the client (advanced analytics, etc.).
  const sub = await query<{ plan: string }>(
    `SELECT plan FROM subscriptions WHERE business_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
    [businessId]
  );
  const plan = sub.rows[0]?.plan ?? 'starter';

  // ── Lazily summarize sessions that have new content ──────────────────────
  const pending = await query<{ id: number }>(
    `SELECT id FROM chat_sessions
     WHERE business_id = $1 AND summarized_at IS NULL AND message_count > 0
     ORDER BY updated_at DESC
     LIMIT ${SUMMARIZE_BATCH}`,
    [businessId]
  );

  for (const { id: sid } of pending.rows) {
    try {
      const msgs = await query<{ role: string; content: string }>(
        'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY id',
        [sid]
      );
      if (msgs.rows.length === 0) continue;
      const { summary, topics } = await summarizeSession(msgs.rows);
      await query(
        'UPDATE chat_sessions SET summary = $1, topics = $2, summarized_at = NOW() WHERE id = $3',
        [summary, JSON.stringify(topics), sid]
      );
    } catch (err) {
      console.error(`Summarize session ${sid} failed (will retry later):`, err);
      // Leave summarized_at NULL so it retries on the next visit.
    }
  }

  // ── Aggregate ────────────────────────────────────────────────────────────
  const sessions = await query<SessionRow>(
    `SELECT id, summary, topics, message_count, created_at, updated_at
     FROM chat_sessions
     WHERE business_id = $1 AND message_count > 0
     ORDER BY updated_at DESC`,
    [businessId]
  );

  const totalSessions = sessions.rows.length;
  const totalMessages = sessions.rows.reduce((sum, s) => sum + s.message_count, 0);

  // Preguntas más frecuentes — count normalized topics across all sessions.
  const topicCounts = new Map<string, number>();
  for (const s of sessions.rows) {
    if (!s.topics) continue;
    let arr: string[] = [];
    try { arr = JSON.parse(s.topics) as string[]; } catch { arr = []; }
    for (const t of new Set(arr)) {
      topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
    }
  }
  const topQuestions = [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const recent = sessions.rows.slice(0, 30).map((s) => ({
    id: s.id,
    summary: s.summary,
    messageCount: s.message_count,
    createdAt: s.created_at,
    pending: s.summary === null,
  }));

  return NextResponse.json({
    businessName: biz.rows[0].name,
    plan,
    totalSessions,
    totalMessages,
    topQuestions,
    recent,
  });
}
