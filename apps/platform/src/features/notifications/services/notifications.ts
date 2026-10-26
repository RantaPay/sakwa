import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listNotifications(userId: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function markRead(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
