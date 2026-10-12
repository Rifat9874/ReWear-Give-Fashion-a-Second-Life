import { ApiError } from '@/lib/errors';
import { handle, ok, readJson, validationError } from '@/lib/api';
import { requireAdmin, requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { getAdminReports } from '@/lib/queries';
import { REPORT_STATUSES } from '@/lib/constants';
import { validateReport } from '@/lib/validation';
import { Item, Report } from '@/models';

// POST /api/reports  { itemId, reason, details } - report a listing (login required)
export const POST = handle(async (request) => {
  const user = await requireUser();
  const { values, errors } = validateReport(await readJson(request));
  if (Object.keys(errors).length) throw validationError(errors);

  await connectDB();
  const item = await Item.findById(values.itemId).select('title seller').lean();
  if (!item) throw new ApiError(404, 'This listing no longer exists.');
  if (String(item.seller) === user.id) throw new ApiError(400, 'You cannot report your own listing.');

  try {
    const report = await Report.create({
      item: item._id,
      itemTitle: item.title,
      reporter: user.id,
      reason: values.reason,
      details: values.details,
    });
    return ok({ report: { id: String(report._id), status: report.status } }, 201);
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, 'You have already reported this listing. Our moderators will review it.');
    throw error;
  }
});

// GET /api/reports?status=Open - admin only
export const GET = handle(async (request) => {
  await requireAdmin(); // checked on the server, not just by hiding the page
  const requested = request.nextUrl.searchParams.get('status') || 'Open';
  const status = requested === 'All' || REPORT_STATUSES.includes(requested) ? requested : 'Open';
  return ok({ reports: await getAdminReports(status) });
});
