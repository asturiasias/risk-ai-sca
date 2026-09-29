// Calculadora determinista de Sangrado Post-Alta BleeMACS
// Fuente verificada: Raposeiras-Roubín S et al. JACC Cardiovasc Interv 2018;11(19):1959-1968
// DOI: 10.1016/j.jcin.2018.06.017 | PubMed: 29407077

import { ScoreResult } from '../../types/clinical';

export function calculateBleemacsScore(params: {
  edad: number | null;
  sangradoPrevio: 0 | 1 | null;
  enfermedadVascular: 0 | 1 | null; // EVP o ictus previo
  hta: 0 | 1 | null;
  cancerActivo: 0 | 1 | null;
  creatinina: number | null; // mg/dL
  hemoglobina: number | null; // g/dL
}): ScoreResult {
  const missing: string[] = [];
  if (params.edad === null || params.edad === undefined) missing.push('Edad');
  if (params.sangradoPrevio === null || params.sangradoPrevio === undefined) missing.push('Sangrado previo');
  if (params.enfermedadVascular === null || params.enfermedadVascular === undefined) missing.push('Enfermedad vascular previa');
  if (params.hta === null || params.hta === undefined) missing.push('Hipertensión previa');
  if (params.cancerActivo === null || params.cancerActivo === undefined) missing.push('Neoplasia/cáncer activo');
  if (params.creatinina === null || params.creatinina === undefined) missing.push('Creatinina sérica');
  if (params.hemoglobina === null || params.hemoglobina === undefined) missing.push('Hemoglobina');

  if (missing.length > 0) {
    return {
      scoreId: 'bleemacs',
      name: 'BleeMACS Bleeding Score',
      version: 'Raposeiras-Roubín et al. (7 variables originales)',
      applicable: true,
      clinicalTiming: 'Planificación al alta tras SCA tratado con PCI',
      variablesUsed: params,
      missingRequiredVariables: missing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan determinantes clínicos (${missing.join(', ')}).`,
      clinicalOutcome: 'Hemorragia mayor post-alta que requiere hospitalización',
      horizon: '12 meses tras el alta',
      citation: 'Raposeiras-Roubín S, et al. BleeMACS score: a prediction rule for postdischarge bleeding in patients with acute coronary syndrome undergoing percutaneous coronary intervention. JACC Cardiovasc Interv 2018;11:1959-1968.',
      citationDoi: 'https://doi.org/10.1016/j.jcin.2018.06.017'
    };
  }

  const breakdown: { label: string; points: number; detail?: string }[] = [];
  let total = 0;

  // 1. Edad: 65-74 (+1); >= 75 (+2)
  let ptsEdad = 0;
  const e = params.edad!;
  if (e >= 75) ptsEdad = 2;
  else if (e >= 65) ptsEdad = 1;
  breakdown.push({ label: 'Edad', points: ptsEdad, detail: `${e} años` });
  total += ptsEdad;

  // 2. Sangrado previo (+3)
  const ptsBleed = params.sangradoPrevio === 1 ? 3 : 0;
  breakdown.push({ label: 'Antecedente de sangrado previo', points: ptsBleed });
  total += ptsBleed;

  // 3. Enfermedad vascular previa (EVP o ictus) (+1)
  const ptsVasc = params.enfermedadVascular === 1 ? 1 : 0;
  breakdown.push({ label: 'Enfermedad vascular periférica / cerebrovascular', points: ptsVasc });
  total += ptsVasc;

  // 4. Hipertensión arterial (+1)
  const ptsHta = params.hta === 1 ? 1 : 0;
  breakdown.push({ label: 'Hipertensión arterial', points: ptsHta });
  total += ptsHta;

  // 5. Cáncer activo (+2)
  const ptsCa = params.cancerActivo === 1 ? 2 : 0;
  breakdown.push({ label: 'Cáncer / neoplasia activa en 12 meses', points: ptsCa });
  total += ptsCa;

  // 6. Creatinina > 1.5 mg/dL (+1)
  const ptsCr = params.creatinina! > 1.5 ? 1 : 0;
  breakdown.push({ label: 'Creatinina sérica > 1.5 mg/dL', points: ptsCr, detail: `${params.creatinina} mg/dL` });
  total += ptsCr;

  // 7. Hemoglobina < 11.0 g/dL (+2)
  const ptsHb = params.hemoglobina! < 11.0 ? 2 : 0;
  breakdown.push({ label: 'Hemoglobina basal < 11.0 g/dL', points: ptsHb, detail: `${params.hemoglobina} g/dL` });
  total += ptsHb;

  let riskCategory: 'Bajo' | 'Intermedio' | 'Alto' = 'Bajo';
  let percentageRisk = 1.3;
  if (total <= 2) {
    riskCategory = 'Bajo';
    percentageRisk = 1.3;
  } else if (total <= 5) {
    riskCategory = 'Intermedio';
    percentageRisk = 3.8;
  } else {
    riskCategory = 'Alto';
    percentageRisk = 10.4;
  }

  return {
    scoreId: 'bleemacs',
    name: 'BleeMACS Bleeding Score',
    version: 'Raposeiras-Roubín et al. (7 variables originales)',
    applicable: true,
    clinicalTiming: 'Planificación al alta tras angioplastia por SCA',
    variablesUsed: params,
    missingRequiredVariables: [],
    points: total,
    percentageRisk,
    riskCategory,
    interpretation: `Puntuación: ${total}/12 pts. Categoría: Riesgo Hemorrágico ${riskCategory} post-alta (incidencia acumulada de sangrado mayor a 1 año: ~${percentageRisk}%).`,
    clinicalOutcome: 'Hemorragia mayor post-alta con hospitalización',
    horizon: '1 año post-alta',
    citation: 'Raposeiras-Roubín S, et al. BleeMACS score. JACC Cardiovasc Interv 2018;11:1959-1968.',
    citationDoi: 'https://doi.org/10.1016/j.jcin.2018.06.017',
    breakdown
  };
}
