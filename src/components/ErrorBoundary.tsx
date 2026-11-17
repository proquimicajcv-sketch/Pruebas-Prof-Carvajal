import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Error inesperado en la aplicación.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendlyDetail =
        'Ocurrió un inconveniente al comunicarse con la base de datos. Intente recargar la página.';
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string };
        if (parsed?.error?.includes('Quota exceeded')) {
          friendlyDetail =
            'Se alcanzó el límite diario de lecturas/escrituras gratuitas de Firestore. El cupo se restablece al día siguiente.';
        } else if (parsed?.error) {
          friendlyDetail = parsed.error;
        }
      } catch {
        if (this.state.message) {
          friendlyDetail = this.state.message;
        }
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Error de Conexión o Permisos
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{friendlyDetail}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Recargar Plataforma</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
