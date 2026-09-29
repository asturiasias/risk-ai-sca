// Calculadora de Riesgo Tromboembólico CHA2DS2-VASc (Fibrilación Auricular)
// Fuente verificada: Lip GYH et al. Chest 2010;137(2):263-272 / Guías ESC FA 2020 / 2024
// DOI: 10.1378/chest.09-1585

import { ScoreResult } from '../../types/clinical';

export function calculateCha2ds2Vasc(params: {
  icPrevia: 0 | 1 | null;
  hta: 0 | 1 | null;
  edad: number | null;
  diabetes: 0 | 1 | null;
  ictusPrevioOAit: 0 | 1 | null;
  enfermedadVascular: 0 | 1 | null; // IAM previo, EVP, placa aórtica
  sexo: 0 | 1 | null; // 0=M, 1=F
  tieneFibrilacionAuricular?: boolean;
}): ScoreResult {
  const missing: string[] = [];
  if (params.edad === null || params.edad === undefined) missing.push('Edad');
  if (params.sexo === null || params.sexo === undefined) missing.push('Sexo');
  if (params.hta === null || params.hta === undefined) missing.push('Hipertensión');
  if (params.diabetes === null || params.diabetes === undefined) missing.push('Diabetes');
  if (params.icPrevia === null || params.icPrevia === undefined) missing.push('Insuficiencia cardiaca');
  if (params.ictusPrevioOAit === null || params.ictusPrevioOAit === undefined) missing.push('Ictus / AIT previo');
  if (params.enfermedadVascular === null || params.enfermedadVascular === undefined) missing.push('Enfermedad vascular previa');

  if (missing.length > 0) {
    return {
      scoreId: 'cha2ds2_vasc',
      name: 'CHA2DS2-VASc Score',
      version: 'Lip et al. 2010 / Guías ESC FA',
      applicable: Boolean(params.tieneFibrilacionAuricular),
      applicabilityReason: !params.tieneFibrilacionAuricular ? 'Aplicable únicamente en pacientes con fibrilación auricular o flutter documentado.' : undefined,
      clinicalTiming: 'Evaluación de indicación de anticoagulación en FA',
      variablesUsed: params,
      missingRequiredVariables: missing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan datos (${missing.join(', ')}).`,
      clinicalOutcome: 'Ictus isquémico y tromboembolismo sistémico anual',
      horizon: 'Anual',
      citation: 'Lip GY, et al. Refining clinical risk stratification in atrial fibrillation: the CHA2DS2-VASc score. Chest 2010;137:263-272.',
      citationDoi: 'https://doi.org/10.1378/chest.09-1585'
    };
  }

  const breakdown: { label: string; points: number; detail?: string }[] = [];
  let total = 0;

  // C: Insuficiencia cardiaca (+1)
  const ptsIc = params.icPrevia === 1 ? 1 : 0;
  breakdown.push({ label: 'C — Insuficiencia cardiaca congestiva o disfunción VI', points: ptsIc });
  total += ptsIc;

  // H: Hipertensión (+1)
  const ptsHta = params.hta === 1 ? 1 : 0;
  breakdown.push({ label: 'H — Hipertensión arterial', points: ptsHta });
  total += ptsHta;

  // A2: Edad >= 75 (+2) o A: 65-74 (+1)
  let ptsEdad = 0;
  const e = params.edad!;
  if (e >= 75) ptsEdad = 2;
  else if (e >= 65) ptsEdad = 1;
  breakdown.push({ label: 'A — Edad', points: ptsEdad, detail: `${e} años` });
  total += ptsEdad;

  // D: Diabetes (+1)
  const ptsDm = params.diabetes === 1 ? 1 : 0;
  breakdown.push({ label: 'D — Diabetes mellitus', points: ptsDm });
  total += ptsDm;

  // S2: Ictus / AIT / tromboembolismo (+2)
  const ptsStroke = params.ictusPrevioOAit === 1 ? 2 : 0;
  breakdown.push({ label: 'S₂ — Antecedente de ictus isquémico o AIT', points: ptsStroke });
  total += ptsStroke;

  // V: Enfermedad vascular (+1)
  const ptsVasc = params.enfermedadVascular === 1 ? 1 : 0;
  breakdown.push({ label: 'V — Enfermedad vascular (IAM previo, EVP o placa)', points: ptsVasc });
  total += ptsVasc;

  // Sc: Sexo femenino (+1)
  const ptsSex = params.sexo === 1 ? 1 : 0;
  breakdown.push({ label: 'Sc — Sexo femenino', points: ptsSex, detail: params.sexo === 1 ? 'Mujer (+1)' : 'Varón (0)' });
  total += ptsSex;

  const isMale = params.sexo === 0;
  const oacIndicated = isMale ? total >= 2 : total >= 3;
  const oacConsidered = isMale ? total === 1 : total === 2;

  let riskCategory: 'Bajo' | 'Intermedio' | 'Alto' = 'Bajo';
  let interpretation = '';

  if (oacIndicated) {
    riskCategory = 'Alto';
    interpretation = `Puntuación: ${total} puntos. INDICACIÓN FORMAL DE ANTICOAGULACIÓN ORAL (Clase I, Nivel A). En varones ≥ 2 y en mujeres ≥ 3 se recomienda anticoagulación oral con DOAC preferente sobre AVK. En el contexto de SCA tratado con PCI, se indica triple terapia breve (habitualmente 1 a 7 días intrahospitalaria) seguida de DOBLE TERAPIA con DOAC + Clopidogrel hasta los 12 meses (Guía ESC 2023 / 2024).`;
  } else if (oacConsidered) {
    riskCategory = 'Intermedio';
    interpretation = `Puntuación: ${total} puntos. Se debe considerar anticoagulación oral (Clase IIa, Nivel B) según beneficio neto individual y preferencias del paciente.`;
  } else {
    riskCategory = 'Bajo';
    interpretation = `Puntuación: ${total} puntos. Riesgo tromboembólico bajo. No está indicada la anticoagulación oral sistemática (Clase III).`;
  }

  return {
    scoreId: 'cha2ds2_vasc',
    name: 'CHA2DS2-VASc Score',
    version: 'Lip et al. 2010 / Guías ESC FA 2020/2024',
    applicable: Boolean(params.tieneFibrilacionAuricular),
    clinicalTiming: 'Presentación en SCA con Fibrilación Auricular',
    variablesUsed: params,
    missingRequiredVariables: [],
    points: total,
    percentageRisk: null,
    riskCategory,
    interpretation,
    clinicalOutcome: 'Tromboembolismo arterial sistémico e ictus isquémico',
    horizon: 'Anual',
    citation: 'Lip GY, et al. Chest 2010;137:263-272.',
    citationDoi: 'https://doi.org/10.1378/chest.09-1585',
    breakdown
  };
}
