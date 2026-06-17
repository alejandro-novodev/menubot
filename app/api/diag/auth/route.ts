import { NextResponse } from 'next/server';
import { authConfig } from '@/auth.config'; // importing runs the AUTH_URL derivation side-effect

export const runtime = 'nodejs';

/**
 * TEMPORARY diagnostic — reports auth-related env *presence* (no secret values)
 * so we can pinpoint a production misconfiguration. REMOVE after debugging.
 */
export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV ?? null,
    secret: {
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
      resolved: !!authConfig.secret, // AUTH_SECRET ?? NEXTAUTH_SECRET
    },
    url: {
      authUrl: process.env.AUTH_URL ?? null,
      nextauthUrl: process.env.NEXTAUTH_URL ?? null,
      railwayPublicDomain: process.env.RAILWAY_PUBLIC_DOMAIN ?? null,
    },
    providers: {
      hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
  });
}
