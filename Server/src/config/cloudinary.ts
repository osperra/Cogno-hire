import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    "Cloudinary env missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
  );
}

function getResourceType(file: Express.Multer.File): "raw" | "image" {
  const mt = (file.mimetype || "").toLowerCase();

  if (mt.startsWith("image/")) return "image";

  return "raw";
}

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const resourceType = getResourceType(file);

    const safeName = file.originalname.replace(/[^\w.-]+/g, "-");

    return {
      folder: "cogno-hire",
      resource_type: resourceType,
      type: "upload",
      access_mode: "public",
      public_id: `${Date.now()}-${safeName}`,
      allowed_formats: ["jpg", "png", "jpeg", "pdf", "doc", "docx", "webp"],
    };
  },
});

export const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const safeName = file.originalname.replace(/[^\w.-]+/g, "-");

    return {
      folder: "cogno-hire",
      resource_type: "raw",
      type: "upload",
      access_mode: "public",
      public_id: `${Date.now()}-${safeName}`,
      allowed_formats: ["pdf", "doc", "docx"],
    };
  },
});

export { cloudinary };
export default cloudinary;
