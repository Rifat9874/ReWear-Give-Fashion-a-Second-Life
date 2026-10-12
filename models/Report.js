import mongoose from 'mongoose';
import { LIMITS, REPORT_REASONS, REPORT_STATUSES } from '../lib/constants.js';

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    itemTitle: { type: String, required: true, trim: true, maxlength: LIMITS.title.max },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, enum: REPORT_REASONS },
    details: { type: String, trim: true, maxlength: LIMITS.reportDetails.max, default: '' },
    status: { type: String, enum: REPORT_STATUSES, default: 'Open' },
  },
  { timestamps: true }
);

// A person can report the same listing only once.
reportSchema.index({ item: 1, reporter: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
