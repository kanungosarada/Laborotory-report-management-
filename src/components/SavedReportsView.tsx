import React, { useState } from 'react';
import { FileText, Printer, Search, Trash2, Copy, ArrowUpRight } from 'lucide-react';
import { LabReport } from '../types/lab';

interface SavedReportsViewProps {
  reports: LabReport[];
  onLoadReport: (report: LabReport) => void;
  onPrintReport: (report: LabReport) => void;
  onDuplicateReport: (report: LabReport) => void;
  onDeleteReport: (id: string) => void;
  onNewReport: () => void;
}

export const SavedReportsView: React.FC<SavedReportsViewProps> = ({
  reports,
  onLoadReport,
  onPrintReport,
  onDuplicateReport,
  onDeleteReport,
  onNewReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<
    'all' | 'blood' | 'urine' | 'both'
  >('all');

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.patient.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      rep.patient.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.patient.referredBy.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (sectionFilter === 'blood') {
      return rep.blood.enabled && !rep.urine.enabled;
    }
    if (sectionFilter === 'urine') {
      return !rep.blood.enabled && rep.urine.enabled;
    }
    if (sectionFilter === 'both') {
      return rep.blood.enabled && rep.urine.enabled;
    }
    return true;
  });

  const describeSections = (rep: LabReport): string => {
    const parts: string[] = [];
    if (rep.blood.enabled) parts.push('Blood Test');
    if (rep.urine.enabled) parts.push('Urine Test');
    if (rep.physicalExam.enabled) parts.push('Physical Vitals');
    return parts.join(' · ') || 'No Sections';
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Saved Diagnostic Reports Archive
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Load, duplicate, edit, or re-print patient pathology reports stored on this workstation.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewReport}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap shrink-0"
        >
          Create Blank Report
        </button>
      </div>

      {/* Search & Interactive Filter Controls */}
      <div className="my-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient Name, Lab ID (BPL-...), or Doctor..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded">
          {(
            [
              ['all', 'All Reports'],
              ['blood', 'Blood Test Only'],
              ['urine', 'Urine Test Only'],
              ['both', 'Combined Blood & Urine'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSectionFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                sectionFilter === key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      {filteredReports.length === 0 ? (
        <div className="border border-slate-200 bg-white p-12 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-900">
            No matching diagnostic reports found
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try clearing your search query or start a new laboratory report in the Report Workbench.
          </p>
          <button
            type="button"
            onClick={onNewReport}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
          >
            Open Report Workbench
          </button>
        </div>
      ) : (
        <div className="border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Lab Report ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Referred By</th>
                <th className="py-3 px-4">Included Sections</th>
                <th className="py-3 px-4">Report Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredReports.map((rep) => (
                <tr
                  key={rep.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {rep.patient.reportId}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {rep.patient.patientName.trim()
                      ? `${rep.patient.patientTitle} ${rep.patient.patientName}`
                      : 'Unnamed Patient'}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                    {rep.patient.age || '—'} {rep.patient.ageUnit} ·{' '}
                    {rep.patient.gender}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {rep.patient.referredBy || 'Self'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                    {describeSections(rep)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                    {rep.patient.reportDate}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onLoadReport(rep)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Edit / View
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrintReport(rep)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicateReport(rep)}
                        title="Duplicate report as new Lab ID"
                        className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteReport(rep.id)}
                        title="Delete saved report"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
