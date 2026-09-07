import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export type UploadResult =
  | { ok: true; publicPath: string; mime: string; bytes: number }
  | { ok: false; message: string };

export async function saveDesignUpload(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, message: "Please choose an image file." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Image must be 5MB or smaller." };
  }

  const mime = file.type;
  const ext = ALLOWED[mime];
  if (!ext) {
    return {
      ok: false,
      message: "Only PNG, JPG, WEBP, or SVG files are allowed.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Basic SVG safety: reject script/event handlers in uploaded SVG.
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

  const filename = `${nanoid(16)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "designs");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return {
    ok: true,
    publicPath: `/uploads/designs/${filename}`,
    mime,
    bytes: buffer.length,
  };
}
