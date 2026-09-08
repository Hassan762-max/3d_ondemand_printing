import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export type StoredFile = {
  publicPath: string;
  bytes: number;
};

export interface StorageProvider {
  readonly name: string;
  put(input: {
    folder: string;
    filename: string;
    buffer: Buffer;
  }): Promise<StoredFile>;
}

export class LocalDiskStorage implements StorageProvider {
  readonly name = "local";

  async put(input: {
    folder: string;
    filename: string;
    buffer: Buffer;
  }): Promise<StoredFile> {
    const dir = path.join(process.cwd(), "public", "uploads", input.folder);
    await mkdir(dir, { recursive: true });
    const full = path.join(dir, input.filename);
    await writeFile(full, input.buffer);
    return {
      publicPath: `/uploads/${input.folder}/${input.filename}`,
      bytes: input.buffer.length,
    };
  }
}

/** Placeholder for S3/R2/GCS — throws until wired with credentials. */
export class ObjectStorageStub implements StorageProvider {
  readonly name = "object";

  async put(): Promise<StoredFile> {
    throw new Error(
      "Object storage is not configured. Set STORAGE_PROVIDER=local or wire S3/R2.",
    );
  }
}

export function getStorageProvider(): StorageProvider {
  const mode = (process.env.STORAGE_PROVIDER || "local").toLowerCase();
  if (mode === "s3" || mode === "r2" || mode === "object") {
    return new ObjectStorageStub();
  }
  return new LocalDiskStorage();
}

export function newUploadFilename(ext: string) {
  return `${Date.now()}-${nanoid(8)}.${ext}`;
}
