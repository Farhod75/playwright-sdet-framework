import { test, expect } from '../../fixtures/api.fixture';
import { UserSchema, UserListSchema } from '../../data/schemas';

test.describe('Users API', () => {

  // ── CONTRACT TESTS ──────────────────────────────────────
  // Schema validation replaces field-by-field assertions.

  test('single user matches schema contract @smoke', async ({ api }) => {
    const response = await api.getUser(2);
    expect(response.status()).toBe(200);

    const result = UserSchema.safeParse(await response.json());
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  test('user list matches schema contract @regression', async ({ api }) => {
    const response = await api.getAllUsers();
    expect(response.status()).toBe(200);

    const result = UserListSchema.safeParse(await response.json());
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  // ── BEHAVIOR TESTS ──────────────────────────────────────
  // These assert LOGIC, not shape — schema can't cover them.

  test('GET all users returns a non-empty array @smoke', async ({ api }) => {
    const body = await (await api.getAllUsers()).json();

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET non-existent user returns 404 @regression', async ({ api }) => {
    const response = await api.getUser(9999);
    expect(response.status()).toBe(404);
  });

  test('POST creates a user @regression', async ({ api }) => {
    const payload = { name: 'Farhod Elbekov', email: 'farhod@test.com' };
    const response = await api.createUser(payload);

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.name).toBe(payload.name);
    expect(body.email).toBe(payload.email);
    expect(body).toHaveProperty('id');
  });

  test('GET posts filtered by userId @regression', async ({ api }) => {
    const posts = await (await api.getPostsByUser(1)).json();

    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((p: any) => p.userId === 1)).toBe(true);
  });
});