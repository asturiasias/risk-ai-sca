import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DocumentIntakeView } from './components/DocumentIntakeView';
import { PatientReviewView } from './components/PatientReviewView';
import { ScoresView } from './components/ScoresView';
import { RecommendationsView } from './components/RecommendationsView';
import { EvidenceLibraryView } from './components/EvidenceLibraryView';
import { CumulativeDatabaseView } from './components/CumulativeDatabaseView';
import { SyntheticDemoView } from './components/SyntheticDemoView';
import { SettingsGovernanceView } from './components/SettingsGovernanceView';
import { SavedPatientsView } from './components/SavedPatientsView';
import { MedicalReportModal } from './components/MedicalReportModal';
import { PatientRecord } from './types/clinical';
import { SYNTHETIC_PATIENTS } from './services/syntheticPatients';
import { extractClinicalDataFromText, createEmptyPatientRecord } from './services/pdfExtractor';
import { loadAllPatientsFromStorage, savePatientToStorage, deletePatientFromStorage, exportDatabaseToXLSX } from './services/storageService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('intake');
  const [currentPatient, setCurrentPatient] = useState<PatientRecord | null>(null);
  const [savedPatients, setSavedPatients] = useState<PatientRecord[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carga inicial de pacientes desde IndexedDB/localStorage
  useEffect(() => {
    async function initStorage() {
      const loaded = await loadAllPatientsFromStorage();
      if (loaded.length > 0) {
        setSavedPatients(loaded);
        setCurrentPatient(loaded[0]);
      } else {
        // Carga inicial de demostración con los pacientes sintéticos
        const demoRecords: PatientRecord[] = SYNTHETIC_PATIENTS.map(sp => {
          const docs = sp.documents.map(d => ({
            name: d.title,
            type: 'text',
            date: d.date,
            text: d.content
          }));
          const ext = extractClinicalDataFromText(docs, sp.id);
          return {
            id: sp.id,
            episodeId: 'EP-01',
            isSynthetic: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            evaluationPhase: sp.number === 8 ? 'seguimiento_12m' : 'ingreso',
            reviewStatus: sp.number === 7 ? 'pendiente' : 'revisado',
            data: ext.fields,
            recommendationsAccepted: {}
          };
        });

        // Guardar silenciosamente en storage para tener base acumulativa lista
        for (const dr of demoRecords) {
          await savePatientToStorage(dr);
        }
        setSavedPatients(demoRecords);
        setCurrentPatient(demoRecords[0]);
      }
    }

    initStorage();
  }, []);

  const handleSaveCurrentPatient = async () => {
    if (!currentPatient) return;
    setIsSaving(true);
    try {
      await savePatientToStorage(currentPatient);
      const reloaded = await loadAllPatientsFromStorage();
      setSavedPatients(reloaded);
    } catch (err) {
      console.error('Error al guardar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtractionCompleted = (newRecord: PatientRecord) => {
    setCurrentPatient(newRecord);
    setActiveTab('review');
    savePatientToStorage(newRecord).then(() => {
      loadAllPatientsFromStorage().then(setSavedPatients);
    });
  };

  const handleLoadSyntheticById = (syntheticId: string) => {
    const sp = SYNTHETIC_PATIENTS.find(c => c.id === syntheticId);
    if (!sp) return;

    const docs = sp.documents.map(d => ({
      name: d.title,
      type: 'text',
      date: d.date,
      text: d.content
    }));

    const ext = extractClinicalDataFromText(docs, sp.id);
    const rec: PatientRecord = {
      id: sp.id,
      episodeId: 'EP-01',
      isSynthetic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evaluationPhase: sp.number === 8 ? 'seguimiento_12m' : 'ingreso',
      reviewStatus: sp.number === 7 ? 'pendiente' : 'revisado',
      data: ext.fields,
      recommendationsAccepted: {}
    };

    setCurrentPatient(rec);
    setActiveTab('scores');
    savePatientToStorage(rec).then(() => {
      loadAllPatientsFromStorage().then(setSavedPatients);
    });
  };

  const handleNewPatientClick = () => {
    const empty = createEmptyPatientRecord();
    setCurrentPatient(empty);
    setActiveTab('intake');
  };

  const handleDeletePatient = async (patientId: string) => {
    await deletePatientFromStorage(patientId);
    const reloaded = await loadAllPatientsFromStorage();
    setSavedPatients(reloaded);
    if (currentPatient?.id === patientId) {
      setCurrentPatient(reloaded.length > 0 ? reloaded[0] : null);
    }
  };

  const handleRestoreBackup = async (restoredPatients: PatientRecord[]) => {
    for (const p of restoredPatients) {
      await savePatientToStorage(p);
    }
    const reloaded = await loadAllPatientsFromStorage();
    setSavedPatients(reloaded);
    if (reloaded.length > 0) {
      setCurrentPatient(reloaded[0]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* Printable / Viewable Report Modal */}
      {isReportModalOpen && (
        <MedicalReportModal
          patient={currentPatient}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Top Header */}
      <Header
        currentPatient={currentPatient}
        onExportReport={() => setIsReportModalOpen(true)}
        onNewPatient={handleNewPatientClick}
        onSavePatient={handleSaveCurrentPatient}
        onExportExcel={() => exportDatabaseToXLSX(savedPatients)}
        isSaving={isSaving}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onNewPatientClick={handleNewPatientClick}
          savedPatientsCount={savedPatients.length}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'intake' && (
            <DocumentIntakeView
              onExtractionCompleted={handleExtractionCompleted}
              onLoadSyntheticCase={handleLoadSyntheticById}
            />
          )}

          {activeTab === 'patients' && (
            <SavedPatientsView
              patients={savedPatients}
              onSelectPatient={p => {
                setCurrentPatient(p);
                setActiveTab('review');
              }}
              onDeletePatient={handleDeletePatient}
              onNewPatient={handleNewPatientClick}
            />
          )}

          {activeTab === 'review' && currentPatient && (
            <PatientReviewView
              patient={currentPatient}
              onUpdatePatient={updated => {
                setCurrentPatient(updated);
                savePatientToStorage(updated);
              }}
              onProceedToScores={() => setActiveTab('scores')}
            />
          )}

          {activeTab === 'scores' && currentPatient && (
            <ScoresView
              patient={currentPatient}
              onProceedToRecommendations={() => setActiveTab('recs')}
            />
          )}

          {activeTab === 'recs' && currentPatient && (
            <RecommendationsView
              patient={currentPatient}
              onUpdatePatient={updated => {
                setCurrentPatient(updated);
                savePatientToStorage(updated);
              }}
              onProceedToDatabase={() => setActiveTab('database')}
            />
          )}

          {activeTab === 'library' && <EvidenceLibraryView />}

          {activeTab === 'database' && (
            <CumulativeDatabaseView
              patients={savedPatients}
              onSelectPatient={p => {
                setCurrentPatient(p);
                setActiveTab('review');
              }}
              onDeletePatient={handleDeletePatient}
              onRestoreBackup={handleRestoreBackup}
            />
          )}

          {activeTab === 'demo' && (
            <SyntheticDemoView
              onLoadSyntheticToSession={record => {
                setCurrentPatient(record);
                setActiveTab('scores');
                savePatientToStorage(record).then(() => {
                  loadAllPatientsFromStorage().then(setSavedPatients);
                });
              }}
            />
          )}

          {activeTab === 'settings' && <SettingsGovernanceView />}
        </main>
      </div>
    </div>
  );
};

export default App;
