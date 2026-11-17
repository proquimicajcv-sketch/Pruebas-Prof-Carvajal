import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, FlaskConical, Lock, Send, Sparkles } from 'lucide-react';
import {
  IsabellaExamConfig,
  IsabellaExamImage,
  IsabellaSectionId,
  IsabellaSubmittedMap,
  StudentSession,
  UserAnswers,
} from '../types/exam';
import { sanitizeCompleteInput } from '../utils/grading';
import { ConfirmDialog } from './ConfirmDialog';

interface IsabellaWorkspaceProps {
  student: StudentSession;
  config: IsabellaExamConfig;
  answers: UserAnswers;
  sectionSubmitted: IsabellaSubmittedMap;
  infractionCount: number;
  onUpdateAnswer: <K extends keyof UserAnswers>(section: K, value: UserAnswers[K]) => void;
  onLockSection: (section: IsabellaSectionId) => void;
  onSubmitFullExam: () => void;
  onOpenTeacherModal: () => void;
}

const TABS: { id: IsabellaSectionId; label: string; pts: string }[] = [
  { id: 'selection', label: 'I. Selección Única', pts: '20 pts' },
  { id: 'matching1', label: 'II. Asocie 1', pts: '5 pts' },
  { id: 'matching2', label: 'III. Asocie 2', pts: '5 pts' },
  { id: 'completes', label: 'IV. Completes', pts: '5 pts' },
  { id: 'development', label: 'V. Desarrollo', pts: '2 pts' },
  { id: 'bonus', label: 'VI. Opcional', pts: '+1 pt' },
];

export const IsabellaWorkspace: React.FC<IsabellaWorkspaceProps> = ({
  student,
  config,
  answers,
  sectionSubmitted,
  infractionCount,
  onUpdateAnswer,
  onLockSection,
  onSubmitFullExam,
  onOpenTeacherModal,
}) => {
  const [activeTab, setActiveTab] = useState<IsabellaSectionId>('selection');
  const [confirmSection, setConfirmSection] = useState<IsabellaSectionId | null>(null);
  const [confirmFinalSubmit, setConfirmFinalSubmit] = useState(false);
  const [sectionFeedback, setSectionFeedback] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [highlightMissing, setHighlightMissing] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const progress = useMemo(() => {
    const sel = Object.keys(answers.selection).length;
    const m1 = Object.values(answers.matching).filter((v) => v !== '' && v !== undefined).length;
    const m2 = Object.values(answers.matching2 || {}).filter(
      (v) => v !== '' && v !== undefined
    ).length;
    const cmp = Object.values(answers.completes).filter((v) => v.trim().length > 0).length;
    const dev = (answers.development[0] || '').trim().length > 0 ? 1 : 0;
    return {
      answered: sel + m1 + m2 + cmp + dev,
      total:
        config.selection.length +
        config.matching1.length +
        config.matching2.length +
        config.completes.length +
        1,
    };
  }, [answers, config]);

  const getMissingInSection = (sec: IsabellaSectionId): number[] => {
    if (sec === 'selection') {
      return config.selection
        .map((_, idx) => (answers.selection[idx] === undefined ? idx + 1 : -1))
        .filter((n) => n > 0);
    }
    if (sec === 'matching1') {
      return config.matching1
        .map((_, idx) => {
          const v = answers.matching[idx];
          return v === undefined || v === '' ? idx + 1 : -1;
        })
        .filter((n) => n > 0);
    }
    if (sec === 'matching2') {
      return config.matching2
        .map((_, idx) => {
          const v = answers.matching2?.[idx];
          return v === undefined || v === '' ? idx + 1 : -1;
        })
        .filter((n) => n > 0);
    }
    if (sec === 'completes') {
      return config.completes
        .map((_, idx) => ((answers.completes[idx] || '').trim().length === 0 ? idx + 1 : -1))
        .filter((n) => n > 0);
    }
    if (sec === 'development') {
      return (answers.development[0] || '').trim().length === 0 ? [1] : [];
    }
    return [];
  };

  const getMissingAllRequired = (): {
    section: IsabellaSectionId;
    label: string;
    missing: number[];
  }[] => {
    const requiredSections: { section: IsabellaSectionId; label: string }[] = [
      { section: 'selection', label: 'I. Selección Única' },
      { section: 'matching1', label: 'II. Asocie 1' },
      { section: 'matching2', label: 'III. Asocie 2' },
      { section: 'completes', label: 'IV. Completes' },
      { section: 'development', label: 'V. Desarrollo' },
    ];
    return requiredSections
      .map((s) => ({ ...s, missing: getMissingInSection(s.section) }))
      .filter((s) => s.missing.length > 0);
  };

  const scrollToMissingItem = (section: IsabellaSectionId, questionOneBased: number) => {
    const idx = questionOneBased - 1;
    const targetId =
      section === 'selection'
        ? `isa-sel-card-${idx}`
        : section === 'matching1'
        ? `isa-m1-${idx}`
        : section === 'matching2'
        ? `isa-m2-${idx}`
        : section === 'completes'
        ? `isa-cmp-${idx}`
        : 'isa-dev-0';

    window.setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (section !== 'selection') {
          el.focus();
        }
      }
    }, 90);
  };

  const handleRequestLockSection = (sec: IsabellaSectionId) => {
    const missing = getMissingInSection(sec);
    if (missing.length > 0) {
      setHighlightMissing(true);
      const preview = missing.slice(0, 8).join(', ');
      const extra = missing.length > 8 ? ` (+${missing.length - 8} más)` : '';
      setValidationError(
        `Debe responder todas las preguntas de esta sección antes de enviarla y bloquearla. Faltan: ${preview}${extra}.`
      );
      scrollToMissingItem(sec, missing[0]);
      return;
    }
    setValidationError(null);
    setHighlightMissing(false);
    setConfirmSection(sec);
  };

  const handleRequestFinalSubmit = () => {
    const incomplete = getMissingAllRequired();
    if (incomplete.length > 0) {
      setHighlightMissing(true);
      const summary = incomplete
        .map((s) => {
          const preview = s.missing.slice(0, 4).join(', ');
          const extra = s.missing.length > 4 ? ` (+${s.missing.length - 4} más)` : '';
          return `${s.label} (ítems: ${preview}${extra})`;
        })
        .join(' · ');
      setValidationError(
        `No se puede entregar la prueba todavía porque faltan preguntas por responder: ${summary}.`
      );
      const first = incomplete[0];
      setActiveTab(first.section);
      scrollToMissingItem(first.section, first.missing[0]);
      return;
    }
    setValidationError(null);
    setHighlightMissing(false);
    setConfirmFinalSubmit(true);
  };

  const isLocked = sectionSubmitted[activeTab];

  const handleConfirmLock = () => {
    if (!confirmSection) return;
    if (getMissingInSection(confirmSection).length > 0) {
      setConfirmSection(null);
      return;
    }
    onLockSection(confirmSection);
    setConfirmSection(null);
    setValidationError(null);
    setHighlightMissing(false);
    setSectionFeedback('Sección enviada y bloqueada correctamente.');
    window.setTimeout(() => setSectionFeedback(null), 4000);
  };

  const renderFigure = (key: string, img: IsabellaExamImage, maxHeight = 'max-h-[260px]') => (
    <figure className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      {!imgErrors[key] ? (
        <img
          src={img.path}
          alt={img.alt}
          referrerPolicy="no-referrer"
          onError={() => setImgErrors((prev) => ({ ...prev, [key]: true }))}
          className={`w-full ${maxHeight} object-contain bg-white block mx-auto`}
        />
      ) : (
        <div className="h-36 flex items-center justify-center px-4 text-xs text-slate-500 text-center">
          {img.caption}
        </div>
      )}
      <figcaption className="px-4 py-2 text-xs text-slate-600 border-t border-slate-200 bg-white">
        {img.caption}
      </figcaption>
    </figure>
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Teal Top Bar */}
      <header
        className="text-white border-b border-black/10"
        style={{ backgroundColor: config.themeColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" aria-hidden="true" />
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
              Avance: {progress.answered}/{progress.total} ítems
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
        {/* Friendly Academic Adaptation Banner */}
        <section
          aria-label="Instrucciones de la prueba"
          className="bg-teal-50 border border-teal-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-teal-950 leading-relaxed">
            <p className="font-bold">
              {config.subtitle} · Valor total: 37 puntos
            </p>
            <p className="text-teal-900">
              Lea cuidadosamente cada pregunta. Seleccione o responda según se le indica de forma
              clara y ordenada. Esta evaluación ha sido diseñada como apoyo académico accesible.
            </p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <nav
          aria-label="Secciones de la prueba"
          className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto"
        >
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            const locked = sectionSubmitted[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSectionFeedback(null);
                }}
                className={`flex-1 min-w-[155px] min-h-[42px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-teal-700 text-white'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {locked && <Check className="w-4 h-4 text-teal-200 shrink-0" aria-hidden="true" />}
                <span>{tab.label}</span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    active ? 'text-teal-100' : 'text-slate-400'
                  }`}
                >
                  ({tab.pts})
                </span>
              </button>
            );
          })}
        </nav>

        {sectionFeedback && (
          <div
            role="status"
            className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-800 flex items-center gap-2"
          >
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{sectionFeedback}</span>
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

        {/* Section Container */}
        <main className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {activeTab === 'selection' && 'I Parte: Selección Única'}
                {activeTab === 'matching1' && 'II Parte: Asocie 1 (Fenómenos de Luz y Energía)'}
                {activeTab === 'matching2' && 'III Parte: Asocie 2 (Clasificación de Energías)'}
                {activeTab === 'completes' && 'IV Parte: Completes'}
                {activeTab === 'development' && 'V Parte: Desarrollo'}
                {activeTab === 'bonus' && 'VI Parte: Pregunta Opcional'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeTab === 'selection' &&
                  'Valor: 20 puntos (1 punto cada una). Seleccione la opción correcta para cada enunciado.'}
                {activeTab === 'matching1' &&
                  'Valor: 5 puntos (1 punto cada acierto). Relacione cada concepto de la Columna A con su descripción en la Columna B.'}
                {activeTab === 'matching2' &&
                  'Valor: 5 puntos (1 punto cada acierto). Relacione cada tipo o fuente de energía con su clasificación correcta.'}
                {activeTab === 'completes' &&
                  'Valor: 5 puntos (1 punto cada respuesta). Complete los espacios en MAYÚSCULAS y sin tildes.'}
                {activeTab === 'development' &&
                  'Valor: 2 puntos (1 punto por cada ventaja válida explicada). Responda de forma clara y ordenada.'}
                {activeTab === 'bonus' &&
                  'Valor: +1 punto adicional opcional. Si no desea responderla, no resta puntos.'}
              </p>
            </div>

            {isLocked ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sección Bloqueada</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleRequestLockSection(activeTab)}
                className="min-h-[42px] px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Enviar y Bloquear Sección
              </button>
            )}
          </div>

          {/* I. SELECCIÓN ÚNICA */}
          {activeTab === 'selection' && (
            <div className="space-y-6">
              {config.selection.map((item, idx) => {
                const chosen = answers.selection[idx];
                const isMissing = highlightMissing && chosen === undefined;
                return (
                  <React.Fragment key={idx}>
                    {idx === 0 && renderFigure('sel-optics', config.images.optics)}
                    {idx === 4 && renderFigure('sel-renewable', config.images.renewable)}
                    {idx === 13 && renderFigure('sel-comparison', config.images.comparison)}
                    <fieldset
                      id={`isa-sel-card-${idx}`}
                      disabled={isLocked}
                      className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                        isMissing
                          ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                          : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <legend className="text-sm font-semibold text-slate-900 leading-relaxed px-1">
                        <span className="font-mono text-teal-700 mr-2 tabular-nums">
                          {idx + 1}.
                        </span>
                        {item.q}
                      </legend>
                      <div className="space-y-2 pt-1">
                        {item.options.map((opt, optIdx) => {
                          const selected = chosen === optIdx;
                          return (
                            <label
                              key={optIdx}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm transition-colors min-h-[44px] ${
                                isLocked ? 'cursor-not-allowed opacity-85' : 'cursor-pointer'
                              } ${
                                selected
                                  ? 'bg-teal-50 border-teal-600 text-slate-900 font-medium'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`isa-sel-${idx}`}
                                checked={selected}
                                disabled={isLocked}
                                onChange={() =>
                                  onUpdateAnswer('selection', {
                                    ...answers.selection,
                                    [idx]: optIdx,
                                  })
                                }
                                className="mt-0.5 text-teal-600 focus:ring-teal-600"
                              />
                              <span className="leading-relaxed">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* II. ASOCIE 1 */}
          {activeTab === 'matching1' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFigure('m1-optics', config.images.optics, 'max-h-[200px]')}
                {renderFigure('m1-renewable', config.images.renewable, 'max-h-[200px]')}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs sm:text-sm text-slate-700">
                <p className="font-bold text-slate-900">Columna B (Descripciones):</p>
                {config.matching1[0].options.map((opt, i) => (
                  <p key={i}>{opt}</p>
                ))}
              </div>

              <div className="space-y-3">
                {config.matching1.map((item, idx) => {
                  const val = answers.matching[idx];
                  const isMissing = highlightMissing && (val === undefined || val === '');
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isMissing
                          ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <label
                        htmlFor={`isa-m1-${idx}`}
                        className="text-sm font-semibold text-slate-900 flex-1"
                      >
                        <span className="font-mono text-teal-700 mr-2 tabular-nums">
                          {idx + 1}.
                        </span>
                        {item.concept}
                      </label>
                      <select
                        id={`isa-m1-${idx}`}
                        disabled={isLocked}
                        value={val === undefined ? '' : String(val)}
                        onChange={(e) => {
                          const v = e.target.value;
                          const nextM1: Record<number, number | ''> = {
                            ...answers.matching,
                            [idx]: v === '' ? '' : Number(v),
                          };
                          onUpdateAnswer('matching', nextM1);
                          if (
                            config.matching1.every(
                              (_, i) => nextM1[i] !== undefined && nextM1[i] !== ''
                            )
                          ) {
                            setValidationError(null);
                          }
                        }}
                        className="w-full md:w-[440px] min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">— Seleccione el número correspondiente —</option>
                        {item.options.map((opt, optIdx) => (
                          <option key={optIdx} value={optIdx}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* III. ASOCIE 2 */}
          {activeTab === 'matching2' && (
            <div className="space-y-5">
              {renderFigure('m2-comparison', config.images.comparison)}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs sm:text-sm text-slate-700">
                <p className="font-bold text-slate-900">Columna B (Clasificaciones):</p>
                {config.matching2[0].options.map((opt, i) => (
                  <p key={i}>{opt}</p>
                ))}
              </div>

              <div className="space-y-3">
                {config.matching2.map((item, idx) => {
                  const val = answers.matching2?.[idx];
                  const isMissing = highlightMissing && (val === undefined || val === '');
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isMissing
                          ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <label
                        htmlFor={`isa-m2-${idx}`}
                        className="text-sm font-semibold text-slate-900 flex-1"
                      >
                        <span className="font-mono text-teal-700 mr-2 tabular-nums">
                          {idx + 1}.
                        </span>
                        {item.concept}
                      </label>
                      <select
                        id={`isa-m2-${idx}`}
                        disabled={isLocked}
                        value={val === undefined ? '' : String(val)}
                        onChange={(e) => {
                          const v = e.target.value;
                          const nextM2: Record<number, number | ''> = {
                            ...(answers.matching2 || {}),
                            [idx]: v === '' ? '' : Number(v),
                          };
                          onUpdateAnswer('matching2', nextM2);
                          if (
                            config.matching2.every(
                              (_, i) => nextM2[i] !== undefined && nextM2[i] !== ''
                            )
                          ) {
                            setValidationError(null);
                          }
                        }}
                        className="w-full md:w-[440px] min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">— Seleccione el número correspondiente —</option>
                        {item.options.map((opt, optIdx) => (
                          <option key={optIdx} value={optIdx}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* IV. COMPLETES */}
          {activeTab === 'completes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFigure('cmp-optics', config.images.optics, 'max-h-[190px]')}
                {renderFigure('cmp-comparison', config.images.comparison, 'max-h-[190px]')}
              </div>

              {config.completes.map((item, idx) => {
                const val = answers.completes[idx] || '';
                const isMissing = highlightMissing && val.trim().length === 0;
                return (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                      isMissing
                        ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <label
                      htmlFor={`isa-cmp-${idx}`}
                      className="block text-sm font-semibold text-slate-900 leading-relaxed"
                    >
                      <span className="font-mono text-teal-700 mr-2 tabular-nums">
                        {idx + 1}.
                      </span>
                      {item.prompt}
                    </label>
                    <input
                      id={`isa-cmp-${idx}`}
                      type="text"
                      disabled={isLocked}
                      value={val}
                      onChange={(e) => {
                        const nextCmp = {
                          ...answers.completes,
                          [idx]: sanitizeCompleteInput(e.target.value),
                        };
                        onUpdateAnswer('completes', nextCmp);
                        if (config.completes.every((_, i) => (nextCmp[i] || '').trim().length > 0)) {
                          setValidationError(null);
                        }
                      }}
                      placeholder="ESCRIBA EN MAYÚSCULAS SIN TILDES..."
                      className="w-full min-h-[44px] bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-slate-900 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* V. DESARROLLO */}
          {activeTab === 'development' && (
            <div className="space-y-5">
              {renderFigure('dev-renewable', config.images.renewable)}

              <div className="p-4 sm:p-5 rounded-xl bg-teal-50/70 border border-teal-200 text-sm text-slate-800 leading-relaxed">
                {config.development.context}
              </div>

              <div
                className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                  highlightMissing && (answers.development[0] || '').trim().length === 0
                    ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <label
                    htmlFor="isa-dev-0"
                    className="text-sm font-semibold text-slate-900 leading-relaxed"
                  >
                    {config.development.question}
                  </label>
                  <span className="font-mono text-xs font-bold text-teal-700 tabular-nums shrink-0 pt-0.5">
                    {config.development.value} pts
                  </span>
                </div>
                <p className="text-xs text-slate-600">{config.development.hint}</p>
                <textarea
                  id="isa-dev-0"
                  rows={5}
                  disabled={isLocked}
                  value={answers.development[0] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateAnswer('development', {
                      ...answers.development,
                      0: val,
                    });
                    if (val.trim().length > 0) setValidationError(null);
                  }}
                  placeholder="Escriba aquí las dos ventajas con claridad..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* VI. OPCIONAL (+1 pt) */}
          {activeTab === 'bonus' && (
            <div className="space-y-5">
              {renderFigure('bonus-comparison', config.images.comparison, 'max-h-[220px]')}

              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <label
                    htmlFor="isa-bonus-0"
                    className="text-sm font-semibold text-slate-900 leading-relaxed"
                  >
                    {config.bonus.question}
                  </label>
                  <span className="font-mono text-xs font-bold text-teal-700 tabular-nums shrink-0 pt-0.5">
                    +{config.bonus.value} pt
                  </span>
                </div>
                <p className="text-xs text-slate-600">{config.bonus.hint}</p>
                <textarea
                  id="isa-bonus-0"
                  rows={4}
                  disabled={isLocked}
                  value={answers.bonus || ''}
                  onChange={(e) => onUpdateAnswer('bonus', e.target.value)}
                  placeholder="Respuesta opcional..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Final Submission Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              Ha completado{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {progress.answered} de {progress.total}
              </strong>{' '}
              ítems obligatorios. Puede entregar la evaluación definitiva cuando termine todas las partes.
            </p>
            <button
              type="button"
              onClick={handleRequestFinalSubmit}
              className="w-full sm:w-auto min-h-[46px] bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-3 px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>Finalizar y Entregar Prueba</span>
            </button>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmSection !== null}
        title="¿Enviar y bloquear esta sección?"
        description="Una vez bloqueada, no podrá modificar sus respuestas en esta parte de la prueba."
        confirmLabel="Sí, enviar y bloquear"
        tone="emerald"
        onConfirm={handleConfirmLock}
        onCancel={() => setConfirmSection(null)}
      />

      <ConfirmDialog
        open={confirmFinalSubmit}
        title="¿Finalizar y entregar su prueba?"
        description={`Ha respondido ${progress.answered} de ${progress.total} ítems (37 puntos totales). Al entregar, sus respuestas quedarán registradas para revisión docente.`}
        confirmLabel="Entregar Prueba Definitiva"
        tone="emerald"
        onConfirm={() => {
          setConfirmFinalSubmit(false);
          if (getMissingAllRequired().length === 0) {
            onSubmitFullExam();
          }
        }}
        onCancel={() => setConfirmFinalSubmit(false)}
      />
    </div>
  );
};
