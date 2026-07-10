import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));

// Hoisted so it survives the client cache in lib/anthropic (the constructor
// only runs once per key) and jest.clearAllMocks() between tests.
const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { query } = require('@/lib/db') as { query: jest.Mock };

const mockBiz = {
  id: 1,
  name: 'El Mesón Austral',
  slug: 'el-meson-austral',
  description: 'Cocina chilena',
  address: null,
  maps_url: null,
  phone: null,
  hours: null,
  notes: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  whatsapp: null,
  tripadvisor: null,
  website: null,
};

const mockDishes = [
  {
    id: 1,
    name: 'Longanizas a la parrilla',
    description: 'Longanizas artesanales con merkén',
    ingredients: 'cerdo, especias, merkén',
    price: 8900,
    category: 'Carnes',
    allergens: 'ninguno',
    is_recommended: true,
  },
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

/**
 * resolveMenuSource makes 2 DB calls for a business-with-dishes:
 *   1. businesses table
 *   2. dishes COUNT
 * Then the quota check for a new session:
 *   3. active subscription (empty → starter, never blocked)
 *   4. chat_sessions COUNT this month
 * Then the chat route fetches actual dish rows for the AI context:
 *   5. dishes SELECT
 * The key-resolution and logChatTurn calls that follow get the default result.
 */
function mockBusinessAndDishes() {
  query
    .mockResolvedValueOnce(makeResult([mockBiz]))
    .mockResolvedValueOnce(makeResult([{ count: '1' }]))
    .mockResolvedValueOnce(emptyResult)
    .mockResolvedValueOnce(makeResult([{ count: '0' }]))
    .mockResolvedValueOnce(makeResult(mockDishes))
    .mockResolvedValue(emptyResult);
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Aquí tienes información sobre nuestros platos.' }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });
  });

  it('returns assistant message for a valid request', async () => {
    mockBusinessAndDishes();

    const req = makeRequest({
      messages: [{ role: 'user', content: '¿Qué platos tienen?' }],
      restaurantSlug: 'el-meson-austral',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Aquí tienes información sobre nuestros platos.');
  });

  it('returns 404 when restaurant is not found', async () => {
    // businesses empty, then legacy restaurants empty
    query.mockResolvedValueOnce(emptyResult).mockResolvedValueOnce(emptyResult);

    const req = makeRequest({ messages: [], restaurantSlug: 'nonexistent' });
    const response = await POST(req);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Restaurant not found');
  });

  it('returns 500 on database error', async () => {
    query.mockRejectedValueOnce(new Error('DB connection failed'));

    const req = makeRequest({ messages: [], restaurantSlug: 'el-meson-austral' });
    const response = await POST(req);

    expect(response.status).toBe(500);
  });

  it('calls Anthropic with system prompt containing restaurant name', async () => {
    mockBusinessAndDishes();

    const req = makeRequest({
      messages: [{ role: 'user', content: 'Hola' }],
      restaurantSlug: 'el-meson-austral',
    });

    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('El Mesón Austral'),
        model: 'claude-sonnet-4-6',
      })
    );
  });
});
