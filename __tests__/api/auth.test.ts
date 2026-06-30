import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed_password') }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { query } = require('@/lib/db') as { query: jest.Mock };

function makeResult<T>(rows: T[]) {
  return { rows, command: 'SELECT', rowCount: rows.length, oid: 0, fields: [] };
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.INVITE_ONLY;
  });

  it('returns 400 when fields are missing', async () => {
    const req = makeRequest({ name: 'Ana', email: '' });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/requeridos/i);
  });

  it('returns 400 when password is too short', async () => {
    const req = makeRequest({ name: 'Ana', email: 'ana@test.com', password: 'short' });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/8 caracteres/);
  });

  it('returns 409 when email already exists', async () => {
    query.mockResolvedValueOnce(makeResult([{ id: 99 }])); // existing user found

    const req = makeRequest({ name: 'Ana', email: 'existing@test.com', password: 'password123' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toMatch(/ya existe/i);
  });

  it('creates user and returns userId on success', async () => {
    query
      .mockResolvedValueOnce(makeResult([]))           // no existing user
      .mockResolvedValueOnce(makeResult([{ id: 42 }])); // INSERT RETURNING id

    const req = makeRequest({ name: 'Ana García', email: 'ana@test.com', password: 'securepass' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.userId).toBe(42);
  });

  it('sets pendingApproval=true when INVITE_ONLY is not "false"', async () => {
    process.env.INVITE_ONLY = 'true';
    query
      .mockResolvedValueOnce(makeResult([]))
      .mockResolvedValueOnce(makeResult([{ id: 1 }]));

    const req = makeRequest({ name: 'Ana', email: 'ana@test.com', password: 'securepass' });
    const response = await POST(req);
    const data = await response.json();

    expect(data.pendingApproval).toBe(true);
  });

  it('sets pendingApproval=false when INVITE_ONLY is "false"', async () => {
    process.env.INVITE_ONLY = 'false';
    query
      .mockResolvedValueOnce(makeResult([]))
      .mockResolvedValueOnce(makeResult([{ id: 2 }]));

    const req = makeRequest({ name: 'Ana', email: 'ana@test.com', password: 'securepass' });
    const response = await POST(req);
    const data = await response.json();

    expect(data.pendingApproval).toBe(false);
  });

  it('trims whitespace from name and email before inserting', async () => {
    query
      .mockResolvedValueOnce(makeResult([]))
      .mockResolvedValueOnce(makeResult([{ id: 5 }]));

    const req = makeRequest({ name: '  Ana  ', email: '  ANA@TEST.COM  ', password: 'securepass' });
    await POST(req);

    // Second query is the INSERT — check trimmed values were used
    const insertCall = query.mock.calls[1];
    expect(insertCall[1][0]).toBe('Ana');
    expect(insertCall[1][1]).toBe('ANA@TEST.COM');
  });

  it('returns 500 on database error', async () => {
    query.mockRejectedValueOnce(new Error('DB offline'));

    const req = makeRequest({ name: 'Ana', email: 'ana@test.com', password: 'securepass' });
    const response = await POST(req);

    expect(response.status).toBe(500);
  });
});
