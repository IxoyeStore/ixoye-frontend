import { describe, it, expect, vi, beforeEach } from "vitest";

// ── vi.hoisted ensures these exist before vi.mock runs ───────────────────────
const { mockNext, mockRedirect } = vi.hoisted(() => ({
  mockNext: vi.fn(() => ({ type: "next" })),
  mockRedirect: vi.fn((url: URL) => ({ type: "redirect", url: url.toString() })),
}));

vi.mock("next/server", () => ({
  NextResponse: { next: mockNext, redirect: mockRedirect },
}));

import { middleware } from "../middleware";

// ── Helper: build a minimal NextRequest-shaped object ────────────────────────
function req(pathname: string, cookies: Record<string, string> = {}) {
  return {
    cookies: {
      get: (name: string) =>
        cookies[name] !== undefined ? { value: cookies[name] } : undefined,
    },
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
  } as any;
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Admin middleware", () => {
  beforeEach(() => {
    mockNext.mockClear();
    mockRedirect.mockClear();
  });

  // Unauthenticated → /admin
  it("redirects to /login when no jwt cookie on /admin", () => {
    middleware(req("/admin"));
    expect(mockRedirect).toHaveBeenCalledOnce();
    expect(mockRedirect.mock.calls[0][0].toString()).toContain("/login");
  });

  it("redirects to /login when no jwt cookie on /admin/products", () => {
    middleware(req("/admin/products"));
    expect(mockRedirect.mock.calls[0][0].toString()).toContain("/login");
  });

  // Authenticated but wrong role → /admin
  it("redirects to / when jwt exists but no role cookie on /admin", () => {
    middleware(req("/admin", { jwt: "token123" }));
    expect(mockRedirect).toHaveBeenCalledOnce();
    expect(mockRedirect.mock.calls[0][0].toString()).toMatch(/\/$/);
  });

  it("redirects to / when role is Authenticated (non-admin) on /admin", () => {
    middleware(req("/admin", { jwt: "token123", role: "Authenticated" }));
    expect(mockRedirect).toHaveBeenCalledOnce();
    expect(mockRedirect.mock.calls[0][0].toString()).toMatch(/\/$/);
  });

  it("redirects to / when role is some other value on /admin/orders", () => {
    middleware(req("/admin/orders", { jwt: "token123", role: "Editor" }));
    expect(mockRedirect.mock.calls[0][0].toString()).toMatch(/\/$/);
  });

  // Admin passes through
  it("calls next() for admin user on /admin", () => {
    middleware(req("/admin", { jwt: "token123", role: "Admin" }));
    expect(mockNext).toHaveBeenCalledOnce();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("calls next() for admin user on /admin/products/bulk", () => {
    middleware(req("/admin/products/bulk", { jwt: "token123", role: "Admin" }));
    expect(mockNext).toHaveBeenCalledOnce();
  });
});

describe("Profile middleware", () => {
  beforeEach(() => {
    mockNext.mockClear();
    mockRedirect.mockClear();
  });

  it("redirects to /login when no jwt on /profile", () => {
    middleware(req("/profile"));
    expect(mockRedirect.mock.calls[0][0].toString()).toContain("/login");
  });

  it("calls next() for authenticated user on /profile", () => {
    middleware(req("/profile", { jwt: "token123" }));
    expect(mockNext).toHaveBeenCalledOnce();
  });
});

describe("Auth page middleware", () => {
  beforeEach(() => {
    mockNext.mockClear();
    mockRedirect.mockClear();
  });

  it("redirects to /profile when authenticated user visits /login", () => {
    middleware(req("/login", { jwt: "token123" }));
    expect(mockRedirect.mock.calls[0][0].toString()).toContain("/profile");
  });

  it("redirects to /profile when authenticated user visits /register", () => {
    middleware(req("/register", { jwt: "token123" }));
    expect(mockRedirect.mock.calls[0][0].toString()).toContain("/profile");
  });

  it("calls next() for unauthenticated user on /login", () => {
    middleware(req("/login"));
    expect(mockNext).toHaveBeenCalledOnce();
  });
});

describe("Public routes", () => {
  beforeEach(() => {
    mockNext.mockClear();
    mockRedirect.mockClear();
  });

  it("calls next() for any user on /", () => {
    middleware(req("/"));
    expect(mockNext).toHaveBeenCalledOnce();
  });
});
