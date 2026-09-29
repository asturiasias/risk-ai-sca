import React from 'react';
import {
  FileUp,
  Users,
  ClipboardCheck,
  Calculator,
  Stethoscope,
  BookOpen,
  Database,
  FlaskConical,
  Settings,
  PlusCircle
} from 'lucide-react';

export type ActiveTab =
  | 'intake'
  | 'patients'
  | 'review'
  | 'scores'
  | 'recs'
  | 'library'
  | 'database'
  | 'demo'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewPatientClick: () => void;
  savedPatientsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onNewPatientClick,
  savedPatientsCount
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'intake', label: 'Nuevo / Cargar Documentos', icon: <FileUp className="w-4 h-4" /> },
    { id: 'patients', label: 'Pacientes Guardados', icon: <Users className="w-4 h-4" />, badge: String(savedPatientsCount) },
    { id: 'review', label: 'Evaluación y Revisión', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'scores', label: 'Scores Deterministas', icon: <Calculator className="w-4 h-4" /> },
    { id: 'recs', label: 'Recomendaciones y Citas', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'library', label: 'Biblioteca Científica (RAG)', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'database', label: 'Base de Datos Acumulativa', icon: <Database className="w-4 h-4" /> },
    { id: 'demo', label: 'Casos Sintéticos (Demo)', icon: <FlaskConical className="w-4 h-4" />, badge: '8 perfiles' },
    { id: 'settings', label: 'Gobernanza y Pruebas', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0">
      {/* Top CTA */}
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={onNewPatientClick}
          className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo Paciente
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className={isActive ? 'text-teal-400' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Details */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between items-center text-slate-300 font-medium">
          <span>Risk AI-SCA v2026.1</span>
          <span className="text-emerald-400">Offline Ready</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Prototipo para evaluación médica y formativa. No constituye marcado CE de producto sanitario asistencial.
        </p>
      </div>
    </aside>
  );
};
