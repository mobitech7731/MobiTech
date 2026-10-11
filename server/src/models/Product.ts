import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  price: number;
  compareAtPrice?: number;
  images: unknown[];
  isNewArrival: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  inStock: boolean;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0.01, max: 1000000 },
    compareAtPrice: { type: Number, min: 0 },
    images: { type: [Schema.Types.Mixed], default: [] },
    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0, min: 0, max: 100000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);
