import { POST } from '@/app/api/dishes/route';
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
  return new NextRequest('http://localhost/api/dishes', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Query sequence for a successful dish creation:
 *   1. SELECT businesses (ownership check)
 *   2. INSERT dish RETURNING id
 *   3. SELECT dishes for completeness recalc
 *   4. UPDATE businesses SET menu_completeness
 */
function mockSuccessfulCreate(dishRows = [{ description: 'Desc', price: 8900, category: 'Entradas', ingredients: 'A', allergens: 'B' }]) {
  query
    .mockResolvedValueOnce(makeResult([{ id: 1 }]))    // ownership check
    .mockResolvedValueOnce(makeResult([{ id: 55 }]))   // INSERT dish
    .mockResolvedValueOnce(makeResult(dishRows))        // SELECT for completeness
    .mockResolvedValueOnce(emptyResult);               // UPDATE completeness
}

describe('POST /api/dishes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    auth.mockResolvedValueOnce(null);
    const req = makeRequest({ businessId: 1, name: 'Empanada' });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('returns 400 when businessId is missing', async () => {
    const req = makeRequest({ name: 'Empanada' });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/requeridos/i);
  });

  it('returns 400 when name is missing', async () => {
    const req = makeRequest({ businessId: 1 });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/requeridos/i);
  });

  it('returns 403 when business belongs to another user', async () => {
    query.mockResolvedValueOnce(emptyResult); // ownership check fails

    const req = makeRequest({ businessId: 999, name: 'Empanada' });
    const response = await POST(req);

    expect(response.status).toBe(403);
  });

  it('creates dish and returns dishId with completeness score', async () => {
    mockSuccessfulCreate();

    const req = makeRequest({
      businessId: 1,
      name: 'Empanada de pino',
      description: 'Clásica empanada chilena',
      price: 2900,
      category: 'Entradas',
      ingredients: 'carne, cebolla, huevo, aceitunas',
      allergens: 'gluten',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.dishId).toBe(55);
    expect(typeof data.completeness).toBe('number');
  });

  it('recalculates and returns updated menu completeness', async () => {
    // Full dish gives 100 points; menu with one full dish = score 100
    const fullDish = { description: 'D', price: 100, category: 'C', ingredients: 'I', allergens: 'A' };
    mockSuccessfulCreate([fullDish]);

    const req = makeRequest({ businessId: 1, name: 'Nuevo Plato', description: 'D', price: 100, category: 'C', ingredients: 'I', allergens: 'A' });
    const response = await POST(req);
    const data = await response.json();

    expect(data.completeness).toBe(100);
  });

  it('completeness is lower when dishes have missing fields', async () => {
    // Dish with only name (all optional fields null) → score 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockSuccessfulCreate([{ description: null, price: null, category: null, ingredients: null, allergens: null } as any]);

    const req = makeRequest({ businessId: 1, name: 'Plato mínimo' });
    const response = await POST(req);
    const data = await response.json();

    expect(data.completeness).toBe(0);
  });

  it('trims dish name before inserting', async () => {
    mockSuccessfulCreate();

    const req = makeRequest({ businessId: 1, name: '  Empanada  ' });
    await POST(req);

    const insertCall = query.mock.calls[1];
    expect(insertCall[1][1]).toBe('Empanada'); // index 1 is dish name
  });
});
