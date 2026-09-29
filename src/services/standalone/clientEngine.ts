export const STANDALONE_CLIENT_ENGINE = `
// MOTOR DETERMINISTA Y EXTRACTOR EMBEBIDO
function calculateCockcroftGault(edad, peso, creatinina, sexo) {
  if (!edad || !peso || !creatinina || creatinina <= 0) return { crCl: null };
  const factor = sexo === 1 ? 0.85 : 1.0;
  const val = ((140 - edad) * peso * factor) / (72 * creatinina);
  return { crCl: Math.round(val * 10) / 10 };
}

function calculateGrace(d) {
  const edad = d.edad, fc = d.fc_ingreso, pas = d.pas_ingreso, cr = d.creatinina_ingreso;
  const killip = d.killip_ingreso || 1;
  const parada = d.parada_cardiaca_ingreso === 1;
  const st = d.desviacion_st_ecg === 1;
  const bio = d.biomarcadores_positivos_elevados === 1;
  
  if (edad === null || fc === null || pas === null || cr === null) {
    return { points: null, category: 'Indeterminado' };
  }
  
  let pts = 0;
  if (edad < 30) pts += 0; else if (edad < 40) pts += 8; else if (edad < 50) pts += 25; else if (edad < 60) pts += 41; else if (edad < 70) pts += 58; else if (edad < 80) pts += 75; else if (edad < 90) pts += 91; else pts += 100;
  if (fc < 50) pts += 0; else if (fc < 70) pts += 3; else if (fc < 90) pts += 9; else if (fc < 110) pts += 15; else if (fc < 150) pts += 24; else if (fc < 200) pts += 38; else pts += 46;
  if (pas < 80) pts += 58; else if (pas < 100) pts += 53; else if (pas < 120) pts += 43; else if (pas < 140) pts += 34; else if (pas < 160) pts += 24; else if (pas < 200) pts += 10; else pts += 0;
  if (cr < 0.4) pts += 1; else if (cr < 0.8) pts += 4; else if (cr < 1.2) pts += 7; else if (cr < 1.6) pts += 10; else if (cr < 2.0) pts += 13; else if (cr < 4.0) pts += 21; else pts += 28;
  if (killip === 2) pts += 20; else if (killip === 3) pts += 39; else if (killip >= 4) pts += 59;
  if (parada) pts += 39;
  if (st) pts += 28;
  if (bio) pts += 14;
  
  const isStemi = d.tipo_sca === 0;
  let cat = 'Bajo';
  if (isStemi) {
    if (pts <= 125) cat = 'Bajo'; else if (pts <= 154) cat = 'Intermedio'; else cat = 'Alto';
  } else {
    if (pts <= 108) cat = 'Bajo'; else if (pts <= 140) cat = 'Intermedio'; else cat = 'Alto';
  }
  return { points: pts, category: cat };
}

function calculateTimi(d) {
  if (d.edad === null || d.desviacion_st_ecg === null || d.biomarcadores_positivos_elevados === null) {
    return { points: null, category: 'Indeterminado' };
  }
  let pts = 0;
  if (d.edad >= 65) pts++;
  let rf = 0;
  if (d.hta_previa === 1) rf++;
  if (d.dislipidemia === 1) rf++;
  if (d.diabetes === 1) rf++;
  if (d.tabaquismo_activo === 1) rf++;
  if (rf >= 3) pts++;
  if (d.estenosis_coronaria_conocida_50 === 1) pts++;
  if (d.antiagregacion_aas_7d_previos === 1) pts++;
  if (d.episodios_angina_24h === 1) pts++;
  if (d.desviacion_st_ecg === 1) pts++;
  if (d.biomarcadores_positivos_elevados === 1) pts++;
  
  let cat = 'Bajo';
  if (pts <= 2) cat = 'Bajo (4.7%)';
  else if (pts <= 4) cat = 'Intermedio (13-20%)';
  else cat = 'Alto (26-41%)';
  return { points: pts, category: cat };
}

function calculatePreciseDapt(d, crcl) {
  if (d.edad === null || crcl === null || d.hemoglobina_ingreso === null || d.leucocitos_ingreso === null || d.sangrado_previo_espontaneo === null) {
    return { points: null, category: 'Indeterminado' };
  }
  let pts = 0;
  if (d.edad > 50) pts += Math.min(28, Math.round((d.edad - 50) * 0.7));
  if (crcl <= 15) pts += 25; else if (crcl <= 30) pts += 18; else if (crcl <= 60) pts += 9; else if (crcl <= 90) pts += 4; else if (crcl < 100) pts += 1;
  if (d.hemoglobina_ingreso < 15) pts += Math.min(26, Math.max(0, Math.round((15 - d.hemoglobina_ingreso) * 3.7)));
  if (d.leucocitos_ingreso > 5) pts += Math.min(14, Math.max(0, Math.round((d.leucocitos_ingreso - 5) * 0.9)));
  if (d.sangrado_previo_espontaneo === 1) pts += 24;
  
  const isHbr = pts >= 25;
  return { points: pts, category: isHbr ? 'Alto (HBR ≥ 25)' : 'Bajo / Estándar (< 25)', isHbr };
}

function calculateCrusade(d, crcl) {
  const hto = d.hematocrito_ingreso || (d.hemoglobina_ingreso ? d.hemoglobina_ingreso * 3 : null);
  if (!hto || !crcl || !d.fc_ingreso || !d.pas_ingreso) return { points: null, category: 'Indeterminado' };
  let pts = 0;
  if (hto < 31) pts += 9; else if (hto < 34) pts += 7; else if (hto < 37) pts += 3; else if (hto < 40) pts += 2;
  if (crcl <= 15) pts += 35; else if (crcl <= 30) pts += 25; else if (crcl <= 60) pts += 14; else if (crcl <= 90) pts += 7;
  if (d.fc_ingreso >= 121) pts += 11; else if (d.fc_ingreso >= 111) pts += 10; else if (d.fc_ingreso >= 101) pts += 8; else if (d.fc_ingreso >= 91) pts += 6; else if (d.fc_ingreso >= 81) pts += 3; else if (d.fc_ingreso >= 71) pts += 1;
  if (d.sexo === 1) pts += 8;
  if (d.killip_ingreso && d.killip_ingreso >= 2) pts += 7;
  if (d.enfermedad_arterial_periferica === 1 || d.ictus_isquemico_previo === 1) pts += 7;
  if (d.diabetes === 1) pts += 6;
  if (d.pas_ingreso < 90) pts += 10; else if (d.pas_ingreso < 100) pts += 8; else if (d.pas_ingreso < 120) pts += 1;
  
  let cat = 'Muy Bajo (<=20)';
  if (pts <= 20) cat = 'Muy Bajo (<=20)';
  else if (pts <= 30) cat = 'Bajo (21-30)';
  else if (pts <= 40) cat = 'Moderado (31-40)';
  else if (pts <= 50) cat = 'Alto (41-50)';
  else cat = 'Muy Alto (>50)';
  return { points: pts, category: cat };
}

function calculateArcHbr(d, crcl) {
  const major = [];
  const minor = [];
  if (d.anticoagulacion_oral_cronica === 1 || d.fa_previa === 1) major.push('Anticoagulación oral crónica');
  if (crcl !== null && crcl < 30) major.push('ERC grave (CrCl < 30 mL/min)');
  else if (crcl !== null && crcl < 60) minor.push('ERC moderada (CrCl 30-59 mL/min)');
  if (d.hemoglobina_ingreso !== null) {
    if (d.hemoglobina_ingreso < 11.0) major.push('Anemia grave (Hb < 11.0 g/dL)');
    else if (d.sexo === 0 && d.hemoglobina_ingreso < 13.0) minor.push('Anemia moderada en varón (Hb < 13.0)');
    else if (d.sexo === 1 && d.hemoglobina_ingreso < 12.0) minor.push('Anemia moderada en mujer (Hb < 12.0)');
  }
  if (d.sangrado_previo_espontaneo === 1) major.push('Sangrado espontáneo hospitalario previo');
  if (d.plaquetas_ingreso && d.plaquetas_ingreso < 100) major.push('Trombocitopenia < 100');
  if (d.cancer_activo === 1) major.push('Cáncer activo');
  if (d.hemorragia_intracraneal_previa === 1) major.push('Hemorragia intracraneal previa');
  if (d.edad >= 75) minor.push('Edad >= 75 años');
  if (d.ictus_isquemico_previo === 1) minor.push('Ictus isquémico previo');
  
  const isHbr = major.length >= 1 || minor.length >= 2;
  const isIndet = (d.creatinina_ingreso === null || d.hemoglobina_ingreso === null) && !isHbr;
  return {
    isHbr: isIndet ? null : isHbr,
    category: isIndet ? 'Indeterminado' : (isHbr ? 'HBR Positivo' : 'No HBR'),
    majorCount: major.length,
    minorCount: minor.length,
    majorList: major,
    minorList: minor
  };
}

function calculateDaptScore(d, phase) {
  if (phase !== 'seguimiento_12m') {
    return { points: null, category: 'No aplicable en fase aguda', applicable: false };
  }
  if (d.edad === null || d.tabaquismo_activo === null || d.diabetes === null) return { points: null, category: 'Indeterminado' };
  let pts = 0;
  if (d.edad >= 75) pts -= 2; else if (d.edad >= 65) pts -= 1;
  if (d.tabaquismo_activo === 1) pts += 1;
  if (d.diabetes === 1) pts += 1;
  if (d.tipo_sca === 0 || d.tipo_sca === 1) pts += 1;
  if (d.pci_previa === 1 || d.iam_previo === 1) pts += 1;
  if (d.diametro_stent_menor_3mm === 1) pts += 1;
  if (d.ic_previa === 1 || (d.fevi_inicial !== null && d.fevi_inicial < 30)) pts += 2;
  return { points: pts, category: pts >= 2 ? 'Favorable prolongar DAPT (>12m)' : 'Desfavorable prolongar (Suspender al año)', applicable: true };
}

function computeAllScores(patient) {
  const d = {};
  Object.keys(patient.data).forEach(k => { d[k] = patient.data[k].value; });
  const cg = calculateCockcroftGault(d.edad, d.peso_kg, d.creatinina_ingreso, d.sexo);
  const crcl = cg.crCl !== null ? cg.crCl : d.aclaramiento_creatinina_cg;
  return {
    crcl,
    cg,
    grace: calculateGrace(d),
    timi: calculateTimi(d),
    preciseDapt: calculatePreciseDapt(d, crcl),
    crusade: calculateCrusade(d, crcl),
    arcHbr: calculateArcHbr(d, crcl),
    daptScore: calculateDaptScore(d, patient.evaluationPhase)
  };
}

// Extractor Determinista de Texto a Variables Clínicas
function extractFromText(text, targetId) {
  const idMatch = text.match(/ID:\\s*([A-Za-z0-9\\-_]+)/i);
  const patientId = idMatch ? idMatch[1] : (targetId || 'SCA-MANUAL-001');
  const fields = {};
  DICTIONARY.forEach(def => {
    fields[def.key] = { value: null, quote: '' };
  });
  fields.id_pseudonimo.value = patientId;
  fields.id_episodio_indice.value = 'EP-01';

  const age = text.match(/(?:edad|var[oó]n|mujer|paciente)?\\s*(?:de\\s*)?(\\d{2})\\s*(?:a[ñn]os|a\\b)/i);
  if (age) { fields.edad.value = parseInt(age[1], 10); fields.edad.quote = age[0]; }

  if (/\\b(?:var[oó]n|hombre|masculino)\\b/i.test(text)) { fields.sexo.value = 0; fields.sexo.quote = 'Varón'; }
  else if (/\\b(?:mujer|femenino)\\b/i.test(text)) { fields.sexo.value = 1; fields.sexo.quote = 'Mujer'; }

  const peso = text.match(/peso[:\\s]*(\\d{2,3}(?:[.,]\\d+)?)\\s*kg/i);
  if (peso) { fields.peso_kg.value = parseFloat(peso[1].replace(',', '.')); fields.peso_kg.quote = peso[0]; }
  const talla = text.match(/talla[:\\s]*(\\d{2,3})\\s*cm/i);
  if (talla) { fields.talla_cm.value = parseFloat(talla[1]); fields.talla_cm.quote = talla[0]; }

  const fc = text.match(/(?:fc|frecuencia cardiaca)[:\\s]*(\\d{2,3})/i);
  if (fc) { fields.fc_ingreso.value = parseInt(fc[1], 10); fields.fc_ingreso.quote = fc[0]; }
  const pa = text.match(/(?:pa|presi[oó]n arterial|ta)[:\\s]*(\\d{2,3})\\s*\\/\\s*(\\d{2,3})/i);
  if (pa) { fields.pas_ingreso.value = parseInt(pa[1], 10); fields.pad_ingreso.value = parseInt(pa[2], 10); fields.pas_ingreso.quote = pa[0]; }

  if (/\\b(?:scacest|stemi|elevaci[oó]n del segmento st)\\b/i.test(text)) { fields.tipo_sca.value = 0; fields.desviacion_st_ecg.value = 1; fields.tipo_sca.quote = 'SCACEST'; }
  else if (/\\b(?:scasest|iamsest|nstemi)\\b/i.test(text)) { fields.tipo_sca.value = 1; fields.tipo_sca.quote = 'SCASEST'; }
  else if (/angina inestable/i.test(text)) { fields.tipo_sca.value = 2; fields.tipo_sca.quote = 'Angina Inestable'; }

  const killip = text.match(/killip\\s*([I|V|1-4]+)/i);
  if (killip) {
    const k = killip[1].toUpperCase();
    fields.killip_ingreso.value = (k === 'IV' || k === '4') ? 4 : (k === 'III' || k === '3') ? 3 : (k === 'II' || k === '2') ? 2 : 1;
    fields.killip_ingreso.quote = killip[0];
  }

  if (/niega (?:diabetes|dm2?)/i.test(text)) { fields.diabetes.value = 0; fields.diabetes.quote = 'Niega diabetes'; }
  else if (/\\b(?:diabetes|dm2?)\\b/i.test(text)) { fields.diabetes.value = 1; fields.diabetes.quote = 'Diabetes documentada'; }

  if (/niega (?:hta|hipertensi[oó]n)/i.test(text)) { fields.hta_previa.value = 0; fields.hta_previa.quote = 'No hipertenso'; }
  else if (/\\b(?:hta|hipertensi[oó]n)\\b/i.test(text)) { fields.hta_previa.value = 1; fields.hta_previa.quote = 'Hipertensión documentada'; }

  if (/fumador (?:activo|de)|tabaquismo activo/i.test(text)) { fields.tabaquismo_activo.value = 1; fields.tabaquismo_activo.quote = 'Fumador activo'; }
  else if (/exfumador/i.test(text)) { fields.tabaquismo_activo.value = 0; fields.tabaquismo_previo.value = 1; fields.tabaquismo_activo.quote = 'Exfumador'; }
  else if (/no fumador/i.test(text)) { fields.tabaquismo_activo.value = 0; fields.tabaquismo_activo.quote = 'No fumador'; }

  if (/\\b(?:fibrilaci[oó]n auricular|fa permanente|fa parox[ií]stica)\\b/i.test(text)) { fields.fa_previa.value = 1; fields.fa_previa.quote = 'FA documentada'; }
  if (/niega (?:ictus|acv|ait)/i.test(text)) { fields.ictus_isquemico_previo.value = 0; fields.ictus_isquemico_previo.quote = 'Niega ictus'; }
  else if (/\\b(?:ictus isqu[eé]mico|acv isqu[eé]mico)\\b/i.test(text)) { fields.ictus_isquemico_previo.value = 1; fields.ictus_isquemico_previo.quote = 'Ictus isquémico documentado'; }

  const cr = text.match(/creatinina[:\\s]*(\\d{1,2}(?:[.,]\\d+)?)/i);
  if (cr) { fields.creatinina_ingreso.value = parseFloat(cr[1].replace(',', '.')); fields.creatinina_ingreso.quote = cr[0]; }
  const hb = text.match(/hemoglobina[:\\s]*(\\d{1,2}(?:[.,]\\d+)?)/i);
  if (hb) { fields.hemoglobina_ingreso.value = parseFloat(hb[1].replace(',', '.')); fields.hemoglobina_ingreso.quote = hb[0]; }
  const leuco = text.match(/leucocitos[:\\s]*(\\d{1,2}(?:[.,]\\d+)?)/i);
  if (leuco) { fields.leucocitos_ingreso.value = parseFloat(leuco[1].replace(',', '.')); fields.leucocitos_ingreso.quote = leuco[0]; }

  const trop = text.match(/troponina[:\\s]*(\\d[\\d,.]*)/i);
  if (trop) {
    const val = parseFloat(trop[1].replace(',', '.'));
    fields.troponina_pico_observado.value = val;
    fields.biomarcadores_positivos_elevados.value = val > 14 ? 1 : 0;
    fields.troponina_pico_observado.quote = trop[0];
  }
  const fevi = text.match(/fevi[:\\s]*(\\d{2})%/i);
  if (fevi) { fields.fevi_inicial.value = parseInt(fevi[1], 10); fields.fevi_inicial.quote = fevi[0]; }

  return fields;
}
`;
