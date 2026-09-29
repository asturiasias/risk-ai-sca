// Diccionario Clínico Mínimo y Ampliable para Risk AI-SCA
// Contiene la especificación de variables, encabezados autoexplicativos, unidades y codificaciones estándar.

export interface FieldDefinition {
  key: string;
  header: string; // Encabezado autoexplicativo exacto para la tabla acumulativa
  shortLabel: string;
  category: 'identificacion' | 'antecedentes' | 'presentacion' | 'anatomia' | 'laboratorio' | 'ventricular_biomarcadores' | 'lipidos' | 'farmacos_documentados' | 'duraciones';
  type: 'binary' | 'numeric' | 'select' | 'text' | 'date';
  unit?: string;
  options?: { value: any; label: string }[];
  description: string;
  defaultValue?: any;
}

export const CLINICAL_DICTIONARY: FieldDefinition[] = [
  // 1. Identificación y contexto
  {
    key: 'id_pseudonimo',
    header: 'ID seudónimo',
    shortLabel: 'ID Seudónimo',
    category: 'identificacion',
    type: 'text',
    description: 'Identificador seudónimo estable del paciente'
  },
  {
    key: 'id_episodio_indice',
    header: 'ID episodio índice',
    shortLabel: 'ID Episodio',
    category: 'identificacion',
    type: 'text',
    description: 'Identificador del episodio índice asistencial'
  },
  {
    key: 'es_sintetico',
    header: 'Sintético (0=real;1=sintético;.=sin dato)',
    shortLabel: 'Sintético',
    category: 'identificacion',
    type: 'binary',
    description: 'Indicador de paciente sintético para pruebas o demostración'
  },
  {
    key: 'edad',
    header: 'Edad (años)',
    shortLabel: 'Edad',
    category: 'identificacion',
    type: 'numeric',
    unit: 'años',
    description: 'Edad cumplida del paciente al ingreso'
  },
  {
    key: 'sexo',
    header: 'Sexo (0=masculino;1=femenino;.=sin dato)',
    shortLabel: 'Sexo',
    category: 'identificacion',
    type: 'select',
    options: [
      { value: 0, label: '0 = Masculino' },
      { value: 1, label: '1 = Femenino' },
      { value: null, label: '. = Sin dato' }
    ],
    description: 'Sexo biológico documentado'
  },
  {
    key: 'peso_kg',
    header: 'Peso (kg;.=sin dato)',
    shortLabel: 'Peso',
    category: 'identificacion',
    type: 'numeric',
    unit: 'kg',
    description: 'Peso corporal en kilogramos'
  },
  {
    key: 'talla_cm',
    header: 'Talla (cm;.=sin dato)',
    shortLabel: 'Talla',
    category: 'identificacion',
    type: 'numeric',
    unit: 'cm',
    description: 'Estatura en centímetros'
  },
  {
    key: 'imc',
    header: 'IMC (kg/m²;.=sin dato)',
    shortLabel: 'IMC',
    category: 'identificacion',
    type: 'numeric',
    unit: 'kg/m²',
    description: 'Índice de masa corporal'
  },
  {
    key: 'fecha_ingreso',
    header: 'Fecha de ingreso (AAAA-MM-DD;.=sin dato)',
    shortLabel: 'Fecha Ingreso',
    category: 'identificacion',
    type: 'date',
    description: 'Fecha de admisión hospitalaria'
  },
  {
    key: 'momento_evaluacion',
    header: 'Momento de evaluación (urgencias/ingreso/cateterismo/alta/seguimiento)',
    shortLabel: 'Fase Evaluación',
    category: 'identificacion',
    type: 'text',
    description: 'Momento clínico en el que se ejecuta la evaluación prospectiva'
  },

  // 2. Antecedentes y riesgos
  {
    key: 'hta_previa',
    header: 'HTA previa (0=no;1=sí;.=sin dato)',
    shortLabel: 'HTA Previa',
    category: 'antecedentes',
    type: 'binary',
    description: 'Hipertensión arterial diagnosticada previamente'
  },
  {
    key: 'tabaquismo_activo',
    header: 'Tabaquismo activo (0=no;1=sí;.=sin dato)',
    shortLabel: 'Tabaco Activo',
    category: 'antecedentes',
    type: 'binary',
    description: 'Fumador de cigarrillos en el momento actual o reciente'
  },
  {
    key: 'tabaquismo_previo',
    header: 'Tabaquismo previo/exfumador (0=no;1=sí;.=sin dato)',
    shortLabel: 'Exfumador',
    category: 'antecedentes',
    type: 'binary',
    description: 'Antecedente de consumo de tabaco abandonado'
  },
  {
    key: 'diabetes',
    header: 'Diabetes (0=no;1=sí;.=sin dato)',
    shortLabel: 'Diabetes',
    category: 'antecedentes',
    type: 'binary',
    description: 'Diagnóstico documentado de diabetes mellitus'
  },
  {
    key: 'dislipidemia',
    header: 'Dislipidemia (0=no;1=sí;.=sin dato)',
    shortLabel: 'Dislipidemia',
    category: 'antecedentes',
    type: 'binary',
    description: 'Diagnóstico previo de hipercolesterolemia o dislipidemia'
  },
  {
    key: 'erc_previa',
    header: 'ERC previa (0=no;1=sí;.=sin dato)',
    shortLabel: 'ERC Previa',
    category: 'antecedentes',
    type: 'binary',
    description: 'Enfermedad renal crónica diagnosticada previa al ingreso'
  },
  {
    key: 'dialisis',
    header: 'Diálisis crónica (0=no;1=sí;.=sin dato)',
    shortLabel: 'Diálisis',
    category: 'antecedentes',
    type: 'binary',
    description: 'Terapia sustitutiva renal en programa crónico'
  },
  {
    key: 'fa_previa',
    header: 'Fibrilación auricular previa (0=no;1=sí;.=sin dato)',
    shortLabel: 'FA Previa',
    category: 'antecedentes',
    type: 'binary',
    description: 'Antecedente documentado de FA o flutter auricular'
  },
  {
    key: 'iam_previo',
    header: 'IAM previo (0=no;1=sí;.=sin dato)',
    shortLabel: 'IAM Previo',
    category: 'antecedentes',
    type: 'binary',
    description: 'Infarto de miocardio previo documentado'
  },
  {
    key: 'pci_previa',
    header: 'PCI previa (0=no;1=sí;.=sin dato)',
    shortLabel: 'PCI Previa',
    category: 'antecedentes',
    type: 'binary',
    description: 'Intervencionismo coronario percutáneo previo'
  },
  {
    key: 'cabg_previa',
    header: 'CABG previa (0=no;1=sí;.=sin dato)',
    shortLabel: 'CABG Previa',
    category: 'antecedentes',
    type: 'binary',
    description: 'Cirugía de bypass aortocoronario previa'
  },
  {
    key: 'ic_previa',
    header: 'Insuficiencia cardiaca previa (0=no;1=sí;.=sin dato)',
    shortLabel: 'IC Previa',
    category: 'antecedentes',
    type: 'binary',
    description: 'Antecedente de insuficiencia cardiaca crónica'
  },
  {
    key: 'enfermedad_arterial_periferica',
    header: 'Enfermedad vascular periférica (0=no;1=sí;.=sin dato)',
    shortLabel: 'EVP / PAD',
    category: 'antecedentes',
    type: 'binary',
    description: 'Claudicación, bypass periférico o arteriopatía documentada'
  },
  {
    key: 'ictus_isquemico_previo',
    header: 'Ictus isquémico previo (0=no;1=sí;.=sin dato)',
    shortLabel: 'Ictus Isquémico',
    category: 'antecedentes',
    type: 'binary',
    description: 'Accidente cerebrovascular isquémico previo'
  },
  {
    key: 'ait_previo',
    header: 'AIT previo (0=no;1=sí;.=sin dato)',
    shortLabel: 'AIT Previo',
    category: 'antecedentes',
    type: 'binary',
    description: 'Accidente isquémico transitorio documentado'
  },
  {
    key: 'hemorragia_intracraneal_previa',
    header: 'Hemorragia intracraneal previa (0=no;1=sí;.=sin dato)',
    shortLabel: 'HIC Previa',
    category: 'antecedentes',
    type: 'binary',
    description: 'Hemorragia intracraneal o ictus hemorrágico en cualquier momento'
  },
  {
    key: 'sangrado_previo_espontaneo',
    header: 'Sangrado previo espontáneo con ingreso/transfusión (0=no;1=sí;.=sin dato)',
    shortLabel: 'Sangrado Previo',
    category: 'antecedentes',
    type: 'binary',
    description: 'Hemorragia previa espontánea con necesidad de ingreso o transfusión'
  },
  {
    key: 'cancer_activo',
    header: 'Cáncer activo en 12 meses (0=no;1=sí;.=sin dato)',
    shortLabel: 'Cáncer Activo',
    category: 'antecedentes',
    type: 'binary',
    description: 'Neoplasia maligna activa o tratamiento antineoplásico en los últimos 12 meses'
  },
  {
    key: 'hepatopatia_cirrosis',
    header: 'Hepatopatía/cirrosis con hipertensión portal (0=no;1=sí;.=sin dato)',
    shortLabel: 'Cirrosis / HTP',
    category: 'antecedentes',
    type: 'binary',
    description: 'Cirrosis hepática clínicamente relevante o hipertensión portal'
  },
  {
    key: 'anticoagulacion_oral_cronica',
    header: 'Anticoagulación oral crónica indicada (0=no;1=sí;.=sin dato)',
    shortLabel: 'AOC Crónica',
    category: 'antecedentes',
    type: 'binary',
    description: 'Indicación permanente de anticoagulación oral (por FA, prótesis mecánica o TVP/TEP)'
  },
  {
    key: 'antiagregacion_aas_7d_previos',
    header: 'AAS en 7 días previos al ingreso (0=no;1=sí;.=sin dato)',
    shortLabel: 'AAS 7 días',
    category: 'antecedentes',
    type: 'binary',
    description: 'Uso documentado de ácido acetilsalicílico en los 7 días previos'
  },

  // 3. Presentación clínica y ECG
  {
    key: 'tipo_sca',
    header: 'Tipo SCA (0=SCACEST;1=SCASEST-IAM/no Q;2=angina inestable;.=sin dato)',
    shortLabel: 'Tipo SCA',
    category: 'presentacion',
    type: 'select',
    options: [
      { value: 0, label: '0 = SCACEST' },
      { value: 1, label: '1 = SCASEST-IAM (no Q)' },
      { value: 2, label: '2 = Angina Inestable' },
      { value: null, label: '. = Sin dato' }
    ],
    description: 'Clasificación del síndrome coronario agudo según presentación'
  },
  {
    key: 'fc_ingreso',
    header: 'Frecuencia cardiaca ingreso (lpm;.=sin dato)',
    shortLabel: 'FC Ingreso',
    category: 'presentacion',
    type: 'numeric',
    unit: 'lpm',
    description: 'Frecuencia cardiaca basal al ingreso'
  },
  {
    key: 'pas_ingreso',
    header: 'Presión arterial sistólica ingreso (mmHg;.=sin dato)',
    shortLabel: 'PAS Ingreso',
    category: 'presentacion',
    type: 'numeric',
    unit: 'mmHg',
    description: 'Presión arterial sistólica inicial'
  },
  {
    key: 'pad_ingreso',
    header: 'Presión arterial diastólica ingreso (mmHg;.=sin dato)',
    shortLabel: 'PAD Ingreso',
    category: 'presentacion',
    type: 'numeric',
    unit: 'mmHg',
    description: 'Presión arterial diastólica inicial'
  },
  {
    key: 'killip_ingreso',
    header: 'Clase Killip ingreso (1=I;2=II;3=III;4=IV;.=sin dato)',
    shortLabel: 'Killip',
    category: 'presentacion',
    type: 'select',
    options: [
      { value: 1, label: '1 = Killip I (sin signos de IC)' },
      { value: 2, label: '2 = Killip II (crepitantes < 50%, 3R)' },
      { value: 3, label: '3 = Killip III (edema agudo de pulmón)' },
      { value: 4, label: '4 = Killip IV (shock cardiogénico)' },
      { value: null, label: '. = Sin dato' }
    ],
    description: 'Clasificación de Killip-Kimball al ingreso'
  },
  {
    key: 'parada_cardiaca_ingreso',
    header: 'Parada cardiaca al ingreso (0=no;1=sí;.=sin dato)',
    shortLabel: 'PCR Ingreso',
    category: 'presentacion',
    type: 'binary',
    description: 'Reanimación por PCR extrahospitalaria o a la llegada'
  },
  {
    key: 'desviacion_st_ecg',
    header: 'Desviación ST en ECG (0=no;1=sí;.=sin dato)',
    shortLabel: 'Desviación ST',
    category: 'presentacion',
    type: 'binary',
    description: 'Elevación o depresión del segmento ST >= 0.5 mm en 2 derivaciones contiguas'
  },
  {
    key: 'episodios_angina_24h',
    header: 'Episodios angina >=2 en 24h (0=no;1=sí;.=sin dato)',
    shortLabel: 'Angina >=2 en 24h',
    category: 'presentacion',
    type: 'binary',
    description: 'Dos o más episodios de angina grave en las últimas 24 horas'
  },
  {
    key: 'estenosis_coronaria_conocida_50',
    header: 'Estenosis coronaria previa >=50% (0=no;1=sí;.=sin dato)',
    shortLabel: 'Estenosis Previa >=50%',
    category: 'presentacion',
    type: 'binary',
    description: 'Enfermedad arterial coronaria documentada previamente con estenosis >=50%'
  },

  // 4. Anatomía y tratamiento invasivo
  {
    key: 'coronariografia_realizada',
    header: 'Coronariografía realizada (0=no;1=sí;.=sin dato)',
    shortLabel: 'Cateterismo',
    category: 'anatomia',
    type: 'binary',
    description: 'Realización de angiografía coronaria invasiva en el episodio'
  },
  {
    key: 'numero_vasos_enfermos',
    header: 'Número de vasos con estenosis significativa (0-3;.=sin dato)',
    shortLabel: 'Vasos Afectados',
    category: 'anatomia',
    type: 'numeric',
    description: 'Número de vasos coronarios principales con estenosis >= 70% (o >= 50% en TCI)'
  },
  {
    key: 'afectacion_tronco_comun',
    header: 'Tronco común izquierdo con estenosis >=50% (0=no;1=sí;.=sin dato)',
    shortLabel: 'Tronco Común',
    category: 'anatomia',
    type: 'binary',
    description: 'Afectación significativa del tronco común coronario izquierdo'
  },
  {
    key: 'pci_realizada',
    header: 'PCI realizada en episodio (0=no;1=sí;.=sin dato)',
    shortLabel: 'PCI Episodio',
    category: 'anatomia',
    type: 'binary',
    description: 'Implantación de stent o angioplastia coronaria durante el episodio'
  },
  {
    key: 'pci_compleja',
    header: 'PCI compleja (3 vasos/CTO/longitud >=60mm/bifurcación 2 stents) (0=no;1=sí;.=sin dato)',
    shortLabel: 'PCI Compleja',
    category: 'anatomia',
    type: 'binary',
    description: 'Cumple criterios de angioplastia compleja (definición PARIS / ESC)'
  },
  {
    key: 'diametro_stent_menor_3mm',
    header: 'Diámetro de stent < 3 mm (0=no;1=sí;.=sin dato)',
    shortLabel: 'Stent < 3 mm',
    category: 'anatomia',
    type: 'binary',
    description: 'Al menos un stent implantado con diámetro menor a 3.0 mm (variable DAPT score)'
  },
  {
    key: 'revascularizacion_completa',
    header: 'Revascularización completa (0=incompleta;1=completa;.=sin dato/no evaluable)',
    shortLabel: 'Revasc. Completa',
    category: 'anatomia',
    type: 'select',
    options: [
      { value: 0, label: '0 = Incompleta' },
      { value: 1, label: '1 = Completa' },
      { value: null, label: '. = Sin dato / No evaluable' }
    ],
    description: 'Tratamiento de todas las lesiones coronarias funcionales u obstructivas'
  },

  // 5. Laboratorio, hematología y metabolismo
  {
    key: 'hemoglobina_ingreso',
    header: 'Hemoglobina ingreso (g/dL;.=sin dato)',
    shortLabel: 'Hb Ingreso',
    category: 'laboratorio',
    type: 'numeric',
    unit: 'g/dL',
    description: 'Hemoglobina basal al ingreso en g/dL'
  },
  {
    key: 'hematocrito_ingreso',
    header: 'Hematocrito ingreso (%;.=sin dato)',
    shortLabel: 'Hto Ingreso',
    category: 'laboratorio',
    type: 'numeric',
    unit: '%',
    description: 'Hematocrito basal medido (no deducido) en porcentaje'
  },
  {
    key: 'leucocitos_ingreso',
    header: 'Leucocitos ingreso (10^9/L;.=sin dato)',
    shortLabel: 'Leucocitos',
    category: 'laboratorio',
    type: 'numeric',
    unit: '10^9/L',
    description: 'Recuento de leucocitos al ingreso en 10^9/L (x1000/µL)'
  },
  {
    key: 'plaquetas_ingreso',
    header: 'Plaquetas ingreso (10^9/L;.=sin dato)',
    shortLabel: 'Plaquetas',
    category: 'laboratorio',
    type: 'numeric',
    unit: '10^9/L',
    description: 'Recuento de plaquetas al ingreso en 10^9/L'
  },
  {
    key: 'creatinina_ingreso',
    header: 'Creatinina ingreso (mg/dL;.=sin dato)',
    shortLabel: 'Cr Ingreso',
    category: 'laboratorio',
    type: 'numeric',
    unit: 'mg/dL',
    description: 'Creatinina sérica basal al ingreso en mg/dL'
  },
  {
    key: 'aclaramiento_creatinina_cg',
    header: 'CrCl Cockcroft-Gault (mL/min;.=sin dato)',
    shortLabel: 'CrCl Cockcroft',
    category: 'laboratorio',
    type: 'numeric',
    unit: 'mL/min',
    description: 'Aclaramiento de creatinina calculado por fórmula de Cockcroft-Gault'
  },
  {
    key: 'fg_ckd_epi',
    header: 'FG CKD-EPI informado (mL/min/1.73m²;.=sin dato)',
    shortLabel: 'eGFR CKD-EPI',
    category: 'laboratorio',
    type: 'numeric',
    unit: 'mL/min/1.73m²',
    description: 'Filtrado glomerular estimado informado por laboratorio'
  },
  {
    key: 'glucosa_ingreso',
    header: 'Glucosa ingreso (mg/dL;.=sin dato)',
    shortLabel: 'Glucosa',
    category: 'laboratorio',
    type: 'numeric',
    unit: 'mg/dL',
    description: 'Glucemia basal al ingreso'
  },
  {
    key: 'hba1c',
    header: 'HbA1c (%;.=sin dato)',
    shortLabel: 'HbA1c',
    category: 'laboratorio',
    type: 'numeric',
    unit: '%',
    description: 'Hemoglobina glicada en porcentaje'
  },
  {
    key: 'potasio_ingreso',
    header: 'Potasio ingreso (mmol/L;.=sin dato)',
    shortLabel: 'Potasio',
    category: 'laboratorio',
    type: 'numeric',
    unit: 'mmol/L',
    description: 'Potasio sérico al ingreso'
  },

  // 6. Función ventricular y biomarcadores
  {
    key: 'fevi_inicial',
    header: 'FEVI inicial (%;.=sin dato)',
    shortLabel: 'FEVI Inicial',
    category: 'ventricular_biomarcadores',
    type: 'numeric',
    unit: '%',
    description: 'Fracción de eyección del ventrículo izquierdo inicial documentada'
  },
  {
    key: 'troponina_pico_observado',
    header: 'Troponina pico observado (ng/L;.=sin dato)',
    shortLabel: 'Troponina Pico',
    category: 'ventricular_biomarcadores',
    type: 'numeric',
    unit: 'ng/L',
    description: 'Valor máximo observado de troponina en el episodio'
  },
  {
    key: 'troponina_tipo',
    header: 'Troponina tipo (I/T;.=sin dato)',
    shortLabel: 'Tipo Troponina',
    category: 'ventricular_biomarcadores',
    type: 'text',
    description: 'Tipo de ensayo de troponina (I o T ultrasensible)'
  },
  {
    key: 'troponina_limite_superior_url',
    header: 'Troponina límite superior URL (ng/L;.=sin dato)',
    shortLabel: 'Troponina URL',
    category: 'ventricular_biomarcadores',
    type: 'numeric',
    unit: 'ng/L',
    description: 'Percentil 99 o límite superior de referencia del ensayo utilizado'
  },
  {
    key: 'biomarcadores_positivos_elevados',
    header: 'Biomarcadores miocárdicos elevados (0=no;1=sí;.=sin dato)',
    shortLabel: 'Troponina > URL',
    category: 'ventricular_biomarcadores',
    type: 'binary',
    description: 'Elevación de troponina por encima del percentil 99 del ensayo'
  },
  {
    key: 'nt_probnp_maximo',
    header: 'NT-proBNP máximo (pg/mL;.=sin dato)',
    shortLabel: 'NT-proBNP',
    category: 'ventricular_biomarcadores',
    type: 'numeric',
    unit: 'pg/mL',
    description: 'Pico observado de NT-proBNP'
  },

  // 7. Perfil lipídico
  {
    key: 'colesterol_total',
    header: 'Colesterol total (mg/dL;.=sin dato)',
    shortLabel: 'Col. Total',
    category: 'lipidos',
    type: 'numeric',
    unit: 'mg/dL',
    description: 'Colesterol total sérico'
  },
  {
    key: 'ldl_colesterol',
    header: 'Colesterol LDL (mg/dL;.=sin dato)',
    shortLabel: 'c-LDL',
    category: 'lipidos',
    type: 'numeric',
    unit: 'mg/dL',
    description: 'Colesterol LDL medido o calculado'
  },
  {
    key: 'hdl_colesterol',
    header: 'Colesterol HDL (mg/dL;.=sin dato)',
    shortLabel: 'c-HDL',
    category: 'lipidos',
    type: 'numeric',
    unit: 'mg/dL',
    description: 'Colesterol HDL sérico'
  },
  {
    key: 'trigliceridos',
    header: 'Triglicéridos (mg/dL;.=sin dato)',
    shortLabel: 'Triglicéridos',
    category: 'lipidos',
    type: 'numeric',
    unit: 'mg/dL',
    description: 'Concentración sérica de triglicéridos'
  },
  {
    key: 'lpa_mg_dl',
    header: 'Lipoproteína(a) (mg/dL;.=sin dato)',
    shortLabel: 'Lp(a) mg/dL',
    category: 'lipidos',
    type: 'numeric',
    unit: 'mg/dL',
    description: 'Lp(a) medida en concentración de masa'
  },

  // 8. Fármacos DOCUMENTADOS (binario 0/1/.)
  {
    key: 'aas_documentado',
    header: 'AAS documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'AAS',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Ácido acetilsalicílico prescrito/administrado'
  },
  {
    key: 'ticagrelor_documentado',
    header: 'Ticagrelor documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'Ticagrelor',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Ticagrelor 90 mg/12h documentado'
  },
  {
    key: 'prasugrel_documentado',
    header: 'Prasugrel documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'Prasugrel',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Prasugrel 10 mg/día (o 5 mg/día ajustado) documentado'
  },
  {
    key: 'clopidogrel_documentado',
    header: 'Clopidogrel documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'Clopidogrel',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Clopidogrel 75 mg/día documentado'
  },
  {
    key: 'anticoagulante_oral_documentado',
    header: 'Anticoagulante oral documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'AOC',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Anticoagulante de acción directa (DOAC) o antagonista de vit K (AVK)'
  },
  {
    key: 'estatinas_documentadas',
    header: 'Estatinas documentadas (0=no;1=sí;.=sin dato)',
    shortLabel: 'Estatina',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Cualquier estatina documentada'
  },
  {
    key: 'estatina_alta_intensidad',
    header: 'Estatina alta intensidad (atorva>=40/rosuva>=20) (0=no;1=sí;.=sin dato)',
    shortLabel: 'Estatina Alta Int.',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Atorvastatina >= 40 mg o Rosuvastatina >= 20 mg diarios'
  },
  {
    key: 'ezetimiba_documentada',
    header: 'Ezetimiba documentada (0=no;1=sí;.=sin dato)',
    shortLabel: 'Ezetimiba',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Ezetimiba 10 mg/día documentada'
  },
  {
    key: 'betabloqueante_documentado',
    header: 'Betabloqueante documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'Betabloqueante',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Betabloqueante (bisoprolol, metoprolol, carvedilol) documentado'
  },
  {
    key: 'ieca_ara2_documentado',
    header: 'IECA o ARA II documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'IECA / ARA II',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Inhibidor de la ECA o antagonista del receptor de angiotensina II'
  },
  {
    key: 'arni_documentado',
    header: 'ARNI sacubitrilo/valsartán documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'ARNI',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Sacubitrilo/valsartán documentado'
  },
  {
    key: 'isglt2_documentado',
    header: 'iSGLT2 documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'iSGLT2',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Inhibidor SGLT2 (dapagliflozina, empagliflozina) documentado'
  },
  {
    key: 'arm_documentado',
    header: 'ARM eplerenona/espironolactona documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'ARM',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Antagonista del receptor de mineralocorticoides documentado'
  },
  {
    key: 'ibp_documentado',
    header: 'IBP gastroprotección documentado (0=no;1=sí;.=sin dato)',
    shortLabel: 'IBP',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Inhibidor de la bomba de protones documentado'
  },
  {
    key: 'rehabilitacion_cardiaca_documentada',
    header: 'Derivación a rehabilitación cardiaca (0=no;1=sí;.=sin dato)',
    shortLabel: 'Rehab. Cardiaca',
    category: 'farmacos_documentados',
    type: 'binary',
    description: 'Derivación prescrita a programa de prevención secundaria y rehabilitación cardiaca'
  },

  // 9. Duraciones de DAPT
  {
    key: 'dapt_meses_documentados',
    header: 'DAPT documentada (meses;.=sin dato)',
    shortLabel: 'DAPT Documentada (m)',
    category: 'duraciones',
    type: 'numeric',
    unit: 'meses',
    description: 'Duración explícita de doble antiagregación documentada en el informe de alta'
  },
  {
    key: 'dapt_meses_propuestos',
    header: 'DAPT propuesta plataforma (meses;.=sin dato)',
    shortLabel: 'DAPT Propuesta (m)',
    category: 'duraciones',
    type: 'numeric',
    unit: 'meses',
    description: 'Duración de DAPT sugerida por las guías en base al perfil isquémico/hemorrágico'
  },
  {
    key: 'dapt_meses_aceptados',
    header: 'DAPT aceptada por médico (meses;.=sin dato)',
    shortLabel: 'DAPT Aceptada (m)',
    category: 'duraciones',
    type: 'numeric',
    unit: 'meses',
    description: 'Duración de DAPT validada o fijada por el médico responsable'
  }
];

export const DICTIONARY_MAP = new Map<string, FieldDefinition>(
  CLINICAL_DICTIONARY.map(def => [def.key, def])
);

// Formateador estándar de visualización según las reglas de codificación
export function formatValueForDisplay(val: any, fieldKey?: string): string {
  if (val === null || val === undefined || val === '' || Number.isNaN(val)) {
    return '.';
  }
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toString() : val.toFixed(2).replace(/\.?0+$/, '');
  }
  if (typeof val === 'boolean') {
    return val ? '1' : '0';
  }
  return String(val);
}
