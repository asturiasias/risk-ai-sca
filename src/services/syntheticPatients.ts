// Pacientes Sintéticos para Demostración y Validación de Risk AI-SCA
// Contiene 8 perfiles clínicos completos, historias narrativas, múltiples documentos por caso y datos verdad para contraste.

import { SyntheticPatientProfile } from '../types/clinical';

export const SYNTHETIC_PATIENTS: SyntheticPatientProfile[] = [
  // 1. SCACEST con PCI, perfil hemorrágico favorable y FEVI conservada
  {
    id: 'SCA-SYNTH-01',
    number: 1,
    name: 'Varón 54a — SCACEST inferior, PCI primaria CD, bajo riesgo hemorrágico',
    summary: 'SCACEST inferior con ICP primaria a coronaria derecha, FEVI 58%, sin factores de riesgo hemorrágico.',
    clinicalScenario: 'Varón de 54 años, fumador activo, sin otros antecedentes conocidos, que acude por dolor torácico opresivo de 90 minutos de evolución. ECG con elevación de ST en II, III y aVF.',
    keyFeatures: ['SCACEST', 'ICP primaria con 1 stent en CD', 'FEVI 58%', 'PRECISE-DAPT < 25', 'ARC-HBR negativo'],
    documents: [
      {
        title: 'Informe de Urgencias y Sala de Hemodinámica',
        type: 'urgencias',
        date: '2026-03-10 04:15',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
ID: SCA-SYNTH-01 | Varón, 54 años | Peso: 78 kg | Talla: 176 cm | IMC: 25.2 kg/m²
Motivo de consulta: Dolor retroesternal opresivo irradiado a mandíbula de 90 min de evolución con cortejo vegetativo.
Antecedentes: Fumador de 20 paquetes/año. No hipertenso conocido. Niega diabetes. Niega antecedentes de sangrado ni úlcera. Niega ictus o AIT previo. No alergias medicamentosas.
Exploración: Consciente, sudoroso. FC: 68 lpm, PA: 135/82 mmHg, SatO2 97% basal. Auscultación cardiaca rítmica, sin soplos. Auscultación pulmonar limpia (Killip I).
ECG Urgencias: Ritmo sinusal a 70 lpm, elevación del segmento ST de 2.5 mm en derivaciones II, III y aVF con descenso especular en I y aVL.
Procedimiento urgente: Activación código infarto. Coronariografía por acceso radial derecho: Oclusión trombótica aguda del segmento distal de la arteria coronaria derecha (CD). Árbol coronario izquierdo sin estenosis significativas (DA y CX normales).
ICP primaria exitosa sobre CD con implante de 1 stent farmacoactivo de 3.5 x 24 mm. Flujo final TIMI 3. Sin complicaciones.`
      },
      {
        title: 'Analítica Seriada de Laboratorio',
        type: 'analitica',
        date: '2026-03-10 08:30',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
Bioquímica y Hematología al ingreso:
- Hemoglobina: 14.8 g/dL | Hematocrito: 44.1%
- Leucocitos: 9.8 x 10^9/L | Plaquetas: 245 x 10^9/L
- Creatinina sérica: 0.92 mg/dL | Urea: 34 mg/dL
- FG CKD-EPI informado: 94 mL/min/1.73m²
- Glucosa: 118 mg/dL | HbA1c: 5.4% | Potasio: 4.2 mmol/L | Sodio: 140 mmol/L
- Troponina I ultrasensible (URL < 26 ng/L):
  * Al ingreso (04:30 h): 420 ng/L
  * A las 4 h (08:30 h): 14,800 ng/L
  * A las 12 h (16:30 h) [Pico observado]: 28,450 ng/L
  * A las 24 h (04:30 h +1d): 19,200 ng/L (curva descendente típica)
- Perfil Lipídico: Colesterol total: 215 mg/dL | c-LDL: 142 mg/dL | c-HDL: 41 mg/dL | Triglicéridos: 160 mg/dL`
      },
      {
        title: 'Ecocardiograma Transtorácico y Alta',
        type: 'alta',
        date: '2026-03-12 11:00',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
Ecocardiograma al alta: VI no dilatado con hipocinesia inferobasal leve. Fracción de eyección del VI (FEVI): 58%. Sin valvulopatías significativas.
Tratamiento prescrito al alta:
- Ácido acetilsalicílico (AAS) 100 mg cada 24 h
- Prasugrel 10 mg cada 24 h (duración prevista de DAPT: 12 meses)
- Atorvastatina 80 mg cada 24 h
- Pantoprazol 20 mg cada 24 h
- Derivación formal a programa de Rehabilitación Cardiaca ambulatoria.`
      }
    ],
    groundTruth: {
      edad: 54,
      sexo: 0,
      peso_kg: 78,
      talla_cm: 176,
      imc: 25.18,
      hta_previa: 0,
      tabaquismo_activo: 1,
      diabetes: 0,
      dislipidemia: 1,
      tipo_sca: 0,
      killip_ingreso: 1,
      fc_ingreso: 68,
      pas_ingreso: 135,
      hemoglobina_ingreso: 14.8,
      hematocrito_ingreso: 44.1,
      leucocitos_ingreso: 9.8,
      plaquetas_ingreso: 245,
      creatinina_ingreso: 0.92,
      aclaramiento_creatinina_cg: 104.3,
      fevi_inicial: 58,
      troponina_pico_observado: 28450,
      biomarcadores_positivos_elevados: 1,
      ldl_colesterol: 142,
      aas_documentado: 1,
      prasugrel_documentado: 1,
      estatina_alta_intensidad: 1,
      rehabilitacion_cardiaca_documentada: 1,
      dapt_meses_documentados: 12
    },
    expectedScores: {
      grace: { points: 106, category: 'Bajo' },
      preciseDapt: { points: 14, category: 'Bajo' },
      crusade: { points: 1, category: 'Bajo' },
      arcHbr: { points: 0, category: 'Bajo' }
    }
  },

  // 2. SCASEST en persona mayor con anemia, ERC y sangrado previo
  {
    id: 'SCA-SYNTH-02',
    number: 2,
    name: 'Mujer 82a — SCASEST con anemia, ERC moderada-grave y sangrado digestivo previo',
    summary: 'SCASEST en octogenaria frágil con hemoglobina 9.8 g/dL, CrCl 26 mL/min, úlcera sangrante hace 4 meses. Alto riesgo hemorrágico (ARC-HBR positivo).',
    clinicalScenario: 'Mujer de 82 años con HTA y ERC previa que presenta disnea de esfuerzo progresiva y dolor torácico en reposo de 2 horas. Antecedente de melenas con ingreso hace 4 meses.',
    keyFeatures: ['SCASEST', 'Edad 82a', 'Anemia (Hb 9.8)', 'CrCl 26 mL/min', 'ARC-HBR Positivo', 'Prasugrel contraindicado/desaconsejado'],
    documents: [
      {
        title: 'Informe de Ingreso Hospitalario — Urgencias',
        type: 'urgencias',
        date: '2026-02-18 19:40',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
ID: SCA-SYNTH-02 | Mujer, 82 años | Peso: 55 kg | Talla: 154 cm | IMC: 23.2 kg/m²
Antecedentes médicos: Hipertensión arterial en tratamiento con enalapril 10 mg. Enfermedad renal crónica estadio 3b-4. Antecedente de úlcera duodenal sangrante con ingreso hospitalario y transfusión de 2 concentrados de hematíes hace 4 meses. Niega ictus o AIT. No alergias conocidas.
Enfermedad actual: Dolor opresivo retroesternal que se inició mientras cenaba, asociado a cortejo vegetativo y ligera disnea de decúbito.
Exploración: Palidez mucocutánea. FC: 94 lpm, PA: 152/86 mmHg, SatO2 93% aire ambiente. Crepitantes bibasales en tercio inferior (Killip II).
ECG al ingreso: Ritmo sinusal a 95 lpm, descenso horizontal del segmento ST de 1.5 mm en derivaciones V4-V6 y aVL.`
      },
      {
        title: 'Laboratorio de Admisión',
        type: 'analitica',
        date: '2026-02-18 20:30',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
- Hemoglobina: 9.8 g/dL | Hematocrito: 29.8% | VCM: 84 fL
- Leucocitos: 11.2 x 10^9/L | Plaquetas: 182 x 10^9/L
- Creatinina sérica: 1.84 mg/dL | Urea: 88 mg/dL | FG CKD-EPI: 25 mL/min/1.73m²
- CrCl Cockcroft-Gault: [(140-82)*55*0.85]/(72*1.84) = 20.4 mL/min
- Troponina T ultrasensible: Ingreso: 185 ng/L (URL < 14 ng/L). Pico observado a las 6 h: 840 ng/L
- Glucosa: 132 mg/dL | Potasio: 4.8 mmol/L | Sodio: 137 mmol/L
- Perfil Lipídico: Colesterol total: 178 mg/dL | c-LDL: 112 mg/dL`
      },
      {
        title: 'Informe de Coronariografía y Alta',
        type: 'alta',
        date: '2026-02-21 14:00',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
Cateterismo (a las 20 h del ingreso tras hidratación con suero fisiológico): Lesión suboclusiva del 90% en tercio medio de arteria circunfleja (CX). Se realiza angioplastia con implante de 1 stent farmacoactivo de 2.75 x 18 mm. Buen resultado angiográfico.
Ecocardiograma: FEVI 50%.
Estrategia antitrombótica acordada por alto riesgo de sangrado (ARC-HBR positivo por hemorragia reciente en < 6m, anemia < 11 g/dL y ERC severa):
- DAPT acortada: Clopidogrel 75 mg/día + AAS 100 mg/día durante 1 a 3 meses, y posterior monoterapia con Clopidogrel.
- Omeprazol 40 mg/día.
- Atorvastatina 40 mg/día. Bisoprolol 2.5 mg/día.`
      }
    ],
    groundTruth: {
      edad: 82,
      sexo: 1,
      peso_kg: 55,
      talla_cm: 154,
      imc: 23.19,
      hta_previa: 1,
      diabetes: 0,
      erc_previa: 1,
      sangrado_previo_espontaneo: 1,
      tipo_sca: 1,
      fc_ingreso: 94,
      pas_ingreso: 152,
      killip_ingreso: 2,
      desviacion_st_ecg: 1,
      biomarcadores_positivos_elevados: 1,
      hemoglobina_ingreso: 9.8,
      hematocrito_ingreso: 29.8,
      leucocitos_ingreso: 11.2,
      plaquetas_ingreso: 182,
      creatinina_ingreso: 1.84,
      aclaramiento_creatinina_cg: 20.4,
      fg_ckd_epi: 25,
      fevi_inicial: 50,
      troponina_pico_observado: 840,
      diametro_stent_menor_3mm: 1,
      aas_documentado: 1,
      clopidogrel_documentado: 1,
      ibp_documentado: 1,
      dapt_meses_documentados: 3
    },
    expectedScores: {
      grace: { points: 168, category: 'Alto' },
      preciseDapt: { points: 61, category: 'Alto' },
      crusade: { points: 52, category: 'Muy Alto' },
      arcHbr: { points: 3, category: 'Alto' }
    }
  },

  // 3. SCA con FA y anticoagulación crónica
  {
    id: 'SCA-SYNTH-03',
    number: 3,
    name: 'Varón 71a — SCASEST con Fibrilación Auricular permanente anticoagulada',
    summary: 'SCA en paciente anticoagulado crónicamente por FA (CHA2DS2-VASc 4). Requiere desescalado rápido a Doble Terapia con DOAC + Clopidogrel.',
    clinicalScenario: 'Varón de 71 años con antecedente de FA permanente en tratamiento con Apixabán 5 mg/12h e insuficiencia cardiaca previa. Ingresa por angina in crescendo y elevación de troponina.',
    keyFeatures: ['FA anticoagulada', 'DOAC + Clopidogrel', 'Evitar Prasugrel/Ticagrelor con DOAC', 'Triple terapia hospitalaria ≤ 1 semana'],
    documents: [
      {
        title: 'Urgencias — Informe Clínico de Ingreso',
        type: 'urgencias',
        date: '2026-03-05 16:10',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
ID: SCA-SYNTH-03 | Varón, 71 años | Peso: 82 kg | Talla: 172 cm | IMC: 27.7 kg/m²
Antecedentes: Fibrilación auricular permanente en tratamiento con Apixabán 5 mg/12h. Hipertensión arterial de larga data. Insuficiencia cardiaca con FEVI 45%. No ictus ni AIT. No antecedentes de sangrado.
Enfermedad actual: En las últimas 48 horas presenta múltiples episodios anginosos con mínimos esfuerzos y un episodio de 45 minutos de dolor en reposo.
Exploración: Arritmia completa a 88 lpm, PA: 138/84 mmHg. Eupneico en reposo, sin edemas ni crepitantes (Killip I).
ECG: Fibrilación auricular con respuesta ventricular media a 85 lpm. Descenso de ST de 1 mm en derivaciones precordiales V5-V6.`
      },
      {
        title: 'Analítica de Urgencias y Coronariografía',
        type: 'cateterismo',
        date: '2026-03-06 10:30',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
Laboratorio:
- Hemoglobina: 13.9 g/dL | Hematocrito: 41.2% | Leucocitos: 7.4 x 10^9/L | Plaquetas: 210 x 10^9/L
- Creatinina sérica: 1.15 mg/dL | CrCl Cockcroft-Gault: 71.3 mL/min
- Troponina I ultrasensible: Ingreso 310 ng/L, pico 1,450 ng/L.
- c-LDL: 98 mg/dL | Glucosa: 104 mg/dL
Coronariografía invasiva (radial): Enfermedad de 1 vaso. Estenosis del 85% en segmento medio de arteria descendente anterior (DA). Implante de 1 stent farmacoactivo de 3.0 x 20 mm.
Resultado exitoso TIMI 3.`
      },
      {
        title: 'Informe de Alta y Régimen Antitrombótico',
        type: 'alta',
        date: '2026-03-08 12:00',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
Plan antitrombótico de consenso multidisciplinar (Cardiología / Farmacología):
- CHA2DS2-VASc: 4 puntos (IC + HTA + Edad 71 + Vascular). HAS-BLED: 2 puntos.
- Se suspende AAS tras la angioplastia intrahospitalaria (triple terapia de 48 horas únicamente).
- Régimen al alta: DOBLE TERAPIA ANTITROMBÓTICA con:
  1. Apixabán 5 mg dos veces al día (dosis estándar completa).
  2. Clopidogrel 75 mg una vez al día (duración: 12 meses).
  [SE RECUERDA: Prasugrel y Ticagrelor están formalmente desaconsejados en combinación con DOAC].
- Atorvastatina 80 mg/día. Bisoprolol 5 mg/día. Enalapril 5 mg/12h. Pantoprazol 20 mg/día.`
      }
    ],
    groundTruth: {
      edad: 71,
      sexo: 0,
      peso_kg: 82,
      talla_cm: 172,
      imc: 27.72,
      hta_previa: 1,
      fa_previa: 1,
      anticoagulacion_oral_cronica: 1,
      ic_previa: 1,
      tipo_sca: 1,
      fc_ingreso: 88,
      pas_ingreso: 138,
      killip_ingreso: 1,
      desviacion_st_ecg: 1,
      biomarcadores_positivos_elevados: 1,
      hemoglobina_ingreso: 13.9,
      hematocrito_ingreso: 41.2,
      leucocitos_ingreso: 7.4,
      plaquetas_ingreso: 210,
      creatinina_ingreso: 1.15,
      aclaramiento_creatinina_cg: 71.3,
      fevi_inicial: 45,
      troponina_pico_observado: 1450,
      anticoagulante_oral_documentado: 1,
      clopidogrel_documentado: 1,
      aas_documentado: 0,
      estatina_alta_intensidad: 1,
      ibp_documentado: 1
    },
    expectedScores: {
      grace: { points: 123, category: 'Intermedio' },
      cha2ds2Vasc: { points: 4, category: 'Alto' },
      hasBled: { points: 2, category: 'Bajo' },
      arcHbr: { points: 1, category: 'Alto' }
    }
  },

  // 4. SCA con diabetes, FEVI reducida y necesidades de prevención cardiorrenal
  {
    id: 'SCA-SYNTH-04',
    number: 4,
    name: 'Varón 63a — SCACEST anterior, disfunción ventricular severa (FEVI 28%) y Diabetes tipo 2',
    summary: 'SCACEST anterior con oclusión de DA proximal, FEVI 28%, Killip II. Indicación de cuádruple terapia neurohormonal de IC e iSGLT2 cardiorrenal.',
    clinicalScenario: 'Varón de 63 años, diabético con mal control (HbA1c 8.8%), que ingresa por infarto anterior extenso. Ecocardiograma muestra FEVI 28%. Requiere optimización integral neurohormonal y metabólica.',
    keyFeatures: ['SCACEST anterior', 'FEVI 28%', 'Diabetes mellitus tipo 2', 'Cuádruple terapia IC', 'iSGLT2 / Empagliflozina'],
    documents: [
      {
        title: 'Informe de Urgencias e ICP Primaria',
        type: 'urgencias',
        date: '2026-01-22 03:00',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
ID: SCA-SYNTH-04 | Varón, 63 años | Peso: 86 kg | Talla: 174 cm | IMC: 28.4 kg/m²
Antecedentes: Diabetes mellitus tipo 2 de 10 años de evolución en monoterapia con metformina. Dislipidemia. Exfumador hace 3 años. No antecedentes de sangrado ni ictus.
Enfermedad actual: Dolor centrotorácico opresivo opresivo de 2 h de evolución irradiado a ambos brazos.
Exploración: Sudoración fría. FC: 102 lpm, PA: 110/72 mmHg, SatO2 92% aire ambiente. Crepitantes bibasales hasta campos medios (Killip II).
ECG: Elevación masiva de ST de 4 mm en derivaciones V1 a V5 con ondas Q patológicas incipientes.
ICP primaria: Oclusión aguda proximal de arteria descendente anterior. Se implanta 1 stent farmacoactivo de 3.5 x 28 mm con flujo final TIMI 3.`
      },
      {
        title: 'Analítica Completa y Biomarcadores',
        type: 'analitica',
        date: '2026-01-22 09:00',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
- Hemoglobina: 14.1 g/dL | Hematocrito: 42.5% | Leucocitos: 12.8 x 10^9/L | Plaquetas: 270 x 10^9/L
- Creatinina sérica: 1.22 mg/dL | CrCl Cockcroft-Gault: 82.3 mL/min
- Glucosa al ingreso: 245 mg/dL | HbA1c: 8.8%
- Troponina I pico observado: 42,600 ng/L
- NT-proBNP al ingreso: 3,850 pg/mL
- Perfil Lipídico: Colesterol total: 240 mg/dL | c-LDL: 164 mg/dL | Triglicéridos: 220 mg/dL`
      },
      {
        title: 'Ecocardiograma y Plan de Alta Multidisciplinar',
        type: 'alta',
        date: '2026-01-26 13:00',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
Ecocardiograma reglado: Ventrículo izquierdo dilatado con acinesia anterior, apical y septal anterior. Fracción de eyección del VI severamente deprimida (FEVI): 28%.
Plan de Alta:
1. Antiagregación: AAS 100 mg/día + Prasugrel 10 mg/día durante 12 meses.
2. Cuádruple terapia neurohormonal de IC con FEVI reducida:
   - Sacubitrilo/valsartán 24/26 mg cada 12h (titulación ambulatoria).
   - Bisoprolol 2.5 mg cada 24h.
   - Eplerenona 25 mg cada 24h.
   - Empagliflozina 10 mg cada 24h (doble objetivo: IC + diabetes).
3. Hipolipemiante intensivo: Rosuvastatina 20 mg + Ezetimiba 10 mg/día.
4. Pantoprazol 20 mg/día. Derivación a Unidad de Insuficiencia Cardiaca y Rehabilitación.`
      }
    ],
    groundTruth: {
      edad: 63,
      sexo: 0,
      peso_kg: 86,
      talla_cm: 174,
      imc: 28.4,
      hta_previa: 0,
      diabetes: 1,
      dislipidemia: 1,
      tabaquismo_previo: 1,
      tipo_sca: 0,
      fc_ingreso: 102,
      pas_ingreso: 110,
      killip_ingreso: 2,
      desviacion_st_ecg: 1,
      biomarcadores_positivos_elevados: 1,
      hemoglobina_ingreso: 14.1,
      hematocrito_ingreso: 42.5,
      leucocitos_ingreso: 12.8,
      plaquetas_ingreso: 270,
      creatinina_ingreso: 1.22,
      aclaramiento_creatinina_cg: 82.3,
      fevi_inicial: 28,
      troponina_pico_observado: 42600,
      nt_probnp_maximo: 3850,
      hba1c: 8.8,
      ldl_colesterol: 164,
      aas_documentado: 1,
      prasugrel_documentado: 1,
      arni_documentado: 1,
      betabloqueante_documentado: 1,
      arm_documentado: 1,
      isglt2_documentado: 1,
      estatina_alta_intensidad: 1,
      ezetimiba_documentada: 1,
      ibp_documentado: 1
    },
    expectedScores: {
      grace: { points: 141, category: 'Intermedio' },
      preciseDapt: { points: 19, category: 'Bajo' },
      crusade: { points: 26, category: 'Bajo' }
    }
  },

  // 5. SCA con enfermedad multivaso y revascularización incompleta/segunda intervención planificada
  {
    id: 'SCA-SYNTH-05',
    number: 5,
    name: 'Varón 67a — SCASEST con enfermedad de 3 vasos, PCI culpable y 2º tiempo diferido',
    summary: 'SCASEST de alto riesgo con lesión culpable tratada en DA y lesión severa residual en CD programada para revascularización completa diferida.',
    clinicalScenario: 'Varón de 67 años con angina inestable y elevación de biomarcadores. Coronariografía muestra lesión culpable en DA y lesión del 85% en CD con reserva fraccional patológica.',
    keyFeatures: ['Multivaso (3 vasos)', 'Revascularización incompleta inicial (0)', 'Planificación diferida', 'Ensayo COMPLETE'],
    documents: [
      {
        title: 'Informe de Coronariografía — Hospital Universitario',
        type: 'cateterismo',
        date: '2026-02-04 11:30',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
ID: SCA-SYNTH-05 | Varón, 67 años | Peso: 80 kg | Talla: 175 cm | IMC: 26.1 kg/m²
Antecedentes: HTA, Dislipidemia, Tabaquismo previo.
Diagnóstico al ingreso: SCASEST con dolor torácico refractario y elevación de Troponina T (pico 620 ng/L).
Hallazgos angiográficos:
1. Tronco Común Izquierdo: sin lesiones.
2. Arteria Descendente Anterior (DA): estenosis crítica del 95% en tercio medio con trombo intraluminal (lesión culpable).
3. Arteria Circunfleja (CX): irregularidades parietales no obstructivas (<30%).
4. Arteria Coronaria Derecha (CD): estenosis tubular del 85% en segmento medio con lecho distal de buen calibre.
Intervencionismo:
Se realiza ICP con éxito sobre DA media con implante de stent farmacoactivo de 3.0 x 24 mm.
Decisión del Heart Team: Paciente hemodinámicamente estable. Se califica como revascularización incompleta inicial en el procedimiento de urgencias (código 0). Se programa revascularización completa mediante ICP electiva sobre CD en un segundo tiempo durante el ingreso a las 72 horas (estrategia guiada por ensayo COMPLETE / Guías ACC-AHA 2025).`
      },
      {
        title: 'Informe Clínico de Evolución y Laboratorio',
        type: 'alta',
        date: '2026-02-07 16:00',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
Laboratorio: Hb: 13.5 g/dL | Hto: 40.1% | Leuco: 8.1 x 10^9/L | Plaq: 220 x 10^9/L | Cr: 1.05 mg/dL (CrCl: 79.4 mL/min) | c-LDL: 130 mg/dL.
FEVI: 52%.
Segunda intervención realizada el 07/02: Implante de stent farmacoactivo de 3.0 x 18 mm en CD media con éxito. Revascularización coronaria completa alcanzada (código 1).
Tratamiento al alta: AAS 100 mg/día + Ticagrelor 90 mg/12h (12 meses). Atorvastatina 80 mg/día. Bisoprolol 5 mg/día. Ramipril 5 mg/día. Pantoprazol 20 mg/día.`
      }
    ],
    groundTruth: {
      edad: 67,
      sexo: 0,
      peso_kg: 80,
      talla_cm: 175,
      imc: 26.12,
      hta_previa: 1,
      dislipidemia: 1,
      tipo_sca: 1,
      numero_vasos_enfermos: 2,
      afectacion_tronco_comun: 0,
      pci_realizada: 1,
      revascularizacion_completa: 1,
      fevi_inicial: 52,
      troponina_pico_observado: 620,
      biomarcadores_positivos_elevados: 1,
      hemoglobina_ingreso: 13.5,
      creatinina_ingreso: 1.05,
      aclaramiento_creatinina_cg: 79.4,
      aas_documentado: 1,
      ticagrelor_documentado: 1,
      estatina_alta_intensidad: 1,
      ibp_documentado: 1,
      dapt_meses_documentados: 12
    },
    expectedScores: {
      grace: { points: 114, category: 'Intermedio' },
      preciseDapt: { points: 19, category: 'Bajo' },
      crusade: { points: 14, category: 'Bajo' }
    }
  },

  // 6. Angina inestable, con biomarcadores negativos conforme al ensayo y diagnóstico clínico documentado
  {
    id: 'SCA-SYNTH-06',
    number: 6,
    name: 'Mujer 59a — Angina Inestable (Troponinas negativas repetidas), TIMI 3',
    summary: 'Angina inestable de reposo con troponinas ultrasensibles seriadas estrictamente por debajo del percentil 99. Estudio invasivo programado.',
    clinicalScenario: 'Mujer de 59 años con múltiples episodios de dolor torácico opresivo de reposo. Marcadores de necrosis miocárdica negativos en las extracciones a las 0, 1 y 3 horas.',
    keyFeatures: ['Angina Inestable (Tipo 2)', 'Troponina negativa (< URL)', 'TIMI UA/NSTEMI 3', 'Sin necrosis miocárdica aguda'],
    documents: [
      {
        title: 'Informe de Observación de Urgencias — Algoritmo Diagnóstico',
        type: 'urgencias',
        date: '2026-03-14 07:15',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
ID: SCA-SYNTH-06 | Mujer, 59 años | Peso: 68 kg | Talla: 162 cm | IMC: 25.9 kg/m²
Antecedentes: Hipertensión arterial en tratamiento con amlodipino 5 mg. Dislipidemia. No tabaquismo. No diabetes. Sin historia de sangrado ni cardiopatía previa.
Enfermedad actual: En las últimas 24 horas ha presentado 3 episodios de opresión precordial de 15-20 minutos, el último en reposo hace 2 horas.
Exploración: Asintomática a su llegada. FC: 74 lpm, PA: 142/85 mmHg, SatO2 98%. Killip I.
ECG seriados: Ritmo sinusal a 72 lpm, sin elevación ni descenso significativo del segmento ST. Ondas T aplanadas inespecíficas en V4-V6.`
      },
      {
        title: 'Cinética de Biomarcadores Cardiacos',
        type: 'analitica',
        date: '2026-03-14 11:30',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
Protocolo de Troponina T ultrasensible de alta sensibilidad (Límite superior normal URL: 14 ng/L):
- Troponina basal (0 h): 6.2 ng/L [Negativa]
- Troponina a la 1 h: 6.5 ng/L [Sin cambio delta significativo]
- Troponina a las 3 h: 6.8 ng/L [Negativa confirmada, no supera el percentil 99]
Bioquímica general:
- Hb: 13.2 g/dL | Hto: 39.4% | Leucocitos: 6.8 x 10^9/L | Plaquetas: 260 x 10^9/L
- Creatinina: 0.78 mg/dL | CrCl Cockcroft-Gault: 88.7 mL/min
- Colesterol total: 228 mg/dL | c-LDL: 148 mg/dL
Diagnóstico confirmado: ANGINA INESTABLE (Tipo SCA 2). Ausencia de necrosis miocárdica aguda.`
      }
    ],
    groundTruth: {
      edad: 59,
      sexo: 1,
      peso_kg: 68,
      talla_cm: 162,
      imc: 25.91,
      hta_previa: 1,
      dislipidemia: 1,
      tipo_sca: 2, // Angina inestable
      episodios_angina_24h: 1,
      fc_ingreso: 74,
      pas_ingreso: 142,
      killip_ingreso: 1,
      desviacion_st_ecg: 0,
      biomarcadores_positivos_elevados: 0,
      troponina_pico_observado: 6.8,
      troponina_limite_superior_url: 14,
      hemoglobina_ingreso: 13.2,
      hematocrito_ingreso: 39.4,
      leucocitos_ingreso: 6.8,
      plaquetas_ingreso: 260,
      creatinina_ingreso: 0.78,
      aclaramiento_creatinina_cg: 88.7,
      ldl_colesterol: 148,
      aas_documentado: 1
    },
    expectedScores: {
      grace: { points: 88, category: 'Bajo' },
      timi: { points: 2, category: 'Bajo' },
      preciseDapt: { points: 15, category: 'Bajo' }
    }
  },

  // 7. Caso con información incompleta y discrepancias deliberadas
  {
    id: 'SCA-SYNTH-07',
    number: 7,
    name: 'Varón edad dudosa — Traslado urgente con datos incompletos y discrepancias',
    summary: 'Informe de traslado con variables analíticas incompletas (sin creatinina ni peso), discrepancia de antecedentes que exige revisión médica activa.',
    clinicalScenario: 'Varón trasladado en ambulancia con informe manuscrito fragmentario. Se constata dolor y cambios en ST pero faltan determinantes críticos para calcular CrCl y scores derivados.',
    keyFeatures: ['Falta CrCl y peso', 'Scores deben dar INDETERMINADO', 'No inventar ceros', 'Revisión médica activa requerida'],
    documents: [
      {
        title: 'Hoja de Traslado de Emergencias — Datos Fragmentarios',
        type: 'urgencias',
        date: '2026-03-20 22:15',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA (CASO DE AUDITORÍA Y DISCREPANCIAS)
Paciente varón, edad referida verbalmente en torno a 68 años (sin DNI confirmado a la llegada).
Peso no disponible. Talla no disponible.
Antecedentes: En una hoja previa consta "HTA y posible diabetes", pero el paciente verbaliza que no toma medicamentos y no tiene azúcar alto. No consta analítica renal previa.
Motivo de traslado: Dolor torácico opresivo de 3 horas.
Constantes: FC 88 lpm, PA 145/90 mmHg.
ECG: Descenso de ST en cara lateral de 1 mm.
Analítica remitida urgente:
- Hemoglobina: 12.0 g/dL | Leucocitos: 10.5 x 10^9/L
- Creatinina sérica: NO DETERMINADA / PENDIENTE DE VALIDACIÓN EN CENTRAL
- Troponina I: Positiva rápida cualitativa en tira reactiva, valor cuantitativo pendiente.`
      }
    ],
    groundTruth: {
      edad: 68,
      sexo: 0,
      peso_kg: null,
      talla_cm: null,
      imc: null,
      hta_previa: null, // Discrepancia
      diabetes: null, // Discrepancia
      tipo_sca: 1,
      fc_ingreso: 88,
      pas_ingreso: 145,
      killip_ingreso: 1,
      desviacion_st_ecg: 1,
      biomarcadores_positivos_elevados: 1,
      hemoglobina_ingreso: 12.0,
      creatinina_ingreso: null, // Faltante
      aclaramiento_creatinina_cg: null // No calculable
    },
    expectedScores: {
      grace: { points: null, category: 'Indeterminado' },
      preciseDapt: { points: null, category: 'Indeterminado' },
      crusade: { points: null, category: 'Indeterminado' },
      arcHbr: { points: null, category: 'Indeterminado' }
    }
  },

  // 8. Reevaluación a los 12 meses tras PCI, con historia de eventos/adherencia documentada, para DAPT score
  {
    id: 'SCA-SYNTH-08',
    number: 8,
    name: 'Varón 66a — Consulta de Seguimiento a 12 meses post-PCI (Aplicación del DAPT Score)',
    summary: 'Paciente que cumple 12 meses de DAPT tras ICP por IAM previo con stent < 3mm y tabaquismo activo. No ha sufrido hemorragias ni nuevos infartos. DAPT score ≥ 2 favorable a prolongación.',
    clinicalScenario: 'Revisión en consulta de Cardiología al cumplirse exactamente 1 año de la angioplastia coronaria. Evaluación de la conveniencia de prolongar o suspender el inhibidor P2Y12.',
    keyFeatures: ['Fase seguimiento 12m', 'DAPT score APLICABLE', 'Puntuación DAPT ≥ 2', 'Prolongación recomendada'],
    documents: [
      {
        title: 'Informe de Consulta de Cardiología — Revisión a los 12 Meses',
        type: 'alta',
        date: '2026-03-15 10:00',
        content: `PACIENTE SINTÉTICO — DEMOSTRACIÓN CLÍNICA
ID: SCA-SYNTH-08 | Varón, 66 años | Peso: 79 kg | Talla: 173 cm | IMC: 26.4 kg/m²
Motivo de consulta: Revisión reglada al cumplirse 12 meses de ICP con stent farmacoactivo por infarto agudo de miocardio sin elevación del ST (SCASEST índice hace 1 año).
Evolución en el último año:
- Adherencia excelente a doble antiagregación con AAS 100 mg + Ticagrelor 90 mg/12h.
- Ausencia de eventos isquémicos coronarios o cerebrales intercurrentes.
- Ausencia de complicaciones hemorrágicas mayores o menores (sin hematomas, melenas ni epistaxis).
- Continúa fumando activamente 10 cigarrillos/día (fumador activo).
- Diabetes mellitus tipo 2 diagnosticada hace 4 años.
Detalles anatómicos del cateterismo índice (hace 12 meses):
- Se implantaron 2 stents farmacoactivos, uno de ellos con diámetro de 2.75 mm (< 3 mm) en rama marginal obtusa.
- FEVI conservada (54%). Sin antecedentes de insuficiencia cardiaca.
Laboratorio actual de control:
- Hemoglobina: 14.2 g/dL | Creatinina: 0.95 mg/dL (CrCl: 90 mL/min) | c-LDL: 52 mg/dL.
Propósito de la evaluación: Calcular el DAPT Score de Yeh et al. para determinar si el balance isquémico/hemorrágico favorece continuar DAPT prolongada (12 a 30 meses) o suspender el inhibidor P2Y12.`
      }
    ],
    groundTruth: {
      edad: 66,
      sexo: 0,
      peso_kg: 79,
      talla_cm: 173,
      imc: 26.4,
      tabaquismo_activo: 1,
      diabetes: 1,
      tipo_sca: 1,
      diametro_stent_menor_3mm: 1,
      pci_realizada: 1,
      fevi_inicial: 54,
      ic_previa: 0,
      hemoglobina_ingreso: 14.2,
      creatinina_ingreso: 0.95,
      aclaramiento_creatinina_cg: 90.0,
      dapt_meses_documentados: 12
    },
    expectedScores: {
      daptScore: { points: 3, category: 'Alto' } // Edad 66 (-1), Tabaco (+1), DM (+1), IAM (+1), Stent <3mm (+1) = 3 puntos
    }
  }
];
