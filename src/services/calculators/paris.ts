// Calculadora determinista de Riesgo Trombótico y Hemorrágico PARIS
// Fuente verificada: Baber U et al. JACC 2016;67(2):175-182
// DOI: 10.1016/j.jacc.2015.10.064 | PubMed: 27079334

import { ScoreResult } from '../../types/clinical';

export interface ParisScoresResult {
  thrombotic: ScoreResult;
  bleeding: ScoreResult;
}

export function calculateParisScores(params: {
  esSca: boolean; // Síndrome coronario agudo en presentación
  pciPrevia: 0 | 1 | null;
  cabgPrevia: 0 | 1 | null;
  diabetes: 0 | 1 | null;
  pciCompleja: 0 | 1 | null;
  tabacoActivo: 0 | 1 | null;
  aclaramientoCrCl: number | null; // mL/min
  edad: number | null;
  imc: number | null; // kg/m2
  hemoglobina: number | null; // g/dL
  sexo: 0 | 1 | null; // 0=M, 1=F
  tripleTerapiaAlta: 0 | 1 | null;
}): ParisScoresResult {
  // 1. PARIS Trombótico (Coronary Thrombotic Events - CTE)
  const cteMissing: string[] = [];
  if (params.pciPrevia === null || params.pciPrevia === undefined) cteMissing.push('PCI previa');
  if (params.cabgPrevia === null || params.cabgPrevia === undefined) cteMissing.push('CABG previa');
  if (params.diabetes === null || params.diabetes === undefined) cteMissing.push('Diabetes');
  if (params.pciCompleja === null || params.pciCompleja === undefined) cteMissing.push('PCI compleja');
  if (params.tabacoActivo === null || params.tabacoActivo === undefined) cteMissing.push('Tabaquismo activo');
  if (params.aclaramientoCrCl === null || params.aclaramientoCrCl === undefined) cteMissing.push('CrCl');

  let thromboticResult: ScoreResult;
  if (cteMissing.length > 0) {
    thromboticResult = {
      scoreId: 'paris_cte',
      name: 'PARIS Score — Riesgo Trombótico Coronario (CTE)',
      version: 'Baber et al. JACC 2016',
      applicable: true,
      clinicalTiming: 'Planificación tras intervencionismo coronario',
      variablesUsed: params,
      missingRequiredVariables: cteMissing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan determinantes trombóticos (${cteMissing.join(', ')}).`,
      clinicalOutcome: 'Trombosis de stent o infarto de miocardio espontáneo',
      horizon: '24 meses tras PCI',
      citation: 'Baber U, et al. Risk of Thrombotic and Bleeding Events After Stent Placement: The PARIS Score. J Am Coll Cardiol 2016;67(2):175-182.',
      citationDoi: 'https://doi.org/10.1016/j.jacc.2015.10.064'
    };
  } else {
    const cteBreakdown: { label: string; points: number; detail?: string }[] = [];
    let cteTotal = 0;

    const ptsSca = params.esSca ? 2 : 0;
    cteBreakdown.push({ label: 'Presentación como SCA', points: ptsSca });
    cteTotal += ptsSca;

    const ptsPci = params.pciPrevia === 1 ? 1 : 0;
    cteBreakdown.push({ label: 'PCI previa', points: ptsPci });
    cteTotal += ptsPci;

    const ptsCabg = params.cabgPrevia === 1 ? 2 : 0;
    cteBreakdown.push({ label: 'CABG previa', points: ptsCabg });
    cteTotal += ptsCabg;

    const ptsDm = params.diabetes === 1 ? 1 : 0;
    cteBreakdown.push({ label: 'Diabetes mellitus', points: ptsDm });
    cteTotal += ptsDm;

    const ptsPciComp = params.pciCompleja === 1 ? 2 : 0;
    cteBreakdown.push({ label: 'PCI compleja (3 vasos/CTO/stents ≥60mm/bifurcación)', points: ptsPciComp });
    cteTotal += ptsPciComp;

    const ptsTabaco = params.tabacoActivo === 1 ? 1 : 0;
    cteBreakdown.push({ label: 'Tabaquismo activo', points: ptsTabaco });
    cteTotal += ptsTabaco;

    const ptsCrcl = params.aclaramientoCrCl! < 60 ? 2 : 0;
    cteBreakdown.push({ label: 'CrCl < 60 mL/min', points: ptsCrcl, detail: `${params.aclaramientoCrCl} mL/min` });
    cteTotal += ptsCrcl;

    let cteCategory: 'Bajo' | 'Intermedio' | 'Alto' = 'Bajo';
    let ctePct = 1.4;
    if (cteTotal <= 2) {
      cteCategory = 'Bajo';
      ctePct = 1.4;
    } else if (cteTotal <= 4) {
      cteCategory = 'Intermedio';
      ctePct = 3.2;
    } else {
      cteCategory = 'Alto';
      ctePct = 5.4;
    }

    thromboticResult = {
      scoreId: 'paris_cte',
      name: 'PARIS Score — Riesgo Trombótico Coronario (CTE)',
      version: 'Baber et al. JACC 2016',
      applicable: true,
      clinicalTiming: 'Alta tras angioplastia coronaria',
      variablesUsed: params,
      missingRequiredVariables: [],
      points: cteTotal,
      percentageRisk: ctePct,
      riskCategory: cteCategory,
      interpretation: `Puntuación: ${cteTotal}/11 pts. Categoría: Riesgo Trombótico ${cteCategory} (tasa acumulada CTE a 2 años: ~${ctePct}%).`,
      clinicalOutcome: 'Trombosis de stent definitiva/probable o infarto espontáneo',
      horizon: '24 meses post-PCI',
      citation: 'Baber U, et al. Risk of Thrombotic and Bleeding Events After Stent Placement: The PARIS Score. J Am Coll Cardiol 2016;67(2):175-182.',
      citationDoi: 'https://doi.org/10.1016/j.jacc.2015.10.064',
      breakdown: cteBreakdown
    };
  }

  // 2. PARIS Hemorrágico (Major Bleeding - MB)
  const mbMissing: string[] = [];
  if (params.edad === null || params.edad === undefined) mbMissing.push('Edad');
  if (params.imc === null || params.imc === undefined) mbMissing.push('IMC');
  if (params.tabacoActivo === null || params.tabacoActivo === undefined) mbMissing.push('Tabaquismo activo');
  if (params.hemoglobina === null || params.hemoglobina === undefined) mbMissing.push('Hemoglobina');
  if (params.sexo === null || params.sexo === undefined) mbMissing.push('Sexo');
  if (params.aclaramientoCrCl === null || params.aclaramientoCrCl === undefined) mbMissing.push('CrCl');
  if (params.tripleTerapiaAlta === null || params.tripleTerapiaAlta === undefined) mbMissing.push('Triple terapia al alta');

  let bleedingResult: ScoreResult;
  if (mbMissing.length > 0) {
    bleedingResult = {
      scoreId: 'paris_mb',
      name: 'PARIS Score — Riesgo de Sangrado Mayor (MB)',
      version: 'Baber et al. JACC 2016',
      applicable: true,
      clinicalTiming: 'Planificación al alta tras angioplastia',
      variablesUsed: params,
      missingRequiredVariables: mbMissing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan determinantes hemorrágicos (${mbMissing.join(', ')}).`,
      clinicalOutcome: 'Sangrado mayor BARC 3 o 5',
      horizon: '24 meses tras PCI',
      citation: 'Baber U, et al. Risk of Thrombotic and Bleeding Events After Stent Placement: The PARIS Score. J Am Coll Cardiol 2016;67(2):175-182.',
      citationDoi: 'https://doi.org/10.1016/j.jacc.2015.10.064'
    };
  } else {
    const mbBreakdown: { label: string; points: number; detail?: string }[] = [];
    let mbTotal = 0;

    // Edad: 65-74: +1; >= 75: +2
    let ptsEdad = 0;
    const e = params.edad!;
    if (e >= 75) ptsEdad = 2;
    else if (e >= 65) ptsEdad = 1;
    mbBreakdown.push({ label: 'Edad', points: ptsEdad, detail: `${e} años` });
    mbTotal += ptsEdad;

    // IMC < 25 kg/m2: +2
    const ptsImc = params.imc! < 25 ? 2 : 0;
    mbBreakdown.push({ label: 'IMC < 25 kg/m²', points: ptsImc, detail: `${params.imc} kg/m²` });
    mbTotal += ptsImc;

    // Tabaquismo actual: +1
    const ptsTab = params.tabacoActivo === 1 ? 1 : 0;
    mbBreakdown.push({ label: 'Tabaquismo activo', points: ptsTab });
    mbTotal += ptsTab;

    // Anemia: Hb < 12 en mujeres, < 13 en hombres: +2
    const isAnemic = params.sexo === 1 ? params.hemoglobina! < 12.0 : params.hemoglobina! < 13.0;
    const ptsAnemia = isAnemic ? 2 : 0;
    mbBreakdown.push({ label: 'Anemia basal (Hb <12 en mujeres, <13 en hombres)', points: ptsAnemia, detail: `${params.hemoglobina} g/dL` });
    mbTotal += ptsAnemia;

    // CrCl < 60 mL/min: +2
    const ptsCrcl = params.aclaramientoCrCl! < 60 ? 2 : 0;
    mbBreakdown.push({ label: 'CrCl < 60 mL/min', points: ptsCrcl, detail: `${params.aclaramientoCrCl} mL/min` });
    mbTotal += ptsCrcl;

    // Triple terapia al alta: +2
    const ptsTt = params.tripleTerapiaAlta === 1 ? 2 : 0;
    mbBreakdown.push({ label: 'Triple terapia antitrombótica al alta', points: ptsTt });
    mbTotal += ptsTt;

    let mbCategory: 'Bajo' | 'Intermedio' | 'Alto' = 'Bajo';
    let mbPct = 1.5;
    if (mbTotal <= 3) {
      mbCategory = 'Bajo';
      mbPct = 1.5;
    } else if (mbTotal <= 7) {
      mbCategory = 'Intermedio';
      mbPct = 3.3;
    } else {
      mbCategory = 'Alto';
      mbPct = 8.6;
    }

    bleedingResult = {
      scoreId: 'paris_mb',
      name: 'PARIS Score — Riesgo de Sangrado Mayor (MB)',
      version: 'Baber et al. JACC 2016',
      applicable: true,
      clinicalTiming: 'Planificación al alta tras angioplastia',
      variablesUsed: params,
      missingRequiredVariables: [],
      points: mbTotal,
      percentageRisk: mbPct,
      riskCategory: mbCategory,
      interpretation: `Puntuación: ${mbTotal}/11 pts. Categoría: Riesgo Hemorrágico ${mbCategory} (tasa acumulada de sangrado mayor a 2 años: ~${mbPct}%).`,
      clinicalOutcome: 'Sangrado mayor extrahospitalario (BARC 3 o 5)',
      horizon: '24 meses post-PCI',
      citation: 'Baber U, et al. Risk of Thrombotic and Bleeding Events After Stent Placement: The PARIS Score. J Am Coll Cardiol 2016;67(2):175-182.',
      citationDoi: 'https://doi.org/10.1016/j.jacc.2015.10.064',
      breakdown: mbBreakdown
    };
  }

  return { thrombotic: thromboticResult, bleeding: bleedingResult };
}
