import mongoose from "mongoose";

export function getMongooseBucket(bucketName = "docs") {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Mongoose DB not ready. Did you connect first?");
  }

  const GridFSBucketCtor = mongoose.mongo.GridFSBucket as unknown as new (
    db: unknown,
    options: { bucketName: string }
  ) => mongoose.mongo.GridFSBucket;

  return new GridFSBucketCtor(db, { bucketName });
}
