import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cogno-hire",
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "doc", "docx", "webp"],
  } as any, // Type assertion needed due to loose typing in the library
});

export default cloudinary;
