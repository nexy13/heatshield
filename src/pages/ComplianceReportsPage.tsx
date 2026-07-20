import { Shield, FileText, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

const mockReports = [
  { id: '1', site: 'Anekal Brick Industries', date: '2026-07-19', grade: 'A', workers: 42, issues: 0 },
  { id: '2', site: 'Jigani Eco Bricks', date: '2026-07-19', grade: 'A', workers: 36, issues: 0 },
  { id: '3', site: 'Bommasandra Kilns', date: '2026-07-19', grade: 'B', workers: 51, issues: 2 },
  { id: '4', site: 'Attibele Clay Works', date: '2026-07-19', grade: 'B', workers: 28, issues: 1 },
  { id: '5', site: 'Chandapura Brick Industries', date: '2026-07-19', grade: 'C', workers: 18, issues: 4 },
];

const GRADE_BADGE: Record<string, string> = {
  A: 'badge-success',
  B: 'badge-info',
  C: 'badge-warning',
};

export default function ComplianceReportsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left">
          <p className="eyebrow mb-1.5">Governance</p>
          <h2 className="page-title">Compliance Reports</h2>
          <p className="page-subtitle">Automated safety & NGO compliance logs</p>
        </div>
        <Button variant="primary" className="py-2.5 px-4">
          <Download size={16} /> Export All (CSV)
        </Button>
      </div>

      <Card className="overflow-hidden p-0" hoverable={false}>
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
            {mockReports.map((report) => (
              <TableRow key={report.id} className="group">
                <TableCell className="text-[var(--text-muted)] font-mono text-sm">{report.date}</TableCell>
                <TableCell className="font-semibold text-left text-[var(--text)]">{report.site}</TableCell>
                <TableCell className="text-[var(--text-secondary)]">{report.workers}</TableCell>
                <TableCell>
                  <span className={`badge ${GRADE_BADGE[report.grade] ?? 'badge-danger'}`}>
                    Grade {report.grade}
                  </span>
                </TableCell>
                <TableCell>
                  {report.issues > 0 ? (
                    <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--high)' }}>
                      {report.issues} Issues
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--safe)' }}>
                      <Shield size={14} /> Clear
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    style={{ color: 'var(--info)' }}
                  >
                    <FileText size={14} /> View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
