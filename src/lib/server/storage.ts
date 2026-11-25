import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStorageConfig } from "./env";

/**
 * S3-compatible file storage: SeaweedFS locally, Cloudflare R2 live.
 * Only the endpoint and keys in .env change between the two.
 *
 * Use this for files tools create or receive. Premade downloads that ship
 * with the site belong in /public/downloads.
 */

type Clients = { server: S3Client; signer: S3Client; cfg: ReturnType<typeof getStorageConfig> };
const globalForS3 = globalThis as unknown as { s3?: Clients };

function clients(): Clients {
  if (!globalForS3.s3) {
    const cfg = getStorageConfig();
    const base = {
      region: cfg.region,
      forcePathStyle: cfg.forcePathStyle,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
      // R2 doesn't support the SDK's default CRC checksums on every operation.
      requestChecksumCalculation: "WHEN_REQUIRED" as const,
      responseChecksumValidation: "WHEN_REQUIRED" as const,
    };
    const server = new S3Client({ ...base, endpoint: cfg.endpoint });
    const signer = cfg.publicEndpoint === cfg.endpoint ? server : new S3Client({ ...base, endpoint: cfg.publicEndpoint });
    globalForS3.s3 = { server, signer, cfg };
  }
  return globalForS3.s3;
}

/** Upload a file from the server. */
export async function putFile(key: string, body: Uint8Array | Buffer | string, contentType: string) {
  const { server, cfg } = clients();
  await server.send(new PutObjectCommand({ Bucket: cfg.bucket, Key: key, Body: body, ContentType: contentType }));
  return { key };
}

/** Delete a file. */
export async function deleteFile(key: string) {
  const { server, cfg } = clients();
  await server.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
}

/** Short-lived link a browser can download a private file from. */
export async function getDownloadUrl(key: string, opts: { filename?: string; expiresIn?: number } = {}) {
  const { signer, cfg } = clients();
  return getSignedUrl(
    signer,
    new GetObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      ResponseContentDisposition: opts.filename
        ? `attachment; filename="${opts.filename.replace(/"/g, "")}"`
        : undefined,
    }),
    { expiresIn: opts.expiresIn ?? 600 },
  );
}

/** Short-lived link a browser can PUT a file to directly (needs bucket CORS on R2). */
export async function getUploadUrl(key: string, contentType: string, expiresIn = 600) {
  const { signer, cfg } = clients();
  return getSignedUrl(signer, new PutObjectCommand({ Bucket: cfg.bucket, Key: key, ContentType: contentType }), {
    expiresIn,
  });
}

/** Permanent URL, only when the bucket is public (S3_PUBLIC_URL set). */
export function getPublicUrl(key: string) {
  const { cfg } = clients();
  return cfg.publicUrl ? `${cfg.publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}` : null;
}

/** Throws if the bucket can't be reached. */
export async function checkStorage() {
  const { server, cfg } = clients();
  await server.send(new HeadBucketCommand({ Bucket: cfg.bucket }));
  return cfg.bucket;
}
