import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

const verifyIPNMock = vi.fn();
const isPaymentSuccessMock = vi.fn();
const markAccountPaidMock = vi.fn();
const findUniqueMock = vi.fn();

vi.mock("@/lib/services/billing.service", () => ({
  verifyIPN: (p: unknown) => verifyIPNMock(p),
  isPaymentSuccess: (p: unknown) => isPaymentSuccessMock(p),
  markAccountPaid: (...args: unknown[]) => markAccountPaidMock(...args),
}));

// Route uses checkTieredRateLimit from rate-limit-tiers (not @/lib/ratelimit)
vi.mock("@/lib/api/rate-limit-tiers", () => ({
  checkTieredRateLimit: () => Promise.resolve({ allowed: true }),
  getClientIdentifier: () => "ip",
  rateLimitHeaders: () => ({}),
}));

vi.mock("@/lib/services/audit.service", () => ({
  logAudit: vi.fn(),
  auditContext: () => ({ ipAddress: "127.0.0.1", userAgent: "test" }),
}));

// Route (defense-in-depth) validates accountId exists in DB before activating
vi.mock("@/lib/data/prisma", () => ({
  prisma: { account: { findUnique: (...args: unknown[]) => findUniqueMock(...args) } },
}));

// Route uses Redis for idempotency keys; skip by returning null (no Redis configured)
vi.mock("@/lib/redis", () => ({ getRedis: () => null }));

vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

describe("POST /api/webhooks/2checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyIPNMock.mockReturnValue(true);
    isPaymentSuccessMock.mockReturnValue(true);
    markAccountPaidMock.mockResolvedValue({ ok: true });
    // Return a pending account so the defense-in-depth check passes
    findUniqueMock.mockResolvedValue({ id: "acc-1", status: "pending" });
  });

  it("returns 401 when signature invalid", async () => {
    verifyIPNMock.mockReturnValue(false);
    const request = new Request("http://localhost/api/webhooks/2checkout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ REFNO: "1" }).toString(),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 200 OK when payment success and markAccountPaid succeeds", async () => {
    const request = new Request("http://localhost/api/webhooks/2checkout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        MERCHANT_ORDER_ID: "acc-1",
        ORDERNO: "ord-1",
      }).toString(),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
  });
});
