import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default_super_secret_kartu_bisnis_jwt_key_32_bytes_len"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah mengakses halaman atau API admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Kecualikan rute login dan login API
    if (
      pathname === "/admin/login" ||
      pathname === "/api/admin/auth/login"
    ) {
      // Jika sudah login dan mencoba ke /admin/login, redirect ke /admin
      const token = request.cookies.get("admin_session")?.value;
      if (token && pathname === "/admin/login") {
        try {
          await jwtVerify(token, SECRET_KEY);
          return NextResponse.redirect(new URL("/admin", request.url));
        } catch {
          // Token invalid, izinkan ke login
        }
      }
      return NextResponse.next();
    }

    // Proteksi semua rute admin lainnya
    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized or token expired" }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
