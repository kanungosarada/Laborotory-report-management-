import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LabReport,
  LabSettings,
  SectionKey,
  TestParameter,
  WidalDilutionRow,
} from '../types/lab';

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

function formatParamResult(param: TestParameter): string {
  const val = param.result.trim();
  if (!val) return '__________________';
  const unitStr = param.unit ? ` ${param.unit}` : '';
  const flagStr =
    param.flag === 'critical'
      ? ' [CRITICAL]'
      : param.flag === 'abnormal'
      ? ' [ABNORMAL]'
      : '';
  return `${val}${unitStr}${flagStr}`;
}

export function generateReportPdfDoc(
  report: LabReport,
  settings: LabSettings
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const {
    patient,
    blood,
    urine,
    physicalExam,
    hideEmptyRowsOnPrint,
    sectionOrder = ['blood', 'urine', 'physical'],
  } = report;

  // Determine effective specimen string
  const isDefaultSpecimen =
    patient.specimen === 'Whole Blood / Serum / Mid-Stream Urine' ||
    patient.specimen.trim() === '';
  let effectiveSpecimen = patient.specimen;
  if (isDefaultSpecimen) {
    if (blood.enabled && !urine.enabled) {
      effectiveSpecimen = 'EDTA Whole Blood & Plain Serum';
    } else if (!blood.enabled && urine.enabled) {
      effectiveSpecimen = 'Mid-Stream Morning Urine';
    } else if (!blood.enabled && !urine.enabled && physicalExam.enabled) {
      effectiveSpecimen = 'Clinical Physical Assessment';
    } else {
      effectiveSpecimen = 'Whole Blood / Serum / Urine';
    }
  }

  let cursorY = margin;

  // 1. HEADER OR PRE-PRINTED TOP SPACE
  if (settings.printHeaderMode === 'full-letterhead') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(`Reg. No.: ${settings.registrationNo}`, margin, cursorY + 3);
    doc.text(settings.timings, pageWidth - margin, cursorY + 3, {
      align: 'right',
    });

    cursorY += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);

    cursorY += 5;

    // BPL Emblem Box
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, cursorY - 2, 12, 12, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('BPL', margin + 6, cursorY + 5.2, { align: 'center' });

    // Lab Name & Address
    const titleX = margin + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(settings.labName.toUpperCase(), titleX, cursorY + 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(settings.tagline, titleX, cursorY + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const fullAddress = `${settings.addressLine1}${
      settings.addressLine2 ? ', ' + settings.addressLine2 : ''
    }`;
    doc.text(fullAddress, titleX, cursorY + 11.5);

    // Contact Details on Right
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Tel: ${settings.phonePrimary}`,
      pageWidth - margin,
      cursorY + 2.5,
      { align: 'right' }
    );
    if (settings.phoneSecondary) {
      doc.setFont('courier', 'normal');
      doc.text(
        `Alt: ${settings.phoneSecondary}`,
        pageWidth - margin,
        cursorY + 6.5,
        { align: 'right' }
      );
    }
    if (settings.email) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(settings.email, pageWidth - margin, cursorY + 10.5, {
        align: 'right',
      });
    }

    cursorY += 15;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.7);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 4;
  } else {
    cursorY = Math.max(margin, settings.preprintedTopMarginMm);
  }

  // 2. PATIENT DEMOGRAPHICS BOX
  const boxHeight = patient.contactNumber.trim() ? 24 : 20;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.rect(margin, cursorY, contentWidth, boxHeight);

  const midX = margin + contentWidth * 0.54;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(midX, cursorY + 2, midX, cursorY + boxHeight - 2);

  const leftLabelX = margin + 3;
  const leftValX = margin + 28;
  const rightLabelX = midX + 4;
  const rightValX = midX + 28;

  let rowY = cursorY + 5;
  doc.setFontSize(8.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Patient Name :', leftLabelX, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const pName = patient.patientName.trim()
    ? `${patient.patientTitle} ${patient.patientName}`.toUpperCase()
    : '____________________________';
  doc.text(pName, leftValX, rowY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Lab Reg. ID :', rightLabelX, rowY);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(patient.reportId || '—', rightValX, rowY);

  rowY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Age / Sex    :', leftLabelX, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const ageStr = `${
    patient.age.trim() ? `${patient.age} ${patient.ageUnit}` : '____'
  } / ${patient.gender}`;
  doc.text(ageStr, leftValX, rowY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Sample Date :', rightLabelX, rowY);
  doc.setFont('courier', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(patient.sampleDate || '—', rightValX, rowY);

  rowY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Referred By  :', leftLabelX, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(patient.referredBy.trim() || 'Self / OPD', leftValX, rowY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Report Date :', rightLabelX, rowY);
  doc.setFont('courier', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(patient.reportDate || '—', rightValX, rowY);

  rowY += 4.5;
  if (patient.contactNumber.trim()) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Contact No.  :', leftLabelX, rowY);
    doc.setFont('courier', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(patient.contactNumber, leftValX, rowY);
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Specimen    :', rightLabelX, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(effectiveSpecimen.substring(0, 32), rightValX, rowY);

  cursorY += boxHeight + 5;

  const totalCols =
    2 +
    (settings.showReferenceRanges ? 1 : 0) +
    (settings.showMethodColumn ? 1 : 0);

  const buildHeaders = (col1Title: string, col2Title: string) => {
    const headers = [col1Title, col2Title];
    if (settings.showReferenceRanges) headers.push('Reference Interval');
    if (settings.showMethodColumn) headers.push('Method');
    return [headers];
  };

  const buildRow = (
    name: string,
    result: string,
    ref: string,
    method?: string
  ) => {
    const row = [name, result];
    if (settings.showReferenceRanges) row.push(ref);
    if (settings.showMethodColumn) row.push(method || 'Standard');
    return row;
  };

  const renderBloodPdfSection = () => {
    if (!blood.enabled) return;
    const activeItems = blood.items.filter((item) => {
      if (item.type === 'standard') {
        return shouldRenderParam(item.param, hideEmptyRowsOnPrint);
      }
      if (item.type === 'widal') {
        return (
          item.included &&
          item.rows.some((r) => shouldRenderWidalRow(r, hideEmptyRowsOnPrint))
        );
      }
      if (item.type === 'blood-group') {
        if (!item.included) return false;
        if (
          hideEmptyRowsOnPrint &&
          item.aboGroup.trim() === '' &&
          item.rhFactor.trim() === ''
        )
          return false;
        return true;
      }
      return false;
    });

    if (activeItems.length === 0) return;

    if (cursorY > pageHeight - 60) {
      doc.addPage();
      cursorY = margin;
    }

    doc.setFillColor(15, 23, 42);
    doc.rect(margin, cursorY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(blood.sectionTitle.toUpperCase(), margin + 3, cursorY + 4.5);
    cursorY += 6.5;

    const bloodBody: (
      | string
      | {
          content: string;
          colSpan?: number;
          styles?: Record<string, unknown>;
        }
    )[][] = [];

    activeItems.forEach((item, idx) => {
      if (item.type === 'standard') {
        bloodBody.push(
          buildRow(
            `${idx + 1}. ${item.param.name}`,
            formatParamResult(item.param),
            item.param.referenceRange,
            item.param.method
          )
        );
      } else if (item.type === 'widal') {
        bloodBody.push([
          {
            content: `${idx + 1}. ${item.name.toUpperCase()}${
              item.method ? ' — ' + item.method : ''
            }`,
            colSpan: totalCols,
            styles: {
              fillColor: [241, 245, 249],
              fontStyle: 'bold',
              textColor: [15, 23, 42],
            },
          },
        ]);

        const visibleRows = item.rows.filter((r) =>
          shouldRenderWidalRow(r, hideEmptyRowsOnPrint)
        );
        for (const wRow of visibleRows) {
          const val = wRow.resultTitre.trim() || '__________________';
          const abn =
            wRow.flag !== 'normal' && wRow.resultTitre.trim()
              ? ' [REACTIVE]'
              : '';
          const gridSuffix =
            item.displayMode === 'grid'
              ? `  (1:20[${wRow.dilutions.d1_20}] 1:40[${wRow.dilutions.d1_40}] 1:80[${wRow.dilutions.d1_80}] 1:160[${wRow.dilutions.d1_160}] 1:320[${wRow.dilutions.d1_320}])`
              : '';
          bloodBody.push(
            buildRow(
              `   • ${wRow.label}`,
              `${val}${abn}${gridSuffix}`,
              wRow.referenceRange,
              'Agglutination'
            )
          );
        }
      } else if (item.type === 'blood-group') {
        const bgResult =
          item.aboGroup.trim() || item.rhFactor.trim()
            ? `${item.aboLabel}: ${item.aboGroup || '—'}   |   ${
                item.rhLabel
              }: ${item.rhFactor || '—'}`
            : `${item.aboLabel}: _______  |  ${item.rhLabel}: _______`;
        bloodBody.push(
          buildRow(
            `${idx + 1}. ${item.name}`,
            bgResult,
            item.referenceRange,
            item.method
          )
        );
      }
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: buildHeaders('Test Investigation', 'Observed Result'),
      body: bloodBody as never,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [15, 23, 42],
        lineColor: [180, 180, 180],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        lineColor: [15, 23, 42],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 65 },
        1: { font: 'courier', fontStyle: 'bold' },
      },
    });

    cursorY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 5;
  };

  const renderUrinePdfSection = () => {
    if (!urine.enabled) return;
    const activeSubs = urine.subSections
      .filter((sub) => sub.enabled)
      .map((sub) => ({
        ...sub,
        activeItems: sub.items.filter((p) =>
          shouldRenderParam(p, hideEmptyRowsOnPrint)
        ),
      }))
      .filter((sub) => sub.activeItems.length > 0);

    if (activeSubs.length === 0) return;

    if (cursorY > pageHeight - 60) {
      doc.addPage();
      cursorY = margin;
    }

    doc.setFillColor(15, 23, 42);
    doc.rect(margin, cursorY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(urine.sectionTitle.toUpperCase(), margin + 3, cursorY + 4.5);
    cursorY += 6.5;

    const urineBody: (
      | string
      | {
          content: string;
          colSpan?: number;
          styles?: Record<string, unknown>;
        }
    )[][] = [];

    for (const sub of activeSubs) {
      urineBody.push([
        {
          content: sub.title.toUpperCase(),
          colSpan: totalCols,
          styles: {
            fillColor: [241, 245, 249],
            fontStyle: 'bold',
            textColor: [15, 23, 42],
          },
        },
      ]);
      for (const p of sub.activeItems) {
        urineBody.push(
          buildRow(
            `   ${p.name}`,
            formatParamResult(p),
            p.referenceRange,
            p.method
          )
        );
      }
    }

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: buildHeaders('Urine Examination Parameter', 'Observed Result'),
      body: urineBody as never,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [15, 23, 42],
        lineColor: [180, 180, 180],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        lineColor: [15, 23, 42],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 65 },
        1: { font: 'courier', fontStyle: 'bold' },
      },
    });

    cursorY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 5;
  };

  const renderPhysicalPdfSection = () => {
    if (!physicalExam.enabled) return;
    const activeParams = physicalExam.parameters.filter((p) =>
      shouldRenderParam(p, hideEmptyRowsOnPrint)
    );
    if (activeParams.length === 0) return;

    if (cursorY > pageHeight - 55) {
      doc.addPage();
      cursorY = margin;
    }

    doc.setFillColor(15, 23, 42);
    doc.rect(margin, cursorY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      physicalExam.sectionTitle.toUpperCase(),
      margin + 3,
      cursorY + 4.5
    );
    cursorY += 6.5;

    const physBody = activeParams.map((p) =>
      buildRow(p.name, formatParamResult(p), p.referenceRange, p.method)
    );

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: buildHeaders('Physical Parameter', 'Observed Measurement'),
      body: physBody,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [15, 23, 42],
        lineColor: [180, 180, 180],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        lineColor: [15, 23, 42],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 65 },
        1: { font: 'courier', fontStyle: 'bold' },
      },
    });

    cursorY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 5;
  };

  // Render sections in exact configured order
  for (const secKey of sectionOrder as SectionKey[]) {
    if (secKey === 'blood') renderBloodPdfSection();
    if (secKey === 'urine') renderUrinePdfSection();
    if (secKey === 'physical') renderPhysicalPdfSection();
  }

  // REMARKS & SIGNATORY FOOTER
  if (patient.labRemarks.trim()) {
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.25);
    const splitRemarks = doc.splitTextToSize(
      patient.labRemarks.trim(),
      contentWidth - 6
    );
    const remHeight = 7 + splitRemarks.length * 4;
    doc.rect(margin, cursorY, contentWidth, remHeight);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(
      'PATHOLOGY REMARKS / CLINICAL INTERPRETATION:',
      margin + 3,
      cursorY + 4.5
    );
    doc.setFont('helvetica', 'normal');
    doc.text(splitRemarks, margin + 3, cursorY + 9);
    cursorY += remHeight + 4;
  }

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('*** END OF DIAGNOSTIC REPORT ***', pageWidth / 2, cursorY + 3, {
    align: 'center',
  });

  const footerStartY = Math.max(cursorY + 18, pageHeight - 34);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.line(margin, footerStartY, margin + 58, footerStartY);
  doc.line(
    pageWidth - margin - 62,
    footerStartY,
    pageWidth - margin,
    footerStartY
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.technicianName, margin, footerStartY + 4.5);
  doc.text(
    settings.pathologistName,
    pageWidth - margin,
    footerStartY + 4.5,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(settings.technicianQualification, margin, footerStartY + 8.5);
  doc.text(
    settings.pathologistQualification,
    pageWidth - margin,
    footerStartY + 8.5,
    { align: 'right' }
  );

  if (settings.printHeaderMode === 'full-letterhead') {
    const bottomY = footerStartY + 13;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, bottomY, pageWidth - margin, bottomY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(settings.footerNote.substring(0, 115), margin, bottomY + 4);
  }

  return doc;
}

export function downloadReportPdf(
  report: LabReport,
  settings: LabSettings
): string {
  const doc = generateReportPdfDoc(report, settings);
  const safeName = report.patient.patientName
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${report.patient.reportId || 'BPL-Report'}${
    safeName ? '_' + safeName : ''
  }.pdf`;
  doc.save(filename);
  return filename;
}

export function createReportPdfBlobUrl(
  report: LabReport,
  settings: LabSettings
): string {
  const doc = generateReportPdfDoc(report, settings);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

export function encodePrintPayload(
  report: LabReport,
  settings: LabSettings
): string {
  try {
    const json = JSON.stringify({ report, settings });
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  } catch {
    return '';
  }
}

export function decodePrintPayload(
  encoded: string
): { report: LabReport; settings: LabSettings } | null {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
