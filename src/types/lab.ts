export type TestFlag = 'normal' | 'abnormal' | 'critical';

export type SectionKey = 'blood' | 'urine' | 'physical';

export interface TestParameter {
  id: string;
  code: string;
  name: string;
  included: boolean;
  result: string;
  unit: string;
  referenceRange: string;
  method?: string;
  flag: TestFlag;
  quickOptions: string[];
}

export interface WidalDilutionRow {
  id: string;
  antigen: string;
  label: string;
  included: boolean;
  resultTitre: string;
  referenceRange: string;
  flag: TestFlag;
  dilutions: {
    d1_20: string;
    d1_40: string;
    d1_80: string;
    d1_160: string;
    d1_320: string;
  };
}

export interface BloodStandardItem {
  id: string;
  type: 'standard';
  param: TestParameter;
}

export interface BloodWidalItem {
  id: string;
  type: 'widal';
  name: string;
  included: boolean;
  displayMode: 'titre' | 'grid';
  method: string;
  rows: WidalDilutionRow[];
}

export interface BloodGroupItem {
  id: string;
  type: 'blood-group';
  name: string;
  included: boolean;
  aboLabel: string;
  rhLabel: string;
  aboGroup: string;
  rhFactor: string;
  referenceRange: string;
  method: string;
  aboQuickOptions: string[];
  rhQuickOptions: string[];
}

export type BloodTestItem =
  | BloodStandardItem
  | BloodWidalItem
  | BloodGroupItem;

export interface BloodTestSection {
  enabled: boolean;
  sectionTitle: string;
  departmentTag: string;
  items: BloodTestItem[];
}

export interface UrineSubSection {
  id: string;
  title: string;
  enabled: boolean;
  items: TestParameter[];
}

export interface UrineTestSection {
  enabled: boolean;
  sectionTitle: string;
  departmentTag: string;
  subSections: UrineSubSection[];
}

export interface StandalonePhysicalSection {
  enabled: boolean;
  sectionTitle: string;
  departmentTag: string;
  parameters: TestParameter[];
}

export interface PatientInfo {
  reportId: string;
  patientTitle: string;
  patientName: string;
  age: string;
  ageUnit: 'Years' | 'Months' | 'Days';
  gender: 'Male' | 'Female' | 'Other';
  referredBy: string;
  sampleDate: string;
  reportDate: string;
  specimen: string;
  contactNumber: string;
  labRemarks: string;
  verifiedBy: string;
}

export interface MasterTestTemplate {
  sectionOrder: SectionKey[];
  blood: BloodTestSection;
  urine: UrineTestSection;
  physicalExam: StandalonePhysicalSection;
}

export interface LabReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  patient: PatientInfo;
  sectionOrder: SectionKey[];
  blood: BloodTestSection;
  urine: UrineTestSection;
  physicalExam: StandalonePhysicalSection;
  hideEmptyRowsOnPrint: boolean;
}

export interface LabSettings {
  labName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  registrationNo: string;
  timings: string;
  technicianName: string;
  technicianQualification: string;
  pathologistName: string;
  pathologistQualification: string;
  footerNote: string;
  printHeaderMode: 'full-letterhead' | 'preprinted-pad';
  preprintedTopMarginMm: number;
  showReferenceRanges: boolean;
  showMethodColumn: boolean;
}
