import { supabaseAdmin } from '@/lib/db/supabase';

// Returns aggregate spend across all conversations. A per-conversation
// breakdown and a UI for this land in Phase 7 — this just makes the real
// numbers available now that usage_log is actually being written to.

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('usage_log')
    .select('estimated_cost_usd, input_tokens, output_tokens');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const totals = (data ?? []).reduce(
    (acc, row) => ({
      totalCostUsd: acc.totalCostUsd + Number(row.estimated_cost_usd ?? 0),
      totalInputTokens: acc.totalInputTokens + (row.input_tokens ?? 0),
      totalOutputTokens: acc.totalOutputTokens + (row.output_tokens ?? 0),
    }),
    { totalCostUsd: 0, totalInputTokens: 0, totalOutputTokens: 0 },
  );

  return Response.json(totals);
}
