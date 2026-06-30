import { GET } from '@/app/api/restaurant/[slug]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { query } = require('@/lib/db') as { query: jest.Mock };

function makeResult<T>(rows: T[]) {
  return { rows, command: 'SELECT', rowCount: rows.length, oid: 0, fields: [] };
}

function makeContext(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

const mockBiz = {
  id: 1,
  name: 'El Mesón Austral',
  description: 'Cocina chilena de autor',
  address: 'Los Alerces 1847, Barrio Italia',
  maps_url: null,
  phone: '+56 2 2345 6789',
  hours: 'Lun–Dom 12:00–23:00',
  notes: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  whatsapp: null,
  tripadvisor: null,
  website: null,
};

/**
 * resolveMenuSource makes 2 DB calls for a business with dishes:
 *   1. businesses table (by slug)
 *   2. dishes COUNT
 * getBusinessPlan adds a 3rd call:
 *   3. subscriptions table
 */
function mockBusinessWithPlan(plan = 'pro') {
  query
    .mockResolvedValueOnce(makeResult([mockBiz]))
    .mockResolvedValueOnce(makeResult([{ count: '5' }]))
    .mockResolvedValueOnce(makeResult([{ plan }]));
}

describe('GET /api/restaurant/[slug]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns restaurant data for a valid slug', async () => {
    mockBusinessWithPlan();
    const req = new NextRequest('http://localhost/api/restaurant/el-meson-austral');
    const response = await GET(req, makeContext('el-meson-austral'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('El Mesón Austral');
    expect(data.slug).toBe('el-meson-austral');
    expect(data.description).toBe('Cocina chilena de autor');
  });

  it('returns 404 for an unknown slug', async () => {
    // resolveMenuSource checks businesses, then legacy restaurants — both empty → null
    query
      .mockResolvedValueOnce(makeResult([]))
      .mockResolvedValueOnce(makeResult([]));

    const req = new NextRequest('http://localhost/api/restaurant/nonexistent');
    const response = await GET(req, makeContext('nonexistent'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Restaurant not found');
  });

  it('returns 500 on database error', async () => {
    query.mockRejectedValueOnce(new Error('Connection timeout'));
    const req = new NextRequest('http://localhost/api/restaurant/el-meson-austral');
    const response = await GET(req, makeContext('el-meson-austral'));
    expect(response.status).toBe(500);
  });

  it('queries with the correct slug parameter', async () => {
    mockBusinessWithPlan();
    const req = new NextRequest('http://localhost/api/restaurant/test-slug');
    await GET(req, makeContext('test-slug'));
    expect(query).toHaveBeenCalledWith(expect.any(String), ['test-slug']);
  });

  it('pro plan has reviewsEnabled true', async () => {
    mockBusinessWithPlan('pro');
    const req = new NextRequest('http://localhost/api/restaurant/el-meson-austral');
    const response = await GET(req, makeContext('el-meson-austral'));
    const data = await response.json();
    expect(data.reviewsEnabled).toBe(true);
  });

  it('trial plan has reviewsEnabled true (trial gets Pro features)', async () => {
    mockBusinessWithPlan('trial');
    const req = new NextRequest('http://localhost/api/restaurant/el-meson-austral');
    const response = await GET(req, makeContext('el-meson-austral'));
    const data = await response.json();
    expect(data.reviewsEnabled).toBe(true); // trial = pro features
  });

  it('starter plan has reviewsEnabled false', async () => {
    mockBusinessWithPlan('starter');
    const req = new NextRequest('http://localhost/api/restaurant/el-meson-austral');
    const response = await GET(req, makeContext('el-meson-austral'));
    const data = await response.json();
    expect(data.reviewsEnabled).toBe(false);
  });

  it('includes address and phone in response', async () => {
    mockBusinessWithPlan();
    const req = new NextRequest('http://localhost/api/restaurant/el-meson-austral');
    const response = await GET(req, makeContext('el-meson-austral'));
    const data = await response.json();
    expect(data.address).toBe('Los Alerces 1847, Barrio Italia');
    expect(data.phone).toBe('+56 2 2345 6789');
    expect(data.hours).toBe('Lun–Dom 12:00–23:00');
  });
});
