import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config — no bcryptjs, no pg imports
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  providers: [], // Providers added in auth.ts (Node.js only)
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
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
