import type { Role } from "@sakwa/types";
import { createId } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { listUsersByRole } from "@/features/users";

export async function notifyUser(input: {
  userId: string;
  title: string;
  body: string;
  kind: string;
  entityTable?: string;
  entityId?: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("notifications").insert({
    id: createId(),
    user_id: input.userId,
    title: input.title,
    body: input.body,
    kind: input.kind,
    entity_table: input.entityTable ?? null,
    entity_id: input.entityId ?? null,
  });
  if (error) throw error;
}

export async function notifyRole(
  role: Role,
  input: Omit<Parameters<typeof notifyUser>[0], "userId">,
) {
  const people = await listUsersByRole(role);
  await Promise.all(people.map((row) => notifyUser({ ...input, userId: row.id })));
}
