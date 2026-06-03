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

describe('GET /api/restaurant/[slug]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns restaurant data for a valid slug', async () => {
    const mockRestaurant = { id: 1, name: 'Izakaya Nami', slug: 'izakaya-nami', description: 'Test' };
    query.mockResolvedValueOnce(makeResult([mockRestaurant]));

    const req = new NextRequest('http://localhost/api/restaurant/izakaya-nami');
    const response = await GET(req, makeContext('izakaya-nami'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Izakaya Nami');
    expect(data.slug).toBe('izakaya-nami');
  });

  it('returns 404 for an unknown slug', async () => {
    query.mockResolvedValueOnce(makeResult([]));

    const req = new NextRequest('http://localhost/api/restaurant/nonexistent');
    const response = await GET(req, makeContext('nonexistent'));

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Restaurant not found');
  });

  it('returns 500 on database error', async () => {
    query.mockRejectedValueOnce(new Error('Connection timeout'));

    const req = new NextRequest('http://localhost/api/restaurant/izakaya-nami');
    const response = await GET(req, makeContext('izakaya-nami'));

    expect(response.status).toBe(500);
  });

  it('queries with the correct slug parameter', async () => {
    query.mockResolvedValueOnce(makeResult([{ id: 1, name: 'Test', slug: 'test', description: '' }]));

    const req = new NextRequest('http://localhost/api/restaurant/test-slug');
    await GET(req, makeContext('test-slug'));

    expect(query).toHaveBeenCalledWith(expect.any(String), ['test-slug']);
  });
});
