import { createClient } from '@supabase/supabase-js';

// Server-side only — never import this file from a client component.
// Uses the service role key, which bypasses Row Level Security. That's
// acceptable for now because there's no Auth/RLS yet (single-user, V1);
// revisit this file when Auth is introduced before any public deployment.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
