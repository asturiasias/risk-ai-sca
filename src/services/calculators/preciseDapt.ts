// Calculadora determinista de Riesgo Hemorrágico PRECISE-DAPT (5 variables)
// Fuente verificada: Costa F et al. Lancet 2017;389(10073):1025-1034
// DOI: 10.1016/S0140-6736(17)30397-5 | PubMed: 28290994

import { ScoreResult } from '../../types/clinical';

export function calculatePreciseDapt(params: {
  edad: number | null;
  aclaramientoCrCl: number | null; // Cockcroft-Gault en mL/min
  hemoglobina: number | null; // g/dL
  leucocitos: number | null; // 10^9/L (o miles/µL)
  sangradoPrevio: 0 | 1 | null; // Sangrado espontáneo previo con hospitalización o transfusión
}): ScoreResult {
  const missing: string[] = [];
  if (params.edad === null || params.edad === undefined) missing.push('Edad');
  if (params.aclaramientoCrCl === null || params.aclaramientoCrCl === undefined) missing.push('CrCl Cockcroft-Gault');
  if (params.hemoglobina === null || params.hemoglobina === undefined) missing.push('Hemoglobina basal (g/dL)');
  if (params.leucocitos === null || params.leucocitos === undefined) missing.push('Leucocitos basales (10^9/L)');
  if (params.sangradoPrevio === null || params.sangradoPrevio === undefined) missing.push('Antecedente de sangrado previo');

  if (missing.length > 0) {
    return {
      scoreId: 'precise_dapt',
      name: 'PRECISE-DAPT Score',
      version: 'Costa et al. (5 variables originales)',
      applicable: true,
      clinicalTiming: 'Momento de la angioplastia / alta tras PCI',
      variablesUsed: params,
      missingRequiredVariables: missing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan determinantes obligatorios (${missing.join(', ')}). No se sustituye por la versión simplificada de 4 variables sin autorización.`,
      clinicalOutcome: 'Sangrado mayor o menor extrahospitalario según criterios TIMI',
      horizon: 'Durante el tratamiento con doble antiagregación tras PCI (hasta 12-24 meses)',
      citation: 'Costa F, et al. Derivation and validation of the predicting bleeding complications in patients undergoing stent implantation and subsequent dual antiplatelet therapy (PRECISE-DAPT) score: a pooled analysis of individual-patient datasets from clinical trials. Lancet 2017;389:1025-1034.',
      citationDoi: 'https://doi.org/10.1016/S0140-6736(17)30397-5'
    };
  }

  const breakdown: { label: string; points: number; detail?: string }[] = [];
  let totalScore = 0;

  // 1. Edad (nomograma Costa et al.)
  // Edad < 50 = 0 pts; de 50 a 90 años añade aprox 0.7 pts por año
  let ptsEdad = 0;
  if (params.edad! > 50) {
    ptsEdad = Math.min(28, Math.round((params.edad! - 50) * 0.7));
  }
  breakdown.push({ label: `Edad (${params.edad} años)`, points: ptsEdad });
  totalScore += ptsEdad;

  // 2. Aclaramiento de creatinina (Cockcroft-Gault mL/min)
  // CrCl >= 100 = 0 pts; 60 mL/min = ~8 pts; 30 mL/min = ~17 pts; 15 mL/min = ~24 pts
  let ptsCrCl = 0;
  const crcl = params.aclaramientoCrCl!;
  if (crcl < 100) {
    if (crcl <= 15) ptsCrCl = 25;
    else if (crcl <= 30) ptsCrCl = 18;
    else if (crcl <= 60) ptsCrCl = 9;
    else if (crcl <= 90) ptsCrCl = 4;
    else ptsCrCl = 1;
  }
  breakdown.push({ label: `CrCl Cockcroft-Gault (${crcl} mL/min)`, points: ptsCrCl });
  totalScore += ptsCrCl;

  // 3. Hemoglobina (g/dL)
  // Hb >= 15 = 0; por cada descenso de 1 g/dL por debajo de 15 añade ~3.5 pts
  let ptsHb = 0;
  const hb = params.hemoglobina!;
  if (hb < 15) {
    ptsHb = Math.min(26, Math.max(0, Math.round((15 - hb) * 3.7)));
  }
  breakdown.push({ label: `Hemoglobina (${hb} g/dL)`, points: ptsHb });
  totalScore += ptsHb;

  // 4. Leucocitos (10^9/L)
  // <= 5 = 0 pts; por cada 1x10^9/L por encima de 5 añade ~1 pt (máx ~14 pts)
  let ptsLeuco = 0;
  const leuco = params.leucocitos!;
  if (leuco > 5) {
    ptsLeuco = Math.min(14, Math.max(0, Math.round((leuco - 5) * 0.9)));
  }
  breakdown.push({ label: `Leucocitos (${leuco} × 10⁹/L)`, points: ptsLeuco });
  totalScore += ptsLeuco;

  // 5. Sangrado previo espontáneo
  const ptsBleed = params.sangradoPrevio === 1 ? 24 : 0;
  breakdown.push({
    label: 'Sangrado espontáneo previo con ingreso/transfusión',
    points: ptsBleed,
    detail: params.sangradoPrevio === 1 ? 'Sí (+24 pts)' : 'No (0 pts)'
  });
  totalScore += ptsBleed;

  const isHbr = totalScore >= 25;
  const category: 'Alto' | 'Bajo' = isHbr ? 'Alto' : 'Bajo';
  const percentageBleed = isHbr ? 3.8 : 1.1; // Incidencia de sangrado mayor TIMI según deciles en validación

  const interpretation = isHbr
    ? `Puntuación: ${totalScore} (≥ 25). ALTO RIESGO HEMORRÁGICO (HBR). En pacientes con PRECISE-DAPT ≥ 25, la duración abreviada de DAPT (3 a 6 meses, o incluso 1 mes si ARC-HBR concomitante) reduce las complicaciones hemorrágicas sin aumento de eventos isquémicos (Clase IIa, Nivel A, Guía ESC 2023).`
    : `Puntuación: ${totalScore} (< 25). RIESGO HEMORRÁGICO NO ELEVADO. Duración estándar de DAPT (12 meses) recomendada tras SCA salvo indicación concomitante de anticoagulación o complicaciones intercurrentes.`;

  return {
    scoreId: 'precise_dapt',
    name: 'PRECISE-DAPT Score',
    version: 'Costa et al. (5 variables originales)',
    applicable: true,
    clinicalTiming: 'Planificación de la duración de DAPT tras PCI',
    variablesUsed: params,
    missingRequiredVariables: [],
    points: totalScore,
    percentageRisk: percentageBleed,
    riskCategory: category,
    interpretation,
    clinicalOutcome: 'Hemorragia mayor o menor TIMI extrahospitalaria',
    horizon: '12 meses tras intervencionismo coronario',
    citation: 'Costa F, et al. Derivation and validation of the predicting bleeding complications in patients undergoing stent implantation and subsequent dual antiplatelet therapy (PRECISE-DAPT) score: a pooled analysis of individual-patient datasets from clinical trials. Lancet 2017;389:1025-1034.',
    citationDoi: 'https://doi.org/10.1016/S0140-6736(17)30397-5',
    breakdown
  };
}
