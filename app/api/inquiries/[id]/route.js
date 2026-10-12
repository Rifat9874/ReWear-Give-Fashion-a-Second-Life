import { ApiError } from '@/lib/errors';
import { handle, idParam, ok, readJson, validationError } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { toInquiry } from '@/lib/serializers';
import { validateInquiryStatus } from '@/lib/validation';
import { Inquiry } from '@/models';

const POPULATE = [
  { path: 'buyer', select: 'name email' },
  { path: 'seller', select: 'name email' },
  { path: 'item', select: 'title images status price' },
];

// Which status changes are allowed, and who may make them.
const TRANSITIONS = {
  Pending: ['Accepted', 'Declined', 'Closed'],
  Accepted: ['Closed'],
  Declined: [],
  Closed: [],
};
const BUYER_MAY_SET = ['Closed']; // a buyer can only withdraw their own inquiry

// Returns the inquiry only if the user is its buyer or its seller.
// Everyone else gets a 404, so inquiry ids cannot be probed.
async function findMyInquiry(id, user) {
  await connectDB();
  const inquiry = await Inquiry.findById(id);
  const isParticipant = inquiry && [String(inquiry.buyer), String(inquiry.seller)].includes(user.id);
  if (!isParticipant) throw new ApiError(404, 'We could not find that inquiry.');
  return inquiry;
}

// GET /api/inquiries/:id
export const GET = handle(async (request, context) => {
  const user = await requireUser();
  const id = await idParam(context);
  await findMyInquiry(id, user);
  const doc = await Inquiry.findById(id).populate(POPULATE).lean();
  return ok({ inquiry: toInquiry(doc, user.id) });
});

// PATCH /api/inquiries/:id  { status } - seller accepts/declines/closes; buyer can withdraw
export const PATCH = handle(async (request, context) => {
  const user = await requireUser();
  const id = await idParam(context);
  const { values, errors } = validateInquiryStatus(await readJson(request));
  if (Object.keys(errors).length) throw validationError(errors);

  const inquiry = await findMyInquiry(id, user);
  const isSeller = String(inquiry.seller) === user.id;

  if (!isSeller && !BUYER_MAY_SET.includes(values.status)) {
    throw new ApiError(403, 'Only the seller can accept or decline an inquiry.');
  }
  if (!TRANSITIONS[inquiry.status].includes(values.status)) {
    throw new ApiError(409, `A ${inquiry.status.toLowerCase()} inquiry cannot be changed to ${values.status.toLowerCase()}.`);
  }

  inquiry.status = values.status;
  await inquiry.save();
  const doc = await Inquiry.findById(id).populate(POPULATE).lean();
  return ok({ inquiry: toInquiry(doc, user.id) });
});
