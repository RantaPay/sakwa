import { ROLE_HOME, ROLE_LABEL, ROLES, type Role } from "@sakwa/types";
import { Pool } from "pg";

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

export async function createAccount(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  roles?: Role[];
}) {
  const email = input.email.trim().toLowerCase();
  const client = await database().connect();
  try {
    await client.query("begin");
    const created = await client.query<{ id: string }>(
      `insert into auth.users (
         instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
         raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
         confirmation_token, recovery_token, email_change_token_new, email_change
       ) values (
         '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
         $1, extensions.crypt($2, extensions.gen_salt('bf')), now(),
         '{"provider":"email","providers":["email"]}'::jsonb,
         jsonb_build_object('full_name', $3::text),
         now(), now(), '', '', '', ''
       )
       returning id`,
      [email, input.password, input.fullName.trim()],
    );
    const id = created.rows[0]?.id;
    if (!id) throw new Error("Could not create the account.");
    await client.query(
      `insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
       values ($1, $2, jsonb_build_object('sub', $2::text, 'email', $3::text), 'email', now(), now())`,
      [id, id, email],
    );
    await client.query(
      `insert into public.profiles (id, full_name, email, phone, primary_role)
       values ($1, $2, $3, $4, $5)`,
      [id, input.fullName.trim(), email, input.phone.trim(), input.role],
    );
    const roles = [...new Set(input.roles?.length ? input.roles : [input.role])];
    if (!roles.includes(input.role)) roles.unshift(input.role);
    for (const role of roles) {
      await client.query(
        `insert into public.user_roles (user_id, role) values ($1, $2)`,
        [id, role],
      );
    }
    await client.query("commit");
    return { id, email, home: ROLE_HOME[input.role] };
  } catch (error) {
    await client.query("rollback");
    const code =
      typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "23505") throw new Error("That email is already in use.");
    throw error instanceof Error ? error : new Error("Could not create the account.");
  } finally {
    client.release();
  }
}

export function roleLabel(role: Role) {
  return ROLE_LABEL[role];
}
