import { Shield, FileText, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

const mockReports = [
  { id: '1', site: 'Rajput Brick Works', date: '2026-07-15', grade: 'B', workers: 24, issues: 2 },
  { id: '2', site: 'Sharma Kilns', date: '2026-07-15', grade: 'A', workers: 18, issues: 0 },
  { id: '3', site: 'Bihar Brick Ind.', date: '2026-07-15', grade: 'C', workers: 32, issues: 5 },
];

export default function ComplianceReportsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-left">Compliance Reports</h2>
          <p className="text-[var(--color-text-muted)] text-sm text-left">Automated safety & NGO compliance logs</p>
        </div>
        <Button variant="primary" className="py-2.5 px-4 rounded-xl flex items-center gap-2">
          <Download size={16} /> Export All (CSV)
        </Button>
      </div>

      <Card className="overflow-hidden p-0" hoverable={false}>
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-transparent">
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
              <TableRow key={report.id}>
                <TableCell className="text-[var(--color-text-muted)]">{report.date}</TableCell>
                <TableCell className="font-semibold text-left">{report.site}</TableCell>
                <TableCell>{report.workers}</TableCell>
                <TableCell>
                  <span className={`badge ${
                    report.grade === 'A' ? 'badge-success' :
                    report.grade === 'B' ? 'badge-info' :
                    report.grade === 'C' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    Grade {report.grade}
                  </span>
                </TableCell>
                <TableCell>
                  {report.issues > 0 ? (
                    <span className="text-indigo-400 font-medium flex items-center gap-1">
                      {report.issues} Issues
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Shield size={14} /> Clear
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <button className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">
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
