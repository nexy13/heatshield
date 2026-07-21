import { useEffect, useState, useCallback } from 'react';
import { Shield, FileText, Download, Droplets, Siren, ShieldAlert, Thermometer, Inbox } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';
import { useAlerts } from '@/context/AlertContext';
import { useRealtime } from '@/hooks/useRealtime';
import { getAllLatestReports } from '@/lib/api/reports';
import type { ComplianceReport } from '@/types/database';

type SiteReport = ComplianceReport & { site_name?: string };

const GRADE_BADGE: Record<string, BadgeVariant> = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'orange',
  F: 'danger',
};

function violationsOf(report: SiteReport): number {
  return (report.sos_events_count ?? 0) + (report.alerts_triggered ?? 0);
}

function hydrationRate(report: SiteReport): number {
  if (!report.total_workers) return 0;
  return Math.round((report.workers_with_water_breaks / report.total_workers) * 100);
}

/** Quotes/escapes a value for a CSV cell. */
function csvCell(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(reports: SiteReport[]) {
  const headers = ['Date', 'Site Name', 'Workers', 'Hydration Compliance', 'Safety Grade', 'SOS Events', 'Alerts', 'Avg Heat Index', 'Generated At'];
  const rows = reports.map((r) => [
    r.report_date,
    r.site_name ?? '',
    r.total_workers,
    `${hydrationRate(r)}%`,
    r.compliance_grade ?? '',
    r.sos_events_count,
    r.alerts_triggered,
    r.avg_heat_index != null ? `${r.avg_heat_index}°C` : '',
    r.generated_at,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `heatshield-compliance-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ComplianceReportsPage() {
  const { addToast } = useAlerts();
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<SiteReport | null>(null);

  const load = useCallback(async () => {
    try {
      setReports(await getAllLatestReports());
    } catch (err) {
      console.error('Failed to load compliance reports:', err);
      addToast({ title: 'Error', message: 'Failed to load compliance reports', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the table in sync as new reports are generated or incidents change today's grade.
  useRealtime({ table: 'compliance_reports', onData: load });

  const handleExport = () => {
    if (reports.length === 0) {
      addToast({ title: 'Nothing to export', message: 'No compliance reports available yet', type: 'info' });
      return;
    }
    downloadCsv(reports);
    addToast({ title: 'Exported', message: `${reports.length} site report(s) downloaded as CSV`, type: 'success' });
  };

  if (loading) {
    return <Spinner label="Loading compliance reports..." />;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left">
          <p className="eyebrow mb-1.5">Governance</p>
          <h2 className="page-title">Compliance Reports</h2>
          <p className="page-subtitle">Automated safety & NGO compliance logs</p>
        </div>
        <Button variant="primary" className="py-2.5 px-4" onClick={handleExport} disabled={reports.length === 0}>
          <Download size={16} /> Export All (CSV)
        </Button>
      </div>

      <Card className="overflow-hidden p-0" hoverable={false}>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="icon-chip" style={{ width: 44, height: 44, background: 'var(--info-bg)', color: 'var(--info)' }}>
              <Inbox size={20} />
            </span>
            <p className="font-semibold text-[var(--text)]">No compliance reports yet</p>
            <p className="text-sm text-[var(--text-muted)] max-w-sm">
              Reports are generated automatically once a site has logged shift, hydration, or alert
              activity for the day.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Workers</TableHead>
                  <TableHead>Safety Grade</TableHead>
                  <TableHead>Violations</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const violations = violationsOf(report);
                  return (
                    <TableRow key={report.id} className="group">
                      <TableCell className="text-[var(--text-muted)] font-mono text-sm">{report.report_date}</TableCell>
                      <TableCell className="font-semibold text-left text-[var(--text)]">{report.site_name ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{report.total_workers}</TableCell>
                      <TableCell>
                        <Badge variant={GRADE_BADGE[report.compliance_grade ?? ''] ?? 'neutral'}>
                          Grade {report.compliance_grade ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {violations > 0 ? (
                          <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--high)' }}>
                            {violations} Issue{violations === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--safe)' }}>
                            <Shield size={14} /> Clear
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setViewing(report)}
                          className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          style={{ color: 'var(--info)' }}
                        >
                          <FileText size={14} /> View
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Modal
        open={viewing != null}
        onClose={() => setViewing(null)}
        title={viewing?.site_name ?? 'Compliance Report'}
        description={viewing ? `Report for ${viewing.report_date}` : undefined}
        size="md"
        footer={
          viewing && (
            <Button variant="secondary" className="py-2 px-4" onClick={() => downloadCsv([viewing])}>
              <Download size={14} /> Export This Report
            </Button>
          )
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={GRADE_BADGE[viewing.compliance_grade ?? ''] ?? 'neutral'} className="text-sm">
                Grade {viewing.compliance_grade ?? '—'}
              </Badge>
              {violationsOf(viewing) > 0 ? (
                <span className="text-sm font-semibold" style={{ color: 'var(--high)' }}>
                  {violationsOf(viewing)} issue{violationsOf(viewing) === 1 ? '' : 's'} logged
                </span>
              ) : (
                <span className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--safe)' }}>
                  <Shield size={14} /> No violations
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                <span className="icon-chip" style={{ width: 34, height: 34, background: 'var(--info-bg)', color: 'var(--info)' }}>
                  <Droplets size={16} />
                </span>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">Hydration</p>
                  <p className="text-lg font-bold text-[var(--text)]">
                    {hydrationRate(viewing)}%{' '}
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      ({viewing.workers_with_water_breaks}/{viewing.total_workers})
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                <span className="icon-chip" style={{ width: 34, height: 34, background: 'var(--high-bg)', color: 'var(--high)' }}>
                  <Thermometer size={16} />
                </span>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">Avg Heat Index</p>
                  <p className="text-lg font-bold text-[var(--text)]">
                    {viewing.avg_heat_index != null ? `${viewing.avg_heat_index}°C` : '—'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                <span className="icon-chip" style={{ width: 34, height: 34, background: 'var(--emergency-bg)', color: 'var(--emergency)' }}>
                  <Siren size={16} />
                </span>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">SOS Events</p>
                  <p className="text-lg font-bold text-[var(--text)]">{viewing.sos_events_count}</p>
                </div>
              </div>

              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                <span className="icon-chip" style={{ width: 34, height: 34, background: 'var(--high-bg)', color: 'var(--high)' }}>
                  <ShieldAlert size={16} />
                </span>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">Alerts Triggered</p>
                  <p className="text-lg font-bold text-[var(--text)]">{viewing.alerts_triggered}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Generated {new Date(viewing.generated_at).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
