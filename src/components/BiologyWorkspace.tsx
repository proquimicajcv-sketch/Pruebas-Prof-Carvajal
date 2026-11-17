import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  Check,
  Dna,
  Lock,
  Send,
} from 'lucide-react';
import {
  BiologyExamConfig,
  BiologyModuleId,
  BiologySubmittedMap,
  StudentSession,
} from '../types/exam';
import { ConfirmDialog } from './ConfirmDialog';

interface BiologyWorkspaceProps {
  student: StudentSession;
  config: BiologyExamConfig;
  biologyAnswers: Record<string, string>;
  moduleSubmitted: BiologySubmittedMap;
  infractionCount: number;
  onUpdateBiologyAnswer: (subId: string, value: string) => void;
  onLockModule: (moduleId: BiologyModuleId) => void;
  onSubmitFullExam: () => void;
  onOpenTeacherModal: () => void;
}

export const BiologyWorkspace: React.FC<BiologyWorkspaceProps> = ({
  student,
  config,
  biologyAnswers,
  moduleSubmitted,
  infractionCount,
  onUpdateBiologyAnswer,
  onLockModule,
  onSubmitFullExam,
  onOpenTeacherModal,
}) => {
  const [activeModuleId, setActiveModuleId] = useState<BiologyModuleId>('mod1');
  const [confirmModule, setConfirmModule] = useState<BiologyModuleId | null>(null);
  const [confirmFinalSubmit, setConfirmFinalSubmit] = useState(false);
  const [moduleFeedback, setModuleFeedback] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [highlightMissing, setHighlightMissing] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const activeModule = useMemo(
    () => config.modules.find((m) => m.id === activeModuleId) ?? config.modules[0],
    [config.modules, activeModuleId]
  );

  const progress = useMemo(() => {
    let total = 0;
    let answered = 0;
    for (const mod of config.modules) {
      for (const q of mod.questions) {
        for (const sub of q.subquestions) {
          total += 1;
          if ((biologyAnswers[sub.id] || '').trim().length > 0) {
            answered += 1;
          }
        }
      }
    }
    return { answered, total };
  }, [config.modules, biologyAnswers]);

  const getMissingInModule = (modId: BiologyModuleId): string[] => {
    const mod = config.modules.find((m) => m.id === modId);
    if (!mod) return [];
    const missing: string[] = [];
    for (const q of mod.questions) {
      for (const sub of q.subquestions) {
        if ((biologyAnswers[sub.id] || '').trim().length === 0) {
          missing.push(sub.id);
        }
      }
    }
    return missing;
  };

  const getMissingAllModules = (): {
    moduleId: BiologyModuleId;
    tabLabel: string;
    missingIds: string[];
  }[] => {
    return config.modules
      .map((m) => ({
        moduleId: m.id,
        tabLabel: m.tabLabel,
        missingIds: getMissingInModule(m.id),
      }))
      .filter((entry) => entry.missingIds.length > 0);
  };

  const scrollToMissingSubquestion = (subId: string) => {
    window.setTimeout(() => {
      const el = document.getElementById(`bio-q-${subId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 90);
  };

  const handleRequestLockModule = (modId: BiologyModuleId) => {
    const missing = getMissingInModule(modId);
    if (missing.length > 0) {
      setHighlightMissing(true);
      const preview = missing.slice(0, 8).join(', ');
      const extra = missing.length > 8 ? ` (+${missing.length - 8} más)` : '';
      setValidationError(
        `Debe responder todas las subpreguntas de este módulo antes de enviarlo y bloquearlo. Faltan: ${preview}${extra}.`
      );
      scrollToMissingSubquestion(missing[0]);
      return;
    }
    setValidationError(null);
    setHighlightMissing(false);
    setConfirmModule(modId);
  };

  const handleRequestFinalSubmit = () => {
    const incomplete = getMissingAllModules();
    if (incomplete.length > 0) {
      setHighlightMissing(true);
      const summary = incomplete
        .map((m) => {
          const preview = m.missingIds.slice(0, 4).join(', ');
          const extra = m.missingIds.length > 4 ? ` (+${m.missingIds.length - 4} más)` : '';
          return `${m.tabLabel} (${preview}${extra})`;
        })
        .join(' · ');
      setValidationError(
        `No se puede entregar el taller todavía porque faltan subpreguntas por responder: ${summary}.`
      );
      const first = incomplete[0];
      setActiveModuleId(first.moduleId);
      scrollToMissingSubquestion(first.missingIds[0]);
      return;
    }
    setValidationError(null);
    setHighlightMissing(false);
    setConfirmFinalSubmit(true);
  };

  const isLocked = moduleSubmitted[activeModule.id];

  const handleConfirmLock = () => {
    if (!confirmModule) return;
    if (getMissingInModule(confirmModule).length > 0) {
      setConfirmModule(null);
      return;
    }
    onLockModule(confirmModule);
    setConfirmModule(null);
    setValidationError(null);
    setHighlightMissing(false);
    setModuleFeedback('Módulo enviado y bloqueado correctamente.');
    window.setTimeout(() => setModuleFeedback(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Green Top Bar */}
      <header
        className="text-white border-b border-black/10"
        style={{ backgroundColor: config.themeColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Dna className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
              Saint Peter&apos;s School · {config.title}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-white/95 min-w-0">
            <span className="font-semibold truncate max-w-[180px]">{student.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono truncate max-w-[200px]">{student.email}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
              Avance: {progress.answered}/{progress.total} subpreguntas
            </span>
            {infractionCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-amber-200 tabular-nums whitespace-nowrap shrink-0">
                  Advertencias: {infractionCount}/3
                </span>
              </>
            )}
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onOpenTeacherModal}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Acceso Docente</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Progress Strip */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-900 truncate">{student.name}</span>
        <span className="font-mono tabular-nums shrink-0">
          {progress.answered}/{progress.total} ítems
        </span>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Open-Book + Anti-AI/Anti-Google Integrity Banner */}
        <section
          aria-label="Instrucciones del taller y advertencia anti-fraude"
          className="bg-emerald-50 border border-emerald-300/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <BookOpenCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-emerald-950 leading-relaxed">
            <p className="font-bold">
              {config.subtitle} · Valor total: 60 puntos (10 preguntas · 30 subpreguntas de 2 pts)
            </p>
            <p className="text-emerald-900">
              Modalidad a <strong>Libro Abierto Físico</strong>: Fundamente sus respuestas usando
              exclusivamente su libro de texto y el resumen de respaldo autorizado. Sea riguroso y
              emplee vocabulario científico preciso.
            </p>
            <p className="font-semibold text-rose-800 inline-flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Prohibido el uso de IA, Google u otros sitios web: Cambiar de pestaña, minimizar,
                abrir otra ventana, usar clic derecho o redimensionar activará la alarma sonora de
                5 segundos y registrará una infracción (bloqueo total a las 3 infracciones).
              </span>
            </p>
          </div>
        </section>

        {/* Module Navigation Tabs */}
        <nav
          aria-label="Módulos del taller de Biología"
          className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto"
        >
          {config.modules.map((mod) => {
            const active = mod.id === activeModule.id;
            const locked = moduleSubmitted[mod.id];
            const pts = mod.questions.length * 6;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setActiveModuleId(mod.id);
                  setModuleFeedback(null);
                }}
                className={`flex-1 min-w-[200px] min-h-[42px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-emerald-700 text-white'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {locked && <Check className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />}
                <span>{mod.tabLabel}</span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    active ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  ({pts} pts)
                </span>
              </button>
            );
          })}
        </nav>

        {moduleFeedback && (
          <div
            role="status"
            className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-800 flex items-center gap-2"
          >
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{moduleFeedback}</span>
          </div>
        )}

        {validationError && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-rose-800 flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Active Module Content */}
        <main className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">{activeModule.title}</h2>
              <p className="text-xs sm:text-sm text-slate-500">{activeModule.subtitle}</p>
            </div>

            {isLocked ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Módulo Enviado y Bloqueado</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleRequestLockModule(activeModule.id)}
                className="min-h-[42px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Enviar y Bloquear Módulo
              </button>
            )}
          </div>

          {/* Module Scientific Illustration */}
          <figure className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            {!imgErrors[activeModule.id] ? (
              <img
                src={activeModule.imagePath}
                alt={activeModule.imageAlt}
                referrerPolicy="no-referrer"
                onError={() =>
                  setImgErrors((prev) => ({ ...prev, [activeModule.id]: true }))
                }
                className="w-full max-h-[340px] object-cover block"
              />
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-500">
                {activeModule.imageCaption}
              </div>
            )}
            <figcaption className="px-4 py-2.5 text-xs text-slate-600 border-t border-slate-200 bg-white">
              {activeModule.imageCaption}
            </figcaption>
          </figure>

          {/* Module Questions */}
          <div className="space-y-8">
            {activeModule.questions.map((q) => (
              <section key={q.number} className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
                  <span className="font-mono text-emerald-700 mr-2 tabular-nums">
                    {q.number}.
                  </span>
                  {q.title}
                </h3>

                <div className="space-y-4">
                  {q.subquestions.map((sub) => {
                    const value = biologyAnswers[sub.id] || '';
                    const isMissing = highlightMissing && value.trim().length === 0;
                    return (
                      <div
                        key={sub.id}
                        className={`rounded-xl p-4 sm:p-5 space-y-2.5 border ${
                          isMissing
                            ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <label
                            htmlFor={`bio-q-${sub.id}`}
                            className="text-sm font-semibold text-slate-900 leading-relaxed"
                          >
                            <span className="font-mono text-emerald-700 mr-1.5">
                              {sub.label})
                            </span>
                            {sub.prompt}
                          </label>
                          <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums shrink-0 pt-0.5">
                            {sub.value} pts
                          </span>
                        </div>

                        <textarea
                          id={`bio-q-${sub.id}`}
                          rows={3}
                          disabled={isLocked}
                          value={value}
                          onChange={(e) => {
                            const nextVal = e.target.value;
                            onUpdateBiologyAnswer(sub.id, nextVal);
                            if (validationError && nextVal.trim().length > 0) {
                              const remaining = activeModule.questions
                                .flatMap((mq) => mq.subquestions)
                                .filter(
                                  (sq) =>
                                    sq.id !== sub.id &&
                                    (biologyAnswers[sq.id] || '').trim().length === 0
                                );
                              if (remaining.length === 0) {
                                setValidationError(null);
                              }
                            }
                          }}
                          placeholder="Redacte su respuesta fundamentada con vocabulario científico..."
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 leading-relaxed focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Final Submission Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              Ha respondido{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {progress.answered} de {progress.total}
              </strong>{' '}
              subpreguntas del taller. Debe completar los 3 módulos para realizar la entrega.
            </p>
            <button
              type="button"
              onClick={handleRequestFinalSubmit}
              className="w-full sm:w-auto min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>Finalizar y Entregar Taller Completo</span>
            </button>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmModule !== null}
        title="¿Enviar y bloquear este módulo?"
        description="Una vez bloqueado, no podrá modificar las respuestas de este módulo durante la sesión."
        confirmLabel="Sí, enviar y bloquear"
        tone="emerald"
        onConfirm={handleConfirmLock}
        onCancel={() => setConfirmModule(null)}
      />

      <ConfirmDialog
        open={confirmFinalSubmit}
        title="¿Finalizar y entregar el Taller de Biología?"
        description={`Ha completado ${progress.answered} de ${progress.total} subpreguntas (60 puntos totales). Al entregar, todas las respuestas se calificarán y enviarán al registro docente.`}
        confirmLabel="Entregar Taller Definitivo"
        tone="emerald"
        onConfirm={() => {
          setConfirmFinalSubmit(false);
          if (getMissingAllModules().length === 0) {
            onSubmitFullExam();
          }
        }}
        onCancel={() => setConfirmFinalSubmit(false)}
      />
    </div>
  );
};
