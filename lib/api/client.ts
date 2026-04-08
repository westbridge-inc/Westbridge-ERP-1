/**
 * Typed API client for all Westbridge endpoints.
 * Used with React Query for data fetching in dashboard components.
 *
 * @example
 * const { data } = useQuery({ queryKey: ['invoices', filters], queryFn: () => api.erp.list('Sales Invoice', filters) });
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Strip internal infrastructure names from error messages shown to users. */
// Removes references to underlying infrastructure names so users only see Westbridge branding.
function sanitizeError(msg: string): string {
  let cleaned = msg
    .replace(/ERPNext\s*/gi, "")
    .replace(/Frappe\s*/gi, "")
    .replace(/Service error\s*/gi, "");
  // "403: FORBIDDEN" → "Access denied"
  cleaned = cleaned.replace(
    /403:\s*FORBIDDEN/i,
    "You may not have permission for this resource. Please check your plan or contact support.",
  );
  // "404: NOT FOUND" → friendly message
  cleaned = cleaned.replace(/404:\s*NOT FOUND/i, "This resource could not be found");
  // "502: BAD GATEWAY" → service unavailable
  cleaned = cleaned.replace(/502:\s*BAD GATEWAY/i, "Service temporarily unavailable. Please try again shortly");
  return cleaned.trim() || "An unexpected error occurred. Please try again.";
}

/**
 * Fetch a CSRF token from the backend before performing a mutation.
 * Caches the token for 5 minutes to avoid redundant round-trips.
 */
let csrfTokenCache: { token: string; expiresAt: number } | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache && Date.now() < csrfTokenCache.expiresAt) {
    return csrfTokenCache.token;
  }
  const res = await fetch(`${API_BASE}/api/csrf`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch CSRF token");
  const body = (await res.json()) as { data?: { csrfToken?: string } };
  const token = body.data?.csrfToken ?? "";
  csrfTokenCache = { token, expiresAt: Date.now() + 5 * 60 * 1000 };
  return token;
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() ?? "GET";
  const extraHeaders: Record<string, string> = {};

  // Attach CSRF token on all mutation requests
  if (MUTATION_METHODS.has(method)) {
    extraHeaders["X-CSRF-Token"] = await getCsrfToken();
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(sanitizeError(message));
  }
  const body = await res.json();
  return (body as { data: T }).data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}
export interface LoginResult {
  userId: string;
  accountId: string;
  role: string;
}

async function login(input: LoginInput): Promise<LoginResult> {
  return request<LoginResult>("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
}

async function logout(): Promise<void> {
  await request<void>("/api/auth/logout", { method: "POST" });
}

async function forgotPassword(email: string): Promise<void> {
  await request<void>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

async function resetPassword(token: string, password: string): Promise<void> {
  await request<void>("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
}

// ─── ERP ─────────────────────────────────────────────────────────────────────

export interface ErpListParams {
  limit?: number;
  offset?: number;
  page?: number;
  orderBy?: string;
  filters?: Record<string, unknown>[];
  fields?: string[];
}

export interface ErpListResponse {
  data: unknown[];
  meta: { page: number; pageSize: number; hasMore: boolean };
}

async function erpList(doctype: string, params?: ErpListParams): Promise<ErpListResponse> {
  const qs = new URLSearchParams({ doctype });
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.page != null) qs.set("page", String(params.page));
  if (params?.orderBy) qs.set("order_by", params.orderBy);
  if (params?.filters) qs.set("filters", JSON.stringify(params.filters));
  if (params?.fields) qs.set("fields", JSON.stringify(params.fields));
  const res = await fetch(`${API_BASE}/api/erp/list?${qs.toString()}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    // Treat 404 (no records), 502 (backend service unreachable), and 503 as empty data
    // rather than showing an error — the user just has no records yet.
    if (res.status === 404 || res.status === 502 || res.status === 503) {
      return {
        data: [],
        meta: { page: params?.page ?? 0, pageSize: 20, hasMore: false },
      };
    }
    const body = await res.json().catch(() => ({}));
    const message = (body as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(sanitizeError(message));
  }
  const body = (await res.json()) as { data: unknown[]; meta: { page: number; pageSize: number; hasMore: boolean } };
  return { data: body.data ?? [], meta: body.meta ?? { page: 0, pageSize: 20, hasMore: false } };
}

async function erpGet(doctype: string, name: string): Promise<unknown> {
  return request<unknown>(`/api/erp/doc?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`);
}

async function erpCreate(doctype: string, data: Record<string, unknown>): Promise<unknown> {
  return request<unknown>("/api/erp/doc", { method: "POST", body: JSON.stringify({ doctype, data }) });
}

async function erpUpdate(doctype: string, name: string, data: Record<string, unknown>): Promise<unknown> {
  return request<unknown>("/api/erp/doc", {
    method: "PUT",
    body: JSON.stringify({ doctype, name, data }),
  });
}

async function erpDelete(doctype: string, name: string): Promise<void> {
  await request<void>(`/api/erp/doc?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

export interface ErpBatchResult {
  created: number;
  failed: number;
  errors: string[];
}

async function erpBatch(doctype: string, items: Record<string, unknown>[]): Promise<ErpBatchResult> {
  return request<ErpBatchResult>("/api/erp/batch", {
    method: "POST",
    body: JSON.stringify({ doctype, items }),
  });
}

// ─── Account / Profile ────────────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  accountId: string;
  role: string;
  email: string;
  name: string;
}

async function getSession(): Promise<UserProfile> {
  return request<UserProfile>("/api/auth/validate");
}

async function getProfile(): Promise<UserProfile> {
  return request<UserProfile>("/api/account/profile");
}

async function updateProfile(data: {
  name?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  currency?: string;
}): Promise<void> {
  await request<void>("/api/account/profile", { method: "PATCH", body: JSON.stringify(data) });
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: string;
  status: string;
}

export interface BillingData {
  items: BillingHistoryItem[];
  plan: string | null;
  accountCreatedAt: string | null;
  trialEndsAt: string | null;
}

async function getBillingHistory(): Promise<BillingData> {
  return request<BillingData>("/api/billing/history");
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  isYou: boolean;
}

async function getTeam(): Promise<{ members: TeamMember[] }> {
  return request<{ members: TeamMember[] }>("/api/team");
}

async function removeMember(userId: string): Promise<void> {
  await request<void>(`/api/team/${userId}`, { method: "DELETE" });
}

async function updateMemberRole(userId: string, role: string): Promise<void> {
  await request<void>(`/api/team/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
}

export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

async function getPendingInvites(): Promise<{ invites: PendingInvite[] }> {
  return request<{ invites: PendingInvite[] }>("/api/team/invites");
}

async function resendInvite(inviteId: string): Promise<void> {
  await request<void>(`/api/team/invites/${inviteId}/resend`, { method: "POST" });
}

// ─── Security / 2FA ──────────────────────────────────────────────────────────

export interface TotpSetupResult {
  secret: string;
  otpauthUri: string;
  backupCodes: string[];
  qrHint: string;
}

async function setup2FA(): Promise<TotpSetupResult> {
  return request<TotpSetupResult>("/api/auth/2fa/setup", { method: "POST" });
}

async function verify2FA(code: string): Promise<{ enabled: boolean }> {
  return request<{ enabled: boolean }>("/api/auth/2fa/verify", { method: "POST", body: JSON.stringify({ code }) });
}

async function disable2FA(): Promise<void> {
  await request<void>("/api/auth/2fa/disable", { method: "POST" });
}

async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await request<void>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ─── Invite ───────────────────────────────────────────────────────────────────

async function sendInvite(email: string, role: string): Promise<void> {
  await request<void>("/api/invite", { method: "POST", body: JSON.stringify({ email, role }) });
}

async function validateInvite(token: string): Promise<{ email: string; role: string; companyName: string }> {
  return request(`/api/invite?token=${encodeURIComponent(token)}`);
}

async function acceptInvite(token: string, name: string, password: string): Promise<void> {
  await request<void>("/api/invite/accept", { method: "POST", body: JSON.stringify({ token, name, password }) });
}

// ─── Settings / Notifications ─────────────────────────────────────────────────

export interface NotificationPrefs {
  emailInvoices: boolean;
  emailReports: boolean;
  emailSecurityAlerts: boolean;
  emailProductUpdates: boolean;
}

async function getNotificationPrefs(): Promise<NotificationPrefs> {
  return request<NotificationPrefs>("/api/settings/notifications");
}

async function updateNotificationPrefs(prefs: Partial<NotificationPrefs>): Promise<{ updated: boolean }> {
  return request<{ updated: boolean }>("/api/settings/notifications", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}

// ─── Settings / API Keys ──────────────────────────────────────────────────────

export interface ApiKeyEntry {
  id: string;
  prefix: string;
  label: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreateResult {
  key: string;
  prefix: string;
  expiresAt: string | null;
  label: string;
  warning: string;
}

async function getApiKeys(): Promise<{ keys: ApiKeyEntry[] }> {
  return request<{ keys: ApiKeyEntry[] }>("/api/settings/api-keys");
}

async function createApiKey(label: string): Promise<ApiKeyCreateResult> {
  return request<ApiKeyCreateResult>("/api/settings/api-keys", {
    method: "POST",
    body: JSON.stringify({ label }),
  });
}

async function deleteApiKey(id: string): Promise<void> {
  await request<void>(`/api/settings/api-keys/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ─── Billing (extended) ───────────────────────────────────────────────────────

export interface SubscriptionData {
  planId: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
}

/**
 * Backend returns `{ subscription: null | { id, planId, status, ... } }`.
 * We flatten it here so callers can read `status`, `planId`, and
 * `currentPeriodEnd` directly without having to know the envelope shape.
 */
async function getSubscription(): Promise<SubscriptionData> {
  const wrapper = await request<{
    subscription: {
      id: string;
      planId: string;
      status: string;
      currentPeriodStart?: string | null;
      currentPeriodEnd?: string | null;
    } | null;
  }>("/api/billing/subscription");
  const sub = wrapper?.subscription ?? null;
  return {
    planId: sub?.planId ?? null,
    status: sub?.status ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
  };
}

async function changePlan(planId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/billing/change-plan", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

async function cancelSubscription(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/billing/cancel", { method: "POST" });
}

// ─── ERP PDF ──────────────────────────────────────────────────────────────────

async function erpDownloadPdf(doctype: string, name: string): Promise<Blob> {
  const res = await fetch(
    `${API_BASE}/api/erp/doc/pdf?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(sanitizeError(message));
  }
  return res.blob();
}

// ─── Portal ──────────────────────────────────────────────────────────────────

export interface PortalInviteResult {
  tokenId: string;
  portalUrl: string;
}

async function portalInvite(customerName: string, customerEmail: string): Promise<PortalInviteResult> {
  return request<PortalInviteResult>("/api/portal/invite", {
    method: "POST",
    body: JSON.stringify({ customerName, customerEmail }),
  });
}

// ─── Client export ────────────────────────────────────────────────────────────

export const api = {
  auth: { login, logout, forgotPassword, resetPassword, getSession, changePassword, setup2FA, verify2FA, disable2FA },
  account: { getProfile, updateProfile },
  billing: { getHistory: getBillingHistory, getSubscription, changePlan, cancel: cancelSubscription },
  team: {
    get: getTeam,
    remove: removeMember,
    updateRole: updateMemberRole,
    pendingInvites: getPendingInvites,
    resendInvite,
  },
  erp: {
    list: erpList,
    get: erpGet,
    create: erpCreate,
    update: erpUpdate,
    delete: erpDelete,
    batch: erpBatch,
    downloadPdf: erpDownloadPdf,
  },
  invite: { send: sendInvite, validate: validateInvite, accept: acceptInvite },
  portal: { invite: portalInvite },
  settings: {
    notifications: { get: getNotificationPrefs, update: updateNotificationPrefs },
    apiKeys: { list: getApiKeys, create: createApiKey, delete: deleteApiKey },
  },
} as const;
