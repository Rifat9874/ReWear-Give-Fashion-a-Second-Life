import { handle, ok, readJson, validationError } from '@/lib/api';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { assertOwnedImages, deleteInternalImages } from '@/lib/images';
import { toCurrentUser } from '@/lib/serializers';
import { validateProfile } from '@/lib/validation';
import { User } from '@/models';

// GET /api/auth/me - the current user, or null when logged out.
export const GET = handle(async () => {
  const user = await getCurrentUser();
  return ok({ user });
});

// PATCH /api/auth/me - edit MY profile (name, location, bio, profile photo).
// Email, password and admin status cannot be changed here (not in the whitelist).
export const PATCH = handle(async (request) => {
  const current = await requireUser();
  const { values, errors } = validateProfile(await readJson(request));
  if (Object.keys(errors).length) throw validationError(errors);

  await connectDB();
  await assertOwnedImages(values.profileImage ? [values.profileImage] : [], current.id);
  const user = await User.findById(current.id);
  const oldPhoto = user.profileImage;
  Object.assign(user, values);
  await user.save();
  if (oldPhoto && oldPhoto !== values.profileImage) await deleteInternalImages([oldPhoto]);
  return ok({ user: toCurrentUser(user.toObject(), process.env.ADMIN_EMAIL) });
});
