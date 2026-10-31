import { ROLE_HOME, isRole, type Role } from "@sakwa/types";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, isDemoMode, parseDemoCookie } from "@/lib/demo/accounts";
import { actingRole, decodeGrantCookie, pathAccess } from "@/features/permissions/access";
import { PERMISSION_COOKIE, type PermissionRow } from "@/features/permissions/catalog";

const ROLE_PREFIXES: Role[] = [
  "admin",
  "director",
  "accountant",
  "warehouse",
  "agent",
  "investor",
  "customer",
];

function redirectTo(request: NextRequest, pathname: string, next?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

function guardPath(path: string, role: Role, rows: PermissionRow[]) {
  return pathAccess(path, role, rows);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const isAuth = path.startsWith("/login") || path.startsWith("/signup");
  const isPublicApi = path.startsWith("/api/enquiries") || path.startsWith("/api/demo");

  response.headers.set("x-pathname", path);

  const isStaticAsset = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|webmanifest|js|map|txt)$/i.test(
    path,
  );
  if (isPublicApi || isStaticAsset) return response;

  if (isDemoMode()) {
    const session = parseDemoCookie(request.cookies.get(DEMO_COOKIE)?.value);
    if (!session && !isAuth) return redirectTo(request, "/login", path);
    if (session && isAuth) return redirectTo(request, "/");
    if (!session) return response;
    const grants = decodeGrantCookie(request.cookies.get(PERMISSION_COOKIE)?.value);
    const access = guardPath(path, session.role, grants);
    if (access === "deny") return redirectTo(request, ROLE_HOME[session.role]);
    if (access === "allow") return response;
    const prefix = ROLE_PREFIXES.find((role) => path.startsWith(`/${role}`));
    if (prefix && prefix !== session.role) {
      return redirectTo(request, ROLE_HOME[session.role]);
    }
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    if (isAuth) return response;
    return redirectTo(request, "/login", path);
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isAuth) return redirectTo(request, "/login", path);

  if (user && isAuth) return redirectTo(request, "/");

  if (!user) return response;

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const held = (roles ?? [])
    .map((row) => row.role)
    .filter((role): role is Role => isRole(role));

  const actor = actingRole(path, held);
  if (!actor) return redirectTo(request, "/login");

  let grants: PermissionRow[] = [];
  const { data: permissionRows, error: permissionError } = await supabase
    .from("role_permissions")
    .select("role, feature_id, enabled");
  if (!permissionError && permissionRows) {
    grants = permissionRows as PermissionRow[];
  }
  const access = guardPath(path, actor, grants);
  if (access === "deny") return redirectTo(request, ROLE_HOME[actor]);
  if (access === "allow") return response;

  const prefix = ROLE_PREFIXES.find((role) => path.startsWith(`/${role}`));
  if (prefix && !held.includes(prefix)) {
    return redirectTo(request, ROLE_HOME[actor]);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|sw.js|images|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|webmanifest)$).*)",
  ],
};
