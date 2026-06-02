import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";

export const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split(".amazonaws.com/")[1];
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }));
  } catch (err) {
    console.error("S3 delete error:", err.message);
  }
};