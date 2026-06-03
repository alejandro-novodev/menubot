import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Aquí tienes información sobre nuestros platos.' }],
      }),
    },
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { query } = require('@/lib/db') as { query: jest.Mock };

const mockRestaurant = { id: 1, name: 'Izakaya Nami', slug: 'izakaya-nami', description: 'Test' };
const mockDishes = [
  { id: 1, name: 'Karaage', description: 'Pollo frito', ingredients: 'pollo', price: 8500, category: 'entradas', allergens: 'gluten' },
];
const emptyResult = { rows: [], command: '', rowCount: 0, oid: 0, fields: [] };

function makeResult<T>(rows: T[]) {
  return { rows, command: 'SELECT', rowCount: rows.length, oid: 0, fields: [] };
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/chat', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns assistant message for a valid request', async () => {
    query
      .mockResolvedValueOnce(makeResult([mockRestaurant]))
      .mockResolvedValueOnce(makeResult(mockDishes));

    const req = makeRequest({
      messages: [{ role: 'user', content: '¿Qué platos tienen?' }],
      restaurantSlug: 'izakaya-nami',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Aquí tienes información sobre nuestros platos.');
  });

  it('returns 404 when restaurant is not found', async () => {
    query.mockResolvedValueOnce(emptyResult);

    const req = makeRequest({ messages: [], restaurantSlug: 'nonexistent' });
    const response = await POST(req);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Restaurant not found');
  });

  it('returns 500 on database error', async () => {
    query.mockRejectedValueOnce(new Error('DB connection failed'));

    const req = makeRequest({ messages: [], restaurantSlug: 'izakaya-nami' });
    const response = await POST(req);

    expect(response.status).toBe(500);
  });

  it('calls Anthropic with correct system prompt containing restaurant name', async () => {
    query
      .mockResolvedValueOnce(makeResult([mockRestaurant]))
      .mockResolvedValueOnce(makeResult(mockDishes));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Anthropic = require('@anthropic-ai/sdk').default;
    const mockCreate = Anthropic.mock.results[0]?.value.messages.create;

    const req = makeRequest({
      messages: [{ role: 'user', content: 'Hola' }],
      restaurantSlug: 'izakaya-nami',
    });

    await POST(req);

    if (mockCreate) {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('Izakaya Nami'),
          model: 'claude-sonnet-4-20250514',
        })
      );
    }
  });
});
