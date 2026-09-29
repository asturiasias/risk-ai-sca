// Calculadora determinista de Riesgo GRACE (Global Registry of Acute Coronary Events)
// Fuente verificada: Fox KAA et al. BMJ 2006;333:1091 / BMJ Open 2014;4:e004425
// DOI: 10.1136/bmj.38985.646481.55 | PubMed: 24561498

import { ScoreResult } from '../../types/clinical';

export function calculateGraceScore(params: {
  edad: number | null;
  fc: number | null;
  pas: number | null;
  creatinina: number | null;
  killip: number | null; // 1=I, 2=II, 3=III, 4=IV
  paradaIngreso: 0 | 1 | null;
  desviacionSt: 0 | 1 | null;
  biomarcadoresElevados: 0 | 1 | null;
  tipoSca?: 0 | 1 | 2 | null;
}): ScoreResult {
  const missing: string[] = [];
  if (params.edad === null || params.edad === undefined) missing.push('Edad');
  if (params.fc === null || params.fc === undefined) missing.push('Frecuencia cardiaca');
  if (params.pas === null || params.pas === undefined) missing.push('Presión arterial sistólica');
  if (params.creatinina === null || params.creatinina === undefined) missing.push('Creatinina sérica');
  if (params.killip === null || params.killip === undefined) missing.push('Clase Killip');
  if (params.paradaIngreso === null || params.paradaIngreso === undefined) missing.push('Parada cardiaca al ingreso');
  if (params.desviacionSt === null || params.desviacionSt === undefined) missing.push('Desviación del segmento ST');
  if (params.biomarcadoresElevados === null || params.biomarcadoresElevados === undefined) missing.push('Biomarcadores miocárdicos elevados');

  if (missing.length > 0) {
    return {
      scoreId: 'grace',
      name: 'GRACE Score',
      version: '1.0 / Validación Fox et al. (mortalidad intrahospitalaria)',
      applicable: true,
      clinicalTiming: 'Evaluación al ingreso (urgencias)',
      variablesUsed: params,
      missingRequiredVariables: missing,
      points: null,
      percentageRisk: null,
      riskCategory: 'Indeterminado',
      interpretation: `No calculable: faltan datos clínicos obligatorios (${missing.join(', ')}). No se asumen ceros para variables ausentes.`,
      clinicalOutcome: 'Mortalidad intrahospitalaria por cualquier causa',
      horizon: 'Durante el ingreso índice hospitalario',
      citation: 'Fox KAA, et al. Prediction of risk of death and myocardial infarction in the six months after presentation with acute coronary syndrome: prospective multinational observational study (GRACE). BMJ 2006;333:1091.',
      citationDoi: 'https://doi.org/10.1136/bmj.38985.646481.55'
    };
  }

  const breakdown: { label: string; points: number; detail?: string }[] = [];
  let total = 0;

  // 1. Edad
  let ptsEdad = 0;
  const e = params.edad!;
  if (e < 30) ptsEdad = 0;
  else if (e < 40) ptsEdad = 8;
  else if (e < 50) ptsEdad = 25;
  else if (e < 60) ptsEdad = 41;
  else if (e < 70) ptsEdad = 58;
  else if (e < 80) ptsEdad = 75;
  else if (e < 90) ptsEdad = 91;
  else ptsEdad = 100;
  breakdown.push({ label: `Edad (${e} años)`, points: ptsEdad });
  total += ptsEdad;

  // 2. Frecuencia Cardiaca
  let ptsFc = 0;
  const fc = params.fc!;
  if (fc < 50) ptsFc = 0;
  else if (fc < 70) ptsFc = 3;
  else if (fc < 90) ptsFc = 9;
  else if (fc < 110) ptsFc = 15;
  else if (fc < 150) ptsFc = 24;
  else if (fc < 200) ptsFc = 38;
  else ptsFc = 46;
  breakdown.push({ label: `Frecuencia cardiaca (${fc} lpm)`, points: ptsFc });
  total += ptsFc;

  // 3. Presión Arterial Sistólica
  let ptsPas = 0;
  const pas = params.pas!;
  if (pas < 80) ptsPas = 58;
  else if (pas < 100) ptsPas = 53;
  else if (pas < 120) ptsPas = 43;
  else if (pas < 140) ptsPas = 34;
  else if (pas < 160) ptsPas = 24;
  else if (pas < 200) ptsPas = 10;
  else ptsPas = 0;
  breakdown.push({ label: `Presión arterial sistólica (${pas} mmHg)`, points: ptsPas });
  total += ptsPas;

  // 4. Creatinina
  let ptsCr = 0;
  const cr = params.creatinina!;
  if (cr < 0.4) ptsCr = 1;
  else if (cr < 0.8) ptsCr = 4;
  else if (cr < 1.2) ptsCr = 7;
  else if (cr < 1.6) ptsCr = 10;
  else if (cr < 2.0) ptsCr = 13;
  else if (cr < 4.0) ptsCr = 21;
  else ptsCr = 28;
  breakdown.push({ label: `Creatinina (${cr} mg/dL)`, points: ptsCr });
  total += ptsCr;

  // 5. Clase Killip
  let ptsKillip = 0;
  const k = params.killip!;
  if (k === 1) ptsKillip = 0;
  else if (k === 2) ptsKillip = 20;
  else if (k === 3) ptsKillip = 39;
  else if (k >= 4) ptsKillip = 59;
  breakdown.push({ label: `Clase Killip (${k})`, points: ptsKillip });
  total += ptsKillip;

  // 6. Parada cardiaca al ingreso
  const ptsPcr = params.paradaIngreso === 1 ? 39 : 0;
  breakdown.push({ label: 'Parada cardiaca al ingreso', points: ptsPcr, detail: params.paradaIngreso === 1 ? 'Sí (+39)' : 'No (0)' });
  total += ptsPcr;

  // 7. Desviación segmento ST
  const ptsSt = params.desviacionSt === 1 ? 28 : 0;
  breakdown.push({ label: 'Desviación ST', points: ptsSt, detail: params.desviacionSt === 1 ? 'Sí (+28)' : 'No (0)' });
  total += ptsSt;

  // 8. Biomarcadores elevados
  const ptsBio = params.biomarcadoresElevados === 1 ? 14 : 0;
  breakdown.push({ label: 'Biomarcadores miocárdicos elevados', points: ptsBio, detail: params.biomarcadoresElevados === 1 ? 'Sí (+14)' : 'No (0)' });
  total += ptsBio;

  // Estratificación de riesgo
  const isStemi = params.tipoSca === 0;
  let category: 'Bajo' | 'Intermedio' | 'Alto' = 'Bajo';
  let estPercentage = 0;
  let interpretation = '';

  if (isStemi) {
    if (total <= 125) {
      category = 'Bajo';
      estPercentage = 1.5;
      interpretation = 'Riesgo bajo de mortalidad intrahospitalaria (<2%).';
    } else if (total <= 154) {
      category = 'Intermedio';
      estPercentage = 3.5;
      interpretation = 'Riesgo intermedio de mortalidad intrahospitalaria (2-5%).';
    } else {
      category = 'Alto';
      estPercentage = 8.5;
      interpretation = 'Riesgo alto de mortalidad intrahospitalaria (>5%).';
    }
  } else {
    // SCASEST / Angina inestable
    if (total <= 108) {
      category = 'Bajo';
      estPercentage = 0.5;
      interpretation = 'Riesgo bajo de mortalidad intrahospitalaria (<1%).';
    } else if (total <= 140) {
      category = 'Intermedio';
      estPercentage = 2.0;
      interpretation = 'Riesgo intermedio de mortalidad intrahospitalaria (1-3%).';
    } else {
      category = 'Alto';
      estPercentage = 6.0;
      interpretation = 'Riesgo alto de mortalidad intrahospitalaria (>3%). En SCASEST, un score GRACE > 140 es criterio formal de indicación de estrategia invasiva precoz (<24 h) según Guía ESC 2023.';
    }
  }

  return {
    scoreId: 'grace',
    name: 'GRACE Score',
    version: '1.0 (Fox et al.)',
    applicable: true,
    clinicalTiming: 'Ingreso hospitalario / urgencias',
    variablesUsed: params,
    missingRequiredVariables: [],
    points: total,
    percentageRisk: estPercentage,
    riskCategory: category,
    interpretation: `${interpretation} Puntuación total: ${total} puntos.`,
    clinicalOutcome: 'Mortalidad intrahospitalaria por cualquier causa',
    horizon: 'Durante el ingreso índice hospitalario',
    citation: 'Fox KAA, et al. Prediction of risk of death and myocardial infarction in the six months after presentation with acute coronary syndrome: prospective multinational observational study (GRACE). BMJ 2006;333:1091.',
    citationDoi: 'https://doi.org/10.1136/bmj.38985.646481.55',
    breakdown
  };
}
