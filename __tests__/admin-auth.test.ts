import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock next/headers ─────────────────────────────────────────────────────────
const mockGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: mockGet })),
}));

import { getAdminJwt } from "../lib/admin-auth";

// ── Helper: mock a Strapi /api/users/me response ──────────────────────────────
function mockFetch(ok: boolean, body: object) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(body),
    })
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("getAdminJwt", () => {
  beforeEach(() => {
    mockGet.mockReset();
    vi.unstubAllGlobals();
    process.env.NEXT_PUBLIC_API_URL = "http://strapi.test";
  });

  it("returns null when jwt cookie is missing", async () => {
    mockGet.mockReturnValue(undefined);
    const result = await getAdminJwt();
    expect(result).toBeNull();
  });

  it("returns null when Strapi returns a non-ok response", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockFetch(false, { error: "Unauthorized" });
    const result = await getAdminJwt();
    expect(result).toBeNull();
  });

  it("returns null when user role is not Admin", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockFetch(true, { id: 1, role: { name: "Authenticated" } });
    const result = await getAdminJwt();
    expect(result).toBeNull();
  });

  it("returns null when role field is missing entirely", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockFetch(true, { id: 1 });
    const result = await getAdminJwt();
    expect(result).toBeNull();
  });

  it("returns null when role name is a case variation (e.g. 'admin')", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockFetch(true, { id: 1, role: { name: "admin" } });
    const result = await getAdminJwt();
    expect(result).toBeNull();
  });

  it("returns the jwt string when user role is Admin", async () => {
    mockGet.mockReturnValue({ value: "my-secret-jwt" });
    mockFetch(true, { id: 1, role: { name: "Admin" } });
    const result = await getAdminJwt();
    expect(result).toBe("my-secret-jwt");
  });

  it("calls Strapi with the jwt as Bearer token", async () => {
    mockGet.mockReturnValue({ value: "bearer-check-token" });
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, role: { name: "Admin" } }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    await getAdminJwt();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/users/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer bearer-check-token",
        }),
      })
    );
  });

  it("requests the role to be populated in the Strapi query", async () => {
    mockGet.mockReturnValue({ value: "token" });
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, role: { name: "Admin" } }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    await getAdminJwt();
    expect(fetchSpy.mock.calls[0][0]).toContain("populate=role");
  });
});
