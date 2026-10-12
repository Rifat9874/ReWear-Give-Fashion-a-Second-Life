import mongoose from 'mongoose';
import { INQUIRY_STATUSES, LIMITS } from '../lib/constants.js';

const { Schema } = mongoose;

const inquirySchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    // Snapshot of the title so the record still makes sense if the listing is deleted later.
    itemTitle: { type: String, required: true, trim: true, maxlength: LIMITS.title.max },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, minlength: LIMITS.message.min, maxlength: LIMITS.message.max },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'Pending' },
  },
  { timestamps: true }
);

inquirySchema.index({ buyer: 1, createdAt: -1 });
inquirySchema.index({ seller: 1, createdAt: -1 });
inquirySchema.index({ item: 1, buyer: 1, status: 1 });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
