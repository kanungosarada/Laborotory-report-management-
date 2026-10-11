import React, { useEffect, useMemo, useState } from 'react';
import {
  Printer,
  Save,
  RotateCcw,
  FilePlus2,
  Check,
  Eye,
  Sliders,
  Download,
  ExternalLink,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  DEFAULT_LAB_SETTINGS,
  DEFAULT_MASTER_TEST_TEMPLATE,
  SAMPLE_SAVED_REPORTS,
  createBlankReport,
  normalizeReportSchema,
  syncReportWithMasterTemplate,
} from './data/defaultCatalog';
import {
  LabReport,
  LabSettings,
  MasterTestTemplate,
  SectionKey,
} from './types/lab';
import { PrintableReport } from './components/PrintableReport';
import { BloodSectionEditor } from './components/BloodSectionEditor';
import { UrineSectionEditor } from './components/UrineSectionEditor';
import { PhysicalExamEditor } from './components/PhysicalExamEditor';
import { SavedReportsView } from './components/SavedReportsView';
import {
  PresetProfileType,
  TestCatalogView,
} from './components/TestCatalogView';
import { LabSettingsView } from './components/LabSettingsView';
import { TestSettingsView } from './components/TestSettingsView';
import {
  createReportPdfBlobUrl,
  decodePrintPayload,
  downloadReportPdf,
  encodePrintPayload,
} from './utils/pdfGenerator';

type ActiveTab =
  | 'workbench'
  | 'test-settings'
  | 'saved'
  | 'catalog'
  | 'settings';

const STORAGE_KEY_REPORTS = 'babar_patho_lab_saved_reports_v2';
const STORAGE_KEY_SETTINGS = 'babar_patho_lab_settings_v2';
const STORAGE_KEY_SEQ = 'babar_patho_lab_seq_v2';
const STORAGE_KEY_ACTIVE_DRAFT = 'babar_patho_lab_active_draft_v2';
const STORAGE_KEY_MASTER_TEMPLATE = 'babar_patho_lab_master_template_v2';

export default function App() {
  // Check if opened in Standalone Print Mode tab (?printmode=1)
  const isStandalonePrintTab = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('printmode') === '1';
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('workbench');

  // Sequence counter for Lab Report IDs
  const [seqCounter, setSeqCounter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEQ);
      return saved ? parseInt(saved, 10) : 1042;
    } catch {
      return 1042;
    }
  });

  // Master Test Template (customizable in Test Settings)
  const [masterTemplate, setMasterTemplate] = useState<MasterTestTemplate>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_MASTER_TEMPLATE);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.blood?.items && parsed?.urine?.subSections) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
      return structuredClone(DEFAULT_MASTER_TEST_TEMPLATE);
    }
  );

  // Lab settings
  const [settings, setSettings] = useState<LabSettings>(() => {
    try {
      if (window.location.hash.startsWith('#payload=')) {
        const decoded = decodePrintPayload(
          window.location.hash.replace('#payload=', '')
        );
        if (decoded?.settings) return decoded.settings;
      }
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved
        ? { ...DEFAULT_LAB_SETTINGS, ...JSON.parse(saved) }
        : DEFAULT_LAB_SETTINGS;
    } catch {
      return DEFAULT_LAB_SETTINGS;
    }
  });

  // Saved reports archive
  const [savedReports, setSavedReports] = useState<LabReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          return list.map((r) => normalizeReportSchema(r));
        }
      }
    } catch {
      // ignore
    }
    return SAMPLE_SAVED_REPORTS;
  });

  // Current active report in Workbench
  const [currentReport, setCurrentReport] = useState<LabReport>(() => {
    try {
      if (window.location.hash.startsWith('#payload=')) {
        const decoded = decodePrintPayload(
          window.location.hash.replace('#payload=', '')
        );
        if (decoded?.report) return normalizeReportSchema(decoded.report);
      }
      const savedDraft = localStorage.getItem(STORAGE_KEY_ACTIVE_DRAFT);
      if (savedDraft) {
        return normalizeReportSchema(JSON.parse(savedDraft));
      }
    } catch {
      // ignore
    }
    return createBlankReport(1042, masterTemplate);
  });

  // Print modal state
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [lastDownloadedPdfName, setLastDownloadedPdfName] = useState<
    string | null
  >(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile preview toggle when on narrow screens
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>(
    'editor'
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_MASTER_TEMPLATE,
        JSON.stringify(masterTemplate)
      );
    } catch {
      // ignore
    }
  }, [masterTemplate]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(savedReports));
    } catch {
      // ignore
    }
  }, [savedReports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEQ, String(seqCounter));
    } catch {
      // ignore
    }
  }, [seqCounter]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_ACTIVE_DRAFT,
        JSON.stringify(currentReport)
      );
    } catch {
      // ignore
    }
  }, [currentReport]);

  // If opened in standalone print mode (?printmode=1), automatically trigger window.print()
  useEffect(() => {
    if (isStandalonePrintTab) {
      const timer = setTimeout(() => {
        try {
          window.focus();
          window.print();
        } catch {
          // ignore
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isStandalonePrintTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Update Master Template & sync into current report
  const handleMasterTemplateUpdate = (updatedTemplate: MasterTestTemplate) => {
    setMasterTemplate(updatedTemplate);
    setCurrentReport((prev) =>
      syncReportWithMasterTemplate(prev, updatedTemplate)
    );
  };

  // Move top-level section order in active report & master template
  const moveMainSectionOrder = (index: number, dir: -1 | 1) => {
    const order = currentReport.sectionOrder || ['blood', 'urine', 'physical'];
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const nextOrder = [...order];
    const [moved] = nextOrder.splice(index, 1);
    nextOrder.splice(target, 0, moved);

    setCurrentReport({ ...currentReport, sectionOrder: nextOrder });
    setMasterTemplate({ ...masterTemplate, sectionOrder: nextOrder });
    showToast('Rearranged report section order');
  };

  // Construct standalone print URL with encoded report + settings in hash
  const standalonePrintUrl = useMemo(() => {
    const encoded = encodePrintPayload(currentReport, settings);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?printmode=1#payload=${encoded}`;
  }, [currentReport, settings]);

  const handleDownloadPdf = (rep: LabReport = currentReport) => {
    try {
      const filename = downloadReportPdf(rep, settings);
      setLastDownloadedPdfName(filename);
      showToast(`Downloaded A4 PDF: ${filename}`);
    } catch {
      showToast('Could not generate PDF file');
    }
  };

  const handlePrint = (repToPrint?: LabReport) => {
    const targetReport = repToPrint || currentReport;
    if (repToPrint) {
      setCurrentReport(structuredClone(repToPrint));
    }

    let isEmbeddedIframe = false;
    try {
      isEmbeddedIframe = window.self !== window.top;
    } catch {
      isEmbeddedIframe = true;
    }

    if (isEmbeddedIframe) {
      try {
        const blobUrl = createReportPdfBlobUrl(targetReport, settings);
        setPdfBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return blobUrl;
        });
        const filename = downloadReportPdf(targetReport, settings);
        setLastDownloadedPdfName(filename);
      } catch {
        // ignore
      }
      setPrintModalOpen(true);
      try {
        window.focus();
        window.print();
      } catch {
        // ignore sandbox error
      }
    } else {
      setTimeout(() => {
        window.focus();
        window.print();
      }, 100);
    }
  };

  const handleSaveReport = () => {
    const updatedReport: LabReport = {
      ...currentReport,
      updatedAt: new Date().toISOString(),
    };
    setCurrentReport(updatedReport);
    setSavedReports((prev) => {
      const exists = prev.some((r) => r.id === updatedReport.id);
      if (exists) {
        return prev.map((r) => (r.id === updatedReport.id ? updatedReport : r));
      }
      return [updatedReport, ...prev];
    });
    showToast(`Report ${updatedReport.patient.reportId} saved to archive`);
  };

  const handleNewBlankReport = () => {
    const nextSeq = seqCounter + 1;
    setSeqCounter(nextSeq);
    setCurrentReport(createBlankReport(nextSeq, masterTemplate));
    setActiveTab('workbench');
    showToast(`Started new blank report BPL-2026-${nextSeq}`);
  };

  const handleClearResultsOnly = () => {
    setCurrentReport((prev) => {
      const next = structuredClone(prev);
      next.blood.items = next.blood.items.map((item) => {
        if (item.type === 'standard') {
          return {
            ...item,
            param: { ...item.param, result: '', flag: 'normal' },
          };
        }
        if (item.type === 'widal') {
          return {
            ...item,
            rows: item.rows.map((r) => ({
              ...r,
              resultTitre: '',
              flag: 'normal',
              dilutions: {
                d1_20: '-',
                d1_40: '-',
                d1_80: '-',
                d1_160: '-',
                d1_320: '-',
              },
            })),
          };
        }
        return { ...item, aboGroup: '', rhFactor: '' };
      });

      next.urine.subSections = next.urine.subSections.map((sub) => ({
        ...sub,
        items: sub.items.map((p) => ({ ...p, result: '', flag: 'normal' })),
      }));

      next.physicalExam.parameters = next.physicalExam.parameters.map((p) => ({
        ...p,
        result: '',
        flag: 'normal',
      }));

      return next;
    });
    showToast('Cleared all test result values');
  };

  // Preset Profile Selector ("Only Urine Test", "Only Blood Test", etc.)
  const applyPresetProfile = (preset: PresetProfileType) => {
    setCurrentReport((prev) => {
      const next = structuredClone(prev) as LabReport;

      const setAllBloodIncluded = (included: boolean) => {
        next.blood.items = next.blood.items.map((item) => {
          if (item.type === 'standard') {
            return { ...item, param: { ...item.param, included } };
          }
          if (item.type === 'widal') {
            return {
              ...item,
              included,
              rows: item.rows.map((r) => ({ ...r, included })),
            };
          }
          return { ...item, included };
        });
      };

      const setAllUrineIncluded = (included: boolean) => {
        next.urine.subSections = next.urine.subSections.map((sub) => ({
          ...sub,
          enabled: included,
          items: sub.items.map((p) => ({ ...p, included })),
        }));
      };

      if (preset === 'complete') {
        next.blood.enabled = true;
        setAllBloodIncluded(true);
        next.urine.enabled = true;
        setAllUrineIncluded(true);
        next.physicalExam.enabled = false;
        next.patient.specimen = 'Whole Blood / Serum / Mid-Stream Urine';
      } else if (preset === 'urine-only') {
        next.blood.enabled = false;
        next.urine.enabled = true;
        setAllUrineIncluded(true);
        next.physicalExam.enabled = false;
        next.patient.specimen = 'Mid-Stream Morning Urine';
      } else if (preset === 'blood-only') {
        next.blood.enabled = true;
        setAllBloodIncluded(true);
        next.urine.enabled = false;
        next.physicalExam.enabled = false;
        next.patient.specimen = 'EDTA Whole Blood & Plain Serum';
      } else if (preset === 'urine-physical-only') {
        next.blood.enabled = false;
        next.urine.enabled = true;
        next.urine.subSections = next.urine.subSections.map((sub, i) => ({
          ...sub,
          enabled: i === 0,
          items: sub.items.map((p) => ({ ...p, included: i === 0 })),
        }));
        next.physicalExam.enabled = false;
        next.patient.specimen = 'Urine Specimen';
      } else if (preset === 'urine-chemical-only') {
        next.blood.enabled = false;
        next.urine.enabled = true;
        next.urine.subSections = next.urine.subSections.map((sub, i) => ({
          ...sub,
          enabled: i === 1,
          items: sub.items.map((p) => ({ ...p, included: i === 1 })),
        }));
        next.physicalExam.enabled = false;
        next.patient.specimen = 'Urine Specimen';
      } else if (preset === 'urine-microscopic-only') {
        next.blood.enabled = false;
        next.urine.enabled = true;
        next.urine.subSections = next.urine.subSections.map((sub, i) => ({
          ...sub,
          enabled: i === 2,
          items: sub.items.map((p) => ({ ...p, included: i === 2 })),
        }));
        next.physicalExam.enabled = false;
        next.patient.specimen = 'Centrifuged Urine Sediment';
      } else if (preset === 'fever-profile') {
        next.blood.enabled = true;
        next.blood.items = next.blood.items.map((item) => {
          if (item.type === 'widal') {
            return {
              ...item,
              included: true,
              rows: item.rows.map((r) => ({ ...r, included: true })),
            };
          }
          if (item.type === 'blood-group') {
            return { ...item, included: false };
          }
          const code = item.param.code.toUpperCase();
          const isFever = ['MP', 'CRP', 'ESR'].includes(code);
          return { ...item, param: { ...item.param, included: isFever } };
        });
        next.urine.enabled = false;
        next.physicalExam.enabled = false;
        next.patient.specimen = 'Whole Blood & Serum';
      } else if (preset === 'rheumatology-profile') {
        next.blood.enabled = true;
        next.blood.items = next.blood.items.map((item) => {
          if (item.type !== 'standard') {
            return { ...item, included: false };
          }
          const code = item.param.code.toUpperCase();
          const isRheum = ['CRP', 'ASO', 'RA', 'ESR'].includes(code);
          return { ...item, param: { ...item.param, included: isRheum } };
        });
        next.urine.enabled = false;
        next.physicalExam.enabled = false;
        next.patient.specimen = 'Plain Serum & Citrated Blood';
      } else if (preset === 'blood-group-only') {
        next.blood.enabled = true;
        next.blood.items = next.blood.items.map((item) => {
          if (item.type === 'blood-group') {
            return { ...item, included: true };
          }
          if (item.type === 'widal') {
            return { ...item, included: false };
          }
          return { ...item, param: { ...item.param, included: false } };
        });
        next.urine.enabled = false;
        next.physicalExam.enabled = false;
        next.patient.specimen = 'EDTA Whole Blood';
      }

      return next;
    });
    setActiveTab('workbench');
    showToast('Report sections customized');
  };

  // ===========================================================================
  // STANDALONE PRINT TAB MODE (?printmode=1)
  // ===========================================================================
  if (isStandalonePrintTab) {
    return (
      <div className="min-h-screen bg-slate-100 print:bg-white py-6 print:py-0">
        <div className="no-print max-w-[210mm] mx-auto mb-4 bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold">
              {settings.labName} — Dedicated Print View
            </div>
            <div className="text-xs text-slate-300">
              Press Ctrl+P (or Cmd+P) or click Print Now to send to your printer.
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleDownloadPdf(currentReport)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download A4 PDF
            </button>
            <button
              type="button"
              onClick={() => {
                window.focus();
                window.print();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Now
            </button>
          </div>
        </div>
        <PrintableReport report={currentReport} settings={settings} />
      </div>
    );
  }

  const orderedSections: SectionKey[] = currentReport.sectionOrder || [
    'blood',
    'urine',
    'physical',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* =====================================================================
          TOP NAVIGATION BAR (STRICT 3-ZONE TOP BAR CONTRACT, HIDDEN ON PRINT)
          ===================================================================== */}
      <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <a
          href="#workbench"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('workbench');
          }}
          className="text-lg font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0"
        >
          BABAR PATHO LAB
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#workbench"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('workbench');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'workbench'
                ? 'text-slate-950 font-semibold underline decoration-blue-600 decoration-2 underline-offset-8'
                : 'hover:text-slate-950'
            }`}
          >
            Report Workbench
          </a>
          <a
            href="#test-settings"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('test-settings');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'test-settings'
                ? 'text-slate-950 font-semibold underline decoration-blue-600 decoration-2 underline-offset-8'
                : 'hover:text-slate-950'
            }`}
          >
            Test Settings
          </a>
          <a
            href="#saved"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('saved');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'saved'
                ? 'text-slate-950 font-semibold underline decoration-blue-600 decoration-2 underline-offset-8'
                : 'hover:text-slate-950'
            }`}
          >
            Saved Reports ({savedReports.length})
          </a>
          <a
            href="#catalog"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('catalog');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'catalog'
                ? 'text-slate-950 font-semibold underline decoration-blue-600 decoration-2 underline-offset-8'
                : 'hover:text-slate-950'
            }`}
          >
            Test Catalog
          </a>
          <a
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('settings');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'settings'
                ? 'text-slate-950 font-semibold underline decoration-blue-600 decoration-2 underline-offset-8'
                : 'hover:text-slate-950'
            }`}
          >
            Lab Settings
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handlePrint()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / PDF Report
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar (visible only on small screens, hidden on print) */}
      <div className="no-print md:hidden flex items-center justify-between gap-1 px-4 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
        {(
          [
            ['workbench', 'Workbench'],
            ['test-settings', 'Test Settings'],
            ['saved', `Saved (${savedReports.length})`],
            ['catalog', 'Catalog'],
            ['settings', 'Lab Settings'],
          ] as const
        ).map(([tabKey, label]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === tabKey
                ? 'bg-white text-slate-950 font-semibold shadow-xs'
                : 'text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* =====================================================================
          PRINT & PDF DISPATCH MODAL
          ===================================================================== */}
      {printModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-4xl w-full p-5 space-y-4 max-h-[94vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Print &amp; A4 PDF Report — {currentReport.patient.reportId}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Use the printer icon inside the PDF viewer below, open the dedicated print tab, or print the downloaded PDF file:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {lastDownloadedPdfName && (
              <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs text-emerald-900 flex items-center gap-2 shrink-0">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{lastDownloadedPdfName}</strong> has been downloaded automatically to your computer.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
              <a
                href={standalonePrintUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setPrintModalOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <div className="text-left">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Printer className="w-4 h-4" />
                    Open Print Tab &amp; Print Immediately
                  </div>
                  <div className="text-[11px] text-blue-100 mt-0.5">
                    Opens in a full browser tab and launches system print.
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0 ml-2" />
              </a>

              <button
                type="button"
                onClick={() => handleDownloadPdf(currentReport)}
                className="flex items-center justify-between px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors cursor-pointer"
              >
                <div className="text-left">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    Download A4 PDF File (.pdf)
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Saves a vector A4 PDF formatted for Babar Patho Lab.
                  </div>
                </div>
                <Download className="w-4 h-4 shrink-0 ml-2" />
              </button>
            </div>

            {pdfBlobUrl && (
              <div className="flex-1 min-h-[380px] border border-slate-300 bg-slate-100 overflow-hidden">
                <iframe
                  src={pdfBlobUrl}
                  title="Babar Patho Lab A4 PDF Report"
                  className="w-full h-full min-h-[380px]"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-medium">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          MAIN WORKSPACE CONTENT
          ===================================================================== */}
      <main className="flex-1">
        {activeTab === 'test-settings' && (
          <div className="no-print">
            <TestSettingsView
              masterTemplate={masterTemplate}
              onChange={handleMasterTemplateUpdate}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="no-print">
            <SavedReportsView
              reports={savedReports}
              onLoadReport={(rep) => {
                setCurrentReport(normalizeReportSchema(structuredClone(rep)));
                setActiveTab('workbench');
                showToast(`Loaded report ${rep.patient.reportId}`);
              }}
              onPrintReport={(rep) => {
                handlePrint(normalizeReportSchema(rep));
              }}
              onDuplicateReport={(rep) => {
                const nextSeq = seqCounter + 1;
                setSeqCounter(nextSeq);
                const copy = normalizeReportSchema(structuredClone(rep));
                copy.id = `rep-${Date.now()}`;
                copy.patient.reportId = `BPL-${new Date().getFullYear()}-${String(
                  nextSeq
                ).padStart(4, '0')}`;
                setCurrentReport(copy);
                setActiveTab('workbench');
                showToast(`Duplicated as ${copy.patient.reportId}`);
              }}
              onDeleteReport={(id) => {
                setSavedReports((prev) => prev.filter((r) => r.id !== id));
                showToast('Report removed from archive');
              }}
              onNewReport={handleNewBlankReport}
            />
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="no-print">
            <TestCatalogView onStartPresetReport={applyPresetProfile} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="no-print">
            <LabSettingsView settings={settings} onChange={setSettings} />
          </div>
        )}

        {/* ===================================================================
            REPORT WORKBENCH (EDITOR + LIVE A4 PRINTABLE PREVIEW)
            =================================================================== */}
        <div
          className={
            activeTab === 'workbench' ? 'block' : 'hidden print:block'
          }
        >
          {/* Top Workspace Customization & Action Toolbar (no-print) */}
          <div className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Quick Report Section Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 mr-1.5 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  Report Sections:
                </span>
                <button
                  type="button"
                  onClick={() => applyPresetProfile('urine-only')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 ${
                    !currentReport.blood.enabled && currentReport.urine.enabled
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Only Urine Test
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetProfile('blood-only')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 ${
                    currentReport.blood.enabled && !currentReport.urine.enabled
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Only Blood Test
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetProfile('complete')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 ${
                    currentReport.blood.enabled && currentReport.urine.enabled
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Blood + Urine (Both)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetProfile('fever-profile')}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  Fever Profile (MP + Widal + CRP)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetProfile('blood-group-only')}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  Only Blood Group
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('test-settings')}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  + Add / Rearrange Tests
                </button>
              </div>

              {/* Right Workbench Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded cursor-pointer select-none whitespace-nowrap shrink-0">
                  <input
                    type="checkbox"
                    checked={currentReport.hideEmptyRowsOnPrint}
                    onChange={(e) =>
                      setCurrentReport({
                        ...currentReport,
                        hideEmptyRowsOnPrint: e.target.checked,
                      })
                    }
                    className="w-3.5 h-3.5 accent-blue-600 rounded"
                  />
                  <span>Hide Unfilled Rows on Report</span>
                </label>

                <button
                  type="button"
                  onClick={handleClearResultsOnly}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Results
                </button>

                <button
                  type="button"
                  onClick={handleNewBlankReport}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  <FilePlus2 className="w-3.5 h-3.5" />
                  New Patient
                </button>

                <button
                  type="button"
                  onClick={handleSaveReport}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Report
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf(currentReport)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download A4 PDF
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Mode Switcher */}
          <div className="no-print xl:hidden px-4 pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileViewMode('editor')}
              className={`flex-1 py-2 text-xs font-semibold rounded border ${
                mobileViewMode === 'editor'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              1. Enter Patient &amp; Test Results
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('preview')}
              className={`flex-1 py-2 text-xs font-semibold rounded border inline-flex items-center justify-center gap-1.5 ${
                mobileViewMode === 'preview'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              2. Live A4 Print Preview
            </button>
          </div>

          {/* Split-Screen Workstation Grid */}
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: PATIENT DEMOGRAPHICS & LABORATORY RESULT ENTRY */}
            <div
              className={`no-print xl:col-span-6 space-y-5 ${
                mobileViewMode === 'preview' ? 'hidden xl:block' : 'block'
              }`}
            >
              {/* Patient Details Card */}
              <div className="border border-slate-200 bg-white">
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                  <span className="text-sm font-bold tracking-wide uppercase">
                    Patient Demographics &amp; Specimen Registration
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {currentReport.patient.reportId}
                  </span>
                </div>

                <div className="p-4 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Title
                      </label>
                      <select
                        value={currentReport.patient.patientTitle}
                        onChange={(e) => {
                          const title = e.target.value;
                          let gender = currentReport.patient.gender;
                          if (title === 'Mr.' || title === 'Master')
                            gender = 'Male';
                          if (title === 'Mrs.' || title === 'Ms.')
                            gender = 'Female';
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              patientTitle: title,
                              gender,
                            },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Master">Master</option>
                        <option value="Baby">Baby</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>

                    <div className="sm:col-span-9">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Patient Full Name
                      </label>
                      <input
                        type="text"
                        value={currentReport.patient.patientName}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              patientName: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter patient full name..."
                        className="w-full px-3 py-1.5 text-sm font-semibold bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Age
                      </label>
                      <input
                        type="text"
                        value={currentReport.patient.age}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              age: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. 34"
                        className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Age Unit
                      </label>
                      <select
                        value={currentReport.patient.ageUnit}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              ageUnit: e.target.value as
                                | 'Years'
                                | 'Months'
                                | 'Days',
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      >
                        <option value="Years">Years</option>
                        <option value="Months">Months</option>
                        <option value="Days">Days</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gender / Sex
                      </label>
                      <select
                        value={currentReport.patient.gender}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              gender: e.target.value as
                                | 'Male'
                                | 'Female'
                                | 'Other',
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Lab Report ID
                      </label>
                      <input
                        type="text"
                        value={currentReport.patient.reportId}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              reportId: e.target.value,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-sm font-mono font-semibold tabular-nums bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Referred By (Doctor / Clinic)
                      </label>
                      <input
                        type="text"
                        value={currentReport.patient.referredBy}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              referredBy: e.target.value,
                            },
                          })
                        }
                        placeholder="Dr. Name or Self..."
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sample Date
                      </label>
                      <input
                        type="date"
                        value={currentReport.patient.sampleDate}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              sampleDate: e.target.value,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Report Date
                      </label>
                      <input
                        type="date"
                        value={currentReport.patient.reportDate}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              reportDate: e.target.value,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Specimen Type
                      </label>
                      <input
                        type="text"
                        value={currentReport.patient.specimen}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              specimen: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Whole Blood / Serum / Urine"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Patient Contact No. (Optional)
                      </label>
                      <input
                        type="text"
                        value={currentReport.patient.contactNumber}
                        onChange={(e) =>
                          setCurrentReport({
                            ...currentReport,
                            patient: {
                              ...currentReport.patient,
                              contactNumber: e.target.value,
                            },
                          })
                        }
                        placeholder="Phone number..."
                        className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RENDER DYNAMIC ORDERED SECTIONS WITH SECTION REORDER BAR */}
              {orderedSections.map((secKey, secIdx) => (
                <div key={secKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span className="font-mono font-semibold uppercase">
                      Section Order #{secIdx + 1}: {secKey.toUpperCase()} TEST
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={secIdx === 0}
                        onClick={() => moveMainSectionOrder(secIdx, -1)}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" /> Move Section Up
                      </button>
                      <button
                        type="button"
                        disabled={secIdx === orderedSections.length - 1}
                        onClick={() => moveMainSectionOrder(secIdx, 1)}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" /> Move Section Down
                      </button>
                    </div>
                  </div>

                  {secKey === 'blood' && (
                    <BloodSectionEditor
                      blood={currentReport.blood}
                      onChange={(updatedBlood) =>
                        setCurrentReport({
                          ...currentReport,
                          blood: updatedBlood,
                        })
                      }
                    />
                  )}

                  {secKey === 'urine' && (
                    <UrineSectionEditor
                      urine={currentReport.urine}
                      onChange={(updatedUrine) =>
                        setCurrentReport({
                          ...currentReport,
                          urine: updatedUrine,
                        })
                      }
                    />
                  )}

                  {secKey === 'physical' && (
                    <PhysicalExamEditor
                      physicalExam={currentReport.physicalExam}
                      onChange={(updatedPhys) =>
                        setCurrentReport({
                          ...currentReport,
                          physicalExam: updatedPhys,
                        })
                      }
                    />
                  )}
                </div>
              ))}

              {/* CLINICAL REMARKS & BOTTOM PRINT BAR */}
              <div className="border border-slate-200 bg-white p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Pathology Remarks / Clinical Interpretation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={currentReport.patient.labRemarks}
                  onChange={(e) =>
                    setCurrentReport({
                      ...currentReport,
                      patient: {
                        ...currentReport.patient,
                        labRemarks: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter any special clinical remarks, slide morphology notes, or doctor advice..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveReport}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Report to Archive
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(currentReport)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download A4 PDF
                    </button>

                    <a
                      href={standalonePrintUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Open &amp; Print A4 Report
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE A4 PRINT PREVIEW */}
            <div
              className={`xl:col-span-6 xl:sticky xl:top-20 ${
                mobileViewMode === 'editor'
                  ? 'hidden xl:block print:block'
                  : 'block'
              }`}
            >
              <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Live A4 Print Preview — {settings.labName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        printHeaderMode:
                          settings.printHeaderMode === 'full-letterhead'
                            ? 'preprinted-pad'
                            : 'full-letterhead',
                      })
                    }
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    {settings.printHeaderMode === 'full-letterhead'
                      ? 'Mode: Full Letterhead'
                      : `Mode: Pre-Printed Pad (${settings.preprintedTopMarginMm}mm)`}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(currentReport)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>

                  <a
                    href={standalonePrintUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Now
                  </a>
                </div>
              </div>

              <PrintableReport report={currentReport} settings={settings} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
