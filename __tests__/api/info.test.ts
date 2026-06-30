import { GET, PATCH } from '@/app/api/businesses/[id]/info/route';
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

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeGetRequest(id: string) {
  return new NextRequest(`http://localhost/api/businesses/${id}/info`);
}

function makePatchRequest(id: string, body: object) {
  return new NextRequest(`http://localhost/api/businesses/${id}/info`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockBizRow = {
  id: 1,
  name: 'El Mesón Austral',
  slug: 'el-meson-austral',
  status: 'active',
  menu_completeness: 85,
  business_type: 'restaurant',
  description: 'Cocina chilena',
  address: 'Los Alerces 1847',
  maps_url: null,
  phone: '+56 2 2345 6789',
  hours: 'Lun–Dom 12:00–23:00',
  hours_json: null,
  notes: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  whatsapp: null,
  tripadvisor: null,
  website: null,
};

describe('GET /api/businesses/[id]/info', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    auth.mockResolvedValueOnce(null);
    const response = await GET(makeGetRequest('1'), makeContext('1'));
    expect(response.status).toBe(401);
  });

  it('returns business data for the authenticated owner', async () => {
    query.mockResolvedValueOnce(makeResult([mockBizRow]));

    const response = await GET(makeGetRequest('1'), makeContext('1'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('El Mesón Austral');
    expect(data.address).toBe('Los Alerces 1847');
    expect(data.phone).toBe('+56 2 2345 6789');
  });

  it('returns 404 when business not found or belongs to another user', async () => {
    query.mockResolvedValueOnce(emptyResult);

    const response = await GET(makeGetRequest('999'), makeContext('999'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/no encontrado/i);
  });
});

describe('PATCH /api/businesses/[id]/info', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    auth.mockResolvedValueOnce(null);
    const response = await PATCH(makePatchRequest('1', { description: 'Nuevo' }), makeContext('1'));
    expect(response.status).toBe(401);
  });

  it('returns 403 when business belongs to another user', async () => {
    query.mockResolvedValueOnce(emptyResult); // ownership check fails

    const response = await PATCH(makePatchRequest('1', { description: 'Nuevo' }), makeContext('1'));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toMatch(/autorizado/i);
  });

  it('updates business and returns success', async () => {
    query
      .mockResolvedValueOnce(makeResult([{ id: 1 }])) // ownership check passes
      .mockResolvedValueOnce(emptyResult);              // UPDATE

    const response = await PATCH(
      makePatchRequest('1', { description: 'Nueva descripción', phone: '+56 9 1234 5678' }),
      makeContext('1')
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns 400 when no editable fields are provided', async () => {
    query.mockResolvedValueOnce(makeResult([{ id: 1 }])); // ownership check

    const response = await PATCH(
      makePatchRequest('1', { unknownField: 'ignored', anotherField: 'also ignored' }),
      makeContext('1')
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/sin campos/i);
  });

  it('does not allow clearing the name field', async () => {
    query
      .mockResolvedValueOnce(makeResult([{ id: 1 }]))
      .mockResolvedValueOnce(emptyResult);

    // name = '' (empty string) should be ignored; the description update goes through
    const response = await PATCH(
      makePatchRequest('1', { name: '', description: 'Válido' }),
      makeContext('1')
    );

    expect(response.status).toBe(200);
    // The UPDATE query should NOT include "name" in the SET clause
    const updateCall = query.mock.calls[1][0] as string;
    expect(updateCall).not.toMatch(/\bname\b/);
    expect(updateCall).toMatch(/description/);
  });

  it('trims string fields and converts empty string to null', async () => {
    query
      .mockResolvedValueOnce(makeResult([{ id: 1 }]))
      .mockResolvedValueOnce(emptyResult);

    await PATCH(
      makePatchRequest('1', { address: '   ', phone: '  +56 9 1234 5678  ' }),
      makeContext('1')
    );

    const updateValues = query.mock.calls[1][1] as unknown[];
    // address '' → null, phone trimmed
    expect(updateValues).toContain(null);
    expect(updateValues).toContain('+56 9 1234 5678');
  });
});
