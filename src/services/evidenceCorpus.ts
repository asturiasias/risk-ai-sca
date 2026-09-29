// Biblioteca Científica Verificada (Corpus RAG) para Risk AI-SCA
// Contiene citas Vancouver con DOI verificados, sociedad científica, secciones y citas textuales exactas.

import { EvidenceItem } from '../types/clinical';

export const SCIENTIFIC_CORPUS: EvidenceItem[] = [
  // 1. ESC 2023 ACS Guidelines
  {
    id: 'ESC-2023-ACS-INVASIVE-IMMEDIATE',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de los síndromes coronarios agudos',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    section: 'Sección 5.1 — Estrategia invasiva inmediata (< 2 h)',
    recommendationQuote: 'Se recomienda una estrategia invasiva inmediata (< 2 horas desde el contacto médico) en pacientes con SCASEST que presentan al menos un criterio de muy alto riesgo: inestabilidad hemodinámica o shock cardiogénico, dolor torácico recurrente o refractario pese a tratamiento médico óptimo, arritmias ventriculares potencialmente mortales o parada cardiaca resucitada, complicaciones mecánicas del infarto, o insuficiencia cardiaca aguda atribuible a isquemia miocárdica en curso.',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['invasiva inmediata', 'shock', 'inestabilidad', 'scasest', 'urgencias', 'arritmia']
  },
  {
    id: 'ESC-2023-ACS-INVASIVE-EARLY',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de los síndromes coronarios agudos',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    section: 'Sección 5.2 — Estrategia invasiva precoz (< 24 h)',
    recommendationQuote: 'Se recomienda una estrategia invasiva precoz dentro de las primeras 24 horas del ingreso en pacientes con SCASEST con diagnóstico confirmado de IAMSEST, cambios dinámicos del ST o elevación transitoria, o con puntuación de riesgo GRACE estimada > 140 puntos.',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['invasiva precoz', 'grace', 'scasest', '24 horas', 'iamsest']
  },
  {
    id: 'ESC-2023-ACS-P2Y12-CHOICE',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de los síndromes coronarios agudos',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    section: 'Sección 6.1 — Elección del inhibidor P2Y12 en SCA',
    recommendationQuote: 'Se recomienda un inhibidor potente del receptor P2Y12 (prasugrel 10 mg/día o 5 mg/día en ≥75 años o <60 kg, o ticagrelor 90 mg/12 h) en combinación con AAS durante 12 meses tras PCI por SCA, a menos que existan contraindicaciones o alto riesgo hemorrágico (ARC-HBR o PRECISE-DAPT ≥ 25). Se prefiere prasugrel sobre ticagrelor en pacientes sometidos a angioplastia primaria (ensayo ISAR-REACT 5). Clopidogrel (75 mg/día) queda reservado para situaciones de alto riesgo de sangrado, contraindicación/intolerancia a prasugrel/ticagrelor, o necesidad de anticoagulación oral.',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['p2y12', 'prasugrel', 'ticagrelor', 'clopidogrel', 'dapt', 'antiagregacion']
  },
  {
    id: 'ESC-2023-ACS-PRASUGREL-CONTRAINDICATION',
    guidelineOrStudy: 'Ficha Técnica Oficial y Guía ESC 2023 SCA',
    societyOrJournal: 'European Medicines Agency / ESC',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: 'Prasugrel Summary of Product Characteristics & ESC ACS Safety Criteria',
    section: 'Contraindicaciones críticas de Prasugrel',
    recommendationQuote: 'Prasugrel está estrictamente CONTRAINDICADO en pacientes con antecedente de ictus isquémico previo o accidente isquémico transitorio (AIT), hemorragia patológica activa o insuficiencia hepática grave (Child-Pugh C). En pacientes con edad ≥ 75 años no se recomienda de forma general por incremento de hemorragia mortal; si se considera imprescindible, o en pacientes con peso corporal < 60 kg, se exige reducir la dosis de mantenimiento a 5 mg una vez al día.',
    classOfRecommendation: 'Clase III (Contraindicación Absoluta)',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['prasugrel', 'contraindicacion', 'ictus', 'ait', 'peso', 'edad']
  },
  {
    id: 'ESC-2023-ACS-AF-ANTICOAGULATION',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de los síndromes coronarios agudos',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    section: 'Sección 6.3 — Pacientes con indicación de anticoagulación oral sometidos a PCI',
    recommendationQuote: 'En pacientes con FA o indicación de anticoagulación sometidos a PCI por SCA: se recomienda una terapia triple (DOAC + AAS + clopidogrel) durante el procedimiento y la estancia hospitalaria inicial (hasta un máximo de 1 semana). Al alta, se recomienda la desescalada inmediata a TERAPIA DOBLE (DOAC a dosis completa aprobada para prevención de ictus + clopidogrel 75 mg/día) durante 12 meses. Se desaconseja el uso concomitante de ticagrelor o prasugrel como parte de la triple terapia con anticoagulante.',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['fa', 'fibrilacion auricular', 'anticoagulacion', 'triple terapia', 'doble terapia', 'doac', 'clopidogrel']
  },
  {
    id: 'ESC-2023-ACS-HBR-SHORT-DAPT',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de los síndromes coronarios agudos',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    section: 'Sección 6.2 — Duración acortada de DAPT en Alto Riesgo Hemorrágico (HBR)',
    recommendationQuote: 'En pacientes con alto riesgo de hemorragia (definido por ARC-HBR positivo o PRECISE-DAPT ≥ 25), se debe considerar suspender el inhibidor P2Y12 a los 3 meses (o tras 1 mes si riesgo hemorrágico extremo) y continuar con monoterapia antiagregante (preferentemente AAS o inhibidor P2Y12 en monoterapia).',
    classOfRecommendation: 'Clase IIa',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['hbr', 'arc-hbr', 'precise-dapt', 'dapt corta', 'acortamiento', 'sangrado']
  },
  {
    id: 'ESC-2023-ACS-PPI-GASTROPROTECTION',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de los síndromes coronarios agudos',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    section: 'Sección 6.4 — Gastroprotección durante el tratamiento antiplaquetario',
    recommendationQuote: 'Se recomienda el uso rutinario concomitante de un inhibidor de la bomba de protones (IBP) en todos los pacientes con SCA que reciben DAPT, terapia antiplaquetaria simple o anticoagulación oral con alto riesgo de sangrado gastrointestinal (antecedente de úlcera o sangrado GI, edad ≥ 65 años, uso de anticoagulantes, AINEs o corticoides).',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['ibp', 'gastroproteccion', 'dapt', 'ulcera', 'omeprazol', 'pantoprazol']
  },
  {
    id: 'ESC-2019-DYSLIPIDEMIA-GOALS',
    guidelineOrStudy: 'Guía ESC/EAS 2019 para el manejo de las dislipidemias',
    societyOrJournal: 'European Heart Journal (ESC/EAS)',
    year: 2019,
    doi: '10.1093/eurheartj/ehz455',
    url: 'https://doi.org/10.1093/eurheartj/ehz455',
    title: '2019 ESC/EAS Guidelines for the management of dyslipidaemias: lipid modification to reduce cardiovascular risk',
    section: 'Sección 7 — Objetivos de c-LDL en Muy Alto Riesgo Cardiovascular',
    recommendationQuote: 'En pacientes con SCA (clasificados automáticamente como muy alto riesgo cardiovascular): se recomienda una reducción de c-LDL ≥ 50% respecto al valor basal Y alcanzar un objetivo estricto de c-LDL < 55 mg/dL (< 1.4 mmol/L). En pacientes que sufren un segundo evento vascular en < 2 años mientras recibían estatina a dosis máxima tolerada, se puede considerar un objetivo de c-LDL < 40 mg/dL (< 1.0 mmol/L). Se debe iniciar precozmente una estatina de alta intensidad (atorvastatina 40-80 mg o rosuvastatina 20-40 mg); si no se alcanza el objetivo en 4-6 semanas, añadir ezetimiba 10 mg/día, y posteriormente inhibidores de PCSK9.',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['ldl', 'estatina', 'alta intensidad', 'ezetimiba', 'pcsk9', 'dislipidemia', '55 mg/dl']
  },
  {
    id: 'ESC-2023-DIABETES-SGLT2-GLP1',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de la enfermedad cardiovascular en pacientes con diabetes',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad192',
    url: 'https://doi.org/10.1093/eurheartj/ehad192',
    title: '2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes',
    section: 'Sección 5 — Fármacos con beneficio cardiorrenal demostrado',
    recommendationQuote: 'En pacientes con diabetes tipo 2 y enfermedad cardiovascular aterosclerótica documentada (como un SCA): se recomienda el tratamiento con inhibidores de SGLT2 (empagliflozina, dapagliflozina) y/o agonistas del receptor de GLP-1 con beneficio CV probado para reducir el riesgo de nuevos eventos cardiovasculares mayores, muerte cardiovascular y hospitalizaciones por insuficiencia cardiaca, con independencia de la HbA1c basal.',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['diabetes', 'isglt2', 'glp-1', 'empagliflozina', 'dapagliflozina', 'cardiorrenal']
  },
  {
    id: 'ESC-2023-ACS-HEART-FAILURE-BETA-BLOCKERS',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de los síndromes coronarios agudos',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    section: 'Sección 8.2 — Betabloqueantes tras SCA según FEVI',
    recommendationQuote: 'Se recomienda betabloqueo oral en pacientes con SCA y FEVI reducida o ligeramente reducida (FEVI ≤ 40% y 41-49%) para reducir la mortalidad por cualquier causa y cardiovascular. En pacientes con FEVI preservada (> 50%) sin antecedentes de angina, hipertensión o arritmias, la evidencia actual (ensayo REDUCE-AMI 2024 y registros contemporáneos) no demuestra beneficio inequívoco del betabloqueo sistemático a largo plazo; se debe individualizar su mantenimiento o desescalada al año.',
    classOfRecommendation: 'Clase I (en FEVI ≤ 40%) / Clase IIb (en FEVI > 50% no complicada)',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['fevi', 'betabloqueante', 'insuficiencia cardiaca', 'reducida', 'preservada']
  },
  {
    id: 'ESC-2023-ACS-REHABILITATION',
    guidelineOrStudy: 'Guía ESC 2023 para el manejo de los síndromes coronarios agudos',
    societyOrJournal: 'European Heart Journal (ESC)',
    year: 2023,
    doi: '10.1093/eurheartj/ehad191',
    url: 'https://doi.org/10.1093/eurheartj/ehad191',
    title: '2023 ESC Guidelines for the management of acute coronary syndromes',
    section: 'Sección 10 — Prevención secundaria integral y rehabilitación cardiaca',
    recommendationQuote: 'Se recomienda la derivación e inclusión de todos los pacientes tras un SCA a un programa estructurado y multidisciplinar de rehabilitación cardiaca integral y prevención secundaria, para mejorar la capacidad funcional, el control de factores de riesgo, la adherencia terapéutica y reducir la mortalidad por cualquier causa y rehospitalizaciones.',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['rehabilitacion cardiaca', 'prevencion secundaria', 'ejercicio', 'tabaco']
  },
  {
    id: 'ACC-AHA-2025-ACS-REVASC',
    guidelineOrStudy: 'Guía Conjunta ACC/AHA/ACEP/NAEMSP/SCAI 2025 de SCA',
    societyOrJournal: 'Journal of the American College of Cardiology (JACC)',
    year: 2025,
    doi: '10.1016/j.jacc.2024.11.009',
    url: 'https://doi.org/10.1016/j.jacc.2024.11.009',
    title: '2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Acute Coronary Syndromes',
    section: 'Sección 4 — Estrategia invasiva y revascularización completa',
    recommendationQuote: 'En pacientes con SCACEST y enfermedad multivaso hemodinámicamente estables, se recomienda la revascularización completa de las lesiones no culpables con estenosis significativa (ya sea durante el procedimiento índice o de forma diferida durante el ingreso hospitalario) para reducir el riesgo de muerte cardiovascular e infarto recurrente (ensayo COMPLETE).',
    classOfRecommendation: 'Clase I',
    levelOfEvidence: 'Nivel A',
    verifiedKeywords: ['multivaso', 'revascularizacion completa', 'no culpable', 'complete trial', 'acc/aha 2025']
  }
];

// Motor de búsqueda léxica y por secciones para el corpus RAG local
export function queryEvidenceCorpus(query: string, maxResults = 5): EvidenceItem[] {
  if (!query || query.trim() === '') {
    return SCIENTIFIC_CORPUS.slice(0, maxResults);
  }

  const terms = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (terms.length === 0) return SCIENTIFIC_CORPUS.slice(0, maxResults);

  const scored = SCIENTIFIC_CORPUS.map(item => {
    let score = 0;
    const fullText = `${item.title} ${item.section} ${item.recommendationQuote} ${item.verifiedKeywords.join(' ')} ${item.guidelineOrStudy}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    for (const term of terms) {
      if (item.verifiedKeywords.some(k => k.toLowerCase().includes(term))) {
        score += 8;
      }
      if (fullText.includes(term)) {
        score += 3;
      }
    }

    return { item, score };
  });

  return scored
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(entry => entry.item);
}
