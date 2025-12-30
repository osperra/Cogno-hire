import { MongoClient, GridFSBucket } from "mongodb";

let bucket: GridFSBucket | null = null;

export function initGridFS(client: MongoClient, bucketName = "docs") {
  bucket = new GridFSBucket(client.db(), { bucketName });
}

export function getBucket(): GridFSBucket {
  if (!bucket) throw new Error("GridFSBucket not initialized. Call initGridFS() after DB connect.");
  return bucket;
}
