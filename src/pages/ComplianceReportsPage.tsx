import { Shield, FileText, Download } from 'lucide-react';

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
          <h2 className="text-2xl font-bold mb-1">Compliance Reports</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Automated safety & NGO compliance logs</p>
        </div>
        <button className="btn-primary py-2 px-4 rounded-lg flex items-center gap-2 text-sm">
          <Download size={16} /> Export All (CSV)
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Date</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Site Name</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Workers</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Safety Grade</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Violations</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {mockReports.map((report) => (
              <tr key={report.id} className="hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                <td className="p-4 text-sm">{report.date}</td>
                <td className="p-4 font-medium">{report.site}</td>
                <td className="p-4 text-sm">{report.workers}</td>
                <td className="p-4">
                  <span className={`badge ${
                    report.grade === 'A' ? 'badge-success' :
                    report.grade === 'B' ? 'badge-info' :
                    report.grade === 'C' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    Grade {report.grade}
                  </span>
                </td>
                <td className="p-4">
                  {report.issues > 0 ? (
                    <span className="text-indigo-400 font-medium flex items-center gap-1">
                      {report.issues} Issues
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Shield size={14} /> Clear
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <FileText size={14} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
