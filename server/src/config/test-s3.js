import "dotenv/config";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3.js";

const bucketName = process.env.S3_BUCKET_NAME;

try {
  await s3Client.send(
    new HeadBucketCommand({
      Bucket: bucketName,
    })
  );

  console.log(`S3 connection successful. Bucket: ${bucketName}`);
} catch (error) {
  console.error("S3 connection failed:");
  console.error(error);
}