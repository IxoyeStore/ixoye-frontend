import { describe, it, expect } from "vitest";
import {
  detectNewOrders,
  getOrderHref,
  getLatestTimestamp,
  type NotificationOrder,
} from "../lib/order-notifications-utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function order(
  id: number,
  createdAt: string,
  extra: Partial<NotificationOrder> = {}
): NotificationOrder {
  return { id, createdAt, ...extra };
}

const BASE = new Date("2025-01-01T10:00:00Z").getTime(); // 1735725600000

// ── detectNewOrders ───────────────────────────────────────────────────────────

describe("detectNewOrders", () => {
  it("returns orders created strictly after the base timestamp", () => {
    const orders = [
      order(1, "2025-01-01T10:00:01Z"), // 1 s after → new
      order(2, "2025-01-01T10:00:00Z"), // exactly at base → NOT new
      order(3, "2025-01-01T09:59:59Z"), // before → NOT new
    ];
    const result = detectNewOrders(orders, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("returns all orders when baseTimestamp is 0", () => {
    const orders = [order(1, "2025-01-01T10:00:00Z"), order(2, "2025-01-01T11:00:00Z")];
    const result = detectNewOrders(orders, 0);
    expect(result).toHaveLength(2);
  });

  it("returns empty array when all orders are older than base", () => {
    const orders = [
      order(1, "2024-12-31T23:59:59Z"),
      order(2, "2024-12-01T00:00:00Z"),
    ];
    const result = detectNewOrders(orders, BASE);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when input list is empty", () => {
    expect(detectNewOrders([], BASE)).toHaveLength(0);
  });

  it("skips orders without a createdAt field", () => {
    const orders: NotificationOrder[] = [{ id: 1 }, { id: 2, createdAt: "2025-01-01T11:00:00Z" }];
    const result = detectNewOrders(orders, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("returns multiple new orders preserving original order", () => {
    const orders = [
      order(3, "2025-01-01T12:00:00Z"),
      order(2, "2025-01-01T11:00:00Z"),
      order(1, "2025-01-01T09:00:00Z"), // older
    ];
    const result = detectNewOrders(orders, BASE);
    expect(result.map((o) => o.id)).toEqual([3, 2]);
  });
});

// ── getOrderHref ──────────────────────────────────────────────────────────────

describe("getOrderHref", () => {
  it("uses documentId when available", () => {
    expect(getOrderHref({ id: 5, documentId: "abc123xyz" })).toBe(
      "/admin/orders/abc123xyz"
    );
  });

  it("falls back to numeric id when documentId is missing", () => {
    expect(getOrderHref({ id: 42 })).toBe("/admin/orders/42");
  });

  it("prefers documentId over numeric id when both are present", () => {
    const href = getOrderHref({ id: 7, documentId: "doc-99" });
    expect(href).toContain("doc-99");
    expect(href).not.toContain("7");
  });

  it("produces a path starting with /admin/orders/", () => {
    expect(getOrderHref({ id: 1, documentId: "xyz" })).toMatch(/^\/admin\/orders\//);
    expect(getOrderHref({ id: 1 })).toMatch(/^\/admin\/orders\//);
  });
});

// ── getLatestTimestamp ────────────────────────────────────────────────────────

describe("getLatestTimestamp", () => {
  it("returns 0 for an empty list", () => {
    expect(getLatestTimestamp([])).toBe(0);
  });

  it("returns the timestamp of the single order", () => {
    const ts = new Date("2025-06-15T08:00:00Z").getTime();
    expect(getLatestTimestamp([order(1, "2025-06-15T08:00:00Z")])).toBe(ts);
  });

  it("returns the maximum timestamp across multiple orders", () => {
    const orders = [
      order(1, "2025-01-01T10:00:00Z"),
      order(2, "2025-01-01T12:00:00Z"), // latest
      order(3, "2025-01-01T09:00:00Z"),
    ];
    const expected = new Date("2025-01-01T12:00:00Z").getTime();
    expect(getLatestTimestamp(orders)).toBe(expected);
  });

  it("ignores orders without createdAt when others are present", () => {
    const orders: NotificationOrder[] = [
      { id: 1 },
      order(2, "2025-03-01T00:00:00Z"),
    ];
    const expected = new Date("2025-03-01T00:00:00Z").getTime();
    expect(getLatestTimestamp(orders)).toBe(expected);
  });
});
