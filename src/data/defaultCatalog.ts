import {
  BloodTestSection,
  LabReport,
  LabSettings,
  MasterTestTemplate,
  PatientInfo,
  StandalonePhysicalSection,
  UrineTestSection,
} from '../types/lab';

export const DEFAULT_LAB_SETTINGS: LabSettings = {
  labName: 'BABAR PATHO LAB',
  tagline:
    'Clinical Pathology, Haematology, Biochemistry & Microbiology Diagnostic Centre',
  addressLine1: 'Main Hospital Road, Near Medical Square',
  addressLine2: 'Clinical Diagnostics Wing, Ground Floor',
  phonePrimary: '+91 98230 45112',
  phoneSecondary: '+91 94221 78900',
  email: 'reports@babarpatholab.in',
  registrationNo: 'REG/PATH/2026/BPL-089',
  timings: 'Mon – Sat: 7:30 AM to 8:30 PM · Sun: 8:00 AM to 1:00 PM',
  technicianName: 'M. Babar',
  technicianQualification: 'D.M.L.T. · Senior Lab Technologist',
  pathologistName: 'Dr. R. K. Deshmukh',
  pathologistQualification: 'M.D. (Pathology) · Consulting Pathologist',
  footerNote:
    'Clinical correlation is essential. Test results relate only to the specimen tested and are for the perusal of registered medical practitioners.',
  printHeaderMode: 'full-letterhead',
  preprintedTopMarginMm: 42,
  showReferenceRanges: true,
  showMethodColumn: true,
};

export function createBlankBloodSection(enabled = true): BloodTestSection {
  return {
    enabled,
    sectionTitle: 'HAEMATOLOGY, SEROLOGY & IMMUNOLOGY REPORT (BLOOD TEST)',
    departmentTag: 'DEPT: PATHOLOGY / SEROLOGY',
    items: [
      {
        id: 'blood-item-mp',
        type: 'standard',
        param: {
          id: 'blood-mp',
          code: 'MP',
          name: 'Malaria Parasite (MP)',
          included: true,
          result: '',
          unit: '',
          referenceRange: 'Not Detected',
          method: 'Microscopy / Rapid Antigen Card',
          flag: 'normal',
          quickOptions: [
            'Not Detected',
            'No Malaria Parasite Seen',
            'P. Vivax Seen (+)',
            'P. Falciparum Seen (+)',
            'P. Vivax & P. Falciparum (+)',
            'Negative',
          ],
        },
      },
      {
        id: 'blood-item-widal',
        type: 'widal',
        name: 'Widal Test for Enteric Fever (O, H, AH, BH)',
        included: true,
        displayMode: 'titre',
        method: 'Slide & Tube Agglutination',
        rows: [
          {
            id: 'widal-o',
            antigen: 'O',
            label: "S. Typhi 'O' (Somatic)",
            included: true,
            resultTitre: '',
            referenceRange: '< 1:80 (Non-Reactive)',
            flag: 'normal',
            dilutions: {
              d1_20: '-',
              d1_40: '-',
              d1_80: '-',
              d1_160: '-',
              d1_320: '-',
            },
          },
          {
            id: 'widal-h',
            antigen: 'H',
            label: "S. Typhi 'H' (Flagellar)",
            included: true,
            resultTitre: '',
            referenceRange: '< 1:80 (Non-Reactive)',
            flag: 'normal',
            dilutions: {
              d1_20: '-',
              d1_40: '-',
              d1_80: '-',
              d1_160: '-',
              d1_320: '-',
            },
          },
          {
            id: 'widal-ah',
            antigen: 'AH',
            label: "S. Paratyphi 'AH'",
            included: true,
            resultTitre: '',
            referenceRange: '< 1:80 (Non-Reactive)',
            flag: 'normal',
            dilutions: {
              d1_20: '-',
              d1_40: '-',
              d1_80: '-',
              d1_160: '-',
              d1_320: '-',
            },
          },
          {
            id: 'widal-bh',
            antigen: 'BH',
            label: "S. Paratyphi 'BH'",
            included: true,
            resultTitre: '',
            referenceRange: '< 1:80 (Non-Reactive)',
            flag: 'normal',
            dilutions: {
              d1_20: '-',
              d1_40: '-',
              d1_80: '-',
              d1_160: '-',
              d1_320: '-',
            },
          },
        ],
      },
      {
        id: 'blood-item-bg',
        type: 'blood-group',
        name: 'Blood Group (ABO & Rh Typing)',
        included: true,
        aboLabel: 'ABO Group',
        rhLabel: 'Rh (D) Factor',
        aboGroup: '',
        rhFactor: '',
        referenceRange: 'Immuno-Haematology Grouping',
        method: 'Slide / Tube Agglutination (Monoclonal Antisera)',
        aboQuickOptions: ["'A'", "'B'", "'AB'", "'O'"],
        rhQuickOptions: ['Positive (+ve)', 'Negative (-ve)'],
      },
      {
        id: 'blood-item-crp',
        type: 'standard',
        param: {
          id: 'blood-crp',
          code: 'CRP',
          name: 'C-Reactive Protein (CRP)',
          included: true,
          result: '',
          unit: 'mg/L',
          referenceRange: '< 6.0 mg/L (Negative)',
          method: 'Latex Agglutination / Turbidimetry',
          flag: 'normal',
          quickOptions: [
            'Negative',
            'Positive (+)',
            'Positive (++)',
            '3.2',
            '5.8',
            '12.4',
            '24.0',
            '48.0',
          ],
        },
      },
      {
        id: 'blood-item-aso',
        type: 'standard',
        param: {
          id: 'blood-aso',
          code: 'ASO',
          name: 'Anti-Streptolysin O (ASO)',
          included: true,
          result: '',
          unit: 'IU/mL',
          referenceRange: '< 200 IU/mL (Negative)',
          method: 'Latex Agglutination',
          flag: 'normal',
          quickOptions: [
            'Negative',
            'Positive (+)',
            '< 200',
            '110',
            '240',
            '400',
          ],
        },
      },
      {
        id: 'blood-item-ra',
        type: 'standard',
        param: {
          id: 'blood-ra',
          code: 'RA',
          name: 'Rheumatoid Factor (RA Test)',
          included: true,
          result: '',
          unit: 'IU/mL',
          referenceRange: '< 20 IU/mL (Negative)',
          method: 'Latex Agglutination',
          flag: 'normal',
          quickOptions: [
            'Negative',
            'Positive (+)',
            'Weakly Reactive',
            '< 20',
            '12.5',
            '36.0',
          ],
        },
      },
      {
        id: 'blood-item-esr',
        type: 'standard',
        param: {
          id: 'blood-esr',
          code: 'ESR',
          name: 'Erythrocyte Sedimentation Rate (ESR)',
          included: true,
          result: '',
          unit: 'mm / 1st Hr',
          referenceRange: 'Male: 0–15 mm/hr · Female: 0–20 mm/hr',
          method: 'Westergren Method',
          flag: 'normal',
          quickOptions: ['08', '12', '15', '22', '34', '45', '60'],
        },
      },
    ],
  };
}

export function createBlankUrineSection(enabled = true): UrineTestSection {
  return {
    enabled,
    sectionTitle: 'URINE ROUTINE & MICROSCOPIC EXAMINATION REPORT',
    departmentTag: 'DEPT: CLINICAL PATHOLOGY',
    subSections: [
      {
        id: 'urine-sub-physical',
        title: 'I. PHYSICAL TEST (MACROSCOPIC EXAMINATION)',
        enabled: true,
        items: [
          {
            id: 'urine-colour',
            code: 'COLOUR',
            name: 'Colour',
            included: true,
            result: '',
            unit: '',
            referenceRange: 'Pale Yellow / Straw',
            method: 'Visual Inspection',
            flag: 'normal',
            quickOptions: [
              'Pale Yellow',
              'Straw',
              'Yellow',
              'Dark Yellow',
              'Amber',
              'Reddish / Smoky',
              'Colourless',
            ],
          },
          {
            id: 'urine-transparency',
            code: 'TRANSPARENCY',
            name: 'Transparency',
            included: true,
            result: '',
            unit: '',
            referenceRange: 'Clear',
            method: 'Visual Inspection',
            flag: 'normal',
            quickOptions: [
              'Clear',
              'Slightly Turbid',
              'Turbid',
              'Cloudy',
              'Hazy',
            ],
          },
        ],
      },
      {
        id: 'urine-sub-chemical',
        title: 'II. CHEMICAL TEST (BIOCHEMICAL ANALYSIS)',
        enabled: true,
        items: [
          {
            id: 'urine-glucose',
            code: 'GLUCOSE',
            name: 'Glucose (Sugar)',
            included: true,
            result: '',
            unit: '',
            referenceRange: 'Nil (Absent)',
            method: 'Dipstick / Benedict Method',
            flag: 'normal',
            quickOptions: [
              'Nil',
              'Absent',
              'Trace',
              'Present (+)',
              'Present (++)',
              'Present (+++)',
              'Present (++++)',
            ],
          },
          {
            id: 'urine-protein',
            code: 'PROTEIN',
            name: 'Protein (Albumin)',
            included: true,
            result: '',
            unit: '',
            referenceRange: 'Nil (Absent)',
            method: 'Dipstick / Sulphosalicylic Acid',
            flag: 'normal',
            quickOptions: [
              'Nil',
              'Absent',
              'Trace',
              'Present (+)',
              'Present (++)',
              'Present (+++)',
              'Present (++++)',
            ],
          },
        ],
      },
      {
        id: 'urine-sub-microscopic',
        title: 'III. MICROSCOPIC TEST (CENTRIFUGED URINE SEDIMENT)',
        enabled: true,
        items: [
          {
            id: 'urine-pus',
            code: 'PUS',
            name: 'Pus Cells (Leukocytes)',
            included: true,
            result: '',
            unit: '/ hpf',
            referenceRange: '0 – 5 / hpf',
            method: 'Centrifuged Sediment Microscopy (40x)',
            flag: 'normal',
            quickOptions: [
              'Nil',
              '1-2',
              '2-4',
              '4-6',
              '6-8',
              '10-12',
              '15-20',
              'Plenty',
            ],
          },
          {
            id: 'urine-rbc',
            code: 'RBC',
            name: 'Red Blood Cells (RBC)',
            included: true,
            result: '',
            unit: '/ hpf',
            referenceRange: 'Nil (0 – 2 / hpf)',
            method: 'Centrifuged Sediment Microscopy (40x)',
            flag: 'normal',
            quickOptions: [
              'Nil',
              'Occasional',
              '1-2',
              '2-4',
              '4-6',
              '8-10',
              'Plenty',
            ],
          },
          {
            id: 'urine-crystal',
            code: 'CRYSTAL',
            name: 'Crystals',
            included: true,
            result: '',
            unit: '/ hpf',
            referenceRange: 'Nil (Absent)',
            method: 'Centrifuged Sediment Microscopy (40x)',
            flag: 'normal',
            quickOptions: [
              'Nil',
              'Calcium Oxalate (+)',
              'Calcium Oxalate (++)',
              'Uric Acid Crystals (+)',
              'Triple Phosphate (+)',
              'Amorphous Phosphates',
              'Amorphous Urates',
            ],
          },
          {
            id: 'urine-epithelial',
            code: 'EPITHELIAL',
            name: 'Epithelial Cells',
            included: true,
            result: '',
            unit: '/ hpf',
            referenceRange: 'Few (1 – 4 / hpf)',
            method: 'Centrifuged Sediment Microscopy (40x)',
            flag: 'normal',
            quickOptions: [
              'Nil',
              '1-2',
              '2-3',
              '3-5',
              'Few',
              'Moderate',
              'Plenty',
            ],
          },
          {
            id: 'urine-cast',
            code: 'CAST',
            name: 'Casts',
            included: true,
            result: '',
            unit: '/ lpf',
            referenceRange: 'Nil (Absent)',
            method: 'Centrifuged Sediment Microscopy (10x)',
            flag: 'normal',
            quickOptions: [
              'Nil',
              'Hyaline Cast (1-2)',
              'Granular Cast (+)',
              'WBC Cast (+)',
              'RBC Cast (+)',
              'Waxy Cast (+)',
            ],
          },
        ],
      },
    ],
  };
}

export function createBlankStandalonePhysicalSection(
  enabled = false
): StandalonePhysicalSection {
  return {
    enabled,
    sectionTitle: 'PHYSICAL EXAMINATION & CLINICAL VITALS REPORT',
    departmentTag: 'GENERAL PHYSICAL TEST',
    parameters: [
      {
        id: 'phys-bp',
        code: 'BP',
        name: 'Blood Pressure (BP)',
        included: true,
        result: '',
        unit: 'mmHg',
        referenceRange: '120 / 80 mmHg',
        method: 'Sphygmomanometer',
        flag: 'normal',
        quickOptions: ['120/80', '110/70', '130/85', '140/90', '150/95'],
      },
      {
        id: 'phys-pulse',
        code: 'PULSE',
        name: 'Pulse Rate',
        included: true,
        result: '',
        unit: 'bpm',
        referenceRange: '60 – 100 bpm',
        method: 'Radial Pulse / Oximetry',
        flag: 'normal',
        quickOptions: ['72', '76', '80', '84', '92', '104'],
      },
      {
        id: 'phys-temp',
        code: 'TEMP',
        name: 'Body Temperature',
        included: true,
        result: '',
        unit: '°F',
        referenceRange: '97.0 – 99.0 °F',
        method: 'Clinical Thermometer',
        flag: 'normal',
        quickOptions: ['98.4', '98.6', '99.8', '100.4', '101.2', '102.0'],
      },
      {
        id: 'phys-weight',
        code: 'WEIGHT',
        name: 'Weight',
        included: true,
        result: '',
        unit: 'kg',
        referenceRange: 'Adult Standard',
        method: 'Digital Scale',
        flag: 'normal',
        quickOptions: ['52', '58', '64', '70', '75', '82'],
      },
      {
        id: 'phys-height',
        code: 'HEIGHT',
        name: 'Height',
        included: false,
        result: '',
        unit: 'cm',
        referenceRange: 'Adult Standard',
        method: 'Stadiometer',
        flag: 'normal',
        quickOptions: ['155', '162', '168', '172', '178'],
      },
      {
        id: 'phys-spo2',
        code: 'SPO2',
        name: 'Oxygen Saturation (SpO2)',
        included: false,
        result: '',
        unit: '%',
        referenceRange: '95 – 100 %',
        method: 'Pulse Oximeter',
        flag: 'normal',
        quickOptions: ['99', '98', '97', '96', '94'],
      },
    ],
  };
}

export const DEFAULT_MASTER_TEST_TEMPLATE: MasterTestTemplate = {
  sectionOrder: ['blood', 'urine', 'physical'],
  blood: createBlankBloodSection(true),
  urine: createBlankUrineSection(true),
  physicalExam: createBlankStandalonePhysicalSection(false),
};

export function generateReportId(seqNumber = 1042): string {
  const now = new Date();
  const yr = now.getFullYear();
  return `BPL-${yr}-${String(seqNumber).padStart(4, '0')}`;
}

export function getTodayFormatted(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function createBlankReport(
  seqNumber = 1042,
  masterTemplate: MasterTestTemplate = DEFAULT_MASTER_TEST_TEMPLATE
): LabReport {
  const today = getTodayFormatted();
  const patient: PatientInfo = {
    reportId: generateReportId(seqNumber),
    patientTitle: 'Mr.',
    patientName: '',
    age: '',
    ageUnit: 'Years',
    gender: 'Male',
    referredBy: 'Self / OPD',
    sampleDate: today,
    reportDate: today,
    specimen: 'Whole Blood / Serum / Mid-Stream Urine',
    contactNumber: '',
    labRemarks: '',
    verifiedBy: 'M. Babar (D.M.L.T.)',
  };

  const clonedTemplate = structuredClone(masterTemplate);

  return {
    id: `rep-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    patient,
    sectionOrder: clonedTemplate.sectionOrder || ['blood', 'urine', 'physical'],
    blood: clonedTemplate.blood,
    urine: clonedTemplate.urine,
    physicalExam: clonedTemplate.physicalExam,
    hideEmptyRowsOnPrint: false,
  };
}

/**
 * Syncs structural changes made in Test Settings (reordering, new tests, edited names/units/ranges/quickOptions)
 * into the active report while preserving any result values the laboratorian already entered!
 */
export function syncReportWithMasterTemplate(
  currentReport: LabReport,
  master: MasterTestTemplate
): LabReport {
  const updated = structuredClone(currentReport);
  updated.sectionOrder = [...master.sectionOrder];

  // Sync Blood Section
  updated.blood.sectionTitle = master.blood.sectionTitle;
  updated.blood.departmentTag = master.blood.departmentTag;

  const existingBloodMap = new Map(
    updated.blood.items.map((item) => [item.id, item])
  );

  updated.blood.items = master.blood.items.map((masterItem) => {
    const existing = existingBloodMap.get(masterItem.id);
    if (!existing || existing.type !== masterItem.type) {
      return structuredClone(masterItem);
    }

    if (masterItem.type === 'standard' && existing.type === 'standard') {
      return {
        ...masterItem,
        param: {
          ...masterItem.param,
          result: existing.param.result,
          flag: existing.param.flag,
        },
      };
    }

    if (masterItem.type === 'widal' && existing.type === 'widal') {
      const existingRows = new Map(existing.rows.map((r) => [r.id, r]));
      return {
        ...masterItem,
        rows: masterItem.rows.map((mRow) => {
          const exRow = existingRows.get(mRow.id);
          if (!exRow) return structuredClone(mRow);
          return {
            ...mRow,
            resultTitre: exRow.resultTitre,
            flag: exRow.flag,
            dilutions: { ...exRow.dilutions },
          };
        }),
      };
    }

    if (masterItem.type === 'blood-group' && existing.type === 'blood-group') {
      return {
        ...masterItem,
        aboGroup: existing.aboGroup,
        rhFactor: existing.rhFactor,
      };
    }

    return structuredClone(masterItem);
  });

  // Sync Urine Section
  updated.urine.sectionTitle = master.urine.sectionTitle;
  updated.urine.departmentTag = master.urine.departmentTag;

  const existingSubMap = new Map(
    updated.urine.subSections.map((s) => [s.id, s])
  );

  updated.urine.subSections = master.urine.subSections.map((mSub) => {
    const exSub = existingSubMap.get(mSub.id);
    if (!exSub) return structuredClone(mSub);
    const exParamMap = new Map(exSub.items.map((p) => [p.id, p]));
    return {
      ...mSub,
      items: mSub.items.map((mParam) => {
        const exParam = exParamMap.get(mParam.id);
        if (!exParam) return structuredClone(mParam);
        return {
          ...mParam,
          result: exParam.result,
          flag: exParam.flag,
        };
      }),
    };
  });

  // Sync Physical Exam Section
  updated.physicalExam.sectionTitle = master.physicalExam.sectionTitle;
  updated.physicalExam.departmentTag = master.physicalExam.departmentTag;
  const exPhysMap = new Map(
    updated.physicalExam.parameters.map((p) => [p.id, p])
  );
  updated.physicalExam.parameters = master.physicalExam.parameters.map(
    (mParam) => {
      const exParam = exPhysMap.get(mParam.id);
      if (!exParam) return structuredClone(mParam);
      return {
        ...mParam,
        result: exParam.result,
        flag: exParam.flag,
      };
    }
  );

  return updated;
}

/**
 * Ensures any legacy report stored in localStorage is migrated cleanly to the new dynamic schema.
 */
export function normalizeReportSchema(raw: unknown): LabReport {
  const fallback = createBlankReport(1042);
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Record<string, unknown>;

  // Check if already on new schema (blood.items is an array and urine.subSections is an array)
  const bloodObj = r.blood as Record<string, unknown> | undefined;
  const urineObj = r.urine as Record<string, unknown> | undefined;
  if (
    bloodObj &&
    Array.isArray(bloodObj.items) &&
    urineObj &&
    Array.isArray(urineObj.subSections)
  ) {
    const typed = raw as LabReport;
    if (!Array.isArray(typed.sectionOrder)) {
      typed.sectionOrder = ['blood', 'urine', 'physical'];
    }
    if (!typed.physicalExam.sectionTitle) {
      typed.physicalExam.sectionTitle =
        'PHYSICAL EXAMINATION & CLINICAL VITALS REPORT';
      typed.physicalExam.departmentTag = 'GENERAL PHYSICAL TEST';
    }
    return typed;
  }

  return fallback;
}

export const SAMPLE_SAVED_REPORTS: LabReport[] = [
  (() => {
    const rep = createBlankReport(1039);
    rep.id = 'sample-urine-only';
    rep.patient = {
      reportId: 'BPL-2026-1039',
      patientTitle: 'Mrs.',
      patientName: 'Farzana Begum',
      age: '36',
      ageUnit: 'Years',
      gender: 'Female',
      referredBy: 'Dr. A. K. Siddiqui (M.D. Medicine)',
      sampleDate: getTodayFormatted(),
      reportDate: getTodayFormatted(),
      specimen: 'Mid-Stream Morning Urine',
      contactNumber: '+91 98231 11204',
      labRemarks:
        'Mild pyuria observed under high power field. Advise urine culture if clinically indicated.',
      verifiedBy: 'M. Babar (D.M.L.T.)',
    };
    rep.blood.enabled = false;
    rep.urine.enabled = true;
    const phys = rep.urine.subSections[0];
    const chem = rep.urine.subSections[1];
    const micro = rep.urine.subSections[2];
    phys.items[0].result = 'Pale Yellow';
    phys.items[1].result = 'Slightly Turbid';
    phys.items[1].flag = 'abnormal';
    chem.items[0].result = 'Nil';
    chem.items[1].result = 'Trace';
    chem.items[1].flag = 'abnormal';
    micro.items[0].result = '8-10';
    micro.items[0].flag = 'abnormal';
    micro.items[1].result = '1-2';
    micro.items[2].result = 'Calcium Oxalate (+)';
    micro.items[2].flag = 'abnormal';
    micro.items[3].result = '2-3';
    micro.items[4].result = 'Nil';
    return rep;
  })(),
  (() => {
    const rep = createBlankReport(1040);
    rep.id = 'sample-blood-only';
    rep.patient = {
      reportId: 'BPL-2026-1040',
      patientTitle: 'Mr.',
      patientName: 'Rajeshwar Patil',
      age: '42',
      ageUnit: 'Years',
      gender: 'Male',
      referredBy: 'Dr. S. M. Kulkarni (MBBS, DNB)',
      sampleDate: getTodayFormatted(),
      reportDate: getTodayFormatted(),
      specimen: 'EDTA Whole Blood & Plain Serum',
      contactNumber: '+91 94228 55319',
      labRemarks:
        'Significant Widal agglutination titre observed for S. Typhi O and H antigens. Correlate clinically.',
      verifiedBy: 'M. Babar (D.M.L.T.)',
    };
    rep.blood.enabled = true;
    rep.urine.enabled = false;
    for (const item of rep.blood.items) {
      if (item.type === 'standard') {
        if (item.param.code === 'MP') item.param.result = 'Not Detected';
        if (item.param.code === 'CRP') {
          item.param.result = '18.4';
          item.param.flag = 'abnormal';
        }
        if (item.param.code === 'ASO') item.param.result = 'Negative';
        if (item.param.code === 'RA') item.param.result = 'Negative';
        if (item.param.code === 'ESR') {
          item.param.result = '28';
          item.param.flag = 'abnormal';
        }
      } else if (item.type === 'widal') {
        item.rows[0].resultTitre = '1:160 (Reactive)';
        item.rows[0].flag = 'abnormal';
        item.rows[0].dilutions = {
          d1_20: '+',
          d1_40: '+',
          d1_80: '+',
          d1_160: '+',
          d1_320: '-',
        };
        item.rows[1].resultTitre = '1:160 (Reactive)';
        item.rows[1].flag = 'abnormal';
        item.rows[1].dilutions = {
          d1_20: '+',
          d1_40: '+',
          d1_80: '+',
          d1_160: '+',
          d1_320: '-',
        };
        item.rows[2].resultTitre = 'Negative (< 1:20)';
        item.rows[3].resultTitre = 'Negative (< 1:20)';
      } else if (item.type === 'blood-group') {
        item.aboGroup = "'B'";
        item.rhFactor = 'Positive (+ve)';
      }
    }
    return rep;
  })(),
];
