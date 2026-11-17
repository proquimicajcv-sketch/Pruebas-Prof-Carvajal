import React, { useEffect, useState } from 'react';
import { CalendarCheck, Lock, ShieldAlert } from 'lucide-react';
import { TEACHER_SECRET_CODE } from '../data/examData';

interface SecretCodeModalProps {
  open: boolean;
  isLockedOut: boolean;
  hasActiveStudent: boolean;
  mode?: 'default' | 'unlock-biology';
  onUnlockSession: (verifiedCode: string) => void;
  onOpenTeacherPanel: (verifiedCode: string) => void;
  onUnlockBiologyEarly?: (verifiedCode: string) => void;
  onClose: () => void;
}

export const SecretCodeModal: React.FC<SecretCodeModalProps> = ({
  open,
  isLockedOut,
  hasActiveStudent,
  mode = 'default',
  onUnlockSession,
  onOpenTeacherPanel,
  onUnlockBiologyEarly,
  onClose,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (open) {
      setCode('');
      setError(false);
      setVerifiedCode(null);
      setVerifying(false);
    }
  }, [open]);

  if (!open) return null;

  const isBiologyMode = mode === 'unlock-biology' && !isLockedOut;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = code.trim();
    setVerifying(true);

    let ok = candidate === TEACHER_SECRET_CODE;
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: candidate }),
      });
      if (res.status === 200) ok = true;
      else if (res.status === 401) ok = false;
    } catch {
      // Fallback to local constant check
    }

    setVerifying(false);

    if (ok) {
      setError(false);
      if (isLockedOut) {
        onUnlockSession(candidate);
      } else if (isBiologyMode && onUnlockBiologyEarly) {
        onUnlockBiologyEarly(candidate);
      } else {
        setVerifiedCode(candidate);
      }
    } else {
      setError(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="secret-modal-title"
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl">
        <div className="text-center space-y-2">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
              isLockedOut
                ? 'bg-rose-100 text-rose-700'
                : isBiologyMode
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isLockedOut ? (
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            ) : isBiologyMode ? (
              <CalendarCheck className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Lock className="w-6 h-6" aria-hidden="true" />
            )}
          </div>
          <h3 id="secret-modal-title" className="text-xl font-bold text-slate-900">
            {isLockedOut
              ? 'Pantalla Bloqueada por Infracciones'
              : isBiologyMode
              ? 'Habilitar Pruebas Programadas'
              : verifiedCode
              ? 'Autorización Docente Verificada'
              : 'Código de Acceso Docente'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isLockedOut
              ? 'Se superó el límite de 3 advertencias de integridad académica. Su avance está resguardado; al ingresar el código docente podrá continuar exactamente desde este punto.'
              : isBiologyMode
              ? 'Las pruebas de 7.°, 8.°, 9.° Año y 10.° Biología están programadas para abrir el miércoles 18 de noviembre de 2026 a las 7:20 a.m. Ingrese el código docente para habilitarlas anticipadamente.'
              : verifiedCode
              ? 'Seleccione la acción administrativa que desea ejecutar.'
              : 'Ingrese el código secreto de 4 dígitos proporcionado por el profesor para descargar el documento de notas, revisar calificaciones o desbloquear la sesión.'}
          </p>
        </div>

        {!verifiedCode ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex justify-center">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="••••"
                autoFocus
                aria-label="Código secreto docente de 4 dígitos"
                className="w-48 text-center tracking-[0.4em] text-2xl font-mono font-bold py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-slate-50"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-700 text-center font-semibold">
                Código incorrecto. Verifique e intente nuevamente.
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              {!isLockedOut && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-h-[42px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={verifying}
                className={`flex-1 min-h-[42px] disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 ${
                  isBiologyMode
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {verifying
                  ? 'Verificando...'
                  : isBiologyMode
                  ? 'Habilitar Prueba'
                  : 'Verificar Código'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onOpenTeacherPanel(verifiedCode)}
              className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors whitespace-nowrap shrink-0"
            >
              Abrir Documento de Notas y Panel Administrador
            </button>
            <button
              type="button"
              onClick={() => onUnlockSession(verifiedCode)}
              className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors whitespace-nowrap shrink-0"
            >
              {hasActiveStudent
                ? 'Desbloquear y Continuar Sesión Actual'
                : 'Liberar Correos Bloqueados'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors whitespace-nowrap shrink-0"
            >
              Volver sin cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
