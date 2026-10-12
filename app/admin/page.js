import Link from 'next/link';
import AdminReportActions from '@/components/AdminReportActions';
import DbErrorNotice from '@/components/DbErrorNotice';
import EmptyState from '@/components/EmptyState';
import SafeImage from '@/components/SafeImage';
import StatusBadge from '@/components/StatusBadge';
import { requireAdminPage } from '@/lib/auth';
import { REPORT_STATUSES } from '@/lib/constants';
import { getAdminReports, getReportCounts } from '@/lib/queries';
import { formatDate, formatPrice } from '@/lib/utilities';

export const metadata = { title: 'Moderation' };

export default async function AdminPage({ searchParams }) {
  await requireAdminPage(); // non-admins get the 404 page
  const { status: requested } = await searchParams;
  const status = REPORT_STATUSES.includes(requested) ? requested : 'Open';

  let reports = null;
  let counts = null;
  try {
    [reports, counts] = await Promise.all([getAdminReports(status), getReportCounts()]);
  } catch (error) {
    console.error('[admin] could not load reports:', error.message);
  }

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Moderation</h1>
        <p className="muted">Review reported listings. You can dismiss a report or remove the listing.</p>
      </header>

      {!reports ? (
        <DbErrorNotice />
      ) : (
        <>
          <nav className="tabs" aria-label="Report status">
            {REPORT_STATUSES.map((name) => (
              <Link key={name} href={`/admin?status=${name}`} className={name === status ? 'is-current' : ''} aria-current={name === status ? 'page' : undefined}>
                {name} ({counts[name] ?? 0})
              </Link>
            ))}
          </nav>

          {reports.length === 0 ? (
            <EmptyState title={`No ${status.toLowerCase()} reports`}>
              {status === 'Open' ? 'Nothing needs your attention right now.' : 'Reports will appear here once they are handled.'}
            </EmptyState>
          ) : (
            <ul className="report-list">
              {reports.map((report) => (
                <li key={report.id} className="report">
                  <div className="report-thumb">
                    <SafeImage src={report.item?.image} alt="" label="Removed" />
                  </div>
                  <div className="report-body">
                    <div className="inquiry-top">
                      <p className="inquiry-title">
                        {report.item ? <Link href={`/items/${report.itemId}`}>{report.itemTitle}</Link> : <span>{report.itemTitle} (listing removed)</span>}
                      </p>
                      <StatusBadge status={report.status} />
                    </div>
                    {report.item ? <p className="muted">{formatPrice(report.item.price)}, currently {report.item.status.toLowerCase()}</p> : null}
                    <p><strong>{report.reason}</strong></p>
                    {report.details ? <p className="inquiry-message">{report.details}</p> : null}
                    <p className="muted">Reported by {report.reporter?.name || 'a former member'} on {formatDate(report.createdAt)}</p>
                    {report.status === 'Open' ? <AdminReportActions report={report} /> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
