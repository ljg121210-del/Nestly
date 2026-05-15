import { createClient } from "@supabase/supabase-js";

const realSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const realSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseEnv =
  Boolean(realSupabaseUrl) && Boolean(realSupabaseAnonKey);

export const supabase = createClient(
  realSupabaseUrl || "https://placeholder.supabase.co",
  realSupabaseAnonKey || "placeholder"
);