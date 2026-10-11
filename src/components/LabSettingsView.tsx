import React from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { LabSettings } from '../types/lab';
import { DEFAULT_LAB_SETTINGS } from '../data/defaultCatalog';

interface LabSettingsViewProps {
  settings: LabSettings;
  onChange: (updated: LabSettings) => void;
}

export const LabSettingsView: React.FC<LabSettingsViewProps> = ({
  settings,
  onChange,
}) => {
  const [savedNotice, setSavedNotice] = React.useState(false);

  const triggerSaved = (updated: LabSettings) => {
    onChange(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laboratory Profile & Print Configuration
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure Babar Patho Lab letterhead details, signatory credentials, and A4 printer layout margins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="w-4 h-4" /> Changes applied automatically
            </span>
          )}
          <button
            type="button"
            onClick={() => triggerSaved(DEFAULT_LAB_SETTINGS)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Letterhead Identity */}
        <div className="border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
            01. Laboratory Header & Contact Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Laboratory Name (Header Title)
            </label>
            <input
              type="text"
              value={settings.labName}
              onChange={(e) =>
                triggerSaved({ ...settings, labName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Tagline / Subtitle
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) =>
                triggerSaved({ ...settings, tagline: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration / License No.
              </label>
              <input
                type="text"
                value={settings.registrationNo}
                onChange={(e) =>
                  triggerSaved({ ...settings, registrationNo: e.target.value })
                }
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lab Working Hours
              </label>
              <input
                type="text"
                value={settings.timings}
                onChange={(e) =>
                  triggerSaved({ ...settings, timings: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={settings.addressLine1}
              onChange={(e) =>
                triggerSaved({ ...settings, addressLine1: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address Line 2 / City &amp; Pin
            </label>
            <input
              type="text"
              value={settings.addressLine2}
              onChange={(e) =>
                triggerSaved({ ...settings, addressLine2: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Phone
              </label>
              <input
                type="text"
                value={settings.phonePrimary}
                onChange={(e) =>
                  triggerSaved({ ...settings, phonePrimary: e.target.value })
                }
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Secondary Phone
              </label>
              <input
                type="text"
                value={settings.phoneSecondary}
                onChange={(e) =>
                  triggerSaved({ ...settings, phoneSecondary: e.target.value })
                }
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lab Email
              </label>
              <input
                type="text"
                value={settings.email}
                onChange={(e) =>
                  triggerSaved({ ...settings, email: e.target.value })
                }
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Signatories & Print Paper Format */}
        <div className="space-y-6">
          <div className="border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
              02. Report Signatories &amp; Footer
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Left Signatory (Lab Technologist)
                </label>
                <input
                  type="text"
                  value={settings.technicianName}
                  onChange={(e) =>
                    triggerSaved({ ...settings, technicianName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technologist Qualification
                </label>
                <input
                  type="text"
                  value={settings.technicianQualification}
                  onChange={(e) =>
                    triggerSaved({
                      ...settings,
                      technicianQualification: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Right Signatory (Pathologist / In-Charge)
                </label>
                <input
                  type="text"
                  value={settings.pathologistName}
                  onChange={(e) =>
                    triggerSaved({
                      ...settings,
                      pathologistName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pathologist Qualification
                </label>
                <input
                  type="text"
                  value={settings.pathologistQualification}
                  onChange={(e) =>
                    triggerSaved({
                      ...settings,
                      pathologistQualification: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Footer Disclaimer Note
              </label>
              <textarea
                rows={2}
                value={settings.footerNote}
                onChange={(e) =>
                  triggerSaved({ ...settings, footerNote: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
              03. Printer Paper &amp; Table Columns
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Letterhead Printing Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    triggerSaved({
                      ...settings,
                      printHeaderMode: 'full-letterhead',
                    })
                  }
                  className={`p-3 text-left border rounded transition-colors ${
                    settings.printHeaderMode === 'full-letterhead'
                      ? 'border-blue-600 bg-blue-50/40 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">
                    Print Full Letterhead Header
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    For plain white A4 paper. Prints Babar Patho Lab header &amp; footer.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerSaved({
                      ...settings,
                      printHeaderMode: 'preprinted-pad',
                    })
                  }
                  className={`p-3 text-left border rounded transition-colors ${
                    settings.printHeaderMode === 'preprinted-pad'
                      ? 'border-blue-600 bg-blue-50/40 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">
                    Pre-Printed Letterhead Pad
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Leaves top blank space for existing printed lab stationery.
                  </div>
                </button>
              </div>
            </div>

            {settings.printHeaderMode === 'preprinted-pad' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pre-Printed Top Header Space (in millimeters: {settings.preprintedTopMarginMm} mm)
                </label>
                <input
                  type="range"
                  min={20}
                  max={85}
                  value={settings.preprintedTopMarginMm}
                  onChange={(e) =>
                    triggerSaved({
                      ...settings,
                      preprintedTopMarginMm: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.showReferenceRanges}
                  onChange={(e) =>
                    triggerSaved({
                      ...settings,
                      showReferenceRanges: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-xs font-medium text-slate-800">
                  Show Biological Reference Interval (Normal Range) Column on Report
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.showMethodColumn}
                  onChange={(e) =>
                    triggerSaved({
                      ...settings,
                      showMethodColumn: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-xs font-medium text-slate-800">
                  Show Analytical Method Column on Report
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
