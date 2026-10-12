import mongoose from 'mongoose';
import { CATEGORIES, CONDITIONS, ITEM_STATUSES, LIMITS, SIZES } from '../lib/constants.js';

const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: LIMITS.title.min, maxlength: LIMITS.title.max },
    description: { type: String, required: true, trim: true, minlength: LIMITS.description.min, maxlength: LIMITS.description.max },
    price: {
      type: Number,
      required: true,
      min: LIMITS.price.min,
      max: LIMITS.price.max,
      validate: { validator: Number.isInteger, message: 'Price must be a whole number.' },
    },
    category: { type: String, required: true, enum: CATEGORIES },
    size: { type: String, required: true, enum: SIZES },
    condition: { type: String, required: true, enum: CONDITIONS },
    brand: { type: String, trim: true, maxlength: LIMITS.brand.max, default: '' },
    color: { type: String, trim: true, maxlength: LIMITS.color.max, default: '' },
    measurements: { type: String, trim: true, maxlength: LIMITS.measurements.max, default: '' },
    images: {
      type: [{ type: String, trim: true, maxlength: LIMITS.imageUrl.max }],
      validate: {
        validator: (list) => Array.isArray(list) && list.length >= 1 && list.length <= LIMITS.maxImages,
        message: `An item needs between 1 and ${LIMITS.maxImages} images.`,
      },
    },
    location: { type: String, required: true, trim: true, minlength: 2, maxlength: LIMITS.location.max },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ITEM_STATUSES, default: 'Available' },
  },
  { timestamps: true }
);

// Indexes match the queries the app actually runs:
itemSchema.index({ status: 1, createdAt: -1 }); // browse "newest"
itemSchema.index({ status: 1, category: 1, price: 1 }); // category + price filters/sorting
itemSchema.index({ seller: 1, status: 1, createdAt: -1 }); // dashboard and seller profile

export default mongoose.models.Item || mongoose.model('Item', itemSchema);
