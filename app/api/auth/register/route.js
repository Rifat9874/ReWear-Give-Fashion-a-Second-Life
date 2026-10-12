import bcrypt from 'bcryptjs';
import { ApiError } from '@/lib/errors';
import { handle, ok, readJson, validationError } from '@/lib/api';
import { setSessionCookie } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { toCurrentUser } from '@/lib/serializers';
import { validateRegister } from '@/lib/validation';
import { User } from '@/models';

// POST /api/auth/register - create an account and log the person in.
export const POST = handle(async (request) => {
  const body = await readJson(request);
  const { values, errors } = validateRegister(body);
  if (Object.keys(errors).length) throw validationError(errors);

  await connectDB();
  const duplicate = { email: 'An account with this email already exists.' };
  if (await User.exists({ email: values.email })) throw new ApiError(409, 'That email is already registered.', duplicate);

  const passwordHash = await bcrypt.hash(values.password, 12); // never store the plain password
  let user;
  try {
    user = await User.create({ name: values.name, email: values.email, passwordHash, location: values.location });
  } catch (error) {
    // Two people registering the same email at the same moment: the unique index catches it.
    if (error?.code === 11000) throw new ApiError(409, 'That email is already registered.', duplicate);
    throw error;
  }

  await setSessionCookie(user._id);
  return ok({ user: toCurrentUser(user.toObject(), process.env.ADMIN_EMAIL) }, 201);
});
