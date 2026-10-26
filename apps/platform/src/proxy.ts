import { ROLE_HOME, isRole, type Role } from "@sakwa/types";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, isDemoMode, parseDemoCookie } from "@/lib/demo/accounts";

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

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
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

  const prefix = ROLE_PREFIXES.find((role) => path.startsWith(`/${role}`));
  if (prefix && !held.includes(prefix)) {
    return redirectTo(request, held[0] ? ROLE_HOME[held[0]] : "/login");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|sw.js|images|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|webmanifest)$).*)",
  ],
};
