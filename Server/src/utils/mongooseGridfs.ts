// Server/src/utils/mongooseGridfs.ts
import mongoose from "mongoose";

export function getMongooseBucket(bucketName = "docs") {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Mongoose DB not ready. Did you connect first?");

  // Use mongoose's bundled driver to avoid mongodb type/version conflicts
  const GridFSBucketCtor = (mongoose.mongo as any).GridFSBucket as new (
    db: any,
    options: { bucketName: string }
  ) => any;

  return new GridFSBucketCtor(db, { bucketName });
}
