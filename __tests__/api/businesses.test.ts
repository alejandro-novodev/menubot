import { POST } from '@/app/api/businesses/create/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));
jest.mock('@/auth', () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: '42', role: 'owner', email: 'owner@test.com' } }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { query } = require('@/lib/db') as { query: jest.Mock };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { auth } = require('@/auth') as { auth: jest.Mock };

function makeResult<T>(rows: T[]) {
  return { rows, command: 'SELECT', rowCount: rows.length, oid: 0, fields: [] };
}

const emptyResult = makeResult([]);

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/businesses/create', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Query sequence for a successful business creation:
 *   1. COUNT existing businesses (Promise.all[0])
 *   2. SELECT active subscription (Promise.all[1])
 *   3. SELECT slug uniqueness check
 *   4. INSERT business RETURNING id
 *   5. INSERT trial subscription
 */
function mockSuccessfulCreate(currentCount = 0, plan = 'trial') {
  query
    .mockResolvedValueOnce(makeResult([{ count: String(currentCount) }]))  // business count
    .mockResolvedValueOnce(plan === 'trial' ? emptyResult : makeResult([{ plan }])) // subscription
    .mockResolvedValueOnce(emptyResult)                                    // slug check (unique)
    .mockResolvedValueOnce(makeResult([{ id: 99 }]))                       // INSERT business
    .mockResolvedValueOnce(emptyResult);                                   // INSERT subscription
}

describe('POST /api/businesses/create', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    auth.mockResolvedValueOnce(null);
    const req = makeRequest({ name: 'Mi Restaurante', businessType: 'restaurant' });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    const req = makeRequest({ name: '  ', businessType: 'restaurant' });
    // plan limit queries still run before the name check in the current flow
    query.mockResolvedValue(makeResult([{ count: '0' }]));
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/nombre/i);
  });

  it('returns 403 when trial user already has 1 business', async () => {
    query
      .mockResolvedValueOnce(makeResult([{ count: '1' }])) // already has 1
      .mockResolvedValueOnce(emptyResult);                 // no active subscription = trial

    const req = makeRequest({ name: 'Nuevo Local', businessType: 'bar' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toMatch(/trial/);
  });

  it('returns 403 when starter user already has 1 business', async () => {
    query
      .mockResolvedValueOnce(makeResult([{ count: '1' }]))
      .mockResolvedValueOnce(makeResult([{ plan: 'starter' }]));

    const req = makeRequest({ name: 'Nuevo Local', businessType: 'bar' });
    const response = await POST(req);

    expect(response.status).toBe(403);
  });

  it('allows multi plan user to create up to 5 businesses', async () => {
    query
      .mockResolvedValueOnce(makeResult([{ count: '4' }]))  // has 4 businesses
      .mockResolvedValueOnce(makeResult([{ plan: 'multi' }]))
      .mockResolvedValueOnce(emptyResult)                   // slug unique
      .mockResolvedValueOnce(makeResult([{ id: 10 }]))      // INSERT
      .mockResolvedValueOnce(emptyResult);                  // subscription

    const req = makeRequest({ name: 'Local 5', businessType: 'restaurant' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.businessId).toBe(10);
  });

  it('creates business and returns businessId and slug', async () => {
    mockSuccessfulCreate();
    const req = makeRequest({ name: 'Mi Restaurante', businessType: 'restaurant', description: 'Cocina casera' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.businessId).toBe(99);
    expect(data.slug).toBe('mi-restaurante');
  });

  it('slugifies business name (removes accents, spaces become dashes)', async () => {
    mockSuccessfulCreate();
    const req = makeRequest({ name: 'Café Temporäda', businessType: 'service' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.slug).toMatch(/^cafe-temporada$/);
  });

  it('deduplicates slug when it already exists', async () => {
    query
      .mockResolvedValueOnce(makeResult([{ count: '0' }]))    // business count
      .mockResolvedValueOnce(emptyResult)                      // no subscription
      .mockResolvedValueOnce(makeResult([{ id: 5 }]))          // slug "mi-bar" taken
      .mockResolvedValueOnce(emptyResult)                      // "mi-bar-1" free
      .mockResolvedValueOnce(makeResult([{ id: 20 }]))         // INSERT business
      .mockResolvedValueOnce(emptyResult);                     // INSERT subscription

    const req = makeRequest({ name: 'Mi Bar', businessType: 'bar' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.slug).toBe('mi-bar-1');
  });

  it('returns 500 on database error', async () => {
    query.mockRejectedValueOnce(new Error('DB timeout'));
    const req = makeRequest({ name: 'Mi Restaurante', businessType: 'restaurant' });
    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});
