import { ROLE_HOME, ROLE_LABEL, ROLES, type Role } from "@sakwa/types";
import { Pool } from "pg";
import { createAdminSupabase } from "@/lib/supabase/admin";

export type AccountRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  active: boolean;
};

let pool: Pool | null = null;

function database() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("The database is not configured.");
  if (!pool) {
    const connectionString = raw.replace(/sslmode=[^&]*/g, "sslmode=no-verify");
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function listAccounts(): Promise<AccountRow[]> {
  const { rows } = await database().query<{
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    primary_role: string;
    is_active: boolean;
  }>(
    `select id, full_name, email, phone, primary_role, is_active
     from public.profiles
     order by primary_role, full_name`,
  );
  return rows.flatMap((row) => {
    if (!ROLES.includes(row.primary_role as Role)) return [];
    return [
      {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        role: row.primary_role as Role,
        active: row.is_active,
      },
    ];
  });
}

function friendlyAuthError(message: string) {
  if (/already (been )?registered|already exists/i.test(message)) {
    return "That email is already in use.";
  }
  if (/password/i.test(message)) return message;
  return `Could not create the login: ${message}`;
}

export async function createPersonAccount(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  roles?: Role[];
}) {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const roles = [...new Set([input.role, ...(input.roles ?? [])])];

  const admin = createAdminSupabase();
  const created = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (created.error || !created.data.user) {
    throw new Error(friendlyAuthError(created.error?.message ?? "unknown error"));
  }
  const id = created.data.user.id;

  try {
    // One statement, so the profile and its roles are saved together or not at all.
    await database().query(
      `with person as (
         insert into public.profiles (id, full_name, email, phone, primary_role)
         values ($1, $2, $3, $4, $5)
         returning id
       )
       insert into public.user_roles (user_id, role)
       select person.id, role from person, unnest($6::text[]) as role`,
      [id, fullName, email, input.phone.trim(), input.role, roles],
    );
    return { id, email, home: ROLE_HOME[input.role] };
  } catch (error) {
    await admin.auth.admin.deleteUser(id).catch(() => undefined);
    const code =
      typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "23505") throw new Error("That email is already in use.");
    throw error instanceof Error ? error : new Error("Could not create the account.");
  }
}

export function roleLabel(role: Role) {
  return ROLE_LABEL[role];
}
