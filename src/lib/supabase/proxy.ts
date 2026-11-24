import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/** Refreshes the Supabase session cookie and guards private areas. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Do not add code between createServerClient and getClaims(): it keeps the session fresh.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  const needsAuth =
    pathname.startsWith("/admin") ||
    pathname === "/wishlist" ||
    (pathname.startsWith("/account") && !isPublicAccountPage(pathname));

  if (needsAuth && !isSignedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

function isPublicAccountPage(pathname: string) {
  return ["/account/login", "/account/register", "/account/forgot-password"].includes(pathname);
}
