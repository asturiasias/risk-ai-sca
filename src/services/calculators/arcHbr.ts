// Consenso ARC-HBR (Academic Research Consortium for High Bleeding Risk)
// Fuente verificada: Urban P et al. Circulation 2019;140(3):240-250
// DOI: 10.1161/CIRCULATIONAHA.119.040167 | PubMed: 31116078

import { ScoreResult } from '../../types/clinical';

export interface ArcHbrEvaluationResult extends ScoreResult {
  majorCriteriaMet: string[];
  minorCriteriaMet: string[];
  isHbr: boolean | null; // true = HBR; false = No HBR; null = Indeterminado
}

export function evaluateArcHbr(params: {
  edad: number | null;
  sexo: 0 | 1 | null;
  fgCkdepi: number | null; // mL/min/1.73m2
  hemoglobina: number | null; // g/dL
  plaquetas: number | null; // 10^9/L
  anticoagulacionOralCronica: 0 | 1 | null;
  sangradoEspontaneoHospitalizacion6m: 0 | 1 | null;
  sangradoEspontaneoHospitalizacion12m: 0 | 1 | null;
  diatesisHemorragica: 0 | 1 | null;
  cirrosisHipertensionPortal: 0 | 1 | null;
  cancerActivo12m: 0 | 1 | null;
  hemorragiaIntracranealPrevia: 0 | 1 | null;
  ictusIsquemico6m: 0 | 1 | null;
  ictusIsquemicoCualquierMomento: 0 | 1 | null;
  cirugiaNoDiferibleDapt: 0 | 1 | null;
  cirugiaMayorTraumaReciente30d: 0 | 1 | null;
  malformacionArteriovenosaCerebral: 0 | 1 | null;
  usoCronicoAinesOCorticoides: 0 | 1 | null;
}): ArcHbrEvaluationResult {
  const majorMet: string[] = [];
  const minorMet: string[] = [];
  const missingCrucial: string[] = [];

  // 1. Criterios Mayores
  // Anticoagulación oral crónica
  if (params.anticoagulacionOralCronica === 1) {
    majorMet.push('Uso previsto de anticoagulación oral crónica a largo plazo');
  } else if (params.anticoagulacionOralCronica === null) {
    missingCrucial.push('Indicación de anticoagulación oral crónica');
  }

  // ERC grave / terminal (FG < 30 mL/min/1.73m2)
  if (params.fgCkdepi !== null && params.fgCkdepi !== undefined) {
    if (params.fgCkdepi < 30) {
      majorMet.push(`ERC grave o terminal (FG ${params.fgCkdepi} mL/min/1.73m² < 30)`);
    } else if (params.fgCkdepi >= 30 && params.fgCkdepi < 60) {
      minorMet.push(`ERC moderada (FG ${params.fgCkdepi} mL/min/1.73m² entre 30 y 59)`);
    }
  } else {
    missingCrucial.push('Filtrado glomerular / función renal');
  }

  // Hemoglobina basal
  if (params.hemoglobina !== null && params.hemoglobina !== undefined) {
    if (params.hemoglobina < 11.0) {
      majorMet.push(`Anemia basal grave (Hemoglobina ${params.hemoglobina} g/dL < 11.0)`);
    } else {
      // Criterio menor de anemia: 11-12.9 en hombres, 11-11.9 en mujeres
      const isMale = params.sexo === 0;
      if (isMale && params.hemoglobina >= 11.0 && params.hemoglobina < 13.0) {
        minorMet.push(`Anemia basal moderada en varón (Hb ${params.hemoglobina} g/dL < 13.0)`);
      } else if (!isMale && params.sexo === 1 && params.hemoglobina >= 11.0 && params.hemoglobina < 12.0) {
        minorMet.push(`Anemia basal moderada en mujer (Hb ${params.hemoglobina} g/dL < 12.0)`);
      }
    }
  } else {
    missingCrucial.push('Hemoglobina basal');
  }

  // Sangrado espontáneo
  if (params.sangradoEspontaneoHospitalizacion6m === 1) {
    majorMet.push('Sangrado espontáneo que requirió hospitalización o transfusión en los últimos 6 meses');
  } else if (params.sangradoEspontaneoHospitalizacion12m === 1) {
    minorMet.push('Sangrado espontáneo previo con hospitalización o transfusión entre 6 y 12 meses');
  }

  // Trombocitopenia basal (<100 x 10^9/L)
  if (params.plaquetas !== null && params.plaquetas !== undefined) {
    if (params.plaquetas < 100) {
      majorMet.push(`Trombocitopenia moderada/grave basal (Plaquetas ${params.plaquetas} × 10⁹/L < 100)`);
    }
  }

  // Diátesis hemorrágica crónica
  if (params.diatesisHemorragica === 1) {
    majorMet.push('Diátesis hemorrágica documentada');
  }

  // Cirrosis hepática con hipertensión portal
  if (params.cirrosisHipertensionPortal === 1) {
    majorMet.push('Cirrosis hepática clínicamente relevante con hipertensión portal');
  }

  // Cáncer activo en 12 meses
  if (params.cancerActivo12m === 1) {
    majorMet.push('Cáncer activo o en tratamiento en los últimos 12 meses');
  }

  // Hemorragia intracraneal previa (cualquier momento) o MAV cerebral
  if (params.hemorragiaIntracranealPrevia === 1 || params.malformacionArteriovenosaCerebral === 1) {
    majorMet.push('Hemorragia intracraneal previa espontánea o malformación arteriovenosa cerebral');
  }

  // Ictus isquémico reciente (<6 meses)
  if (params.ictusIsquemico6m === 1) {
    majorMet.push('Ictus isquémico en los últimos 6 meses');
  } else if (params.ictusIsquemicoCualquierMomento === 1) {
    minorMet.push('Ictus isquémico previo (>6 meses)');
  }

  // Cirugía mayor no diferible bajo DAPT o trauma/cirugía mayor <30d
  if (params.cirugiaNoDiferibleDapt === 1) {
    majorMet.push('Cirugía mayor no diferible programada bajo tratamiento con DAPT');
  }
  if (params.cirugiaMayorTraumaReciente30d === 1) {
    majorMet.push('Cirugía mayor o traumatismo mayor reciente en los 30 días previos a la PCI');
  }

  // 2. Criterios Menores adicionales
  // Edad >= 75 años
  if (params.edad !== null && params.edad !== undefined) {
    if (params.edad >= 75) {
      minorMet.push(`Edad ≥ 75 años (${params.edad} años)`);
    }
  } else {
    missingCrucial.push('Edad');
  }

  // Uso crónico de AINEs o corticoides
  if (params.usoCronicoAinesOCorticoides === 1) {
    minorMet.push('Tratamiento crónico oral con AINEs o corticoides sistémicos');
  }

  // Regla ARC-HBR:
  // HBR si >= 1 Criterio Mayor O >= 2 Criterios Menores
  const qualifiesHbr = majorMet.length >= 1 || minorMet.length >= 2;

  let riskCategory: 'Alto' | 'Bajo' | 'Indeterminado' = 'Indeterminado';
  let isHbr: boolean | null = null;
  let interpretation = '';

  if (qualifiesHbr) {
    // Si ya se cumple la regla, es HBR demostrable aunque falten algunos otros datos secundarios
    isHbr = true;
    riskCategory = 'Alto';
    interpretation = `ALTO RIESGO HEMORRÁGICO (ARC-HBR POSITIVO). Cumple ${majorMet.length} criterio(s) mayor(es) y ${minorMet.length} criterio(s) menor(es). Se define como riesgo previsto de sangrado mayor BARC 3 o 5 ≥ 4% al año. Justifica estrategia de desescalado o acortamiento de DAPT (1 a 3 meses) según Guía ESC 2023.`;
  } else if (missingCrucial.length > 0) {
    // Si NO se cumple con lo conocido pero faltan determinantes capitales: INDETERMINADO
    isHbr = null;
    riskCategory = 'Indeterminado';
    interpretation = `CLASIFICACIÓN INDETERMINADA: Faltan determinantes esenciales (${missingCrucial.join(', ')}). Siguiendo las directrices ARC-HBR, no se etiqueta falsamente como 'bajo riesgo' a un paciente con datos incompletos.`;
  } else {
    // Evaluado sistemáticamente sin cumplir criterios
    isHbr = false;
    riskCategory = 'Bajo';
    interpretation = `NO CUMPLE CRITERIOS ARC-HBR (Riesgo Hemorrágico No Elevado). Criterios mayores presentes: 0. Criterios menores: ${minorMet.length} (< 2). Apto para duración estándar de DAPT salvo otras indicaciones clínicas.`;
  }

  const breakdown = [
    ...majorMet.map(c => ({ label: `[CRITERIO MAYOR] ${c}`, points: 'Mayor' })),
    ...minorMet.map(c => ({ label: `[CRITERIO MENOR] ${c}`, points: 'Menor' }))
  ];

  return {
    scoreId: 'arc_hbr',
    name: 'Consenso ARC-HBR (Academic Research Consortium for High Bleeding Risk)',
    version: 'Urban et al. Circulation 2019 / Guías ESC SCA 2023',
    applicable: true,
    clinicalTiming: 'Planificación de la duración y régimen antitrombótico tras PCI',
    variablesUsed: params,
    missingRequiredVariables: missingCrucial,
    points: majorMet.length + (minorMet.length >= 2 ? 1 : 0),
    percentageRisk: isHbr ? 4.5 : 1.2,
    riskCategory,
    interpretation,
    clinicalOutcome: 'Hemorragia mayor BARC tipo 3 o 5',
    horizon: '1 año post-PCI',
    citation: 'Urban P, et al. Defining High Bleeding Risk in Patients Undergoing Percutaneous Coronary Intervention: A Consensus Document From the Academic Research Consortium for High Bleeding Risk. Circulation 2019;140(3):240-250.',
    citationDoi: 'https://doi.org/10.1161/CIRCULATIONAHA.119.040167',
    breakdown,
    majorCriteriaMet: majorMet,
    minorCriteriaMet: minorMet,
    isHbr
  };
}
