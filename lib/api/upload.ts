/**
 * File upload utility for Westbridge ERP.
 *
 * Separated from the main API client (lib/api/client.ts) to avoid conflicts
 * with concurrent changes. Handles multipart file uploads with CSRF tokens.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── CSRF token (duplicated from client.ts to stay independent) ──────────────

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

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UploadOptions {
  /** The file to upload */
  file: File;
  /** Doctype to attach the file to (optional) */
  doctype?: string;
  /** Document name to attach the file to (optional) */
  docname?: string;
  /** Whether the file should be private (default: true) */
  isPrivate?: boolean;
  /** Progress callback: receives a value between 0 and 1 */
  onProgress?: (progress: number) => void;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface UploadResult {
  file_url: string | null;
  file_name: string;
}

// ─── Upload function ─────────────────────────────────────────────────────────

/**
 * Upload a file to the ERP backend via `/api/erp/upload`.
 * Handles CSRF token injection and supports progress tracking via XMLHttpRequest.
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { file, doctype, docname, isPrivate = true, onProgress, signal } = options;

  const csrfToken = await getCsrfToken();

  const formData = new FormData();
  formData.append("file", file, file.name);
  if (doctype) formData.append("doctype", doctype);
  if (docname) formData.append("docname", docname);
  formData.append("is_private", isPrivate ? "1" : "0");

  // Use XMLHttpRequest for progress tracking when a callback is provided
  if (onProgress) {
    return new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/api/erp/upload`);
      xhr.withCredentials = true;
      xhr.setRequestHeader("X-CSRF-Token", csrfToken);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded / e.total);
        }
      });

      xhr.addEventListener("load", () => {
        try {
          const body = JSON.parse(xhr.responseText) as {
            data?: UploadResult;
            error?: { message?: string };
          };
          if (xhr.status >= 200 && xhr.status < 300 && body.data) {
            resolve(body.data);
          } else {
            reject(new Error(body.error?.message ?? `Upload failed (HTTP ${xhr.status})`));
          }
        } catch {
          reject(new Error("Failed to parse upload response"));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
      xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled")));

      if (signal) {
        signal.addEventListener("abort", () => xhr.abort(), { once: true });
      }

      xhr.send(formData);
    });
  }

  // Simple fetch path (no progress tracking)
  const res = await fetch(`${API_BASE}/api/erp/upload`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": csrfToken },
    body: formData,
    signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { error?: { message?: string } })?.error?.message ?? `Upload failed (HTTP ${res.status})`;
    throw new Error(message);
  }

  const body = (await res.json()) as { data?: UploadResult };
  if (!body.data) throw new Error("Invalid upload response");
  return body.data;
}
