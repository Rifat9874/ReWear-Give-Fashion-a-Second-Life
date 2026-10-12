import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    // select:false means queries never return the hash unless explicitly asked.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['buyer', 'seller', 'member', 'admin'], default: 'member', required: true },
    location: { type: String, trim: true, maxlength: 80, default: '' },
    profileImage: { type: String, trim: true, maxlength: 500, default: '' },
    bio: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
