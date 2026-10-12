'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/client-api';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from './ToastProvider';

// Moderator buttons for one open report. The server re-checks that the caller is the admin.
export default function AdminReportActions({ report }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(action) {
    setBusy(true);
    const result = await apiRequest(`/api/reports/${report.id}`, { method: 'PATCH', body: { action } });
    setBusy(false);
    setConfirming(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(action === 'dismiss' ? 'Report dismissed.' : 'Listing removed and report closed.');
    router.refresh();
  }

  return (
    <div className="row-actions">
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => run('dismiss')} disabled={busy}>Dismiss report</button>
      {report.item ? (
        <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setConfirming(true)} disabled={busy}>Remove listing</button>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title="Remove this listing?"
        message={`“${report.itemTitle}” will be deleted permanently and the report will be marked as actioned.`}
        confirmLabel="Remove listing"
        danger
        busy={busy}
        onConfirm={() => run('remove-listing')}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
