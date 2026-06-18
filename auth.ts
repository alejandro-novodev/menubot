import NextAuth, { CredentialsSignin } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { authConfig } from './auth.config';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string | null;
  role: string;
  approved: boolean;
  image: string | null;
}

/** Invite-only by default; flip INVITE_ONLY=false to open registration to all. */
const inviteOnly = process.env.INVITE_ONLY !== 'false';

/** Account exists and password is right, but an admin hasn't enabled it yet. */
class PendingApprovalError extends CredentialsSignin {
  code = 'pending_approval';
}

/** Whether this user may sign in given the invite-only gate. */
function canSignIn(user: { role: string; approved: boolean }): boolean {
  return !inviteOnly || user.role === 'admin' || user.approved;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const res = await query<UserRow>(
          'SELECT * FROM users WHERE email = $1',
          [credentials.email as string]
        );
        const user = res.rows[0];
        if (!user || !user.password_hash) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!valid) return null;
        // Invite-only gate: valid credentials but not yet enabled by an admin.
        if (!canSignIn(user)) throw new PendingApprovalError();
        return { id: String(user.id), email: user.email, name: user.name, role: user.role, image: user.image };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = await query<UserRow>('SELECT * FROM users WHERE email = $1', [user.email!]);
        let userId: number;

        if (existing.rows.length === 0) {
          const inserted = await query<{ id: number }>(
            `INSERT INTO users (name, email, email_verified, image, role)
             VALUES ($1, $2, NOW(), $3, 'owner') RETURNING id`,
            [user.name, user.email, user.image]
          );
          userId = inserted.rows[0].id;
        } else {
          userId = existing.rows[0].id;
        }

        await query(
          `INSERT INTO oauth_accounts (user_id, provider, provider_account_id)
           VALUES ($1, $2, $3) ON CONFLICT (provider, provider_account_id) DO NOTHING`,
          [userId, account.provider, account.providerAccountId]
        );

        const role = existing.rows[0]?.role ?? 'owner';
        const approved = existing.rows[0]?.approved ?? false;
        // Invite-only gate: block Google sign-in for accounts not yet enabled.
        // The account row still exists, so an admin can approve it afterward.
        if (!canSignIn({ role, approved })) {
          return '/auth/login?status=pending';
        }

        user.id = String(userId);
        user.role = role;
      }
      return true;
    },
  },
});
