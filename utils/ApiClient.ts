import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * ApiClient — the API-layer equivalent of a Page Object.
 *
 * Endpoints and request shapes live HERE, not in test files.
 * When a route changes from /users to /v2/users, you edit one line.
 */
export class ApiClient {
  // APIRequestContext is the type of Playwright's `request` fixture.
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // ── USERS ───────────────────────────────────────────────

  async getUser(id: number): Promise<APIResponse> {
    return await this.request.get(`/users/${id}`);
  }

  async getAllUsers(): Promise<APIResponse> {
    return await this.request.get('/users');
  }

  /**
   * `data` serializes the object to JSON and sets Content-Type automatically.
   * Use `form` instead for application/x-www-form-urlencoded.
   */
  async createUser(payload: { name: string; email: string }): Promise<APIResponse> {
    return await this.request.post('/users', { data: payload });
  }

  async updateUser(id: number, payload: object): Promise<APIResponse> {
    return await this.request.put(`/users/${id}`, { data: payload });
  }

  async deleteUser(id: number): Promise<APIResponse> {
    return await this.request.delete(`/users/${id}`);
  }

  // ── POSTS ───────────────────────────────────────────────

  /**
   * `params` builds the query string safely — it URL-encodes values for you.
   * This produces: /posts?userId=1
   *
   * Never concatenate query strings by hand; special characters will break it.
   */
  async getPostsByUser(userId: number): Promise<APIResponse> {
    return await this.request.get('/posts', { params: { userId } });
  }

  // ── HELPERS ─────────────────────────────────────────────

  /**
   * Fetch and parse in one call, with a status guard.
   *
   * Why a guard? If the call fails, .json() may throw a cryptic parse error
   * on an HTML error page. This surfaces the real status instead.
   *
   * <T = any> is a generic — callers can specify the expected return type:
   *   const user = await client.getJson<User>('/users/2');
   */
  async getJson<T = any>(path: string): Promise<T> {
    const response = await this.request.get(path);

    if (!response.ok()) {
      throw new Error(`GET ${path} failed with ${response.status()}`);
    }

    return await response.json();
  }

  /**
   * Fetch, guard the status, and validate against a schema in one call.
   *
   * ZodSchema<T> means "a schema that produces type T",
   * so the return value is fully typed for the caller.
   */
  async getValidated<T>(path: string, schema: import('zod').ZodSchema<T>): Promise<T> {
    const response = await this.request.get(path);

    if (!response.ok()) {
      throw new Error(`GET ${path} failed with ${response.status()}`);
    }

    const body = await response.json();

    // .parse() throws a detailed error naming the exact failing field.
    // Use .safeParse() instead when you want a result object, not a throw.
    return schema.parse(body);
  }
}