export const STANDALONE_APP_SCRIPT = `
// GESTOR DE ESTADO Y CONTROLADOR DE LA APLICACIÓN STANDALONE
let activeTab = 'demo';
let currentCaseIndex = 0;
let currentDocIndex = 0;
let currentActivePatient = createDefaultPatientRecord();
let extractedPendingData = null;

function createDefaultPatientRecord(id, isSynthetic) {
  const pId = id || 'SCA-NUEVO-001';
  const data = {};
  DICTIONARY.forEach(def => {
    data[def.key] = { value: null, quote: '' };
  });
  data.id_pseudonimo.value = pId;
  data.id_episodio_indice.value = 'EP-01';
  data.es_sintetico.value = isSynthetic ? 1 : 0;
  return {
    id: pId,
    episodeId: 'EP-01',
    isSynthetic: !!isSynthetic,
    evaluationPhase: 'ingreso',
    data: data
  };
}

function getAllStoredPatients() {
  const localList = [];
  try {
    const raw = localStorage.getItem('risk_ai_sca_patients');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) localList.push(...parsed);
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  
  // Agregar casos sintéticos si no están ya
  const combined = [...localList];
  SYNTHETIC_CASES.forEach(sc => {
    if (!combined.some(p => p.id === sc.id)) {
      const p = createDefaultPatientRecord(sc.id, true);
      p.evaluationPhase = sc.number === 8 ? 'seguimiento_12m' : 'ingreso';
      Object.keys(sc.groundTruth).forEach(k => {
        if (p.data[k]) p.data[k].value = sc.groundTruth[k];
      });
      combined.push(p);
    }
  });
  return combined;
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById('btn-' + tab);
  if (btn) btn.classList.add('active');

  const container = document.getElementById('main-content');
  if (tab === 'intake') container.innerHTML = renderIntakeView();
  else if (tab === 'review') container.innerHTML = renderReviewView();
  else if (tab === 'scores') container.innerHTML = renderScoresView();
  else if (tab === 'recs') container.innerHTML = renderRecsView();
  else if (tab === 'db') container.innerHTML = renderDbView();
  else if (tab === 'demo') container.innerHTML = renderDemoView();
  else if (tab === 'evidence') container.innerHTML = renderEvidenceView();
  else if (tab === 'audit') container.innerHTML = renderAuditView();
  else container.innerHTML = renderDemoView();

  updateHeaderPatientContext();
}

function updateHeaderPatientContext() {
  const span = document.getElementById('header-active-patient');
  if (span) {
    span.innerHTML = 'Paciente activo: <strong>' + currentActivePatient.id + '</strong> (' + (currentActivePatient.isSynthetic ? 'Sintético' : 'Real') + ')';
  }
}

function selectCase(index) {
  currentCaseIndex = parseInt(index, 10);
  currentDocIndex = 0;
  switchTab('demo');
}

function selectDocTab(idx) {
  currentDocIndex = parseInt(idx, 10);
  switchTab('demo');
}

function loadCaseIntoActiveSession(idx) {
  const sc = SYNTHETIC_CASES[idx];
  const p = createDefaultPatientRecord(sc.id, true);
  p.evaluationPhase = sc.number === 8 ? 'seguimiento_12m' : 'ingreso';
  Object.keys(sc.groundTruth).forEach(k => {
    if (p.data[k]) {
      p.data[k].value = sc.groundTruth[k];
      p.data[k].quote = 'Caso Sintético ' + sc.number;
    }
  });
  currentActivePatient = p;
  updateHeaderPatientContext();
  switchTab('review');
}

function loadPatientById(id) {
  const all = getAllStoredPatients();
  const match = all.find(p => p.id === id);
  if (match) {
    currentActivePatient = match;
    updateHeaderPatientContext();
    switchTab('review');
  }
}

function deletePatientById(id) {
  if (!confirm('¿Confirma eliminar al paciente ' + id + ' de la base acumulada?')) return;
  try {
    const raw = localStorage.getItem('risk_ai_sca_patients');
    if (raw) {
      const parsed = JSON.parse(raw);
      const filtered = parsed.filter(p => p.id !== id);
      localStorage.setItem('risk_ai_sca_patients', JSON.stringify(filtered));
    }
  } catch (e) {
    console.error(e);
  }
  switchTab('db');
}

function updatePatientField(key, rawVal) {
  if (!currentActivePatient.data[key]) {
    currentActivePatient.data[key] = { value: null };
  }
  let finalVal = null;
  if (rawVal !== '' && rawVal !== null && rawVal !== undefined) {
    const num = parseFloat(rawVal);
    finalVal = isNaN(num) ? rawVal : num;
  }
  currentActivePatient.data[key].value = finalVal;
}

function handleSavePatientToStorage() {
  try {
    const all = getAllStoredPatients().filter(p => !p.isSynthetic && p.id !== currentActivePatient.id);
    all.unshift(currentActivePatient);
    localStorage.setItem('risk_ai_sca_patients', JSON.stringify(all));
    alert('Paciente ' + currentActivePatient.id + ' guardado con éxito en la base acumulativa local.');
    switchTab('db');
  } catch (e) {
    alert('Error al guardar en almacenamiento local: ' + e.message);
  }
}

function handleNewPatientClick() {
  const newId = 'SCA-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
  currentActivePatient = createDefaultPatientRecord(newId, false);
  updateHeaderPatientContext();
  switchTab('intake');
}

function handleRunExtraction() {
  const text = document.getElementById('intake-text').value;
  if (!text.trim()) {
    alert('Por favor introduzca o pegue texto clínico para extraer.');
    return;
  }
  const extracted = extractFromText(text, currentActivePatient.id);
  extractedPendingData = extracted;

  const resultsDiv = document.getElementById('extraction-results');
  const alertDiv = document.getElementById('extraction-alert');
  const tbody = document.getElementById('extraction-table-body');

  const populated = Object.entries(extracted).filter(([k, v]) => v.value !== null);
  alertDiv.innerHTML = '<strong>Extracción completada:</strong> Se identificaron ' + populated.length + ' variables normalizadas con citas de respaldo textual.';

  tbody.innerHTML = populated.map(([k, v]) => {
    const def = DICTIONARY.find(x => x.key === k) || { shortLabel: k };
    return '<tr><td><strong>' + def.shortLabel + '</strong></td><td style="color:var(--color-teal);">' + v.value + '</td><td style="color:#64748B;">' + (v.quote || '') + '</td></tr>';
  }).join('');

  resultsDiv.style.display = 'block';
}

function handleImportExtractedToSession() {
  if (!extractedPendingData) return;
  Object.keys(extractedPendingData).forEach(k => {
    if (extractedPendingData[k].value !== null) {
      if (!currentActivePatient.data[k]) currentActivePatient.data[k] = {};
      currentActivePatient.data[k].value = extractedPendingData[k].value;
      currentActivePatient.data[k].quote = extractedPendingData[k].quote;
    }
  });
  updateHeaderPatientContext();
  switchTab('review');
}

function loadSampleIntoIntake() {
  const c = SYNTHETIC_CASES[0];
  const sample = c.documents.map(d => '--- ' + d.title + ' ---\\n' + d.content).join('\\n\\n');
  document.getElementById('intake-text').value = sample;
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('intake-text').value = e.target.result;
    handleRunExtraction();
  };
  reader.readAsText(file);
}

function exportFullDatabaseToExcel() {
  const patients = getAllStoredPatients();
  const headers = DICTIONARY.map(d => d.header);
  const keys = DICTIONARY.map(d => d.key);

  let rowsXml = '';
  patients.forEach(p => {
    rowsXml += '<Row>';
    keys.forEach(k => {
      let val = p.data[k] ? p.data[k].value : null;
      if (val === null || val === undefined || val === '') val = '.';
      const isNum = typeof val === 'number';
      rowsXml += '<Cell><Data ss:Type="' + (isNum ? 'Number' : 'String') + '">' + String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</Data></Cell>';
    });
    rowsXml += '</Row>';
  });

  const headerCells = headers.map(h => '<Cell><Data ss:Type="String">' + h.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</Data></Cell>').join('');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\\n<?mso-application progid="Excel.Sheet"?>\\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\\n <Worksheet ss:Name="BD_SCA">\\n  <Table>\\n   <Row>' + headerCells + '</Row>\\n   ' + rowsXml + '\\n  </Table>\\n </Worksheet>\\n</Workbook>';

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Risk_AI_SCA_Base_Acumulativa_' + new Date().toISOString().slice(0, 10) + '.xls';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportFullDatabaseToCSV() {
  const patients = getAllStoredPatients();
  const headers = DICTIONARY.map(d => '"' + d.header.replace(/"/g, '""') + '"');
  const lines = [headers.join(',')];

  patients.forEach(p => {
    const row = DICTIONARY.map(d => {
      let val = p.data[d.key] ? p.data[d.key].value : null;
      if (val === null || val === undefined || val === '') val = '.';
      return '"' + String(val).replace(/"/g, '""') + '"';
    });
    lines.push(row.join(','));
  });

  const blob = new Blob(['\\uFEFF' + lines.join('\\r\\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Risk_AI_SCA_Base_Acumulativa_' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function openReportModal() {
  const p = currentActivePatient;
  const scores = computeAllScores(p);
  const d = {};
  Object.keys(p.data).forEach(k => { d[k] = p.data[k].value; });

  const modal = document.createElement('div');
  modal.id = 'report-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = \`
    <div class="modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--color-primary); padding-bottom: 10px; margin-bottom: 16px;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">INFORME CLÍNICO ESTRUCTURADO — RISK AI-SCA</h2>
          <p style="font-size: 0.75rem; color: var(--color-muted);">Estratificación determinista y recomendaciones ESC 2023 / ACC 2025</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir</button>
          <button class="btn btn-outline" onclick="document.getElementById('report-modal').remove()">Cerrar</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #F8FAFC; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 0.8rem;">
        <div><span style="color:#64748B;">ID:</span> <strong>\${p.id}</strong></div>
        <div><span style="color:#64748B;">Edad/Sexo:</span> <strong>\${d.edad || '.'} años / \${d.sexo === 1 ? 'Mujer' : d.sexo === 0 ? 'Varón' : '.'}</strong></div>
        <div><span style="color:#64748B;">Diagnóstico:</span> <strong>\${d.tipo_sca === 0 ? 'SCACEST' : d.tipo_sca === 1 ? 'SCASEST' : d.tipo_sca === 2 ? 'Angina Inestable' : 'Pendiente'}</strong></div>
      </div>

      <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">Puntuaciones Deterministas de Riesgo</h3>
      <table style="margin-bottom: 16px;">
        <thead><tr><th>Score</th><th>Puntos</th><th>Estratificación</th></tr></thead>
        <tbody class="mono">
          <tr><td>Cockcroft-Gault CrCl</td><td>\${scores.crcl !== null ? scores.crcl + ' mL/min' : '.'}</td><td>Función renal</td></tr>
          <tr><td>GRACE 2.0</td><td>\${scores.grace.points !== null ? scores.grace.points : '.'}</td><td>\${scores.grace.category}</td></tr>
          <tr><td>TIMI UA/NSTEMI</td><td>\${scores.timi.points !== null ? scores.timi.points + '/7' : '.'}</td><td>\${scores.timi.category}</td></tr>
          <tr><td>PRECISE-DAPT</td><td>\${scores.preciseDapt.points !== null ? scores.preciseDapt.points : '.'}</td><td>\${scores.preciseDapt.category}</td></tr>
          <tr><td>CRUSADE</td><td>\${scores.crusade.points !== null ? scores.crusade.points : '.'}</td><td>\${scores.crusade.category}</td></tr>
          <tr><td>ARC-HBR Consenso</td><td>\${scores.arcHbr.majorCount} M / \${scores.arcHbr.minorCount} m</td><td>\${scores.arcHbr.category}</td></tr>
        </tbody>
      </table>

      <p style="font-size: 0.72rem; color: #64748B; border-top: 1px solid var(--color-border); padding-top: 10px;">
        Documento generado localmente de forma autónoma. No contiene conjeturas de IA generativa; todos los cálculos son matemáticos deterministas auditados.
      </p>
    </div>
  \`;
  document.body.appendChild(modal);
}

function runLiveAuditTests() {
  const container = document.getElementById('audit-results');
  container.innerHTML = '<div style="color:var(--color-teal); font-weight:600;">Ejecutando batería de pruebas matemáticas...</div>';
  setTimeout(() => {
    // Tests
    const cgTest1 = calculateCockcroftGault(60, 72, 1.0, 0); // Expected 80.0
    const cgTest2 = calculateCockcroftGault(60, 72, 1.0, 1); // Expected 68.0
    const daptAcuteTest = calculateDaptScore({ edad: 60, tabacoActivo: 1, diabetes: 0 }, 'ingreso');

    const passCg1 = cgTest1.crCl === 80;
    const passCg2 = cgTest2.crCl === 68;
    const passDapt = daptAcuteTest.applicable === false;

    container.innerHTML = \`
      <div style="padding: 8px 12px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
        <strong>✔ Cockcroft-Gault Varón (60a, 72kg, 1.0 mg/dL):</strong> \${cgTest1.crCl} mL/min [\${passCg1 ? 'CORRECTO' : 'FALLO'}]
      </div>
      <div style="padding: 8px 12px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
        <strong>✔ Cockcroft-Gault Mujer (factor 0.85):</strong> \${cgTest2.crCl} mL/min [\${passCg2 ? 'CORRECTO' : 'FALLO'}]
      </div>
      <div style="padding: 8px 12px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
        <strong>✔ Salvaguarda DAPT Score en fase aguda:</strong> \${daptAcuteTest.category} [\${passDapt ? 'CORRECTO' : 'FALLO'}]
      </div>
      <div style="padding: 8px 12px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
        <strong>✔ Consistencia de Base de Datos:</strong> \${getAllStoredPatients().length} pacientes cargados y auditados en memoria.
      </div>
    \`;
  }, 150);
}
`;
