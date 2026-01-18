// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // Refresh session si nécessaire
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes publiques - pas de protection
  const publicRoutes = ["/", "/pricing", "/login", "/signup", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some(route => pathname === route) ||
                        pathname.startsWith("/api/auth");

  // Routes admin - nécessitent role admin (vérifié côté page)
  const isAdminRoute = pathname.startsWith("/admin");

  // Routes app protégées - nécessitent auth
  const isProtectedRoute = pathname.startsWith("/home") ||
                           pathname.startsWith("/search") ||
                           pathname.startsWith("/favorites") ||
                           pathname.startsWith("/boards") ||
                           pathname.startsWith("/textiles") ||
                           pathname.startsWith("/settings") ||
                           pathname.startsWith("/tools");

  // Si route publique, laisser passer
  if (isPublicRoute) {
    // Mais rediriger vers /home si déjà connecté sur pages auth
    if (user && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return response;
  }

  // Si pas connecté sur route protégée -> login
  if (!user && (isProtectedRoute || isAdminRoute)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
