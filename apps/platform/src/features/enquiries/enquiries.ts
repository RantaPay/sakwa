import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listEnquiries() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("investor_enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateEnquiryStatus(id: string, status: "contacted" | "closed") {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("investor_enquiries")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
