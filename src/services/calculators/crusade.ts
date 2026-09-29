// Calculadora determinista de Sangrado Intrahospitalario CRUSADE
// Fuente verificada: Subherwal S et al. Circulation 2009;119(14):1873-1882
// DOI: 10.1161/CIRCULATIONAHA.108.828541 | PubMed: 19364974

import { ScoreResult } from '../../types/clinical';

export function calculateCrusadeScore(params: {
  hematocrito: number | null; // % basal
  aclaramientoCrCl: number | null; // Cockcroft-Gault mL/min
  fc: number | null; // lpm
  pas: number | null; // mmHg
  sexo: 0 | 1 | null; // 0=M, 1=F
  signosIcIngreso: 0 | 1 | null; // Killip >= 2 o signos IC
  enfermedadVascularPrevia: 0 | 1 | null; // EVP o ictus previo
  diabetes: 0 | 1 | null;
  tipoSca?: 0 | 1 | 2 | null;
}): ScoreResult {
  const missing: string[] = [];
  if (params.hematocrito === null || params.hematocrito === undefined) missing.push('Hematocrito basal (%)');
  if (params.aclaramientoCrCl === null || params.aclaramientoCrCl === undefined) missing.push('CrCl Cockcroft-Gault');
  if (params.fc === null || params.fc === undefined) missing.push('Frecuencia cardiaca');
  if (params.pas === null || params.pas === undefined) missing.push('Presión arterial sistólica');
  if (params.sexo === null || params.sexo === undefined) missing.push('Sexo');
  if (params.signosIcIngreso === null || params.signosIcIngreso === undefined) missing.push('Signos de insuficiencia cardiaca');
  if (params.enfermedadVascularPrevia === null || params.enfermedadVascularPrevia === undefined) missing.push('Enfermedad vascular previa');
  if (params.diabetes === null || params.diabetes === undefined) missing.push('Diabetes mellitus');

  if (missing.length > 0) {
    return {
      scoreId: 'crusade',
      name: 'CRUSADE Bleeding Score',
      version: 'Subherwal et al. (8 variables originales)',
      applicable: true,
      applicabilityReason: 'Población: derivado primariamente en SCASEST hospitalizados; cuantifica sangrado mayor intrahospitalario.',
      clinicalTiming: 'Ingreso hospitalario',
      variablesUsed: params,
      missingRequiredVariables: missing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan determinantes requeridos (${missing.join(', ')}). No se asume 0 para variables ausentes.`,
      clinicalOutcome: 'Hemorragia mayor intrahospitalaria',
      horizon: 'Durante la estancia hospitalaria índice',
      citation: 'Subherwal S, et al. Baseline risk of major bleeding in non-ST-segment-elevation myocardial infarction: the CRUSADE (Can Rapid risk stratification of Unstable angina patients Suppress ADverse outcomes with Early implementation of the ACC/AHA Guidelines) Bleeding Score. Circulation 2009;119:1873-1882.',
      citationDoi: 'https://doi.org/10.1161/CIRCULATIONAHA.108.828541'
    };
  }

  const breakdown: { label: string; points: number; detail?: string }[] = [];
  let total = 0;

  // 1. Hematocrito basal (%)
  let ptsHto = 0;
  const hto = params.hematocrito!;
  if (hto < 31) ptsHto = 9;
  else if (hto < 34) ptsHto = 7;
  else if (hto < 37) ptsHto = 6;
  else if (hto < 40) ptsHto = 3;
  else ptsHto = 0;
  breakdown.push({ label: `Hematocrito (${hto}%)`, points: ptsHto });
  total += ptsHto;

  // 2. Aclaramiento de creatinina (Cockcroft-Gault mL/min)
  let ptsCrcl = 0;
  const crcl = params.aclaramientoCrCl!;
  if (crcl <= 15) ptsCrcl = 39;
  else if (crcl <= 30) ptsCrcl = 35;
  else if (crcl <= 60) ptsCrcl = 28;
  else if (crcl <= 90) ptsCrcl = 17;
  else if (crcl <= 120) ptsCrcl = 7;
  else ptsCrcl = 0;
  breakdown.push({ label: `CrCl Cockcroft-Gault (${crcl} mL/min)`, points: ptsCrcl });
  total += ptsCrcl;

  // 3. Frecuencia cardiaca (lpm)
  let ptsFc = 0;
  const fc = params.fc!;
  if (fc <= 70) ptsFc = 0;
  else if (fc <= 80) ptsFc = 1;
  else if (fc <= 90) ptsFc = 3;
  else if (fc <= 100) ptsFc = 6;
  else if (fc <= 110) ptsFc = 8;
  else if (fc <= 120) ptsFc = 10;
  else ptsFc = 11;
  breakdown.push({ label: `Frecuencia cardiaca (${fc} lpm)`, points: ptsFc });
  total += ptsFc;

  // 4. Presión arterial sistólica (mmHg)
  let ptsPas = 0;
  const pas = params.pas!;
  if (pas <= 90) ptsPas = 10;
  else if (pas <= 100) ptsPas = 8;
  else if (pas <= 120) ptsPas = 5;
  else if (pas <= 180) ptsPas = 1;
  else if (pas <= 200) ptsPas = 3;
  else ptsPas = 5;
  breakdown.push({ label: `Presión arterial sistólica (${pas} mmHg)`, points: ptsPas });
  total += ptsPas;

  // 5. Sexo femenino (+8)
  const ptsSexo = params.sexo === 1 ? 8 : 0;
  breakdown.push({ label: 'Sexo femenino', points: ptsSexo, detail: params.sexo === 1 ? 'Mujer (+8)' : 'Hombre (0)' });
  total += ptsSexo;

  // 6. Signos de insuficiencia cardiaca al ingreso (+7)
  const ptsIc = params.signosIcIngreso === 1 ? 7 : 0;
  breakdown.push({ label: 'Signos de IC al ingreso (Killip ≥ II)', points: ptsIc });
  total += ptsIc;

  // 7. Enfermedad vascular previa (EVP o ictus) (+6)
  const ptsVasc = params.enfermedadVascularPrevia === 1 ? 6 : 0;
  breakdown.push({ label: 'Enfermedad vascular previa (EVP / ictus)', points: ptsVasc });
  total += ptsVasc;

  // 8. Diabetes mellitus (+6)
  const ptsDm = params.diabetes === 1 ? 6 : 0;
  breakdown.push({ label: 'Diabetes mellitus previa', points: ptsDm });
  total += ptsDm;

  let riskCategory: 'Bajo' | 'Intermedio' | 'Alto' | 'Muy Alto' = 'Bajo';
  let percentageRisk = 3.1;
  let categoryName = '';

  if (total <= 20) {
    riskCategory = 'Bajo';
    categoryName = 'Muy bajo';
    percentageRisk = 3.1;
  } else if (total <= 30) {
    riskCategory = 'Bajo';
    categoryName = 'Bajo';
    percentageRisk = 5.5;
  } else if (total <= 40) {
    riskCategory = 'Intermedio';
    categoryName = 'Moderado';
    percentageRisk = 8.6;
  } else if (total <= 50) {
    riskCategory = 'Alto';
    categoryName = 'Alto';
    percentageRisk = 11.9;
  } else {
    riskCategory = 'Muy Alto';
    categoryName = 'Muy alto';
    percentageRisk = 19.5;
  }

  return {
    scoreId: 'crusade',
    name: 'CRUSADE Bleeding Score',
    version: 'Subherwal et al. (8 variables originales)',
    applicable: true,
    clinicalTiming: 'Evaluación al ingreso intrahospitalario',
    variablesUsed: params,
    missingRequiredVariables: [],
    points: total,
    percentageRisk,
    riskCategory,
    interpretation: `Puntuación: ${total} puntos. Riesgo de sangrado mayor intrahospitalario: ${percentageRisk}% (Categoría: ${categoryName}). Requiere optimización de dosis antitrombóticas, abordaje radial y protección gástrica con IBP.`,
    clinicalOutcome: 'Hemorragia mayor intrahospitalaria',
    horizon: 'Durante el ingreso índice hospitalario',
    citation: 'Subherwal S, et al. Baseline risk of major bleeding in non-ST-segment-elevation myocardial infarction: the CRUSADE Bleeding Score. Circulation 2009;119:1873-1882.',
    citationDoi: 'https://doi.org/10.1161/CIRCULATIONAHA.108.828541',
    breakdown
  };
}
