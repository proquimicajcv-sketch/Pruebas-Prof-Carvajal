import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Atom,
  BookOpen,
  Check,
  CheckSquare,
  GitCompareArrows,
  Lock,
  PenLine,
  Send,
  Star,
} from 'lucide-react';
import {
  ExamSectionId,
  LevelExamConfig,
  SectionSubmittedMap,
  StudentSession,
  UserAnswers,
} from '../types/exam';
import { ScientificDiagram } from './ScientificDiagram';
import { ConfirmDialog } from './ConfirmDialog';
import { sanitizeCompleteInput } from '../utils/grading';

interface ExamWorkspaceProps {
  student: StudentSession;
  config: LevelExamConfig;
  answers: UserAnswers;
  sectionSubmitted: SectionSubmittedMap;
  infractionCount: number;
  onUpdateAnswer: <K extends keyof UserAnswers>(section: K, value: UserAnswers[K]) => void;
  onLockSection: (section: ExamSectionId) => void;
  onSubmitFullExam: () => void;
  onOpenTeacherModal: () => void;
}

const TABS: {
  id: ExamSectionId;
  label: string;
  points: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'selection', label: 'I. Selección', points: '40 pts', icon: CheckSquare },
  { id: 'matching', label: 'II. Asocie', points: '5 pts', icon: GitCompareArrows },
  { id: 'completes', label: 'III. Complete', points: '5 pts', icon: PenLine },
  { id: 'development', label: 'IV. Desarrollo', points: '4–5 pts', icon: BookOpen },
  { id: 'bonus', label: 'Bonificación', points: '+1 pt', icon: Star },
];

export const ExamWorkspace: React.FC<ExamWorkspaceProps> = ({
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
  const [activeSection, setActiveSection] = useState<ExamSectionId>('selection');
  const [selectionFilter, setSelectionFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [confirmSection, setConfirmSection] = useState<ExamSectionId | null>(null);
  const [confirmFinalSubmit, setConfirmFinalSubmit] = useState(false);
  const [sectionFeedback, setSectionFeedback] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [highlightMissing, setHighlightMissing] = useState(false);

  const progress = useMemo(() => {
    const selCount = Object.keys(answers.selection).length;
    const matchCount = Object.values(answers.matching).filter(
      (v) => v !== '' && v !== undefined
    ).length;
    const compCount = Object.values(answers.completes).filter(
      (v) => typeof v === 'string' && v.trim().length > 0
    ).length;
    const devCount = Object.values(answers.development).filter(
      (v) => typeof v === 'string' && v.trim().length > 0
    ).length;

    const totalRequired =
      config.selection.length +
      config.matching.length +
      config.completes.length +
      config.development.questions.length;
    const totalAnswered = selCount + matchCount + compCount + devCount;

    return {
      selCount,
      matchCount,
      compCount,
      devCount,
      totalAnswered,
      totalRequired,
    };
  }, [answers, config]);

  const getMissingInSection = (section: ExamSectionId): number[] => {
    if (section === 'selection') {
      return config.selection
        .map((_, idx) => (answers.selection[idx] === undefined ? idx + 1 : -1))
        .filter((n) => n > 0);
    }
    if (section === 'matching') {
      return config.matching
        .map((_, idx) => {
          const v = answers.matching[idx];
          return v === undefined || v === '' ? idx + 1 : -1;
        })
        .filter((n) => n > 0);
    }
    if (section === 'completes') {
      return config.completes
        .map((_, idx) =>
          typeof answers.completes[idx] === 'string' && answers.completes[idx].trim().length > 0
            ? -1
            : idx + 1
        )
        .filter((n) => n > 0);
    }
    if (section === 'development') {
      return config.development.questions
        .map((_, idx) =>
          typeof answers.development[idx] === 'string' &&
          answers.development[idx].trim().length > 0
            ? -1
            : idx + 1
        )
        .filter((n) => n > 0);
    }
    return [];
  };

  const getMissingAllRequired = (): {
    section: ExamSectionId;
    label: string;
    missing: number[];
  }[] => {
    const sections: { section: ExamSectionId; label: string }[] = [
      { section: 'selection', label: 'I. Selección' },
      { section: 'matching', label: 'II. Asocie' },
      { section: 'completes', label: 'III. Complete' },
      { section: 'development', label: 'IV. Desarrollo' },
    ];
    return sections
      .map((s) => ({ ...s, missing: getMissingInSection(s.section) }))
      .filter((s) => s.missing.length > 0);
  };

  const scrollToMissingQuestion = (section: ExamSectionId, questionNumberOneBased: number) => {
    const idx = questionNumberOneBased - 1;
    const targetId =
      section === 'selection'
        ? `sel-q-${idx}`
        : section === 'matching'
        ? `match-q-${idx}`
        : section === 'completes'
        ? `complete-${idx}`
        : `dev-q-${idx}`;

    window.setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (section === 'completes' || section === 'development' || section === 'matching') {
          el.focus();
        }
      }
    }, 90);
  };

  const handleRequestSectionLock = (section: ExamSectionId) => {
    const missing = getMissingInSection(section);
    if (missing.length > 0) {
      setHighlightMissing(true);
      if (section === 'selection') {
        setSelectionFilter('all');
      }
      const preview = missing.slice(0, 8).join(', ');
      const suffix = missing.length > 8 ? ` (+${missing.length - 8} más)` : '';
      setValidationError(
        `No puede enviar ni bloquear este apartado hasta responder todas sus preguntas. Faltan: ${preview}${suffix}.`
      );
      scrollToMissingQuestion(section, missing[0]);
      return;
    }
    setValidationError(null);
    setHighlightMissing(false);
    setConfirmSection(section);
  };

  const handleRequestFinalSubmit = () => {
    const incomplete = getMissingAllRequired();
    if (incomplete.length > 0) {
      setHighlightMissing(true);
      const summary = incomplete
        .map((item) => {
          const preview = item.missing.slice(0, 5).join(', ');
          const extra = item.missing.length > 5 ? ` (+${item.missing.length - 5} más)` : '';
          return `${item.label} (ítems: ${preview}${extra})`;
        })
        .join(' · ');
      setValidationError(
        `No se puede enviar el examen todavía porque faltan preguntas por responder: ${summary}.`
      );
      const first = incomplete[0];
      setActiveSection(first.section);
      if (first.section === 'selection') {
        setSelectionFilter('all');
      }
      scrollToMissingQuestion(first.section, first.missing[0]);
      return;
    }
    setValidationError(null);
    setHighlightMissing(false);
    setConfirmFinalSubmit(true);
  };

  const filteredSelection = useMemo(() => {
    return config.selection
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => {
        const hasAnswer = answers.selection[index] !== undefined;
        if (selectionFilter === 'unanswered') return !hasAnswer;
        if (selectionFilter === 'answered') return hasAnswer;
        return true;
      });
  }, [config.selection, answers.selection, selectionFilter]);

  const isLocked = sectionSubmitted[activeSection];

  const handleConfirmSectionLock = () => {
    if (!confirmSection) return;
    if (getMissingInSection(confirmSection).length > 0) {
      setConfirmSection(null);
      return;
    }
    onLockSection(confirmSection);
    setConfirmSection(null);
    setValidationError(null);
    setHighlightMissing(false);
    setSectionFeedback('Apartado enviado y bloqueado correctamente.');
    window.setTimeout(() => setSectionFeedback(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar (3-zone contract) */}
      <header
        className="text-white border-b border-black/10 transition-colors duration-200"
        style={{ backgroundColor: config.themeColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Atom className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
              Saint Peter&apos;s School · {config.title}
            </span>
          </div>

          {/* Zone 2: Clean unboxed student & progress metadata */}
          <div className="hidden md:flex items-center gap-3 text-xs text-white/90 min-w-0">
            <span className="font-semibold truncate max-w-[180px]">{student.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono truncate max-w-[200px]">{student.email}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
              Avance: {progress.totalAnswered}/{progress.totalRequired}
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

          {/* Zone 3: Single utility action */}
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

      {/* Mobile Student Strip */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-900 truncate">{student.name}</span>
        <span className="font-mono tabular-nums shrink-0">
          {progress.totalAnswered}/{progress.totalRequired} ítems
        </span>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Academic Integrity & Instructions Banner (no thick border-l-4) */}
        <section
          aria-label="Instrucciones generales y advertencia de integridad académica"
          className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-amber-950 leading-relaxed">
            <p className="font-bold">
              Instrucciones Generales e Integridad Académica
            </p>
            <p className="text-amber-900">
              Lea cada ítem con detenimiento.{' '}
              <strong>
                Una vez que envíe y bloquee un apartado, no podrá modificar sus respuestas.
              </strong>
            </p>
            <p className="font-semibold text-rose-800">
              Control Anti-Fraude Activo: Minimizar la pantalla, cambiar de pestaña, abrir otra
              ventana, usar clic derecho o redimensionar la ventana activará una alarma sonora de 5
              segundos y registrará una infracción. Al acumular 3 infracciones, la prueba se
              bloqueará y requerirá autorización docente.
            </p>
          </div>
        </section>

        {/* Section Tabs */}
        <nav
          aria-label="Apartados de la evaluación"
          className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            const submitted = sectionSubmitted[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveSection(tab.id);
                  setSectionFeedback(null);
                }}
                className={`flex-1 min-w-[140px] min-h-[42px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {submitted ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                ) : (
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span>{tab.label}</span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    active ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  ({tab.points})
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

        {/* Section Workspace Card */}
        <main className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* SECTION HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">
                {activeSection === 'selection' && 'I Parte: Selección Única'}
                {activeSection === 'matching' && 'II Parte: Asocie'}
                {activeSection === 'completes' && 'III Parte: Complete'}
                {activeSection === 'development' && 'IV Parte: Desarrollo Teórico'}
                {activeSection === 'bonus' && 'Pregunta Opcional / Bonificación'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {activeSection === 'selection' &&
                  `Valor: 40 puntos (1 punto cada acierto) · Respondidas: ${progress.selCount} de ${config.selection.length}`}
                {activeSection === 'matching' &&
                  `Valor: 5 puntos (1 punto cada acierto) · Relacione cada concepto con su definición`}
                {activeSection === 'completes' &&
                  'Valor: 5 puntos (1 punto cada respuesta) · Escriba únicamente en MAYÚSCULAS y sin tildes (conversión automática)'}
                {activeSection === 'development' &&
                  `Valor: ${config.development.questions.reduce((acc, q) => acc + q.value, 0)} puntos totales · Analice el caso y responda con rigor`}
                {activeSection === 'bonus' &&
                  'Valor: +1 punto extra opcional · No afecta su nota si decide omitirla'}
              </p>
            </div>

            {isLocked ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Apartado Enviado y Bloqueado</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleRequestSectionLock(activeSection)}
                className="min-h-[42px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Enviar y Bloquear Apartado
              </button>
            )}
          </div>

          {/* SECTION 1: SELECTION */}
          {activeSection === 'selection' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(
                    [
                      { id: 'all', label: `Todas (${config.selection.length})` },
                      {
                        id: 'unanswered',
                        label: `Sin responder (${config.selection.length - progress.selCount})`,
                      },
                      { id: 'answered', label: `Respondidas (${progress.selCount})` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectionFilter(f.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        selectionFilter === f.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Compact Numbered Index Map */}
                <div className="flex flex-wrap gap-1" aria-label="Mapa de preguntas">
                  {config.selection.map((_, idx) => {
                    const answered = answers.selection[idx] !== undefined;
                    return (
                      <a
                        key={idx}
                        href={`#sel-q-${idx}`}
                        onClick={() => {
                          if (selectionFilter !== 'all') setSelectionFilter('all');
                        }}
                        className={`w-6 h-6 rounded text-[11px] font-mono tabular-nums font-medium flex items-center justify-center transition-colors ${
                          answered
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={`Ir a pregunta ${idx + 1}`}
                      >
                        {idx + 1}
                      </a>
                    );
                  })}
                </div>
              </div>

              {filteredSelection.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
                  No hay ítems en esta vista de filtro.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSelection.map(({ item, index }) => {
                    const selected = answers.selection[index];
                    const isMissing = highlightMissing && selected === undefined;
                    return (
                      <div
                        key={index}
                        id={`sel-q-${index}`}
                        className={`rounded-xl p-5 space-y-3 border ${
                          isMissing
                            ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                          <span className="font-mono text-blue-700 mr-2 tabular-nums">
                            {index + 1}.
                          </span>
                          {item.q}
                        </p>
                        <div className="space-y-2">
                          {item.options.map((opt, optIdx) => {
                            const checked = selected === optIdx;
                            return (
                              <label
                                key={optIdx}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-xs sm:text-sm transition-colors ${
                                  isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                                } ${
                                  checked
                                    ? 'bg-white border-blue-600 text-slate-900 font-medium'
                                    : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`sel_${index}`}
                                  value={optIdx}
                                  checked={checked}
                                  disabled={isLocked}
                                  onChange={() => {
                                    const nextSel = { ...answers.selection, [index]: optIdx };
                                    onUpdateAnswer('selection', nextSel);
                                    if (Object.keys(nextSel).length >= config.selection.length) {
                                      setValidationError(null);
                                    }
                                  }}
                                  className="mt-0.5 text-blue-600 focus:ring-blue-600 shrink-0"
                                />
                                <span className="leading-relaxed">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: MATCHING */}
          {activeSection === 'matching' && (
            <div className="space-y-4">
              {config.matching.map((item, index) => {
                const selectedVal =
                  answers.matching[index] !== undefined ? answers.matching[index] : '';
                const isMissing = highlightMissing && selectedVal === '';
                return (
                  <div
                    key={index}
                    className={`rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
                      isMissing
                        ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-sm font-bold text-slate-900 md:w-1/3">
                      <span className="font-mono text-blue-700 mr-2 tabular-nums">
                        ({index + 1})
                      </span>
                      {item.concept}
                    </div>
                    <div className="md:w-2/3 w-full">
                      <select
                        id={`match-q-${index}`}
                        disabled={isLocked}
                        value={selectedVal}
                        aria-label={`Definición para ${item.concept}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nextMatch: Record<number, number | ''> = {
                            ...answers.matching,
                            [index]: val === '' ? '' : Number(val),
                          };
                          onUpdateAnswer('matching', nextMatch);
                          const allDone = config.matching.every(
                            (_, i) => nextMatch[i] !== undefined && nextMatch[i] !== ''
                          );
                          if (allDone) setValidationError(null);
                        }}
                        className="w-full min-h-[44px] bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Seleccione la definición correcta --</option>
                        {item.options.map((optText, optIdx) => (
                          <option key={optIdx} value={optIdx}>
                            {optText}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 3: COMPLETES */}
          {activeSection === 'completes' && (
            <div className="space-y-4">
              {config.completes.map((item, index) => {
                const val = answers.completes[index] || '';
                const isMissing = highlightMissing && val.trim().length === 0;
                return (
                  <div
                    key={index}
                    className={`rounded-xl p-4 sm:p-5 space-y-2.5 border ${
                      isMissing
                        ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <label
                      htmlFor={`complete-${index}`}
                      className="block text-sm font-medium text-slate-900 leading-relaxed"
                    >
                      <span className="font-mono font-bold text-blue-700 mr-2 tabular-nums">
                        {index + 1}.
                      </span>
                      {item.prompt}
                    </label>
                    <input
                      id={`complete-${index}`}
                      type="text"
                      disabled={isLocked}
                      value={val}
                      onChange={(e) => {
                        const nextComp = {
                          ...answers.completes,
                          [index]: sanitizeCompleteInput(e.target.value),
                        };
                        onUpdateAnswer('completes', nextComp);
                        const allDone = config.completes.every(
                          (_, i) => (nextComp[i] || '').trim().length > 0
                        );
                        if (allDone) setValidationError(null);
                      }}
                      placeholder="ESCRIBA EN MAYUSCULA SIN TILDES..."
                      className="w-full min-h-[44px] bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold uppercase text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 4: DEVELOPMENT */}
          {activeSection === 'development' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Texto de Análisis Teórico
                  </h3>
                  <p className="font-serif text-base text-slate-900 whitespace-pre-line leading-relaxed max-w-3xl">
                    {config.development.text}
                  </p>
                </div>

                <ScientificDiagram level={config.level} />
              </div>

              <div className="space-y-4">
                {config.development.questions.map((qItem, qIdx) => {
                  const val = answers.development[qIdx] || '';
                  const isMissing = highlightMissing && val.trim().length === 0;
                  return (
                    <div
                      key={qIdx}
                      className={`rounded-xl p-5 space-y-3 border ${
                        isMissing
                          ? 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <label
                          htmlFor={`dev-q-${qIdx}`}
                          className="text-sm font-semibold text-slate-900 leading-relaxed"
                        >
                          {qItem.q}
                        </label>
                        <span className="font-mono text-xs font-bold text-blue-700 tabular-nums shrink-0 pt-0.5">
                          {qItem.value} pts
                        </span>
                      </div>
                      <textarea
                        id={`dev-q-${qIdx}`}
                        rows={4}
                        disabled={isLocked}
                        value={val}
                        onChange={(e) => {
                          const nextDev = {
                            ...answers.development,
                            [qIdx]: e.target.value,
                          };
                          onUpdateAnswer('development', nextDev);
                          const allDone = config.development.questions.every(
                            (_, i) => (nextDev[i] || '').trim().length > 0
                          );
                          if (allDone) setValidationError(null);
                        }}
                        placeholder="Escriba su respuesta argumentada aquí..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 leading-relaxed focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 5: BONUS + FINAL SUBMIT */}
          {activeSection === 'bonus' && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-amber-900">
                    Pregunta Extra de Bonificación
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-900 tabular-nums">
                    +{config.bonus.value} pt
                  </span>
                </div>
                <label
                  htmlFor="bonus-input"
                  className="block text-sm font-semibold text-slate-900 leading-relaxed"
                >
                  {config.bonus.q}
                </label>
                <textarea
                  id="bonus-input"
                  rows={4}
                  disabled={isLocked}
                  value={answers.bonus}
                  onChange={(e) => onUpdateAnswer('bonus', e.target.value)}
                  placeholder="Redacte su respuesta complementaria..."
                  className="w-full bg-white border border-amber-300 rounded-xl p-3.5 text-sm text-slate-900 leading-relaxed focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  Verifique que haya respondido todas las preguntas obligatorias (
                  <strong className="font-mono tabular-nums text-slate-900">
                    {progress.totalAnswered} de {progress.totalRequired}
                  </strong>
                  ) antes de realizar la entrega definitiva.
                </div>
                <button
                  type="button"
                  onClick={handleRequestFinalSubmit}
                  className="w-full sm:w-auto min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Finalizar y Entregar Examen Completo</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Section Lock Confirmation */}
      <ConfirmDialog
        open={confirmSection !== null}
        title="¿Enviar y bloquear este apartado?"
        description="Una vez bloqueado, no podrá modificar las respuestas de este apartado durante la sesión actual."
        confirmLabel="Sí, enviar y bloquear"
        onConfirm={handleConfirmSectionLock}
        onCancel={() => setConfirmSection(null)}
      />

      {/* Final Full Exam Confirmation */}
      <ConfirmDialog
        open={confirmFinalSubmit}
        title="¿Finalizar y entregar el examen completo?"
        description={`Ha respondido ${progress.totalAnswered} de ${progress.totalRequired} ítems requeridos. Al entregar, toda la evaluación quedará bloqueada y registrada.`}
        confirmLabel="Entregar Examen Definitivo"
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
