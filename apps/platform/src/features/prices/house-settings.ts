import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listHouseSettings() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("house_settings")
    .select("id, weekly_interest_bps, updated_at")
    .eq("id", "house")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveWeeklyInterest(input: { percent: number; updatedBy: string }) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("house_settings").upsert({
    id: "house",
    weekly_interest_bps: Math.round(input.percent * 100),
    updated_by: input.updatedBy,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
