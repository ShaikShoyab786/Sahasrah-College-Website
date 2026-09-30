import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { Router, type IRouter } from "express";
import {
  CompleteAdminImageUploadBody,
  CompleteAdminImageUploadResponse,
  RequestAdminImageUploadUrlBody,
  RequestAdminImageUploadUrlResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();
const allowedPurposes = new Set([
  "logo", "hero", "campus", "cta", "update", "topic", "result",
  "testimonial", "faculty", "gallery", "knowledge", "login",
]);
const extensionByContentType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const contentTypeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function hasImageSignature(contentType: string, bytes: Buffer): boolean {
  if (contentType === "image/png") {
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  return contentType === "image/webp"
    && bytes.toString("ascii", 0, 4) === "RIFF"
    && bytes.toString("ascii", 8, 12) === "WEBP";
}

async function streamLegacyLocalImage(
  filename: string,
  res: import("express").Response,
): Promise<boolean> {
  const directories = [
    process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve("uploads"),
    path.resolve("artifacts/api-server/uploads"),
  ];

  for (const directory of new Set(directories)) {
    const filePath = path.join(directory, filename);
    try {
      const details = await stat(filePath);
      if (!details.isFile()) continue;
      res.setHeader("Content-Type", contentTypeByExtension[path.extname(filename).toLowerCase()] ?? "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=3600");
      createReadStream(filePath).pipe(res);
      return true;
    } catch {
      // Try the next legacy directory before returning a not-found response.
    }
  }
  return false;
}

router.get("/uploads/:filename", async (req, res): Promise<void> => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  if (!/^[a-z0-9][a-z0-9._-]{0,240}\.(?:jpe?g|png|webp)$/i.test(filename)) {
    res.status(400).json({ error: "Invalid image path." });
    return;
  }

  try {
    const file = await objectStorage.searchPublicObject(`uploads/${filename}`);
    if (file) {
      const response = await objectStorage.downloadObject(file);
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.setHeader("Cache-Control", "public, max-age=3600");
      if (response.body) {
        Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
      } else {
        res.end();
      }
      return;
    }
    if (await streamLegacyLocalImage(filename, res)) return;
    res.status(404).json({ error: "Image not found." });
  } catch (error) {
    req.log.error({ err: error }, "Error serving uploaded image");
    if (await streamLegacyLocalImage(filename, res)) return;
    res.status(500).json({ error: "Failed to serve image." });
  }
});

router.post(
  "/admin/uploads",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = RequestAdminImageUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Choose a valid image and purpose." });
      return;
    }
    const { fileName, contentType, purpose } = parsed.data;
    const extension = extensionByContentType[contentType];
    if (!extension || !allowedPurposes.has(purpose)) {
      res.status(400).json({ error: "Choose a JPEG, PNG, or WebP image." });
      return;
    }

    const safeName = `${purpose}-${randomUUID()}${extension}`;
    const objectPath = `uploads/${safeName}`;
    try {
      const uploadURL = await objectStorage.getPublicObjectUploadURL(objectPath);
      res.json(RequestAdminImageUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        url: `/api/uploads/${safeName}`,
        purpose,
      }));
    } catch (error) {
      req.log.error({ err: error }, "Error creating admin image upload URL");
      res.status(500).json({ error: "Unable to prepare this image upload." });
    }
  },
);

router.post(
  "/admin/uploads/complete",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = CompleteAdminImageUploadBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid image upload." });
      return;
    }

    const { objectPath, purpose } = parsed.data;
    const match = /^uploads\/([a-z]+)-([a-f0-9-]{36})\.(jpg|png|webp)$/i.exec(objectPath);
    if (!match || match[1] !== purpose) {
      res.status(400).json({ error: "Invalid image upload path." });
      return;
    }

    try {
      const file = await objectStorage.searchPublicObject(objectPath);
      if (!file) {
        res.status(400).json({ error: "The image upload is incomplete." });
        return;
      }

      const [metadata] = await file.getMetadata();
      const contentType = String(metadata.contentType ?? "");
      const size = Number(metadata.size ?? 0);
      if (
        !extensionByContentType[contentType] ||
        extensionByContentType[contentType] !== `.${match[3]}` ||
        size <= 0 ||
        size > 5 * 1024 * 1024
      ) {
        res.status(400).json({ error: "The uploaded image type or size is invalid." });
        return;
      }
      const [header] = await file.download({ start: 0, end: 11 });
      if (!hasImageSignature(contentType, header)) {
        res.status(400).json({ error: "The uploaded file is not a valid image." });
        return;
      }

      res.json(CompleteAdminImageUploadResponse.parse({
        url: `/api/uploads/${match[0].split("/")[1]}`,
        purpose,
      }));
    } catch (error) {
      req.log.error({ err: error }, "Error verifying admin image upload");
      res.status(500).json({ error: "Unable to verify this image upload." });
    }
  },
);

export default router;