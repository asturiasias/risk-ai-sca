export const STANDALONE_VIEWS = `
// VISTAS DEL CLIENTE STANDALONE

function renderIntakeView() {
  return \`
    <div class="card">
      <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">📥 Entrada y Extracción de Documentos Clínicos</h2>
      <p style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 16px;">
        Pegue aquí el texto de informes de urgencias, analíticas, cateterismo o epicrisis. El extractor determinista normalizará las variables clínicas según el Diccionario Oficial sin inventar datos no mencionados.
      </p>

      <div class="form-group">
        <label class="form-label">Texto Clínico sin Estructurar:</label>
        <textarea id="intake-text" class="form-control" style="height: 180px; font-family: monospace; font-size: 0.75rem;" placeholder="Ejemplo: Paciente varón de 64 años, fumador activo, acude por dolor torácico opresivo de 3 horas. ECG: elevación del segmento ST de 3 mm en V1-V4 (SCACEST). PA 130/80 mmHg, FC 88 lpm. Killip I. Analítica: Creatinina 1.1 mg/dL, Hb 14.5 g/dL, Leucocitos 9.8..."></textarea>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 16px; align-items: center;">
        <button class="btn btn-primary" onclick="handleRunExtraction()">🔍 Extraer Variables Deterministas</button>
        <button class="btn btn-outline" onclick="loadSampleIntoIntake()">Cargar Texto de Ejemplo</button>
        <input type="file" id="file-uploader" style="display:none;" onchange="handleFileUpload(event)" accept=".txt,.json">
        <button class="btn btn-outline" onclick="document.getElementById('file-uploader').click()">📁 Cargar Archivo .txt</button>
      </div>

      <div id="extraction-results" style="display: none;">
        <div class="alert-box alert-emerald" id="extraction-alert"></div>
        <div style="max-height: 280px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 6px; margin-bottom: 14px;">
          <table>
            <thead><tr><th>Variable</th><th>Valor Extraído</th><th>Fragmento de Respaldo</th></tr></thead>
            <tbody id="extraction-table-body" class="mono"></tbody>
          </table>
        </div>
        <button class="btn btn-primary" onclick="handleImportExtractedToSession()">✅ Cargar en Sesión y Pasar a Revisión</button>
      </div>
    </div>
  \`;
}

function renderReviewView() {
  const p = currentActivePatient;
  const d = p.data;
  const groups = [
    { title: '1. Identificación y Parámetros Biométricos', keys: ['id_pseudonimo', 'id_episodio_indice', 'edad', 'sexo', 'peso_kg', 'talla_cm', 'imc'] },
    { title: '2. Constantes y Presentación Aguda', keys: ['tipo_sca', 'fc_ingreso', 'pas_ingreso', 'pad_ingreso', 'killip_ingreso', 'desviacion_st_ecg', 'parada_cardiaca_ingreso'] },
    { title: '3. Antecedentes y Comorbilidades', keys: ['hta_previa', 'diabetes', 'dislipidemia', 'tabaquismo_activo', 'tabaquismo_previo', 'fa_previa', 'anticoagulacion_oral_cronica', 'ictus_isquemico_previo', 'ait_previo', 'hemorragia_intracraneal_previa', 'sangrado_previo_espontaneo', 'cancer_activo'] },
    { title: '4. Laboratorio y Biomarcadores', keys: ['creatinina_ingreso', 'hemoglobina_ingreso', 'hematocrito_ingreso', 'leucocitos_ingreso', 'plaquetas_ingreso', 'troponina_pico_observado', 'biomarcadores_positivos_elevados', 'ldl_colesterol'] },
    { title: '5. Función Ventricular e Intervencionismo', keys: ['fevi_inicial', 'numero_vasos_enfermos', 'revascularizacion_completa', 'diametro_stent_menor_3mm', 'pci_previa', 'iam_previo'] }
  ];

  return \`
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">✏️ Editor y Auditoría de Variables Clínicas</h2>
          <p style="font-size: 0.8rem; color: var(--color-muted);">Paciente activo: <strong>\${p.id}</strong> (Episodio: \${p.episodeId}). Modifique cualquier valor para recalcular en tiempo real.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline" onclick="handleSavePatientToStorage()">💾 Guardar en Base de Datos</button>
          <button class="btn btn-primary" onclick="switchTab('scores')">Ver Calculadoras ➔</button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        \${groups.map(g => \`
          <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
            <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 10px; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px;">\${g.title}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;">
              \${g.keys.map(k => {
                const def = DICTIONARY.find(x => x.key === k) || { shortLabel: k, type: 'text', unit: '' };
                const field = d[k] || { value: null };
                const val = field.value !== null && field.value !== undefined ? field.value : '';
                return \`
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="display: flex; justify-content: space-between;">
                      <span>\${def.shortLabel} \${def.unit ? '(' + def.unit + ')' : ''}</span>
                      \${field.quote ? '<span title="' + field.quote.replace(/"/g, '&quot;') + '" style="cursor:help; color:var(--color-teal);">[doc]</span>' : ''}
                    </label>
                    \${renderFieldInput(k, def, val)}
                  </div>
                \`;
              }).join('')}
            </div>
          </div>
        \`).join('')}
      </div>
    </div>
  \`;
}

function renderFieldInput(key, def, val) {
  if (def.options && def.options.length > 0) {
    return \`
      <select class="form-control" onchange="updatePatientField('\${key}', this.value)">
        <option value="" \${val === '' ? 'selected' : ''}>. (Sin dato)</option>
        \${def.options.filter(o => o.value !== null).map(o => \`
          <option value="\${o.value}" \${String(val) === String(o.value) ? 'selected' : ''}>\${o.label}</option>
        \`).join('')}
      </select>
    \`;
  }
  const inputType = def.type === 'numeric' ? 'number' : 'text';
  const step = def.type === 'numeric' ? 'any' : undefined;
  return \`
    <input type="\${inputType}" \${step ? 'step="' + step + '"' : ''} class="form-control mono" value="\${val}" onchange="updatePatientField('\${key}', this.value)">
  \`;
}

function renderScoresView() {
  const p = currentActivePatient;
  const scores = computeAllScores(p);
  const d = {};
  Object.keys(p.data).forEach(k => { d[k] = p.data[k].value; });

  return \`
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">🧮 Calculadoras de Riesgo Deterministas</h2>
          <p style="font-size: 0.8rem; color: var(--color-muted);">Paciente evaluado: <strong>\${p.id}</strong> · Cálculos recalculados automáticamente tras cualquier edición.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline" onclick="switchTab('review')">✏️ Editar Variables</button>
          <button class="btn btn-primary" onclick="switchTab('recs')">Ver Recomendaciones ➔</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
        <!-- Cockcroft-Gault -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">Cockcroft-Gault CrCl</h3>
          <p class="mono" style="font-size: 1.4rem; font-weight: 700; color: var(--color-teal); margin: 4px 0;">
            \${scores.crcl !== null ? scores.crcl + ' mL/min' : 'No calculable'}
          </p>
          <p style="font-size: 0.72rem; color: var(--color-muted);">Fórmula: [(140 - edad) × peso × (0.85 si F)] / (72 × Cr). Variable obligatoria para PRECISE-DAPT y CRUSADE.</p>
        </div>

        <!-- GRACE Score -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">GRACE 2.0 (Mortalidad Intrahospitalaria)</h3>
          <p class="mono" style="font-size: 1.4rem; font-weight: 700; color: var(--color-primary); margin: 4px 0;">
            \${scores.grace.points !== null ? scores.grace.points + ' pts' : 'Indeterminado'}
          </p>
          <p style="font-size: 0.72rem; color: var(--color-muted);">Categoría: <strong>\${scores.grace.category}</strong>. \${scores.grace.points > 140 ? '⚠️ Criterio de coronariografía en &lt; 24h.' : ''}</p>
        </div>

        <!-- TIMI UA/NSTEMI -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">TIMI UA/NSTEMI (7 factores)</h3>
          <p class="mono" style="font-size: 1.4rem; font-weight: 700; color: var(--color-primary); margin: 4px 0;">
            \${scores.timi.points !== null ? scores.timi.points + ' / 7 pts' : 'Indeterminado'}
          </p>
          <p style="font-size: 0.72rem; color: var(--color-muted);">Riesgo de evento a 14 días: <strong>\${scores.timi.category}</strong> (Antman et al. JAMA 2000).</p>
        </div>

        <!-- PRECISE-DAPT -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">PRECISE-DAPT (Sangrado ambulatorio)</h3>
          <p class="mono" style="font-size: 1.4rem; font-weight: 700; color: var(--color-primary); margin: 4px 0;">
            \${scores.preciseDapt.points !== null ? scores.preciseDapt.points + ' pts' : 'Indeterminado'}
          </p>
          <p style="font-size: 0.72rem; color: var(--color-muted);">Estratificación: <strong>\${scores.preciseDapt.category}</strong>. Umbral HBR ≥ 25.</p>
        </div>

        <!-- CRUSADE -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">CRUSADE (Sangrado hospitalario)</h3>
          <p class="mono" style="font-size: 1.4rem; font-weight: 700; color: var(--color-primary); margin: 4px 0;">
            \${scores.crusade.points !== null ? scores.crusade.points + ' pts' : 'Indeterminado'}
          </p>
          <p style="font-size: 0.72rem; color: var(--color-muted);">Categoría: <strong>\${scores.crusade.category}</strong> (Subherwal et al. Circulation 2009).</p>
        </div>

        <!-- ARC-HBR -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">ARC-HBR Consenso</h3>
          <p style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary); margin: 4px 0;">
            \${scores.arcHbr.category}
          </p>
          <p style="font-size: 0.72rem; color: var(--color-muted);">Mayores: \${scores.arcHbr.majorCount} | Menores: \${scores.arcHbr.minorCount}. \${scores.arcHbr.majorList.length ? 'Mayores: ' + scores.arcHbr.majorList.join(', ') : ''}</p>
        </div>

        <!-- DAPT Score -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">DAPT Score (Yeh et al.)</h3>
          <p style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary); margin: 4px 0;">
            \${scores.daptScore.category}
          </p>
          <p style="font-size: 0.72rem; color: var(--color-muted);">Salvaguarda: Sólo aplicable tras 12 meses de DAPT completada sin eventos isquémicos ni hemorrágicos.</p>
        </div>
      </div>
    </div>
  \`;
}

function renderRecsView() {
  const p = currentActivePatient;
  const scores = computeAllScores(p);
  const d = {};
  Object.keys(p.data).forEach(k => { d[k] = p.data[k].value; });

  const isStemi = d.tipo_sca === 0;
  const hasFa = d.fa_previa === 1 || d.anticoagulacion_oral_cronica === 1;
  const isHbr = scores.arcHbr.isHbr === true || (scores.preciseDapt.points !== null && scores.preciseDapt.points >= 25);
  const strokeContraindication = d.ictus_isquemico_previo === 1 || d.ait_previo === 1 || d.hemorragia_intracraneal_previa === 1;

  return \`
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">💡 Recomendaciones Individualizadas y Citas Científicas</h2>
          <p style="font-size: 0.8rem; color: var(--color-muted);">Estratificación y plan terapéutico guiado por Guías ESC 2023 SCA y ACC/AHA 2025 para <strong>\${p.id}</strong>.</p>
        </div>
        <button class="btn btn-outline" onclick="openReportModal()">🖨️ Ver / Imprimir Informe</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <!-- Invasivo -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 14px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-teal); text-transform: uppercase;">1. Estrategia Invasiva y Reperfusión</span>
            <span class="badge badge-local">Clase I, Nivel A</span>
          </div>
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 4px;">
            \${isStemi ? 'Reperfusión inmediata mediante ICP primaria por acceso radial (< 60-90 min)' : (scores.grace.points > 140 ? 'Estrategia invasiva PRECOZ (< 24 h) por Puntuación GRACE > 140' : 'Estrategia invasiva selectiva guiada por estratificación')}
          </h4>
          <p style="font-size: 0.8rem; color: #334155; margin-bottom: 6px;">
            \${isStemi ? 'Diagnóstico de SCACEST confirmado. El acceso radial reduce sangrado en el sitio de punción y mortalidad.' : 'SCASEST de alto riesgo; se beneficia de revascularización anatómica guiada intrahospitalaria.'}
          </p>
          <div style="font-size: 0.72rem; color: #64748B;">Cita: Guía ESC 2023 ACS · DOI: 10.1093/eurheartj/ehad191</div>
        </div>

        <!-- Antitrombótico -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 14px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-teal); text-transform: uppercase;">2. Régimen Antitrombótico y Duración DAPT</span>
            <span class="badge badge-local">Clase I, Nivel A</span>
          </div>
          \${strokeContraindication ? '<div class="alert-box alert-red" style="margin-bottom:8px;"><strong>ALERTA DE SEGURIDAD CRÍTICA:</strong> Prasugrel está estrictamente CONTRAINDICADO (Clase III) por antecedente de ictus/AIT. Use Ticagrelor o Clopidogrel.</div>' : ''}
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 4px;">
            \${hasFa ? 'Doble terapia: DOAC a dosis estándar + Clopidogrel 75 mg/día. Suspender AAS al alta.' : (strokeContraindication ? 'AAS 100 mg/día + TICAGRELOR 90 mg/12 h (Prasugrel bloqueado por seguridad).' : (isHbr ? 'Doble antiagregación corta (1 a 3 meses) con AAS + Clopidogrel por Alto Riesgo Hemorrágico.' : 'AAS 100 mg/día + PRASUGREL 10 mg/día (5 mg si edad ≥75 o peso &lt;60 kg) durante 12 meses.'))}
          </h4>
          <p style="font-size: 0.8rem; color: #334155; margin-bottom: 6px;">
            \${hasFa ? 'En FA sometida a PCI, las guías contraindican la triple terapia prolongada por triplicar el sangrado sin reducir eventos isquémicos.' : 'Tratamiento antiplaquetario individualizado según perfil isquémico/hemorrágico.'}
          </p>
          <div style="font-size: 0.72rem; color: #64748B;">Cita: Guía ESC 2023 ACS Sección 6 · DOI: 10.1093/eurheartj/ehad191</div>
        </div>

        <!-- Lípidos y Cardiorrenal -->
        <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 14px; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-teal); text-transform: uppercase;">3. Prevención Secundaria y Lípidos</span>
            <span class="badge badge-local">Clase I, Nivel A</span>
          </div>
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 4px;">
            Estatina de alta potencia (Atorvastatina 80 mg o Rosuvastatina 20-40 mg) + Ezetimiba 10 mg; objetivo c-LDL &lt; 55 mg/dL.
          </h4>
          <p style="font-size: 0.8rem; color: #334155; margin-bottom: 6px;">
            \${d.fevi_inicial !== null && d.fevi_inicial <= 40 ? 'Disfunción ventricular sistólica (FEVI ' + d.fevi_inicial + '%): iniciar cuatro pilares de insuficiencia cardiaca (Betabloqueante + IECA/ARNI + ARM + iSGLT2).' : 'FEVI conservada (>50%): reevaluar betabloqueo a largo plazo al año.'}
            \${d.diabetes === 1 ? ' En diabetes: asociar iSGLT2 o agonista GLP-1 con beneficio cardiovascular demostrado.' : ''}
          </p>
          <div style="font-size: 0.72rem; color: #64748B;">Cita: Guía ESC/EAS 2019 Dislipidemias · DOI: 10.1093/eurheartj/ehz455</div>
        </div>
      </div>
    </div>
  \`;
}
`;
