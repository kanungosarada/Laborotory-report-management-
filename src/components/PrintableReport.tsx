import React from 'react';
import {
  BloodTestItem,
  LabReport,
  LabSettings,
  SectionKey,
  TestParameter,
  WidalDilutionRow,
} from '../types/lab';

interface PrintableReportProps {
  report: LabReport;
  settings: LabSettings;
}

function shouldRenderParam(param: TestParameter, hideEmpty: boolean): boolean {
  if (!param.included) return false;
  if (hideEmpty && param.result.trim() === '') return false;
  return true;
}

function shouldRenderWidalRow(
  row: WidalDilutionRow,
  hideEmpty: boolean
): boolean {
  if (!row.included) return false;
  if (hideEmpty && row.resultTitre.trim() === '') return false;
  return true;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  report,
  settings,
}) => {
  const {
    patient,
    blood,
    urine,
    physicalExam,
    hideEmptyRowsOnPrint,
    sectionOrder = ['blood', 'urine', 'physical'],
  } = report;

  // Determine effective specimen string based on enabled sections if default
  const effectiveSpecimen = React.useMemo(() => {
    const isDefault =
      patient.specimen === 'Whole Blood / Serum / Mid-Stream Urine' ||
      patient.specimen.trim() === '';
    if (!isDefault) return patient.specimen;
    if (blood.enabled && !urine.enabled) return 'EDTA Whole Blood & Plain Serum';
    if (!blood.enabled && urine.enabled) return 'Mid-Stream Morning Urine';
    if (!blood.enabled && !urine.enabled && physicalExam.enabled)
      return 'Clinical Physical Assessment';
    return 'Whole Blood / Serum / Urine';
  }, [patient.specimen, blood.enabled, urine.enabled, physicalExam.enabled]);

  // Filter active Blood items
  const activeBloodItems = React.useMemo(() => {
    if (!blood.enabled) return [];
    return blood.items.filter((item) => {
      if (item.type === 'standard') {
        return shouldRenderParam(item.param, hideEmptyRowsOnPrint);
      }
      if (item.type === 'widal') {
        if (!item.included) return false;
        const activeRows = item.rows.filter((r) =>
          shouldRenderWidalRow(r, hideEmptyRowsOnPrint)
        );
        return activeRows.length > 0;
      }
      if (item.type === 'blood-group') {
        if (!item.included) return false;
        if (
          hideEmptyRowsOnPrint &&
          item.aboGroup.trim() === '' &&
          item.rhFactor.trim() === ''
        ) {
          return false;
        }
        return true;
      }
      return false;
    });
  }, [blood, hideEmptyRowsOnPrint]);

  const hasAnyBloodTest = activeBloodItems.length > 0;

  // Filter active Urine subSections
  const activeUrineSubSections = React.useMemo(() => {
    if (!urine.enabled) return [];
    return urine.subSections
      .filter((sub) => sub.enabled)
      .map((sub) => ({
        ...sub,
        activeItems: sub.items.filter((p) =>
          shouldRenderParam(p, hideEmptyRowsOnPrint)
        ),
      }))
      .filter((sub) => sub.activeItems.length > 0);
  }, [urine, hideEmptyRowsOnPrint]);

  const hasAnyUrineTest = activeUrineSubSections.length > 0;

  // Filter active Physical Exam parameters
  const activePhysicalExamParams = React.useMemo(() => {
    if (!physicalExam.enabled) return [];
    return physicalExam.parameters.filter((p) =>
      shouldRenderParam(p, hideEmptyRowsOnPrint)
    );
  }, [physicalExam, hideEmptyRowsOnPrint]);

  const hasAnyPhysicalExam = activePhysicalExamParams.length > 0;

  const totalCols =
    2 +
    (settings.showReferenceRanges ? 1 : 0) +
    (settings.showMethodColumn ? 1 : 0);

  const renderResultCell = (param: TestParameter) => {
    const hasVal = param.result.trim() !== '';
    const isAbnormal = param.flag === 'abnormal' || param.flag === 'critical';

    return (
      <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
        {hasVal ? (
          <span
            className={
              isAbnormal
                ? 'font-bold text-slate-950 underline decoration-slate-900 underline-offset-2'
                : 'font-semibold text-slate-900'
            }
          >
            {param.result}
          </span>
        ) : (
          <span className="text-slate-400 italic font-sans text-xs">
            __________________
          </span>
        )}
        {param.unit && hasVal && (
          <span className="text-xs text-slate-600 font-mono">{param.unit}</span>
        )}
        {isAbnormal && hasVal && (
          <span className="text-[11px] font-bold text-slate-900 ml-1">
            [{param.flag === 'critical' ? 'CRITICAL' : 'ABNORMAL'}]
          </span>
        )}
      </div>
    );
  };

  const renderBloodItemRows = (item: BloodTestItem, idx: number) => {
    if (item.type === 'standard') {
      const p = item.param;
      return (
        <tr key={item.id}>
          <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-300">
            {idx + 1}. {p.name}
          </td>
          <td className="py-2 px-3 border-r border-slate-300">
            {renderResultCell(p)}
          </td>
          {settings.showReferenceRanges && (
            <td className="py-2 px-3 font-mono text-[11px] text-slate-700 border-r border-slate-300">
              {p.referenceRange}
            </td>
          )}
          {settings.showMethodColumn && (
            <td className="py-2 px-3 text-[11px] text-slate-600">
              {p.method}
            </td>
          )}
        </tr>
      );
    }

    if (item.type === 'widal') {
      const visibleRows = item.rows.filter((r) =>
        shouldRenderWidalRow(r, hideEmptyRowsOnPrint)
      );
      return (
        <React.Fragment key={item.id}>
          <tr className="bg-slate-50/80">
            <td
              colSpan={totalCols}
              className="py-1.5 px-3 font-bold text-slate-900 uppercase tracking-tight text-[11px]"
            >
              {idx + 1}. {item.name}
              {item.method ? ` — ${item.method}` : ''}
            </td>
          </tr>
          {item.displayMode === 'titre' ? (
            visibleRows.map((row) => {
              const hasVal = row.resultTitre.trim() !== '';
              const isAbn =
                row.flag === 'abnormal' || row.flag === 'critical';
              return (
                <tr key={row.id}>
                  <td className="py-1.5 pl-6 pr-3 font-medium text-slate-800 border-r border-slate-300">
                    • {row.label}
                  </td>
                  <td className="py-1.5 px-3 border-r border-slate-300 font-mono tabular-nums">
                    {hasVal ? (
                      <span
                        className={
                          isAbn
                            ? 'font-bold text-slate-950 underline decoration-slate-900 underline-offset-2'
                            : 'font-semibold text-slate-900'
                        }
                      >
                        {row.resultTitre}
                        {isAbn ? ' [REACTIVE]' : ''}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic font-sans text-xs">
                        __________________
                      </span>
                    )}
                  </td>
                  {settings.showReferenceRanges && (
                    <td className="py-1.5 px-3 font-mono text-[11px] text-slate-700 border-r border-slate-300">
                      {row.referenceRange}
                    </td>
                  )}
                  {settings.showMethodColumn && (
                    <td className="py-1.5 px-3 text-[11px] text-slate-600">
                      Agglutination
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={totalCols} className="p-2.5">
                <table className="w-full border border-slate-700 text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-700 text-center">
                      <th className="py-1 px-2 text-left font-sans font-bold border-r border-slate-400">
                        Widal Antigen
                      </th>
                      <th className="py-1 px-2 border-r border-slate-400">
                        1:20
                      </th>
                      <th className="py-1 px-2 border-r border-slate-400">
                        1:40
                      </th>
                      <th className="py-1 px-2 border-r border-slate-400">
                        1:80
                      </th>
                      <th className="py-1 px-2 border-r border-slate-400">
                        1:160
                      </th>
                      <th className="py-1 px-2 border-r border-slate-400">
                        1:320
                      </th>
                      <th className="py-1 px-2 text-left font-sans font-bold">
                        Observed Titre
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {visibleRows.map((row) => (
                      <tr key={row.id} className="text-center">
                        <td className="py-1 px-2 text-left font-sans font-semibold border-r border-slate-400">
                          {row.label}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-400 font-bold">
                          {row.dilutions.d1_20}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-400 font-bold">
                          {row.dilutions.d1_40}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-400 font-bold">
                          {row.dilutions.d1_80}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-400 font-bold">
                          {row.dilutions.d1_160}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-400 font-bold">
                          {row.dilutions.d1_320}
                        </td>
                        <td className="py-1 px-2 text-left font-bold text-slate-950">
                          {row.resultTitre || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    }

    // Blood Group Block
    return (
      <tr key={item.id}>
        <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-300">
          {idx + 1}. {item.name}
        </td>
        <td className="py-2 px-3 border-r border-slate-300 font-mono tabular-nums">
          {item.aboGroup.trim() || item.rhFactor.trim() ? (
            <div className="space-y-0.5">
              <div>
                <span className="text-slate-600 font-sans text-[11px] mr-1.5">
                  {item.aboLabel}:
                </span>
                <span className="font-bold text-slate-950 text-sm">
                  {item.aboGroup || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-600 font-sans text-[11px] mr-1.5">
                  {item.rhLabel}:
                </span>
                <span className="font-bold text-slate-950">
                  {item.rhFactor || '—'}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 italic font-sans text-xs">
              {item.aboLabel}: _______ · {item.rhLabel}: _______
            </span>
          )}
        </td>
        {settings.showReferenceRanges && (
          <td className="py-2 px-3 font-mono text-[11px] text-slate-700 border-r border-slate-300">
            {item.referenceRange}
          </td>
        )}
        {settings.showMethodColumn && (
          <td className="py-2 px-3 text-[11px] text-slate-600">
            {item.method}
          </td>
        )}
      </tr>
    );
  };

  const renderSectionByKey = (secKey: SectionKey) => {
    if (secKey === 'blood' && hasAnyBloodTest) {
      return (
        <div key="blood" className="mb-6">
          <div className="bg-slate-900 text-white px-3 py-1.5 text-xs font-bold tracking-wider uppercase flex items-center justify-between">
            <span>{blood.sectionTitle}</span>
            <span className="font-mono text-[11px] font-normal text-slate-300">
              {blood.departmentTag}
            </span>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-xs">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-100 text-slate-900 text-left">
                <th className="py-2 px-3 font-bold border-r border-slate-300 w-[38%]">
                  Test Investigation
                </th>
                <th className="py-2 px-3 font-bold border-r border-slate-300 w-[30%]">
                  Observed Result
                </th>
                {settings.showReferenceRanges && (
                  <th className="py-2 px-3 font-bold border-r border-slate-300">
                    Biological Reference Interval
                  </th>
                )}
                {settings.showMethodColumn && (
                  <th className="py-2 px-3 font-bold w-[18%]">Method</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {activeBloodItems.map((item, idx) =>
                renderBloodItemRows(item, idx)
              )}
            </tbody>
          </table>
        </div>
      );
    }

    if (secKey === 'urine' && hasAnyUrineTest) {
      return (
        <div key="urine" className="mb-6">
          <div className="bg-slate-900 text-white px-3 py-1.5 text-xs font-bold tracking-wider uppercase flex items-center justify-between">
            <span>{urine.sectionTitle}</span>
            <span className="font-mono text-[11px] font-normal text-slate-300">
              {urine.departmentTag}
            </span>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-xs">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-100 text-slate-900 text-left">
                <th className="py-2 px-3 font-bold border-r border-slate-300 w-[38%]">
                  Urine Examination Parameter
                </th>
                <th className="py-2 px-3 font-bold border-r border-slate-300 w-[30%]">
                  Observed Value / Result
                </th>
                {settings.showReferenceRanges && (
                  <th className="py-2 px-3 font-bold border-r border-slate-300">
                    Normal Reference Range
                  </th>
                )}
                {settings.showMethodColumn && (
                  <th className="py-2 px-3 font-bold w-[18%]">Method</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {activeUrineSubSections.map((sub) => (
                <React.Fragment key={sub.id}>
                  <tr className="bg-slate-100/90">
                    <td
                      colSpan={totalCols}
                      className="py-1.5 px-3 font-bold text-slate-950 uppercase tracking-wider text-[11px]"
                    >
                      {sub.title}
                    </td>
                  </tr>
                  {sub.activeItems.map((param) => (
                    <tr key={param.id}>
                      <td className="py-2 pl-6 pr-3 font-semibold text-slate-900 border-r border-slate-300">
                        {param.name}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300">
                        {renderResultCell(param)}
                      </td>
                      {settings.showReferenceRanges && (
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-700 border-r border-slate-300">
                          {param.referenceRange}
                        </td>
                      )}
                      {settings.showMethodColumn && (
                        <td className="py-2 px-3 text-[11px] text-slate-600">
                          {param.method}
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (secKey === 'physical' && hasAnyPhysicalExam) {
      return (
        <div key="physical" className="mb-6">
          <div className="bg-slate-900 text-white px-3 py-1.5 text-xs font-bold tracking-wider uppercase flex items-center justify-between">
            <span>{physicalExam.sectionTitle}</span>
            <span className="font-mono text-[11px] font-normal text-slate-300">
              {physicalExam.departmentTag}
            </span>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-xs">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-100 text-slate-900 text-left">
                <th className="py-2 px-3 font-bold border-r border-slate-300 w-[38%]">
                  Physical Parameter
                </th>
                <th className="py-2 px-3 font-bold border-r border-slate-300 w-[30%]">
                  Observed Measurement
                </th>
                {settings.showReferenceRanges && (
                  <th className="py-2 px-3 font-bold border-r border-slate-300">
                    Standard Reference
                  </th>
                )}
                {settings.showMethodColumn && (
                  <th className="py-2 px-3 font-bold w-[18%]">Instrument</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {activePhysicalExamParams.map((param) => (
                <tr key={param.id}>
                  <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-300">
                    {param.name}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-300">
                    {renderResultCell(param)}
                  </td>
                  {settings.showReferenceRanges && (
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-700 border-r border-slate-300">
                      {param.referenceRange}
                    </td>
                  )}
                  {settings.showMethodColumn && (
                    <td className="py-2 px-3 text-[11px] text-slate-600">
                      {param.method}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      id="printable-report-sheet"
      className="print-only-sheet bg-white text-slate-950 w-full max-w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-8 border border-slate-300 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* 1. LETTERHEAD HEADER OR PRE-PRINTED MARGIN */}
        {settings.printHeaderMode === 'full-letterhead' ? (
          <div className="border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 mb-2 border-b border-slate-200 pb-1.5">
              <span>Reg. No.: {settings.registrationNo}</span>
              <span>{settings.timings}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 border-2 border-slate-900 flex items-center justify-center shrink-0 bg-slate-900 text-white font-mono font-bold text-lg tracking-tighter">
                  BPL
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 uppercase leading-none">
                    {settings.labName}
                  </h1>
                  <p className="text-xs font-medium text-slate-700 mt-1">
                    {settings.tagline}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {settings.addressLine1}
                    {settings.addressLine2 ? `, ${settings.addressLine2}` : ''}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-xs text-slate-800 shrink-0 space-y-0.5">
                <div className="font-semibold text-slate-950">
                  Tel: {settings.phonePrimary}
                </div>
                {settings.phoneSecondary && (
                  <div>Alt: {settings.phoneSecondary}</div>
                )}
                {settings.email && (
                  <div className="text-[11px] text-slate-600">
                    {settings.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ height: `${settings.preprintedTopMarginMm}mm` }}
            className="w-full border-b border-dashed border-slate-300 print:border-none flex items-center justify-center text-xs text-slate-400 print:text-transparent mb-4"
          >
            [Pre-Printed Letterhead Space: {settings.preprintedTopMarginMm} mm]
          </div>
        )}

        {/* 2. PATIENT DEMOGRAPHICS & REQUISITION METADATA BOX */}
        <div className="border border-slate-900 p-3 mb-5 bg-slate-50/40 print:bg-transparent">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-baseline">
                <span className="w-28 text-slate-600 font-medium shrink-0">
                  Patient Name
                </span>
                <span className="mr-2 text-slate-600">:</span>
                <span className="font-bold text-sm text-slate-950 uppercase tracking-tight">
                  {patient.patientName.trim()
                    ? `${patient.patientTitle} ${patient.patientName}`
                    : '________________________________'}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-600 font-medium shrink-0">
                  Age / Sex
                </span>
                <span className="mr-2 text-slate-600">:</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {patient.age.trim()
                    ? `${patient.age} ${patient.ageUnit}`
                    : '____'}{' '}
                  / {patient.gender}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-600 font-medium shrink-0">
                  Referred By
                </span>
                <span className="mr-2 text-slate-600">:</span>
                <span className="font-semibold text-slate-900">
                  {patient.referredBy.trim() || 'Self / OPD'}
                </span>
              </div>

              {patient.contactNumber.trim() !== '' && (
                <div className="flex items-baseline">
                  <span className="w-28 text-slate-600 font-medium shrink-0">
                    Contact No.
                  </span>
                  <span className="mr-2 text-slate-600">:</span>
                  <span className="font-mono text-slate-800 tabular-nums">
                    {patient.contactNumber}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-slate-300 sm:pl-5">
              <div className="flex items-baseline">
                <span className="w-28 text-slate-600 font-medium shrink-0">
                  Lab Reg. ID
                </span>
                <span className="mr-2 text-slate-600">:</span>
                <span className="font-mono font-bold text-slate-950 tabular-nums">
                  {patient.reportId}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-600 font-medium shrink-0">
                  Sample Date
                </span>
                <span className="mr-2 text-slate-600">:</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {patient.sampleDate}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-600 font-medium shrink-0">
                  Report Date
                </span>
                <span className="mr-2 text-slate-600">:</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {patient.reportDate}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-28 text-slate-600 font-medium shrink-0">
                  Specimen
                </span>
                <span className="mr-2 text-slate-600">:</span>
                <span className="font-medium text-slate-900">
                  {effectiveSpecimen}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EMPTY STATE IF NO SECTIONS SELECTED */}
        {!hasAnyBloodTest && !hasAnyUrineTest && !hasAnyPhysicalExam && (
          <div className="border border-dashed border-slate-300 p-10 text-center my-8">
            <p className="text-sm font-semibold text-slate-700">
              No Diagnostic Test Sections Selected for Report
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Enable Blood Test, Urine Test, or Physical Examination in the editor panel to populate the clinical report.
            </p>
          </div>
        )}

        {/* RENDER MAIN SECTIONS IN EXACT CONFIGURED ORDER */}
        {sectionOrder.map((secKey) => renderSectionByKey(secKey))}

        {/* CLINICAL REMARKS / INTERPRETATION */}
        {patient.labRemarks.trim() !== '' && (
          <div className="border border-slate-800 p-3 mb-4 text-xs bg-slate-50/50 print:bg-transparent">
            <div className="font-bold text-slate-900 uppercase tracking-tight mb-1">
              Pathology Remarks / Clinical Interpretation:
            </div>
            <p className="text-slate-800 whitespace-pre-line leading-relaxed">
              {patient.labRemarks}
            </p>
          </div>
        )}

        <div className="text-center font-mono text-[11px] text-slate-500 my-4 tracking-widest uppercase">
          *** End of Diagnostic Report ***
        </div>
      </div>

      {/* 4. SIGNATORY & FOOTER BLOCK */}
      <div className="pt-6 border-t border-slate-900 mt-4">
        <div className="grid grid-cols-2 gap-8 items-end mb-4">
          <div className="text-left">
            <div className="h-10" />
            <div className="border-t border-slate-800 inline-block pt-1 pr-8">
              <div className="text-xs font-bold text-slate-950">
                {settings.technicianName}
              </div>
              <div className="text-[11px] text-slate-600">
                {settings.technicianQualification}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="h-10" />
            <div className="border-t border-slate-800 inline-block pt-1 pl-8 text-right">
              <div className="text-xs font-bold text-slate-950">
                {settings.pathologistName}
              </div>
              <div className="text-[11px] text-slate-600">
                {settings.pathologistQualification}
              </div>
            </div>
          </div>
        </div>

        {settings.printHeaderMode === 'full-letterhead' && (
          <div className="border-t border-slate-200 pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-600">
            <span>{settings.footerNote}</span>
            <span className="font-mono shrink-0 font-semibold text-slate-800">
              {settings.labName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
