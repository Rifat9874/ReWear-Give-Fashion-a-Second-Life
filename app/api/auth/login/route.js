import bcrypt from 'bcryptjs';
import { ApiError } from '@/lib/errors';
import { handle, ok, readJson, validationError } from '@/lib/api';
import { setSessionCookie } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { toCurrentUser } from '@/lib/serializers';
import { validateLogin } from '@/lib/validation';
import { User } from '@/models';

// A real bcrypt hash of a throw-away password. When the email is unknown we still
// compare against it, so response time does not reveal which emails are registered.
const DUMMY_HASH = '$2b$12$xZNuMkX/NjsteLP1OALyTON1SwXx3AvFNvLVws.oe57cFNxSPp3Xa';

// POST /api/auth/login
export const POST = handle(async (request) => {
  const body = await readJson(request);
  const { values, errors } = validateLogin(body);
  if (Object.keys(errors).length) throw validationError(errors);

  await connectDB();
  const user = await User.findOne({ email: values.email }).select('+passwordHash').lean();
  const passwordMatches = await bcrypt.compare(values.password, user?.passwordHash || DUMMY_HASH);

  // One generic message for both "no such email" and "wrong password".
  if (!user || !passwordMatches) throw new ApiError(401, 'Incorrect email or password.');

  await setSessionCookie(user._id);
  return ok({ user: toCurrentUser(user, process.env.ADMIN_EMAIL) });
});
