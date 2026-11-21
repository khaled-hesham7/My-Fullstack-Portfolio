/**
 * Global utility functions for the Devfolio portfolio frontend.
 * Centralizes image URL resolution and API base URL helpers.
 */

/**
 * Returns the base server URL (without /api) for resolving media assets.
 * Strips the trailing "/api" segment from NEXT_PUBLIC_API_URL so we get
 * the root domain where Laravel serves storage/media files.
 *
 * Examples:
 *   "http://127.0.0.1:8000/api" → "http://127.0.0.1:8000"
 *   "http://127.0.0.1:8000"     → "http://127.0.0.1:8000"
 */
export function getBaseServerUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  return raw.replace(/\/api\/?$/, "");
}

/**
 * Returns the API base URL for making fetch requests.
 * Ensures the URL ends with "/api".
 *
 * Examples:
 *   "http://127.0.0.1:8000/api" → "http://127.0.0.1:8000/api"
 *   "http://127.0.0.1:8000"     → "http://127.0.0.1:8000/api"
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

/**
 * Determines if a client-side fetch should be attempted.
 * In a deployed/production environment (e.g. Vercel), fetching from a localhost/127.0.0.1
 * URL will trigger net::ERR_CONNECTION_REFUSED browser console errors.
 * This helper avoids firing doomed local requests when running on a live domain.
 */
export function isClientFetchAllowed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (!isLocalHost) {
    if (!raw || raw.includes("localhost") || raw.includes("127.0.0.1")) {
      return false;
    }
  }
  return true;
}

/**
 * Resolves image/media URLs returned by the Laravel backend (Spatie Media Library)
 * into fully-qualified, browser-safe absolute URLs.
 *
 * Handles the following edge cases:
 *  - `null`/`undefined`/empty → returns the provided fallback or a default avatar
 *  - `blob:` URLs (local file preview from <input type="file">) → passthrough
 *  - Absolute URLs with wrong localhost port (e.g. `http://localhost/storage/...`
 *    without :8000) → rewrites to the correct base
 *  - Fully qualified `http(s)://` URLs → passthrough
 *  - Relative paths (e.g. `/storage/media/1/avatar.jpg`) → prepends base server URL
 *
 * @param src       The raw image URL from the API response
 * @param fallback  Optional fallback image path (defaults to "/khalid.jpeg")
 */
export function resolveImageUrl(
  src: string | null | undefined,
  fallback: string = "/khalid.jpeg"
): string {
  if (!src) return fallback;

  // Local blob preview from file input — use as-is
  if (src.startsWith("blob:")) return src;

  const baseUrl = getBaseServerUrl();

  // Fix Spatie Media Library generating http://localhost/ (port 80) URLs
  // when APP_URL isn't set correctly in Laravel .env
  if (
    src.startsWith("http://localhost/") &&
    !src.includes("localhost:8000") &&
    !src.includes("localhost:3000")
  ) {
    return src.replace("http://localhost", baseUrl);
  }

  // Same fix for http://127.0.0.1/ without port
  if (
    src.startsWith("http://127.0.0.1/") &&
    !src.includes("127.0.0.1:8000")
  ) {
    return src.replace("http://127.0.0.1", baseUrl);
  }

  // Already a fully-qualified URL — use as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Relative path — prepend the base server URL
  return `${baseUrl}${src.startsWith("/") ? "" : "/"}${src}`;
}
