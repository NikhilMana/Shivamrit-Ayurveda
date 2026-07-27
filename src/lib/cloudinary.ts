import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "1234567890",
  api_secret: process.env.CLOUDINARY_API_SECRET || "abcdefghijklmnopqrstuvwxyz",
});

export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  folder: string = "shivamrit_products"
): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log("[Cloudinary Mock] Returning fallback image path for local development");
    return "/assets/combo pack.png";
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Failed to upload image"));
        }
        resolve(result.secure_url);
      })
      .end(fileBuffer);
  });
}

export default cloudinary;
