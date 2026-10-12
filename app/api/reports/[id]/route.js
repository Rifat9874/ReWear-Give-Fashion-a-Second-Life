import { ApiError } from '@/lib/errors';
import { handle, idParam, ok, readJson } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { deleteItemCascade } from '@/lib/items';
import { Report } from '@/models';

// PATCH /api/reports/:id  { action: "dismiss" | "remove-listing" } - admin only
export const PATCH = handle(async (request, context) => {
  await requireAdmin();
  const id = await idParam(context);
  const { action } = await readJson(request);
  if (!['dismiss', 'remove-listing'].includes(action)) throw new ApiError(400, 'Action must be "dismiss" or "remove-listing".');

  await connectDB();
  const report = await Report.findById(id);
  if (!report) throw new ApiError(404, 'This report no longer exists.');
  if (report.status !== 'Open') throw new ApiError(409, `This report was already ${report.status.toLowerCase()}.`);

  if (action === 'dismiss') {
    report.status = 'Dismissed';
    await report.save();
    return ok({ report: { id: String(report._id), status: report.status } });
  }

  // remove-listing: delete the listing; deleteItemCascade also marks open reports "Actioned"
  await deleteItemCascade(report.item);
  report.status = 'Actioned';
  await report.save();
  return ok({ report: { id: String(report._id), status: report.status }, removed: true });
});
