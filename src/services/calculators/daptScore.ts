// Calculadora determinista de Prolongación DAPT (DAPT Score)
// Fuente verificada: Yeh RW et al. JAMA 2016;315(16):1735-1749
// DOI: 10.1001/jama.2016.3775 | PubMed: 27022822 | Herramienta oficial ACC: tools.acc.org/DAPTriskapp

import { ScoreResult } from '../../types/clinical';

export function calculateDaptScore(params: {
  edad: number | null;
  tabacoActivo: 0 | 1 | null;
  diabetes: 0 | 1 | null;
  iamEnPresentacion: 0 | 1 | null;
  pciPreviaOIamPrevio: 0 | 1 | null;
  stentPaclitaxel?: 0 | 1 | null;
  diametroStentMenor3mm: 0 | 1 | null;
  icOFeviMenor30: 0 | 1 | null;
  stentInjertoVenoso?: 0 | 1 | null;
  mesesPostPci?: number | null;
  faseEvaluacion?: string;
  haTenidoEventosEn12m?: boolean; // Evento isquémico mayor o hemorrágico previo en el año
}): ScoreResult {
  // Verificación de aplicabilidad temporal obligatoria:
  const isAcutePhase = params.faseEvaluacion === 'urgencias' || params.faseEvaluacion === 'ingreso' || params.faseEvaluacion === 'cateterismo' || params.faseEvaluacion === 'alta';
  const isLessThan12Months = params.mesesPostPci !== undefined && params.mesesPostPci !== null && params.mesesPostPci < 12;

  if (isAcutePhase || isLessThan12Months) {
    return {
      scoreId: 'dapt_score',
      name: 'DAPT Score (Yeh et al.)',
      version: 'JAMA 2016 / Algoritmo original del estudio DAPT',
      applicable: false,
      applicabilityReason: 'NO APLICABLE EN ESTE MOMENTO (fase aguda/alta). El DAPT score fue derivado y validado exclusivamente en pacientes que han completado ~12 meses de DAPT sin eventos isquémicos ni hemorrágicos mayores para decidir si prolongar el tratamiento. No debe emplearse para pautar la DAPT inicial al ingreso.',
      clinicalTiming: 'Reevaluación ambulatoria a los 12 meses post-PCI',
      variablesUsed: params,
      missingRequiredVariables: [],
      points: null,
      percentageRisk: null,
      riskCategory: 'No aplicable',
      interpretation: 'No aplicable en fase aguda. Reserve este score para la consulta de seguimiento al cumplirse 12 meses tras el intervencionismo coronario.',
      clinicalOutcome: 'Beneficio neto isquémico vs riesgo hemorrágico de prolongar DAPT (>12 m)',
      horizon: '12 a 30 meses post-PCI',
      citation: 'Yeh RW, et al. Development and Validation of a Prediction Rule for Benefit and Harm of Dual Antiplatelet Therapy Beyond 1 Year After Percutaneous Coronary Intervention. JAMA 2016;315(16):1735-1749.',
      citationDoi: 'https://doi.org/10.1001/jama.2016.3775'
    };
  }

  const missing: string[] = [];
  if (params.edad === null || params.edad === undefined) missing.push('Edad');
  if (params.tabacoActivo === null || params.tabacoActivo === undefined) missing.push('Tabaquismo activo');
  if (params.diabetes === null || params.diabetes === undefined) missing.push('Diabetes');
  if (params.iamEnPresentacion === null || params.iamEnPresentacion === undefined) missing.push('IAM en presentación índice');
  if (params.pciPreviaOIamPrevio === null || params.pciPreviaOIamPrevio === undefined) missing.push('PCI o IAM previo');
  if (params.diametroStentMenor3mm === null || params.diametroStentMenor3mm === undefined) missing.push('Diámetro de stent < 3 mm');
  if (params.icOFeviMenor30 === null || params.icOFeviMenor30 === undefined) missing.push('IC o FEVI < 30%');

  if (missing.length > 0) {
    return {
      scoreId: 'dapt_score',
      name: 'DAPT Score (Yeh et al.)',
      version: 'JAMA 2016 / Algoritmo original del estudio DAPT',
      applicable: true,
      clinicalTiming: 'Reevaluación a los 12 meses post-PCI',
      variablesUsed: params,
      missingRequiredVariables: missing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan determinantes requeridos (${missing.join(', ')}).`,
      clinicalOutcome: 'Beneficio neto de prolongar DAPT más allá del primer año',
      horizon: '12 a 30 meses post-PCI',
      citation: 'Yeh RW, et al. JAMA 2016;315:1735-1749.',
      citationDoi: 'https://doi.org/10.1001/jama.2016.3775'
    };
  }

  const breakdown: { label: string; points: number; detail?: string }[] = [];
  let total = 0;

  // 1. Edad: >= 75 (-2); 65-74 (-1); <65 (0)
  let ptsEdad = 0;
  const e = params.edad!;
  if (e >= 75) ptsEdad = -2;
  else if (e >= 65) ptsEdad = -1;
  else ptsEdad = 0;
  breakdown.push({ label: 'Edad', points: ptsEdad, detail: `${e} años` });
  total += ptsEdad;

  // 2. Tabaquismo activo (+1)
  const ptsTab = params.tabacoActivo === 1 ? 1 : 0;
  breakdown.push({ label: 'Tabaquismo activo', points: ptsTab });
  total += ptsTab;

  // 3. Diabetes (+1)
  const ptsDm = params.diabetes === 1 ? 1 : 0;
  breakdown.push({ label: 'Diabetes mellitus', points: ptsDm });
  total += ptsDm;

  // 4. IAM en la presentación inicial (+1)
  const ptsIam = params.iamEnPresentacion === 1 ? 1 : 0;
  breakdown.push({ label: 'IAM al inicio del episodio índice', points: ptsIam });
  total += ptsIam;

  // 5. PCI previa o IAM previo (+1)
  const ptsPrev = params.pciPreviaOIamPrevio === 1 ? 1 : 0;
  breakdown.push({ label: 'PCI previa o IAM previo', points: ptsPrev });
  total += ptsPrev;

  // 6. Stent liberador de paclitaxel (+1 si procede)
  const ptsPac = params.stentPaclitaxel === 1 ? 1 : 0;
  if (ptsPac > 0) {
    breakdown.push({ label: 'Stent liberador de paclitaxel', points: ptsPac });
    total += ptsPac;
  }

  // 7. Diámetro de stent < 3 mm (+1)
  const ptsDiam = params.diametroStentMenor3mm === 1 ? 1 : 0;
  breakdown.push({ label: 'Diámetro de stent < 3 mm', points: ptsDiam });
  total += ptsDiam;

  // 8. Insuficiencia cardiaca o FEVI < 30% (+2)
  const ptsIc = params.icOFeviMenor30 === 1 ? 2 : 0;
  breakdown.push({ label: 'IC previa o FEVI < 30%', points: ptsIc });
  total += ptsIc;

  // 9. Stent sobre injerto venoso (CABG) (+2)
  const ptsGraft = params.stentInjertoVenoso === 1 ? 2 : 0;
  if (ptsGraft > 0) {
    breakdown.push({ label: 'Stent en injerto venoso', points: ptsGraft });
    total += ptsGraft;
  }

  const favorableProlongation = total >= 2;
  const category: 'Alto' | 'Bajo' = favorableProlongation ? 'Alto' : 'Bajo';

  const interpretation = favorableProlongation
    ? `Puntuación: ${total} (≥ 2). RELACIÓN BENEFICIO/RIESGO FAVORABLE PARA PROLONGAR DAPT (>12 meses). Se observa una reducción clínicamente significativa de reinfarto y trombosis de stent que supera el riesgo hemorrágico esperado (estudio DAPT, JAMA 2016).`
    : `Puntuación: ${total} (< 2). RELACIÓN BENEFICIO/RIESGO DESFAVORABLE PARA PROLONGAR DAPT. La prolongación se asocia a incremento de sangrado sin reducción isquémica sustancial. Se recomienda suspender el inhibidor P2Y12 al cumplir 12 meses y mantener monoterapia con AAS.`;

  return {
    scoreId: 'dapt_score',
    name: 'DAPT Score (Yeh et al.)',
    version: 'JAMA 2016 / Algoritmo original del estudio DAPT',
    applicable: true,
    clinicalTiming: 'Reevaluación ambulatoria a los 12 meses tras intervencionismo',
    variablesUsed: params,
    missingRequiredVariables: [],
    points: total,
    percentageRisk: null,
    riskCategory: category,
    interpretation,
    clinicalOutcome: 'Equilibrio entre reducción de IAM/trombosis de stent y exceso de sangrado GUSTO moderado/grave',
    horizon: 'Hasta 30 meses post-PCI',
    citation: 'Yeh RW, et al. Development and Validation of a Prediction Rule for Benefit and Harm of Dual Antiplatelet Therapy Beyond 1 Year After Percutaneous Coronary Intervention. JAMA 2016;315(16):1735-1749.',
    citationDoi: 'https://doi.org/10.1001/jama.2016.3775',
    breakdown
  };
}
