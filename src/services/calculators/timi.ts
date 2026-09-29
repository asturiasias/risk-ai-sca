// Calculadora determinista de Riesgo TIMI para SCASEST / Angina Inestable
// Fuente verificada: Antman EM et al. JAMA 2000;284(7):835-842
// DOI: 10.1001/jama.284.7.835 | PubMed: 10938172

import { ScoreResult } from '../../types/clinical';

export function calculateTimiScore(params: {
  edad: number | null;
  hta: 0 | 1 | null;
  dislipidemia: 0 | 1 | null;
  diabetes: 0 | 1 | null;
  tabacoActivo: 0 | 1 | null;
  antecedenteFamiliarCad?: 0 | 1 | null;
  estenosisPrevia50: 0 | 1 | null;
  aas7dPrevios: 0 | 1 | null;
  angina24h: 0 | 1 | null;
  desviacionSt: 0 | 1 | null;
  biomarcadoresElevados: 0 | 1 | null;
  tipoSca?: 0 | 1 | 2 | null;
}): ScoreResult {
  const missing: string[] = [];
  if (params.edad === null || params.edad === undefined) missing.push('Edad');
  if (params.estenosisPrevia50 === null || params.estenosisPrevia50 === undefined) missing.push('Estenosis coronaria previa >=50%');
  if (params.aas7dPrevios === null || params.aas7dPrevios === undefined) missing.push('Uso de AAS en últimos 7 días');
  if (params.angina24h === null || params.angina24h === undefined) missing.push('Episodios de angina >=2 en 24h');
  if (params.desviacionSt === null || params.desviacionSt === undefined) missing.push('Desviación ST en ECG');
  if (params.biomarcadoresElevados === null || params.biomarcadoresElevados === undefined) missing.push('Biomarcadores miocárdicos elevados');

  const rfKnown = [
    params.hta !== null,
    params.dislipidemia !== null,
    params.diabetes !== null,
    params.tabacoActivo !== null
  ].filter(Boolean).length;

  if (rfKnown < 3) {
    missing.push('Factores de riesgo cardiovascular tradicionales (faltan antecedentes mínimos)');
  }

  if (missing.length > 0) {
    return {
      scoreId: 'timi_nsteacs',
      name: 'TIMI Risk Score (SCASEST / Angina Inestable)',
      version: 'Antman et al. (7 variables originales)',
      applicable: params.tipoSca !== 0,
      applicabilityReason: params.tipoSca === 0 ? 'Población: validado exclusivamente en SCASEST y angina inestable; no sustituye al TIMI-STEMI específico.' : undefined,
      clinicalTiming: 'Presentación inicial / Urgencias',
      variablesUsed: params,
      missingRequiredVariables: missing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan datos clínicos requeridos (${missing.join(', ')}).`,
      clinicalOutcome: 'Mortalidad por cualquier causa, nuevo o recurrente IAM, o isquemia refractaria grave',
      horizon: '14 días tras la presentación',
      citation: 'Antman EM, et al. The TIMI risk score for unstable angina/non-ST elevation MI: A method for prognostication and therapeutic decision making. JAMA 2000;284(7):835-842.',
      citationDoi: 'https://doi.org/10.1001/jama.284.7.835'
    };
  }

  const breakdown: { label: string; points: number; detail?: string }[] = [];
  let total = 0;

  // 1. Edad >= 65 años
  const ptsEdad = params.edad! >= 65 ? 1 : 0;
  breakdown.push({ label: 'Edad ≥ 65 años', points: ptsEdad, detail: `${params.edad} años` });
  total += ptsEdad;

  // 2. ≥ 3 factores de riesgo coronario tradicionales
  let rfCount = 0;
  if (params.hta === 1) rfCount++;
  if (params.dislipidemia === 1) rfCount++;
  if (params.diabetes === 1) rfCount++;
  if (params.tabacoActivo === 1) rfCount++;
  if (params.antecedenteFamiliarCad === 1) rfCount++;
  const ptsRf = rfCount >= 3 ? 1 : 0;
  breakdown.push({ label: '≥ 3 Factores de riesgo cardiovascular', points: ptsRf, detail: `${rfCount} identificados (HTA, DM, DLP, tabaco)` });
  total += ptsRf;

  // 3. Estenosis coronaria conocida previa ≥ 50%
  const ptsEstenosis = params.estenosisPrevia50 === 1 ? 1 : 0;
  breakdown.push({ label: 'Estenosis coronaria conocida ≥ 50%', points: ptsEstenosis });
  total += ptsEstenosis;

  // 4. Uso de ácido acetilsalicílico en 7 días previos
  const ptsAas = params.aas7dPrevios === 1 ? 1 : 0;
  breakdown.push({ label: 'Uso de AAS en 7 días previos', points: ptsAas });
  total += ptsAas;

  // 5. Angina grave (≥ 2 episodios en 24 horas)
  const ptsAngina = params.angina24h === 1 ? 1 : 0;
  breakdown.push({ label: 'Episodios angina ≥ 2 en 24 horas', points: ptsAngina });
  total += ptsAngina;

  // 6. Desviación del segmento ST ≥ 0.5 mm
  const ptsSt = params.desviacionSt === 1 ? 1 : 0;
  breakdown.push({ label: 'Desviación ST ≥ 0.5 mm en ECG', points: ptsSt });
  total += ptsSt;

  // 7. Biomarcadores miocárdicos elevados (troponina o CK-MB)
  const ptsBio = params.biomarcadoresElevados === 1 ? 1 : 0;
  breakdown.push({ label: 'Biomarcadores cardiacos elevados', points: ptsBio });
  total += ptsBio;

  // Tasas de eventos a 14 días (Antman et al. JAMA 2000):
  // 0-1: 4.7% (Bajo)
  // 2: 8.3% (Bajo)
  // 3: 13.2% (Intermedio)
  // 4: 19.9% (Intermedio-Alto)
  // 5: 26.2% (Alto)
  // 6-7: 40.9% (Alto)
  const riskRates: Record<number, number> = {
    0: 4.7,
    1: 4.7,
    2: 8.3,
    3: 13.2,
    4: 19.9,
    5: 26.2,
    6: 40.9,
    7: 40.9
  };

  const percentage = riskRates[total] ?? 15.0;
  let category: 'Bajo' | 'Intermedio' | 'Alto' = 'Bajo';
  if (total <= 2) category = 'Bajo';
  else if (total <= 4) category = 'Intermedio';
  else category = 'Alto';

  return {
    scoreId: 'timi_nsteacs',
    name: 'TIMI Risk Score (SCASEST / Angina Inestable)',
    version: 'Antman et al. (7 variables originales)',
    applicable: params.tipoSca !== 0,
    applicabilityReason: params.tipoSca === 0 ? 'Población: derivado y validado en SCASEST / Angina Inestable.' : undefined,
    clinicalTiming: 'Presentación inicial / Urgencias',
    variablesUsed: params,
    missingRequiredVariables: [],
    points: total,
    percentageRisk: percentage,
    riskCategory: category,
    interpretation: `Puntuación: ${total}/7 puntos. Riesgo estimado de muerte, infarto o isquemia grave recurrente a 14 días: ${percentage}%. Categoría: Riesgo ${category}.`,
    clinicalOutcome: 'Mortalidad por cualquier causa, nuevo o recurrente IAM, o isquemia refractaria grave',
    horizon: '14 días tras la presentación',
    citation: 'Antman EM, et al. The TIMI risk score for unstable angina/non-ST elevation MI: A method for prognostication and therapeutic decision making. JAMA 2000;284(7):835-842.',
    citationDoi: 'https://doi.org/10.1001/jama.284.7.835',
    breakdown
  };
}
