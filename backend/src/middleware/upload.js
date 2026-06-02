import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

export const uploadSingle = (fieldName) => (req, res, next) => {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const folder = req.uploadFolder || "general";
        cb(null, `${folder}/${Date.now()}-${file.originalname}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      file.mimetype.startsWith("image/")
        ? cb(null, true)
        : cb(new Error("Only images allowed!"), false);
    },
  }).single(fieldName)(req, res, next);
};

export default uploadSingle;