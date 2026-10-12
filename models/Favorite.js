import mongoose from 'mongoose';

const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One favorite per user per item - the database itself blocks duplicates.
favoriteSchema.index({ user: 1, item: 1 }, { unique: true });
favoriteSchema.index({ item: 1 });

export default mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
