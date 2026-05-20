const ENC = new TextEncoder();

function bytesToBase64url(bytes: Uint8Array): string {
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlToBytes(str: string): Uint8Array {
  const padded = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + (4 - (str.length % 4)) % 4, "=");
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    ENC.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * Creates a signed session token: "<role>.<HMAC-SHA256 signature>"
 * The signature covers the role value — any tampering is detectable.
 */
export async function createSignedSession(role: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET env var is not set");
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, ENC.encode(role));
  return `${role}.${bytesToBase64url(new Uint8Array(sig))}`;
}

/**
 * Verifies a signed session token and returns the role, or null if invalid.
 */
export async function verifySignedSession(token: string): Promise<string | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const role = token.slice(0, dot);
  try {
    const sig = base64urlToBytes(token.slice(dot + 1));
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify("HMAC", key, sig as BufferSource, ENC.encode(role));
    return valid ? role : null;
  } catch {
    return null;
  }
}
