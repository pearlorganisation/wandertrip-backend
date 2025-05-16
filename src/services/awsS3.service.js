import s3Client from "../config/s3Client.js";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { AWS_BUCKET_NAME } from "../config/index.js";

export const uploadToS3 = async (file, folder = "uploads") => {
  console.log("File: ", file);
  const fileExtension = file.originalname.split(".").pop();
  const key = `${folder}/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  //const url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

  return { key };
};

export const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

export const getSignedUrlForKey = async (key) => {
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
  return url;
};
