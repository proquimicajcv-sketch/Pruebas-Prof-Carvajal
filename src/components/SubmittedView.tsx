import React from 'react';
import { CheckCircle2, Info, LogOut } from 'lucide-react';
import { StoredSubmission } from '../types/exam';

interface SubmittedViewProps {
  submission: StoredSubmission;
  onExit: () => void;
}

export const SubmittedView: React.FC<SubmittedViewProps> = ({ submission, onExit }) => {
  const { student, submittedAt } = submission;
  const levelText =
    student.level === '10-bio'
      ? '10.° Biología'
      : student.level === '10-quim-isa'
      ? 'Química Isabella Antonino'
      : student.level === '10-bio-isa'
      ? 'Biología Isabella Antonino'
      : student.level === 10
      ? '10.° Química'
      : `${student.level}.° Año`;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Evaluación Enviada con Éxito
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Estimado(a) <strong className="text-slate-900">{student.name}</strong>, sus
            respuestas han sido registradas correctamente en el sistema de Saint Peter&apos;s School.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Estudiante</span>
            <strong className="text-slate-900 text-right">{student.name}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Correo institucional</span>
            <strong className="text-slate-900 font-mono text-right">{student.email}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Nivel académico</span>
            <strong className="text-slate-900 text-right">{levelText}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Fecha de registro</span>
            <strong className="text-slate-900 font-mono tabular-nums text-right">
              {new Date(submittedAt).toLocaleString('es-CR')}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <span className="text-slate-500">Estado</span>
            <strong className="text-emerald-700">Bloqueado y Registrado</strong>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-3 text-left leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Por directriz docente, las calificaciones y la retroalimentación detallada permanecerán
            ocultas hasta que el profesor las publique oficialmente en clase.
          </span>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Finalizar Sesión / Salir</span>
        </button>
      </div>
    </div>
  );
};
