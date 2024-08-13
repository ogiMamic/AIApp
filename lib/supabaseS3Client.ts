// supabaseS3Client.ts
import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
  forcePathStyle: true,
  region: "eu-central-1", // Replace with your actual project region
  endpoint: "https://swfqwvtklggcvyzmzeka.supabase.co/storage/v1/s3", // Replace with your actual project endpoint
  credentials: {
    accessKeyId: "17f9f0f4ee6995b4bf2e3ce480518fff", // Replace with your actual access key id
    secretAccessKey:
      "ee280c7349afb2935c835ce12a0ef5c2e99af83f32ec3ebfa47f97449d356b32", // Replace with your actual secret access key
  },
});

export const supabaseS3Client = client;
