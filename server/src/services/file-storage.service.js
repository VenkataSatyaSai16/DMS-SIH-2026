import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { calculateSHA256 } from "./file-hash.service.js";

import s3Client from "../config/s3.js";

import path from "node:path";

const bucketName = process.env.S3_BUCKET_NAME;

export const uploadFileToStorage = async (file) => {
  if (!file) {
    throw new Error("File is required");
  }

  const sha256 = calculateSHA256(file.buffer);
  const ext = path.extname(file.originalname || "") || "";
  const objectKey = `test/${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return {
    objectKey,
    bucket: bucketName,
    sha256
  };
};

export const getFileFromStorage = async (objectKey) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  const response = await s3Client.send(command);

  return response;
};

export const uploadCaseFileToStorage = async ({
  file,
  caseId,
  fileId,
}) => {
  if (!file) {
    throw new Error("File is required");
  }

  const ext = path.extname(file.originalname || "") || "";
  const objectKey = `cases/${caseId}/files/${fileId}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return objectKey;
};

export const deleteFileFromStorage = async (objectKey) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  await s3Client.send(command);
};