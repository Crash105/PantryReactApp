import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted runs before any imports, making these mocks available inside vi.mock factories
const mocks = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockUpdate = vi.fn();
  const mockCreate = vi.fn();
  const mockVerifyIdToken = vi.fn();
  return { mockGet, mockSet, mockUpdate, mockCreate, mockVerifyIdToken };
});

vi.mock('@/firebaseAdmin', () => ({
  adminAuth: { verifyIdToken: mocks.mockVerifyIdToken },
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: mocks.mockGet,
        set: mocks.mockSet,
        update: mocks.mockUpdate,
      })),
    })),
  },
}));

vi.mock('openai', () => ({
  OpenAI: vi.fn(function () {
    return { chat: { completions: { create: mocks.mockCreate } } };
  }),
}));

import { POST } from '../../app/api/openai/route.js';

function makeRequest({ token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return new Request('http://localhost/api/openai', {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? { pantryItems: [{ name: 'Chicken' }] }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.mockCreate.mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          result: [
            { name: 'Recipe 1', description: 'Desc 1' },
            { name: 'Recipe 2', description: 'Desc 2' },
          ],
        }),
      },
    }],
  });
  mocks.mockSet.mockResolvedValue(undefined);
  mocks.mockUpdate.mockResolvedValue(undefined);
});

describe('POST /api/openai — authentication', () => {
  it('returns 401 when no bearer token is provided', async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
  });

  it('returns 401 when the token is invalid', async () => {
    mocks.mockVerifyIdToken.mockRejectedValue(new Error('Token expired'));
    const response = await POST(makeRequest({ token: 'bad-token' }));
    expect(response.status).toBe(401);
  });

  it('returns 403 for anonymous (guest) users', async () => {
    mocks.mockVerifyIdToken.mockResolvedValue({
      uid: 'anon123',
      firebase: { sign_in_provider: 'anonymous' },
    });
    const response = await POST(makeRequest({ token: 'anon-token' }));
    expect(response.status).toBe(403);
  });

  it('returns 200 with recipes for a valid Google-authenticated token', async () => {
    mocks.mockVerifyIdToken.mockResolvedValue({
      uid: 'user123',
      firebase: { sign_in_provider: 'google.com' },
    });
    mocks.mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ rateLimit: { count: 0, windowStart: Date.now() - 10 * 60 * 1000 } }),
    });

    const response = await POST(makeRequest({ token: 'valid-token' }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.result).toHaveLength(2);
    expect(data.result[0]).toHaveProperty('name');
    expect(data.result[0]).toHaveProperty('description');
  });
});

describe('POST /api/openai — rate limiting', () => {
  beforeEach(() => {
    mocks.mockVerifyIdToken.mockResolvedValue({
      uid: 'user123',
      firebase: { sign_in_provider: 'google.com' },
    });
  });

  it('returns 429 after 5 recipe generations within one hour', async () => {
    mocks.mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        rateLimit: {
          count: 5,                               // at the limit
          windowStart: Date.now() - 30 * 60 * 1000, // 30 min ago — still within the hour
        },
      }),
    });

    const response = await POST(makeRequest({ token: 'valid-token' }));
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toMatch(/limit/i);
  });

  it('allows generation again after the one-hour window resets', async () => {
    mocks.mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        rateLimit: {
          count: 5,
          windowStart: Date.now() - 61 * 60 * 1000, // 61 min ago — window expired
        },
      }),
    });

    const response = await POST(makeRequest({ token: 'valid-token' }));
    expect(response.status).toBe(200);
  });

  it('allows generation when the user has made fewer than 5 requests', async () => {
    mocks.mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        rateLimit: { count: 4, windowStart: Date.now() - 10 * 60 * 1000 },
      }),
    });

    const response = await POST(makeRequest({ token: 'valid-token' }));
    expect(response.status).toBe(200);
  });
});
