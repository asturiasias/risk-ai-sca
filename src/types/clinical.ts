// Tipos clínicos y estructuras de datos para Risk AI-SCA

export type BinaryCoding = 0 | 1 | null; // 0 = no/ausencia explícita; 1 = sí/presencia; null = sin dato / desconocido
export type SexCoding = 0 | 1 | null; // 0 = masculino; 1 = femenino; null = sin dato
export type ScaTypeCoding = 0 | 1 | 2 | null; // 0 = SCACEST; 1 = SCASEST-IAM / no Q; 2 = angina inestable; null = sin dato
export type RevascCoding = 0 | 1 | null; // 0 = incompleta; 1 = completa; null = no evaluable/sin dato
export type ReviewStatus = 'pendiente' | 'revisado' | 'modificado';
export type DerivationMethod = 'documentado' | 'calculado' | 'medico';

export interface DataField<T = any> {
  key: string;
  label: string;
  header: string; // Encabezado autoexplicativo exacto para tablas/XLSX/CSV
  value: T;
  normalizedValue: T;
  originalRawValue?: string;
  unit?: string;
  canonicalUnit?: string;
  clinicalTimestamp?: string;
  documentName?: string;
  pageOrPosition?: string;
  supportQuote?: string; // Fragmento textual de evidencia extraído del informe
  reviewStatus: ReviewStatus;
  method: DerivationMethod;
  uncertainty?: string;
}

export interface PatientRecord {
  id: string; // ID seudónimo (ej. SCA-2026-001)
  episodeId: string; // ID episodio índice (ej. EP-01)
  isSynthetic: boolean; // 1 = sintético, 0 = real
  createdAt: string;
  updatedAt: string;
  evaluationPhase: 'urgencias' | 'ingreso' | 'cateterismo' | 'alta' | 'seguimiento_12m';
  reviewStatus: ReviewStatus;

  // Variables clínicas estructuradas (Diccionario clínico mínimo)
  data: Record<string, DataField>;

  // Recomendaciones y decisiones del médico
  recommendationsAccepted?: Record<string, 'pendiente' | 'aceptado' | 'modificado' | 'rechazado'>;
  doctorNotes?: string;
  daptDurationProposedMonths?: number | null;
  daptDurationAcceptedMonths?: number | null;
}

export interface ScoreResult {
  scoreId: string;
  name: string;
  version: string;
  applicable: boolean;
  applicabilityReason?: string;
  clinicalTiming: string;
  variablesUsed: Record<string, any>;
  missingRequiredVariables: string[];
  points: number | null;
  percentageRisk?: number | null;
  riskCategory: 'Bajo' | 'Intermedio' | 'Alto' | 'Muy Alto' | 'Indeterminado' | 'No aplicable';
  interpretation: string;
  clinicalOutcome: string;
  horizon: string;
  citation: string;
  citationDoi: string;
  breakdown?: { label: string; points: number | string; detail?: string }[];
}

export interface EvidenceItem {
  id: string;
  guidelineOrStudy: string;
  societyOrJournal: string;
  year: number;
  doi: string;
  url: string;
  title: string;
  section: string;
  recommendationQuote: string;
  classOfRecommendation?: string; // ej. Clase I, Clase IIa, Clase IIb, Clase III
  levelOfEvidence?: string; // ej. Nivel A, Nivel B, Nivel C
  verifiedKeywords: string[];
}

export interface ClinicalRecommendation {
  id: string;
  domain: 'urgencias' | 'invasivo' | 'antitrombotico' | 'cardiorrenal' | 'alta_seguimiento';
  phase: string;
  action: string;
  patientMotivations: string[];
  clinicalJustification: string;
  benefitsRisks: string;
  alternative?: string;
  contraindicationsChecked: string[];
  contraindicationAlert?: string;
  missingDataNotes?: string;
  evidenceItems: EvidenceItem[];
  defaultStatus: 'pendiente' | 'aceptado' | 'modificado' | 'rechazado';
}

export interface SyntheticPatientProfile {
  id: string;
  number: number;
  name: string;
  summary: string;
  clinicalScenario: string;
  keyFeatures: string[];
  documents: {
    title: string;
    type: 'urgencias' | 'analitica' | 'ecg' | 'cateterismo' | 'alta';
    date: string;
    content: string;
  }[];
  groundTruth: Record<string, any>;
  expectedScores: Record<string, { points: number | null; category: string }>;
}
