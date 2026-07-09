import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { AppError } from "./response";

const DATA_URL_RE = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB — generous for a compressed phone photo.

/** Anthropic's vision API only accepts this exact set of media types. */
export type ImageMediaType = "image/jpeg" | "image/png" | "image/webp";

/**
 * Decode a `data:image/...;base64,...` string (what Capacitor's Camera
 * plugin and <input type="file"> + FileReader both produce) and upload it to
 * a private, per-user path in the given bucket.
 */
export async function uploadDataUrlImage(
  supabase: SupabaseClient<Database>,
  opts: { bucket: "skin-analysis-images" | "progress-photos"; userId: string; dataUrl: string },
): Promise<{ path: string; publicUrl: string; contentType: ImageMediaType; bytes: Uint8Array }> {
  const match = DATA_URL_RE.exec(opts.dataUrl);
  if (!match) {
    throw new AppError(
      "Image must be a base64 data URL (image/jpeg, image/png, or image/webp).",
      400,
    );
  }
  const [, subtype, base64] = match;
  const contentType: ImageMediaType =
    subtype === "jpg" ? "image/jpeg" : (`image/${subtype}` as ImageMediaType);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new AppError("Image is too large (max 8MB). Try a lower camera quality setting.", 400);
  }

  const extension = subtype === "jpeg" || subtype === "jpg" ? "jpg" : subtype;
  const path = `${opts.userId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(opts.bucket).upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw new AppError(`Failed to upload image: ${error.message}`, 500);
  }

  const { data: signed } = await supabase.storage
    .from(opts.bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  return { path, publicUrl: signed?.signedUrl ?? path, contentType, bytes };
}
