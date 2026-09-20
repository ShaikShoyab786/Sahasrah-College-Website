import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/auth";

const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, allowedTypes.has(file.mimetype)),
});

const router: IRouter = Router();

router.post(
  "/admin/uploads",
  requireAdmin,
  (req, res, next) => {
    mkdir(uploadDir, { recursive: true }).then(() => next()).catch(next);
  },
  upload.single("file"),
  async (req, res) => {
    const purpose = req.body?.purpose;
    if (purpose !== "logo" && purpose !== "hero") {
      res.status(400).json({ error: "Choose whether the image is for the logo or hero." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "Choose an image to upload." });
      return;
    }

    const extension = path.extname(req.file.originalname).toLowerCase() || ".bin";
    const safeName = `${purpose}-${randomUUID()}${extension}`;
    const finalPath = path.join(uploadDir, safeName);
    const { rename } = await import("node:fs/promises");
    await rename(req.file.path, finalPath);
    res.status(201).json({ url: `/api/uploads/${safeName}`, purpose });
  },
);

export default router;