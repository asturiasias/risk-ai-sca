// Calculadora contextual de Riesgo Hemorrágico HAS-BLED
// Fuente verificada: Pisters R et al. Chest 2010;138(5):1093-1100
// DOI: 10.1378/chest.10-0134 | PubMed: 20299623

import { ScoreResult } from '../../types/clinical';

export function calculateHasBledScore(params: {
  pasIngreso: number | null; // SBP > 160 mmHg
  dialisisOTransplanteOCreatininaMayor22: 0 | 1 | null; // Renal anormal
  cirrosisOHepatopatiaGrave: 0 | 1 | null; // Hepático anormal
  ictusPrevio: 0 | 1 | null; // Ictus
  historiaSangradoOAnemia: 0 | 1 | null; // Bleeding
  inrLabil?: 0 | 1 | null; // Labile INR (solo si AVK)
  edad: number | null; // Elderly > 65
  usoFarmacosAntiagregantesOAINES: 0 | 1 | null; // Drugs
  consumoExcesivoAlcohol?: 0 | 1 | null; // Alcohol
  tieneFibrilacionAuricular?: boolean; // Contexto específico de indicación de anticoagulación
  tieneIndicacionAnticoagulacion?: boolean;
}): ScoreResult {
  const isAnticoagulationContext = Boolean(params.tieneFibrilacionAuricular || params.tieneIndicacionAnticoagulacion);

  const missing: string[] = [];
  if (params.edad === null || params.edad === undefined) missing.push('Edad');
  if (params.pasIngreso === null || params.pasIngreso === undefined) missing.push('Presión arterial sistólica');
  if (params.ictusPrevio === null || params.ictusPrevio === undefined) missing.push('Ictus previo');
  if (params.historiaSangradoOAnemia === null || params.historiaSangradoOAnemia === undefined) missing.push('Historia de sangrado/anemia');
  if (params.dialisisOTransplanteOCreatininaMayor22 === null || params.dialisisOTransplanteOCreatininaMayor22 === undefined) missing.push('Función renal');
  if (params.cirrosisOHepatopatiaGrave === null || params.cirrosisOHepatopatiaGrave === undefined) missing.push('Función hepática');
  if (params.usoFarmacosAntiagregantesOAINES === null || params.usoFarmacosAntiagregantesOAINES === undefined) missing.push('Uso de antiagregantes o AINEs');

  if (missing.length > 0) {
    return {
      scoreId: 'has_bled',
      name: 'HAS-BLED Score (Módulo Contextual de Fibrilación Auricular)',
      version: 'Pisters et al. Chest 2010',
      applicable: isAnticoagulationContext,
      applicabilityReason: !isAnticoagulationContext
        ? 'MÓDULO CONTEXTUAL: HAS-BLED fue diseñado específicamente para pacientes con fibrilación auricular o indicación de anticoagulación oral; no es un score genérico de sangrado para todo SCA.'
        : undefined,
      clinicalTiming: 'Evaluación ante decisión de anticoagulación oral',
      variablesUsed: params,
      missingRequiredVariables: missing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan determinantes obligatorios (${missing.join(', ')}).`,
      clinicalOutcome: 'Hemorragia mayor en pacientes bajo tratamiento anticoagulante',
      horizon: '1 año de tratamiento anticoagulante',
      citation: 'Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation: the Euro Heart Survey. Chest 2010;138(5):1093-1100.',
      citationDoi: 'https://doi.org/10.1378/chest.10-0134'
    };
  }

  const breakdown: { label: string; points: number; detail?: string }[] = [];
  let total = 0;

  // H: Hypertension (uncontrolled SBP > 160 mmHg)
  const ptsH = params.pasIngreso! > 160 ? 1 : 0;
  breakdown.push({ label: 'H — Hipertensión sistólica no controlada (>160 mmHg)', points: ptsH, detail: `${params.pasIngreso} mmHg` });
  total += ptsH;

  // A: Abnormal renal and/or liver function (1 point each, max 2)
  const ptsRenal = params.dialisisOTransplanteOCreatininaMayor22 === 1 ? 1 : 0;
  breakdown.push({ label: 'A — Disfunción renal grave (Cr > 2.2 mg/dL o diálisis)', points: ptsRenal });
  total += ptsRenal;

  const ptsHep = params.cirrosisOHepatopatiaGrave === 1 ? 1 : 0;
  breakdown.push({ label: 'A — Disfunción hepática grave (cirrosis/bilirrubina >2x)', points: ptsHep });
  total += ptsHep;

  // S: Stroke history
  const ptsStroke = params.ictusPrevio === 1 ? 1 : 0;
  breakdown.push({ label: 'S — Antecedente de ictus isquémico o hemorrágico', points: ptsStroke });
  total += ptsStroke;

  // B: Bleeding history or predisposition
  const ptsBleed = params.historiaSangradoOAnemia === 1 ? 1 : 0;
  breakdown.push({ label: 'B — Antecedente de sangrado mayor o predisposición', points: ptsBleed });
  total += ptsBleed;

  // L: Labile INR (solo relevante si toma AVK; 0 si NACO o no consta)
  const ptsInr = params.inrLabil === 1 ? 1 : 0;
  if (params.inrLabil !== undefined) {
    breakdown.push({ label: 'L — INR lábil (tiempo en rango terapéutico < 60%)', points: ptsInr });
    total += ptsInr;
  }

  // E: Elderly (> 65 years)
  const ptsElderly = params.edad! > 65 ? 1 : 0;
  breakdown.push({ label: 'E — Edad > 65 años', points: ptsElderly, detail: `${params.edad} años` });
  total += ptsElderly;

  // D: Drugs (antiplatelets, NSAIDs) (1 pt) and/or Alcohol (>8 drinks/week) (1 pt)
  const ptsDrugs = params.usoFarmacosAntiagregantesOAINES === 1 ? 1 : 0;
  breakdown.push({ label: 'D — Fármacos predisponentes (AAS, P2Y12, AINEs)', points: ptsDrugs });
  total += ptsDrugs;

  const ptsAlc = params.consumoExcesivoAlcohol === 1 ? 1 : 0;
  if (params.consumoExcesivoAlcohol !== undefined) {
    breakdown.push({ label: 'D — Consumo excesivo de alcohol', points: ptsAlc });
    total += ptsAlc;
  }

  const isHighRisk = total >= 3;
  const category: 'Alto' | 'Bajo' = isHighRisk ? 'Alto' : 'Bajo';

  const contextualNote = !isAnticoagulationContext
    ? ' [Nota: Aplicado en paciente sin FA documentada; interpretar con reserva únicamente si se valora anticoagulación sistémica]'
    : '';

  const interpretation = isHighRisk
    ? `Puntuación: ${total} (≥ 3). ALTO RIESGO HEMORRÁGICO BAJO ANTICOAGULACIÓN${contextualNote}. Advertencia clínica primordial: un score HAS-BLED alto NUNCA debe utilizarse por sí solo para negar la anticoagulación oral indicada; su objetivo es identificar y corregir factores modificables (control estricto de PA, retirar AINEs, minimizar duración de triple terapia) y programar seguimiento estrecho (Guía ESC 2023 / 2024).`
    : `Puntuación: ${total} (< 3). Riesgo hemorrágico bajo o intermedio bajo anticoagulación${contextualNote}.`;

  return {
    scoreId: 'has_bled',
    name: 'HAS-BLED Score (Módulo Contextual FA / Anticoagulación)',
    version: 'Pisters et al. Chest 2010',
    applicable: isAnticoagulationContext,
    applicabilityReason: !isAnticoagulationContext
      ? 'Contextual a FA/anticoagulación; no aplicable como score primario en SCA sin indicación de anticoagulante.'
      : undefined,
    clinicalTiming: 'Planificación de la terapia antitrombótica en FA',
    variablesUsed: params,
    missingRequiredVariables: [],
    points: total,
    percentageRisk: null,
    riskCategory: category,
    interpretation,
    clinicalOutcome: 'Hemorragia mayor intrahospitalaria o post-alta bajo anticoagulación',
    horizon: '1 año',
    citation: 'Pisters R, et al. Chest 2010;138(5):1093-1100.',
    citationDoi: 'https://doi.org/10.1378/chest.10-0134',
    breakdown
  };
}
