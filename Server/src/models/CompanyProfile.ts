// Server/src/models/companyProfile.ts
import { Schema, model, Types } from "mongoose";

export interface CompanyProfileDoc {
  _id: Types.ObjectId;
  employerId: Types.ObjectId;

  companyName: string;
  tagline?: string;
  website?: string;
  industry?: string;
  companySize?: string;

  foundedYear?: number;
  headquarters?: string;

  description?: string;
  mission?: string;
  values?: string;

  contactEmail?: string;
  phone?: string;

  linkedin?: string;
  twitter?: string;
  github?: string;
  facebook?: string;

  culture?: string;
  benefits?: string;

  // ✅ GridFS logo fields
  logoGridFsId?: Types.ObjectId;
  logoMimeType?: string;
  logoOriginalName?: string;

  // Optional: still allow direct URL (if you want)
  logoUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

const companyProfileSchema = new Schema<CompanyProfileDoc>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    companyName: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    companySize: { type: String, trim: true },

    foundedYear: { type: Number },
    headquarters: { type: String, trim: true },

    description: { type: String },
    mission: { type: String },
    values: { type: String },

    contactEmail: { type: String, trim: true },
    phone: { type: String, trim: true },

    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    github: { type: String, trim: true },
    facebook: { type: String, trim: true },

    culture: { type: String },
    benefits: { type: String },

    // ✅ GridFS logo
    logoGridFsId: { type: Schema.Types.ObjectId },
    logoMimeType: { type: String },
    logoOriginalName: { type: String },

    // optional fallback url
    logoUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export const CompanyProfile = model<CompanyProfileDoc>(
  "CompanyProfile",
  companyProfileSchema,
  "company_profiles"
);
