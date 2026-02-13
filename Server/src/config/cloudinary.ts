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
});

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    "Cloudinary env missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in Server/.env"
  );
}

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "cogno-hire",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname.replace(/[^\w.-]+/g, "-")}`,
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "doc", "docx", "webp"],
  }),
});
export { cloudinary };

export default cloudinary;
