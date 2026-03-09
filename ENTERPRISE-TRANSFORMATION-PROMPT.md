# Westbridge Core — Enterprise-Grade Transformation Prompt

> Authored after full codebase audit. Execute every section sequentially.
> Goal: production-ready, billion-dollar-caliber codebase as built by principal engineers at Microsoft/Google.

---

## SECTION 1 — Critical Security Fixes

### 1.1 — Fix hex validation in lib/encryption.ts (line 11-12, 18-19)
`Buffer.from(secret, "hex")` silently truncates non-hex characters, meaning
a key like `"zzzz...zzzz"` (64 chars) produces a 0-byte buffer that passes the
length check but fails silently. Add strict regex validation BEFORE the Buffer.from call.

```diff
-  if (!secret || secret.length < 64) throw new Error("ENCRYPTION_KEY must be a 64 valid hex characters (32 bytes)");
-  const key = Buffer.from(secret, "hex");
+  if (!secret || !/^[0-9a-fA-F]{64}$/.test(secret))
+    throw new Error("ENCRYPTION_KEY must be exactly 64 hex characters (0-9, a-f)");
+  const key = Buffer.from(secret, "hex");
   if (key.length !== 32) throw new Error("...");
```
Apply same fix to `getKeyFromHex()`.

### 1.2 — Fix IPv6 regex too-lenient (lib/services/session.service.ts line 31)
`/^[0-9a-fA-F:]+$/` accepts `"::::::::::::::::::::"` as valid.
Replace with a stricter check that uses Node's built-in `net.isIP()`:

```typescript
import { isIP } from "net";
function isValidIp(ip: string): boolean {
  return isIP(ip) !== 0;
}
```

### 1.3 — Fix status code inconsistency in login route (app/api/auth/login/route.ts line 140-143)
Line 140 returns HTTP 403 Forbidden for a log call but line 143 returns HTTP 401.
The mismatch is: `log(403)` then `{ status: 401 }`. This creates a confusing access log.
Fix: change `log(403)` to `log(401)` so the logged status matches the response status.

### 1.4 — Fix missing CSRF audit log on signup failure (app/api/signup/route.ts)
When CSRF validation fails on signup, the failure is silently returned with no
audit log entry. Add an audit log call matching the pattern used in other endpoints:

```typescript
if (!validateCsrf(csrfHeader, csrfCookie)) {
  void logAudit({ ..., action: "auth.signup.csrf_failure", severity: "warn", outcome: "failure" });
  return NextResponse.json(apiError("FORBIDDEN", ...), { status: 403 });
}
```

### 1.5 — Fix AI module context not validated at runtime (app/api/ai/chat/route.ts)
TypeScript type assertions do not exist at runtime. Replace the cast with an
explicit allowlist check:

```typescript
const VALID_MODULES = ["invoices", "crm", "hr", "inventory", "accounting", "procurement"] as const;
const moduleContext = typeof rawModule === "string" && VALID_MODULES.includes(rawModule as AiModule)
  ? (rawModule as AiModule)
  : undefined;
```

### 1.6 — Add missing audit log for session revocation (lib/services/session.service.ts)
`revokeSession()` deletes sessions from DB and cache but logs nothing. Add an
optional `{ userId, accountId, reason }` parameter and emit a `"auth.session.revoked"`
audit log entry when those values are provided.

---

## SECTION 2 — High Priority Reliability Fixes

### 2.1 — Fix silent Redis errors becoming invisible failures
Multiple places use `.catch(() => {})` which swallows errors completely.
For every occurrence of this pattern in the codebase, replace it with:

```typescript
.catch((e) => logger.error("Redis operation failed", { error: e?.message, context: "..." }))
```

Key locations:
- `lib/services/session.service.ts` lines ~100-102, ~130, ~184-185, ~191, ~208
- `lib/webhooks/delivery.ts` Redis pipeline calls
- `lib/jobs/queue.ts` pipeline exec

### 2.2 — Fix unbounded ERP sync cache growth (lib/jobs/workers.ts lines 80-81)
The ERP sync worker writes `erp:doc:*` cache keys with a 5-minute TTL but
the hash key `erp:doc:*:hash` with the same TTL creates 2 keys per document.
With thousands of accounts × thousands of documents × 5 workers this can
exhaust Redis memory. Fix: use a single Redis hash field `HSET erp:doc:{accountId}:{doctype}`
per account/doctype combination, or reduce TTL to 60 seconds for high-volume doctypes.

### 2.3 — Add upper-bound validation on ERP pagination (app/api/erp/list/route.ts)
The current validation allows `pageNum >= 0` with no upper bound. Add:

```typescript
const MAX_PAGE = 10_000;
if (pageNum > MAX_PAGE) return NextResponse.json(apiError("VALIDATION_ERROR", `Page must be ≤ ${MAX_PAGE}`), { status: 400 });
```

### 2.4 — Fix audit log fire-and-forget with no error fallback
All `void logAudit(...)` calls in login/logout/signup routes silently swallow
failures. Implement a lightweight retry wrapper:

```typescript
async function safeLogAudit(entry: AuditEntry): Promise<void> {
  try {
    await logAudit(entry);
  } catch (e) {
    logger.error("Audit log failed — emitting metric", { error: e?.message });
    metrics.increment("audit.log.failure");
  }
}
```
Replace all `void logAudit(...)` calls with `void safeLogAudit(...)`.

### 2.5 — Fix webhook circuit breaker race condition (lib/webhooks/delivery.ts)
The circuit breaker check and increment are two separate DB writes. Under
concurrent failures, multiple workers can trip past the threshold before the
`disabledAt` update lands. Fix with a single atomic `UPDATE ... WHERE consecutiveFailures < threshold`:

```typescript
await prisma.webhookEndpoint.updateMany({
  where: { id: endpointId, disabledAt: null },
  data: {
    consecutiveFailures: { increment: 1 },
    ...(shouldDisable ? { disabledAt: new Date() } : {}),
  },
});
```

### 2.6 — Fix reports worker hardcoded 500-document limit (lib/jobs/workers.ts ~line 141)
Replace `limit_page_length: "500"` with a paginated loop:

```typescript
let allDocs: unknown[] = [];
let page = 0;
const PAGE_SIZE = 500;
const MAX_DOCS = 50_000;
while (allDocs.length < MAX_DOCS) {
  const result = await erpList(doctype, erpnextSessionId, PAGE_SIZE, page * PAGE_SIZE, fields);
  if (!result.ok || result.data.length === 0) break;
  allDocs = allDocs.concat(result.data);
  if (result.data.length < PAGE_SIZE) break;
  page++;
}
if (allDocs.length >= MAX_DOCS) logger.warn("Report truncated at MAX_DOCS limit", { reportType, accountId });
```

---

## SECTION 3 — Architecture & Code Quality Improvements

### 3.1 — Consolidate ALLOWED_DOCTYPES to a single source of truth
`app/api/erp/list/route.ts` and `app/api/erp/doc/route.ts` both define their
own `ALLOWED_DOCTYPES` arrays. Extract to `lib/erp-constants.ts`:

```typescript
// lib/erp-constants.ts
export const ALLOWED_DOCTYPES = [
  "Sales Invoice", "Sales Order", "Purchase Order", "Purchase Invoice",
  "Expense Claim", "Item", "Customer", "Supplier", "Employee",
  "Salary Slip", "Journal Entry", "Payment Entry", "Quotation",
  "Delivery Note", "Stock Entry",
] as const;
export type AllowedDoctype = typeof ALLOWED_DOCTYPES[number];
```
Update both route files to import from here.

### 3.2 — Extract security constants to lib/constants.ts
The following magic numbers are scattered across files and must be centralized:
- `SESSION_EXPIRY_DAYS = 7` (session.service.ts:15)
- `IDLE_TIMEOUT_MINUTES = 30` (session.service.ts:16)
- `MAX_CONCURRENT_SESSIONS = 5` (session.service.ts:17)
- `SESSION_CACHE_TTL_SEC = 5` (session.service.ts:18)
- `CIRCUIT_BREAKER_THRESHOLD = 10` (webhooks/delivery.ts:50)
- `MAX_BODY_BYTES = 1_048_576` (login route:17)

Add them to `lib/constants.ts` under a `SECURITY` namespace and import in each file.

### 3.3 — Add missing `safeLogAudit` helper to lib/services/audit.service.ts
See Section 2.4 above. Add the exported helper function there so all routes share it.

### 3.4 — Implement idempotency keys for ERP document creation (app/api/erp/doc/route.ts POST)
Add a header `Idempotency-Key` check before creating documents. Cache the
response for 24 hours keyed by `{accountId}:{idempotency_key}` in Redis.
Return cached response immediately on duplicate request.

### 3.5 — Add queue depth check before enqueueEmail (lib/jobs/queue.ts)
Before adding to the email queue, check the waiting count:

```typescript
export async function enqueueEmail(data: EmailJobData): Promise<void> {
  const waiting = await emailQueue.getWaitingCount();
  if (waiting > 10_000) {
    logger.error("Email queue depth exceeded", { waiting });
    throw new Error("Email service temporarily unavailable — queue full");
  }
  await emailQueue.add("send", data, { attempts: 3, backoff: { type: "exponential", delay: 2000 } });
}
```

### 3.6 — Migrate all routes to createPipeline() (the TODO in lib/api/pipeline.ts:161)
The routes `erp/list`, `erp/doc`, `auth/*` all manually repeat CSRF/auth/rate-limit
boilerplate. Each route should use `createPipeline([...middleware], handler)` instead.
This eliminates ~150 lines of duplicated setup code and ensures consistent behavior.

---

## SECTION 4 — Observability & Production Hardening

### 4.1 — Add metrics for all security-critical operations
In `lib/metrics.ts` add (or verify existence of) counters for:
- `auth.login.success` / `auth.login.failure` / `auth.login.locked`
- `auth.session.created` / `auth.session.expired` / `auth.session.revoked`
- `audit.log.failure`
- `webhook.circuit_breaker.opened`
- `erp.sync.changed` / `erp.sync.unchanged`
- `rate_limit.hit.ip` / `rate_limit.hit.email`

### 4.2 — Replace all silent `.catch(() => {})` with observable failures
See Section 2.1. After this change, all Redis failures will emit a log line
and metric, making production incidents diagnosable.

### 4.3 — Add structured context to all logger calls
Every `logger.warn()` / `logger.error()` call must include a `context` field
identifying the service/function. This enables log aggregation by service in
Datadog/Grafana.

### 4.4 — Add health check assertions for Redis connectivity
The `/api/health/ready` endpoint should verify:
1. Database responds to `SELECT 1` (or Prisma equivalent)
2. Redis responds to PING
3. ERPNext base URL is reachable (optional, non-fatal)

### 4.5 — Implement Bull Board for job queue visibility
Wire up `@bull-board/api` and `@bull-board/nextjs` to `/dashboard/admin/queues`.
Gate behind `withPermission("admin.jobs.view")`. This resolves the TODO at
`lib/jobs/queue.ts:25`.

---

## SECTION 5 — Testing Gaps

### 5.1 — Add tests for lib/encryption.ts
Write a Vitest test file `lib/encryption.test.ts` covering:
- `encrypt()` produces a 3-part colon-separated ciphertext
- `decrypt(encrypt(x)) === x` round-trip
- Tampered auth tag throws `"authentication tag mismatch"`
- Invalid hex key throws proper error
- Key rotation: `ENCRYPTION_KEY_PREVIOUS` decrypts old ciphertext
- `getKey()` rejects non-hex 64-char strings (after Section 1.1 fix)

### 5.2 — Add tests for lib/services/session.service.ts
Write `lib/services/session.service.test.ts` covering:
- `createSession()` returns token, stores hash not plaintext
- `validateSession()` cache hit path (mock Redis)
- `validateSession()` expired session returns `err("Session expired")`
- `validateSession()` idle timeout returns `err("Session expired")`
- `validateSession()` fingerprint mismatch returns err
- `revokeSession()` deletes from DB and Redis

### 5.3 — Add tests for lib/webhooks/delivery.ts
Write `lib/webhooks/delivery.test.ts` covering:
- `signPayload()` produces expected HMAC
- Circuit breaker opens after CIRCUIT_BREAKER_THRESHOLD failures
- Successful delivery resets consecutive failures to 0

---

## SECTION 6 — Developer Experience

### 6.1 — Add a `CONTRIBUTING.md` section on security practices
Document:
- Never use `.catch(() => {})` — always log
- Always use `safeLogAudit()` for audit entries
- New API routes must use `createPipeline()`
- New ERP doctypes must be added to `lib/erp-constants.ts`

### 6.2 — Update docs/TECH-DEBT.md to reflect closed items
After implementing Sections 1–5, mark the following as resolved:
- TD-06 (pipeline migration) — if done
- TD-03 (audit trail gaps) — if done
- Add new entries for any deferred work

### 6.3 — Add .env.example documentation comments
For every variable in `.env.example`, add an inline comment explaining:
- What it does
- How to generate the value (e.g., `openssl rand -hex 32` for ENCRYPTION_KEY)
- Whether it's required or optional

---

## EXECUTION ORDER

Execute in this order to avoid breaking dependencies:

1. **Section 1** — all critical security fixes (no structural changes)
2. **Section 3.1** — extract ERP constants (required by Section 3.6)
3. **Section 3.2** — extract security constants (required by other sections)
4. **Section 2.4 / 3.3** — add `safeLogAudit` helper
5. **Section 2.1** — fix silent Redis errors (touches many files)
6. **Section 2.2–2.6** — remaining reliability fixes
7. **Section 3.4–3.6** — architecture improvements
8. **Section 4** — observability hardening
9. **Section 5** — test coverage
10. **Section 6** — documentation

---

*This prompt was generated by analyzing all 39 key files of the westbridge-core codebase.
Every fix is grounded in a specific file and line number identified in the audit.*
