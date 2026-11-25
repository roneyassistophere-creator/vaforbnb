import "server-only";

/**
 * Server-side settings, read lazily so `next build` works without a database
 * or bucket. See .env.example for every variable.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.`);
  return value;
}

export function getDatabaseUrl() {
  return required("DATABASE_URL");
}

export function getStorageConfig() {
  const endpoint = required("S3_ENDPOINT");
  return {
    /** Endpoint the server talks to (inside Docker: http://storage:8333). */
    endpoint,
    /** Endpoint used in signed URLs that browsers open. Defaults to `endpoint`. */
    publicEndpoint: process.env.S3_PUBLIC_ENDPOINT || endpoint,
    region: process.env.S3_REGION || "auto",
    bucket: required("S3_BUCKET"),
    accessKeyId: required("S3_ACCESS_KEY_ID"),
    secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "true") !== "false",
    /** Optional public base URL (R2 public bucket or custom domain). */
    publicUrl: process.env.S3_PUBLIC_URL?.replace(/\/+$/, "") || null,
  };
}
