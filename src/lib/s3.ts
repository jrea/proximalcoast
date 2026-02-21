
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const s3 = {
  upload: async (key: string, body: Buffer | Uint8Array, contentType: string) => {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    return s3Client.send(command);
  },

  getSignedUrl: async (key: string, expiresIn = 3600) => {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  },

  getFile: async (key: string) => {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response.Body?.transformToByteArray();
  }
};
