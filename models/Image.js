import mongoose from 'mongoose';

const { Schema } = mongoose;

// Uploaded photos are stored in MongoDB (not on the server's disk), so they survive
// redeploys and work on serverless hosting. The browser shrinks photos before upload.
const imageSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false }, // only loaded when serving the image
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

imageSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.models.Image || mongoose.model('Image', imageSchema);
