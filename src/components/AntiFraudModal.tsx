import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AntiFraudModalProps {
  visible: boolean;
  infractionCount: number;
  countdown: number;
  lastReason: string;
}

export const AntiFraudModal: React.FC<AntiFraudModalProps> = ({
  visible,
  infractionCount,
  countdown,
  lastReason,
}) => {
  if (!visible) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="antifraud-title"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl w-[90vw] max-w-3xl p-8 sm:p-10 flex flex-col justify-between gap-6 border-2 border-rose-600 shadow-2xl text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" aria-hidden="true" />
          </div>
          <h3 id="antifraud-title" className="text-2xl sm:text-3xl font-bold text-rose-700">
            Advertencia de Integridad Académica
          </h3>
          <p className="text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
            Se detectó una acción no autorizada durante la prueba (
            <strong className="text-slate-900">{lastReason}</strong>). Minimizar la pantalla,
            cambiar de pestaña, abrir otra ventana, usar clic derecho o redimensionar la ventana
            infringe el reglamento de evaluación de Saint Peter&apos;s School.
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl px-5 py-4 text-sm font-bold text-rose-900 tabular-nums">
          Infracción {infractionCount} de 3 permitidas · Al acumular 3 infracciones, la prueba se
          bloqueará y requerirá código docente.
        </div>

        <p className="text-xs text-slate-600">
          Esta advertencia sonora e interfaz se cerrarán automáticamente en{' '}
          <span className="font-mono font-bold text-rose-700 text-base tabular-nums">
            {countdown}
          </span>{' '}
          segundos...
        </p>
      </div>
    </div>
  );
};
