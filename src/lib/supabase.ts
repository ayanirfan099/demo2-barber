/* ── Supabase client — single source of truth for the backend connection ── */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** Configured client, or `null` when env vars are missing (localStorage demo mode). */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

if (!supabase) {
  console.warn(
    '[Vienna Cuts] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY fehlen — Demo-Modus (localStorage).'
  );
}
