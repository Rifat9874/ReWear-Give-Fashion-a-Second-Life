import bcrypt from 'bcryptjs';
import { ApiError } from '@/lib/errors';
import { handle, ok, readJson, validationError } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { validatePasswordChange } from '@/lib/validation';
import { User } from '@/models';

// POST /api/auth/password - change MY password (needs the current password)
export const POST = handle(async (request) => {
  const current = await requireUser();
  const { values, errors } = validatePasswordChange(await readJson(request));
  if (Object.keys(errors).length) throw validationError(errors);

  await connectDB();
  const user = await User.findById(current.id).select('+passwordHash');
  const matches = await bcrypt.compare(values.currentPassword, user.passwordHash);
  if (!matches) throw new ApiError(422, 'Your current password is not correct.', { currentPassword: 'Your current password is not correct.' });

  user.passwordHash = await bcrypt.hash(values.newPassword, 12);
  await user.save();
  return ok({ changed: true });
});
