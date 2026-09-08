import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getStorageProvider, newUploadFilename } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024;

const DESIGN_ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const PHOTO_ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export type UploadResult =
  | { ok: true; publicPath: string; mime: string; bytes: number }
  | { ok: false; message: string };

async function saveUpload(
  file: File,
  allowed: Record<string, string>,
  folder: string,
  options?: { allowSvg?: boolean },
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, message: "Please choose an image file." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Image must be 5MB or smaller." };
  }

  const mime = file.type;
  const ext = allowed[mime];
  if (!ext) {
    return {
      ok: false,
      message: options?.allowSvg
        ? "Only PNG, JPG, WEBP, or SVG files are allowed."
        : "Only PNG, JPG, or WEBP photos are allowed.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === "svg") {
    const text = buffer.toString("utf8").toLowerCase();
    if (
      text.includes("<script") ||
      text.includes("javascript:") ||
      /on\w+\s*=/.test(text)
    ) {
      return { ok: false, message: "SVG contains disallowed content." };
    }
  }

  try {
    const storage = getStorageProvider();
    if (storage.name === "local") {
      // Prefer storage provider; keep mkdir fallback path compatible
      const stored = await storage.put({
        folder,
        filename: newUploadFilename(ext),
        buffer,
      });
      return {
        ok: true,
        publicPath: stored.publicPath,
        mime,
        bytes: stored.bytes,
      };
    }

    const filename = newUploadFilename(ext);
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return {
      ok: true,
      publicPath: `/uploads/${folder}/${filename}`,
      mime,
      bytes: buffer.length,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Upload failed.",
    };
  }
}

export async function saveDesignUpload(file: File): Promise<UploadResult> {
  return saveUpload(file, DESIGN_ALLOWED, "designs", { allowSvg: true });
}

export async function savePhotoUpload(file: File): Promise<UploadResult> {
  return saveUpload(file, PHOTO_ALLOWED, "photos");
}
