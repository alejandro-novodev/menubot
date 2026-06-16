import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config — no bcryptjs, no pg imports
export const authConfig: NextAuthConfig = {
  // Trust the reverse proxy's X-Forwarded-* headers (Railway, etc.) so Auth.js
  // resolves the public URL instead of the internal localhost:8080 host.
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [], // Providers added in auth.ts (Node.js only)
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    // Keep every post-auth redirect on our own origin. Behind a proxy a stray
    // callbackUrl can carry the internal host (localhost:8080) — collapse any
    // URL to baseUrl + its path so users never get sent off-origin.
    redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        return `${baseUrl}${target.pathname}${target.search}`;
      } catch {
        return baseUrl;
      }
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith('/admin')) {
        return isLoggedIn && (auth?.user as { role?: string })?.role === 'admin';
      }
      if (pathname.startsWith('/dashboard')) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = String(user.id ?? '');
        token.role = String((user as { role?: string }).role ?? 'owner');
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = (token.id as string | undefined) ?? '';
      session.user.role = (token.role as string | undefined) ?? 'owner';
      return session;
    },
  },
};
