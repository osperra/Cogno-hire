import mongoose from "mongoose";

export function getMongooseBucket(bucketName = "docs") {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Mongoose DB not ready. Did you connect first?");

  const GridFSBucketCtor = (mongoose.mongo as unknown as { GridFSBucket: new (db: unknown, opts: { bucketName: string }) => any })
    .GridFSBucket;

  return new GridFSBucketCtor(db, { bucketName });
}
