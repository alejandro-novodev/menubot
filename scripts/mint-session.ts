import { config } from 'dotenv';
config({ path: '.env.local' });
import { encode } from 'next-auth/jwt';
(async () => {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) { console.error('no AUTH_SECRET'); process.exit(1); }
  const token = await encode({
    token: { id: '3', sub: '3', role: 'owner', name: 'Claude QA', email: 'qa@menubot.local' },
    secret,
    salt: 'authjs.session-token',
    maxAge: 60 * 60 * 24 * 7,
  });
  console.log(token);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
