import React, { useMemo, useRef, useState } from 'react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import {
  ArrowDownUp,
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  LogIn,
  Trash2,
  Unlock,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { ADMIN_EMAIL, auth, googleProvider, isVerifiedAdmin } from '../firebase';
import { examData } from '../data/examData';
import { biologyExamData } from '../data/biologyExamData';
import { isabellaExamData } from '../data/isabellaExamData';
import { isabellaBioExamData } from '../data/isabellaBioExamData';
import { AcademicLevel, StandardAcademicLevel, StoredSubmission } from '../types/exam';
import {
  evaluateFullSubmission,
  isCompleteAnswerCorrect,
  isIsabellaCompleteCorrect,
  sanitizeCompleteInput,
} from '../utils/grading';
import {
  deleteSubmissionRemote,
  downloadMasterCsv,
  downloadOfficialReport,
  getCostaRicaDateKey,
  importSubmissionsBackup,
  unlockEmailRemote,
} from '../utils/storage';

interface TeacherDashboardModalProps {
  open: boolean;
  adminCode: string;
  firebaseUser: User | null;
  submissions: StoredSubmission[];
  biologyEarlyUnlocked: boolean;
  onToggleBiologyEarlyUnlock: (next: boolean) => Promise<void>;
  onUpdateSubmissions: (next: StoredSubmission[]) => void;
  onClose: () => void;
}

type AdminViewMode = 'students' | 'general';
type ItemStatusFilter = 'all' | 'incorrect' | 'correct';

interface GeneralItemStat {
  key: string;
  sectionLabel: string;
  questionLabel: string;
  expectedAnswer?: string;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  correctRate: number;
}

function getLevelDisplayName(level: AcademicLevel): string {
  if (level === '10-bio') return '10.° Biología';
  if (level === '10-quim-isa') return 'Química Isabella Antonino';
  if (level === '10-bio-isa') return 'Biología Isabella Antonino';
  if (level === 10) return '10.° Química';
  return `${level}.° Año`;
}

function buildGeneralStatsForLevel(
  level: AcademicLevel,
  levelSubs: StoredSubmission[]
): GeneralItemStat[] {
  const count = levelSubs.length;
  if (count === 0) return [];

  if (level === '10-bio') {
    const items: GeneralItemStat[] = [];
    for (const mod of biologyExamData.modules) {
      for (const q of mod.questions) {
        for (const subQ of q.subquestions) {
          let fullCorrect = 0;
          for (const s of levelSubs) {
            const g = s.gradeBreakdown ?? evaluateFullSubmission(s.student.level, s.answers);
            if ((g.biologyDetails?.[subQ.id] ?? 0) >= subQ.value) {
              fullCorrect += 1;
            }
          }
          items.push({
            key: `bio-${subQ.id}`,
            sectionLabel: mod.tabLabel,
            questionLabel: `${subQ.id}) ${subQ.prompt}`,
            correctCount: fullCorrect,
            incorrectCount: count - fullCorrect,
            totalCount: count,
            correctRate: Math.round((fullCorrect / count) * 1000) / 10,
          });
        }
      }
    }
    return items;
  }

  if (level === '10-quim-isa' || level === '10-bio-isa') {
    const isaCfg = level === '10-bio-isa' ? isabellaBioExamData : isabellaExamData;
    const items: GeneralItemStat[] = [];
    isaCfg.selection.forEach((item, idx) => {
      let correct = 0;
      for (const s of levelSubs) {
        if (s.answers.selection[idx] === item.correct) correct += 1;
      }
      items.push({
        key: `isa-sel-${idx}`,
        sectionLabel: 'I. Selección Única',
        questionLabel: `${idx + 1}. ${item.q}`,
        expectedAnswer: item.options[item.correct],
        correctCount: correct,
        incorrectCount: count - correct,
        totalCount: count,
        correctRate: Math.round((correct / count) * 1000) / 10,
      });
    });
    isaCfg.matching1.forEach((item, idx) => {
      let correct = 0;
      for (const s of levelSubs) {
        const val = s.answers.matching[idx];
        if (val !== '' && val !== undefined && Number(val) === item.correctIndex) correct += 1;
      }
      items.push({
        key: `isa-m1-${idx}`,
        sectionLabel: 'II. Asocie 1',
        questionLabel: `${idx + 1}. ${item.concept}`,
        expectedAnswer: item.options[item.correctIndex],
        correctCount: correct,
        incorrectCount: count - correct,
        totalCount: count,
        correctRate: Math.round((correct / count) * 1000) / 10,
      });
    });
    isaCfg.matching2.forEach((item, idx) => {
      let correct = 0;
      for (const s of levelSubs) {
        const val = s.answers.matching2?.[idx];
        if (val !== '' && val !== undefined && Number(val) === item.correctIndex) correct += 1;
      }
      items.push({
        key: `isa-m2-${idx}`,
        sectionLabel: 'III. Asocie 2',
        questionLabel: `${idx + 1}. ${item.concept}`,
        expectedAnswer: item.options[item.correctIndex],
        correctCount: correct,
        incorrectCount: count - correct,
        totalCount: count,
        correctRate: Math.round((correct / count) * 1000) / 10,
      });
    });
    isaCfg.completes.forEach((item, idx) => {
      let correct = 0;
      for (const s of levelSubs) {
        if (isIsabellaCompleteCorrect(s.answers.completes[idx] || '', item.acceptableAnswers)) {
          correct += 1;
        }
      }
      items.push({
        key: `isa-cmp-${idx}`,
        sectionLabel: 'IV. Completes',
        questionLabel: `${idx + 1}. ${item.prompt}`,
        expectedAnswer: item.answer,
        correctCount: correct,
        incorrectCount: count - correct,
        totalCount: count,
        correctRate: Math.round((correct / count) * 1000) / 10,
      });
    });
    return items;
  }

  const config = examData[level as StandardAcademicLevel];
  const items: GeneralItemStat[] = [];

  config.selection.forEach((item, idx) => {
    let correct = 0;
    for (const s of levelSubs) {
      if (s.answers.selection[idx] === item.correct) {
        correct += 1;
      }
    }
    items.push({
      key: `sel-${idx}`,
      sectionLabel: 'I. Selección Única',
      questionLabel: `${idx + 1}. ${item.q}`,
      expectedAnswer: item.options[item.correct],
      correctCount: correct,
      incorrectCount: count - correct,
      totalCount: count,
      correctRate: Math.round((correct / count) * 1000) / 10,
    });
  });

  config.matching.forEach((item, idx) => {
    let correct = 0;
    for (const s of levelSubs) {
      const val = s.answers.matching[idx];
      if (val !== '' && val !== undefined && Number(val) === item.correctIndex) {
        correct += 1;
      }
    }
    items.push({
      key: `mat-${idx}`,
      sectionLabel: 'II. Asocie',
      questionLabel: `${idx + 1}. ${item.concept}`,
      expectedAnswer: item.options[item.correctIndex],
      correctCount: correct,
      incorrectCount: count - correct,
      totalCount: count,
      correctRate: Math.round((correct / count) * 1000) / 10,
    });
  });

  config.completes.forEach((item, idx) => {
    let correct = 0;
    for (const s of levelSubs) {
      if (isCompleteAnswerCorrect(s.answers.completes[idx] || '', item.answer)) {
        correct += 1;
      }
    }
    items.push({
      key: `cmp-${idx}`,
      sectionLabel: 'III. Complete',
      questionLabel: `${idx + 1}. ${item.prompt}`,
      expectedAnswer: sanitizeCompleteInput(item.answer),
      correctCount: correct,
      incorrectCount: count - correct,
      totalCount: count,
      correctRate: Math.round((correct / count) * 1000) / 10,
    });
  });

  return items;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  open,
  adminCode,
  firebaseUser,
  submissions,
  biologyEarlyUnlocked,
  onToggleBiologyEarlyUnlock,
  onUpdateSubmissions,
  onClose,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | AcademicLevel>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [viewMode, setViewMode] = useState<AdminViewMode>('students');
  const [itemFilter, setItemFilter] = useState<ItemStatusFilter>('all');
  const [sortMostMissed, setSortMostMissed] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [togglingBiology, setTogglingBiology] = useState(false);
  const [connectingAdminGoogle, setConnectingAdminGoogle] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(
    () =>
      submissions.filter((s) => {
        if (filterLevel !== 'all' && s.student.level !== filterLevel) {
          return false;
        }
        if (filterDate !== 'all' && getCostaRicaDateKey(s.submittedAt) !== filterDate) {
          return false;
        }
        return true;
      }),
    [submissions, filterLevel, filterDate]
  );

  const overallSummary = useMemo(() => {
    if (filtered.length === 0) {
      return {
        count: 0,
        correctTotal: 0,
        incorrectTotal: 0,
        possibleItems: 0,
        correctRate: 0,
        avgGrade: 0,
      };
    }

    let correctTotal = 0;
    let possibleItems = 0;
    let sumPercent = 0;

    for (const s of filtered) {
      const g = s.gradeBreakdown ?? evaluateFullSubmission(s.student.level, s.answers);
      sumPercent += g.finalPercentage;
      if (s.student.level === '10-bio') {
        const subValues = Object.values(g.biologyDetails || {});
        const fullSubs = subValues.filter((v) => v >= 2).length;
        correctTotal += fullSubs;
        possibleItems += 30;
      } else if (s.student.level === '10-quim-isa' || s.student.level === '10-bio-isa') {
        const objEarned = g.selection + g.matching + (g.matching2 ?? 0) + g.completes;
        const objTotal =
          g.selectionTotal + g.matchingTotal + (g.matching2Total ?? 5) + g.completesTotal;
        correctTotal += objEarned;
        possibleItems += objTotal;
      } else {
        const objEarned = g.selection + g.matching + g.completes;
        const objTotal = g.selectionTotal + g.matchingTotal + g.completesTotal;
        correctTotal += objEarned;
        possibleItems += objTotal;
      }
    }

    const incorrectTotal = Math.max(0, possibleItems - correctTotal);
    const correctRate =
      possibleItems > 0 ? Math.round((correctTotal / possibleItems) * 1000) / 10 : 0;
    const avgGrade = Math.round((sumPercent / filtered.length) * 10) / 10;

    return {
      count: filtered.length,
      correctTotal,
      incorrectTotal,
      possibleItems,
      correctRate,
      avgGrade,
    };
  }, [filtered]);

  const groupedGeneralStats = useMemo(() => {
    const levelsOrder: AcademicLevel[] = [
      7,
      8,
      9,
      10,
      '10-quim-isa',
      '10-bio-isa',
      '10-bio',
    ];
    const targetLevels =
      filterLevel === 'all'
        ? levelsOrder.filter((lvl) => filtered.some((s) => s.student.level === lvl))
        : [filterLevel];

    return targetLevels
      .map((lvl) => {
        const levelSubs = filtered.filter((s) => s.student.level === lvl);
        const rawStats = buildGeneralStatsForLevel(lvl, levelSubs);
        const sortedStats = sortMostMissed
          ? [...rawStats].sort((a, b) => b.incorrectCount - a.incorrectCount)
          : rawStats;
        return {
          level: lvl,
          label: getLevelDisplayName(lvl),
          studentCount: levelSubs.length,
          items: sortedStats,
        };
      })
      .filter((g) => g.studentCount > 0);
  }, [filtered, filterLevel, sortMostMissed]);

  if (!open) return null;

  const handleUnlockAndRemove = async (sub: StoredSubmission) => {
    const next = await deleteSubmissionRemote(adminCode, sub.id, sub.student.email);
    onUpdateSubmissions(next);
    setNotice(
      `Se desbloqueó el correo ${sub.student.email} y se actualizó el documento maestro de notas.`
    );
  };

  const handleClearLocks = async () => {
    await unlockEmailRemote(adminCode);
    setNotice('Todos los bloqueos de correo fueron liberados.');
  };

  const handleToggleBiology = async () => {
    setTogglingBiology(true);
    const next = !biologyEarlyUnlocked;
    await onToggleBiologyEarlyUnlock(next);
    setTogglingBiology(false);
    setNotice(
      next
        ? 'Las pruebas de 7.°, 8.°, 9.° y 10.° Biología quedaron habilitadas anticipadamente para ingreso estudiantil.'
        : 'Las pruebas de 7.°, 8.°, 9.° y 10.° Biología volvieron a su programación oficial (18 de noviembre · 7:20 a.m.).'
    );
  };

  const adminGoogleConnected = Boolean(firebaseUser && isVerifiedAdmin());

  const handleConnectAdminGoogle = async () => {
    setConnectingAdminGoogle(true);
    try {
      if (firebaseUser && !isVerifiedAdmin()) {
        await signOut(auth);
      }
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user.email?.toLowerCase() === ADMIN_EMAIL) {
        setNotice(
          'Sesión docente en la nube verificada. Sincronizando entregas permanentes de Firestore en tiempo real.'
        );
      } else {
        setNotice(
          `Inició sesión con ${cred.user.email ?? 'otra cuenta'}. Para consultar todas las entregas en la nube debe usar ${ADMIN_EMAIL}.`
        );
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/popup-blocked') {
        setNotice(
          'El navegador bloqueó la ventana de Google. Permita ventanas emergentes e intente de nuevo.'
        );
      } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setNotice('No se pudo verificar la cuenta docente con Google. Intente nuevamente.');
      }
    } finally {
      setConnectingAdminGoogle(false);
    }
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportingBackup(true);
    try {
      const text = await file.text();
      const targetDate = filterDate !== 'all' ? filterDate : '2026-11-17';
      const result = await importSubmissionsBackup(text, targetDate);
      onUpdateSubmissions(result.submissions);
      setNotice(
        result.importedCount > 0
          ? `Se importaron ${result.importedCount} entrega(s) con fecha ${targetDate}${
              adminGoogleConnected ? ' y se guardaron permanentemente en Firestore.' : '.'
            }`
          : `No se encontraron entregas nuevas válidas con fecha ${targetDate} dentro del archivo seleccionado.`
      );
    } catch {
      setNotice('El archivo seleccionado no tiene un formato de respaldo (.json o .csv) válido.');
    } finally {
      setImportingBackup(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-panel-title"
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div>
            <h3 id="teacher-panel-title" className="text-lg font-bold text-slate-900">
              Panel Administrador · Documento Maestro de Calificaciones
            </h3>
            <p className="text-xs text-slate-500">
              Lic. Jorge Carvajal Vanegas · Revisión automática inmediata al enviar y descarga
              protegida con código docente
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel administrador"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(
              [
                { id: 'all', label: `Todos (${submissions.length})` },
                { id: 7, label: '7.° Año' },
                { id: 8, label: '8.° Año' },
                { id: 9, label: '9.° Año' },
                { id: 10, label: '10.° Química' },
                { id: '10-quim-isa', label: 'Isabella Quím.' },
                { id: '10-bio-isa', label: 'Isabella Bio.' },
                { id: '10-bio', label: '10.° Biología' },
              ] as const
            ).map((tab) => (
              <button
                key={String(tab.id)}
                type="button"
                onClick={() => setFilterLevel(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  filterLevel === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterDate('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  filterDate === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas las fechas
              </button>
              <button
                type="button"
                onClick={() => setFilterDate('2026-11-17')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                  filterDate === '2026-11-17'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3 h-3" aria-hidden="true" />
                <span>17 nov 2026</span>
              </button>
              <input
                type="date"
                aria-label="Filtrar por fecha"
                value={filterDate === 'all' ? '' : filterDate}
                onChange={(e) => setFilterDate(e.target.value || 'all')}
                className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,application/json,text/csv"
              onChange={(e) => void handleImportFileChange(e)}
              className="hidden"
            />
            <button
              type="button"
              disabled={importingBackup}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[38px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{importingBackup ? 'Importando...' : 'Importar (.json / .csv)'}</span>
            </button>

            <button
              type="button"
              disabled={togglingBiology}
              onClick={() => void handleToggleBiology()}
              className={`min-h-[38px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                biologyEarlyUnlocked
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {biologyEarlyUnlocked ? (
                <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>
                {biologyEarlyUnlocked
                  ? '7.°–9.° y Bio 10.°: Habilitadas'
                  : 'Habilitar 7.°–9.° y Bio 10.°'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleClearLocks}
              className="min-h-[38px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Liberar bloqueos</span>
            </button>
            <button
              type="button"
              disabled={filtered.length === 0}
              onClick={() => void downloadOfficialReport(adminCode, filtered)}
              className="min-h-[38px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Descargar Acta (.html)</span>
            </button>
            <button
              type="button"
              disabled={filtered.length === 0}
              onClick={() => void downloadMasterCsv(adminCode, filtered)}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Descargar Notas Excel (.csv)</span>
            </button>
          </div>
        </div>

        {/* Sub-Toolbar: View Mode & Overall Correct/Incorrect Summary */}
        {filtered.length > 0 && (
          <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('students')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'students'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Por Estudiante ({filtered.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('general')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'general'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Resumen General Correctas / Incorrectas</span>
                </button>
              </div>

              {viewMode === 'general' && (
                <button
                  type="button"
                  onClick={() => setSortMostMissed((prev) => !prev)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <ArrowDownUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {sortMostMissed ? 'Orden: Más errores primero' : 'Orden: Secuencia del examen'}
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
              <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
                <span className="text-[11px] font-medium text-slate-500">
                  Evaluaciones filtradas
                </span>
                <div className="text-base font-mono font-bold text-slate-900">
                  {overallSummary.count}
                </div>
              </div>
              <div className="bg-white border border-emerald-200 rounded-xl px-3.5 py-2.5">
                <span className="text-[11px] font-medium text-emerald-700">
                  Respuestas Correctas (General)
                </span>
                <div className="text-base font-mono font-bold text-emerald-700">
                  {overallSummary.correctTotal} / {overallSummary.possibleItems}{' '}
                  <span className="text-xs font-semibold">({overallSummary.correctRate}%)</span>
                </div>
              </div>
              <div className="bg-white border border-rose-200 rounded-xl px-3.5 py-2.5">
                <span className="text-[11px] font-medium text-rose-700">
                  Incorrectas u Omitidas (General)
                </span>
                <div className="text-base font-mono font-bold text-rose-700">
                  {overallSummary.incorrectTotal} / {overallSummary.possibleItems}{' '}
                  <span className="text-xs font-semibold">
                    ({(100 - overallSummary.correctRate).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
                <span className="text-[11px] font-medium text-slate-500">
                  Nota Promedio del Grupo
                </span>
                <div className="text-base font-mono font-bold text-blue-700">
                  {overallSummary.avgGrade.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {!adminGoogleConnected && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-amber-950">
                Sincronización permanente con la base de datos en la nube
              </p>
              <p className="text-amber-900">
                {firebaseUser
                  ? `Actualmente inició sesión con ${firebaseUser.email}. Conéctese con la cuenta docente (${ADMIN_EMAIL}) para ver todas las entregas guardadas en Firestore.`
                  : `Conéctese con su cuenta Google docente (${ADMIN_EMAIL}) para cargar en tiempo real todas las evaluaciones enviadas desde cualquier dispositivo.`}
              </p>
            </div>
            <button
              type="button"
              disabled={connectingAdminGoogle}
              onClick={() => void handleConnectAdminGoogle()}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {connectingAdminGoogle
                  ? 'Conectando...'
                  : firebaseUser
                  ? 'Cambiar a cuenta docente'
                  : 'Conectar cuenta docente'}
              </span>
            </button>
          </div>
        )}

        {notice && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
            {notice}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-1">
              <p className="text-sm font-semibold text-slate-700">
                No hay entregas registradas en este nivel
              </p>
              <p className="text-xs text-slate-500">
                Cada evaluación enviada se califica automáticamente y se guarda en el documento
                maestro para descarga.
              </p>
            </div>
          ) : viewMode === 'general' ? (
            /* GENERAL SUMMARY: ITEM-BY-ITEM CORRECT VS INCORRECT ACROSS STUDENTS */
            <div className="space-y-6">
              {groupedGeneralStats.map((group) => (
                <section
                  key={String(group.level)}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
                    <h4 className="text-sm font-bold text-slate-900">
                      {group.label} · Consolidado General por Pregunta
                    </h4>
                    <span className="text-xs font-mono text-slate-600 tabular-nums">
                      {group.studentCount} estudiante{group.studentCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {group.items.map((item) => (
                      <div
                        key={item.key}
                        className="px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-slate-500">
                            {item.sectionLabel}
                          </div>
                          <p className="text-slate-900 font-medium leading-relaxed">
                            {item.questionLabel}
                          </p>
                          {item.expectedAnswer && (
                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-700">
                                Respuesta correcta:
                              </span>{' '}
                              <span className="font-mono text-emerald-800">
                                {item.expectedAnswer}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0 tabular-nums">
                          <div className="w-32 hidden sm:block">
                            <div className="h-2 w-full bg-rose-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600"
                                style={{ width: `${item.correctRate}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              {item.correctCount} ({item.correctRate}%)
                            </span>
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              {item.incorrectCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* PER-STUDENT LIST WITH FULL CORRECT/INCORRECT BREAKDOWN */
            filtered.map((sub) => {
              const isOpen = expandedId === sub.id;
              const isBio = sub.student.level === '10-bio';
              const isIsa =
                sub.student.level === '10-quim-isa' || sub.student.level === '10-bio-isa';
              const isaCfg =
                sub.student.level === '10-bio-isa' ? isabellaBioExamData : isabellaExamData;
              const lvlLabel = getLevelDisplayName(sub.student.level);
              const grade =
                sub.gradeBreakdown ?? evaluateFullSubmission(sub.student.level, sub.answers);
              const stdConfig =
                !isBio && !isIsa ? examData[sub.student.level as StandardAcademicLevel] : null;

              const studentObjCorrect = isBio
                ? Object.values(grade.biologyDetails || {}).filter((v) => v >= 2).length
                : isIsa
                ? grade.selection + grade.matching + (grade.matching2 ?? 0) + grade.completes
                : grade.selection + grade.matching + grade.completes;
              const studentObjTotal = isBio
                ? 30
                : isIsa
                ? grade.selectionTotal +
                  grade.matchingTotal +
                  (grade.matching2Total ?? 5) +
                  grade.completesTotal
                : grade.selectionTotal + grade.matchingTotal + grade.completesTotal;
              const studentObjIncorrect = Math.max(0, studentObjTotal - studentObjCorrect);

              return (
                <div
                  key={sub.id}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden"
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                        <span>{sub.student.name}</span>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-mono text-xs font-medium text-slate-600">
                          {sub.student.email}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                        <span
                          className={
                            isBio
                              ? 'font-semibold text-emerald-700'
                              : isIsa
                              ? 'font-semibold text-teal-700'
                              : ''
                          }
                        >
                          {lvlLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(sub.submittedAt).toLocaleString('es-CR')}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-semibold">
                          Correctas: {studentObjCorrect}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-700 font-semibold">
                          Incorrectas: {studentObjIncorrect}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            sub.infractions.length > 0
                              ? 'font-semibold text-rose-700'
                              : 'text-slate-600'
                          }
                        >
                          Infracciones: {sub.infractions.length}
                          {sub.lockedOut ? ' (Bloqueado)' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right tabular-nums">
                        <div className="text-xs text-slate-500">
                          Nota Final ({grade.totalEarnedWithBonus}/{grade.baseTotal} pts)
                        </div>
                        <div
                          className={`text-base font-mono font-bold ${
                            isBio
                              ? 'text-emerald-700'
                              : isIsa
                              ? 'text-teal-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {grade.finalPercentage.toFixed(1)}%
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : sub.id)}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <span>{isOpen ? 'Ocultar' : 'Revisar'}</span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleUnlockAndRemove(sub)}
                        title="Eliminar registro del documento y desbloquear correo"
                        className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 inline-flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50 space-y-4 text-xs">
                      {/* Item Correct/Incorrect Filter inside expanded student card */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                        <span className="font-semibold text-slate-700">
                          Detalle de respuestas correctas e incorrectas
                        </span>
                        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg">
                          {(
                            [
                              { id: 'all', label: 'Todas' },
                              { id: 'incorrect', label: 'Solo Incorrectas' },
                              { id: 'correct', label: 'Solo Correctas' },
                            ] as const
                          ).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setItemFilter(f.id)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                                itemFilter === f.id
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {isBio ? (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                            {biologyExamData.modules.map((mod) => {
                              const modMax = mod.questions.length * 6;
                              const modEarned = mod.questions.reduce((acc, q) => {
                                return (
                                  acc +
                                  q.subquestions.reduce(
                                    (subAcc, s) =>
                                      subAcc + (grade.biologyDetails?.[s.id] ?? 0),
                                    0
                                  )
                                );
                              }, 0);
                              return (
                                <div
                                  key={mod.id}
                                  className="bg-white border border-slate-200 rounded-lg p-3"
                                >
                                  <span className="text-slate-500">{mod.tabLabel}</span>
                                  <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                    {modEarned} / {modMax}
                                  </div>
                                </div>
                              );
                            })}
                            <div className="bg-white border border-emerald-200 rounded-lg p-3">
                              <span className="text-emerald-700 font-semibold">
                                Total Taller Biología
                              </span>
                              <div className="font-mono text-sm font-bold text-emerald-700 mt-0.5">
                                {grade.biologyEarned ?? 0} / {grade.biologyTotal ?? 60} pts
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="font-semibold text-slate-800">
                              Respuestas del Taller a Libro Abierto (30 subpreguntas)
                            </div>
                            {biologyExamData.modules.map((mod) => (
                              <div key={mod.id} className="space-y-2">
                                <div className="font-semibold text-emerald-800 pt-1">
                                  {mod.title}
                                </div>
                                {mod.questions.map((q) => {
                                  const visibleSubs = q.subquestions.filter((subQ) => {
                                    const pts = grade.biologyDetails?.[subQ.id] ?? 0;
                                    if (itemFilter === 'correct') return pts >= subQ.value;
                                    if (itemFilter === 'incorrect') return pts < subQ.value;
                                    return true;
                                  });
                                  if (visibleSubs.length === 0) return null;
                                  return (
                                    <div
                                      key={q.number}
                                      className="bg-white border border-slate-200 rounded-lg p-3 space-y-2"
                                    >
                                      <div className="font-semibold text-slate-800">
                                        {q.number}. {q.title}
                                      </div>
                                      <div className="space-y-2 pl-2 border-l-2 border-slate-200">
                                        {visibleSubs.map((subQ) => {
                                          const ans = sub.answers.biology?.[subQ.id] || '';
                                          const pts = grade.biologyDetails?.[subQ.id] ?? 0;
                                          const isFull = pts >= subQ.value;
                                          return (
                                            <div key={subQ.id} className="space-y-0.5">
                                              <div className="flex items-center justify-between gap-2 text-slate-600">
                                                <span className="font-semibold">
                                                  {subQ.id}) {subQ.prompt}
                                                </span>
                                                <span
                                                  className={`font-mono font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                                                    isFull
                                                      ? 'text-emerald-700'
                                                      : pts > 0
                                                      ? 'text-amber-700'
                                                      : 'text-rose-700'
                                                  }`}
                                                >
                                                  {isFull ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                                  ) : (
                                                    <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                                  )}
                                                  {pts} / {subQ.value} pts
                                                </span>
                                              </div>
                                              <p className="text-slate-900 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded p-2 border border-slate-100">
                                                {ans || '— Sin respuesta —'}
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : isIsa ? (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 tabular-nums">
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">I. Selección</span>
                              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                {grade.selection} / {grade.selectionTotal}
                              </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">II. Asocie 1</span>
                              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                {grade.matching} / {grade.matchingTotal}
                              </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">III. Asocie 2</span>
                              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                {grade.matching2 ?? 0} / {grade.matching2Total ?? 5}
                              </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">IV. Completes</span>
                              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                {grade.completes} / {grade.completesTotal}
                              </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">V. Desarrollo</span>
                              <div className="font-mono text-sm font-bold text-teal-700 mt-0.5">
                                {grade.development} / {grade.developmentTotal}
                              </div>
                            </div>
                            {sub.student.level === '10-quim-isa' && (
                              <div className="bg-white border border-slate-200 rounded-lg p-3">
                                <span className="text-slate-500">VI. Opcional</span>
                                <div className="font-mono text-sm font-bold text-emerald-700 mt-0.5">
                                  +{grade.bonus} / {grade.bonusTotal}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              I Parte: Selección Única ({grade.selection}/{grade.selectionTotal} correctas)
                            </div>
                            <div className="space-y-1.5">
                              {isaCfg.selection.map((item, idx) => {
                                const chosen = sub.answers.selection[idx];
                                const isCorrect = chosen === item.correct;
                                if (itemFilter === 'correct' && !isCorrect) return null;
                                if (itemFilter === 'incorrect' && isCorrect) return null;
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-white border rounded-lg p-2.5 space-y-1 ${
                                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-slate-800">
                                        {idx + 1}. {item.q}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
                                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {isCorrect ? (
                                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        ) : (
                                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        )}
                                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                                      </span>
                                    </div>
                                    <div className="text-slate-700">
                                      <span className="font-semibold">Estudiante:</span>{' '}
                                      {chosen !== undefined
                                        ? item.options[chosen]
                                        : '— Sin responder —'}
                                    </div>
                                    {!isCorrect && (
                                      <div className="text-emerald-800">
                                        <span className="font-semibold">Correcta:</span>{' '}
                                        {item.options[item.correct]}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              II Parte: Asocie 1 ({grade.matching}/{grade.matchingTotal} correctas)
                            </div>
                            <div className="space-y-1.5">
                              {isaCfg.matching1.map((item, idx) => {
                                const val = sub.answers.matching[idx];
                                const chosenIdx =
                                  val !== '' && val !== undefined ? Number(val) : null;
                                const isCorrect = chosenIdx === item.correctIndex;
                                if (itemFilter === 'correct' && !isCorrect) return null;
                                if (itemFilter === 'incorrect' && isCorrect) return null;
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-white border rounded-lg p-2.5 space-y-1 ${
                                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-slate-800">
                                        {idx + 1}. {item.concept}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
                                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {isCorrect ? (
                                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        ) : (
                                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        )}
                                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                                      </span>
                                    </div>
                                    <div className="text-slate-700">
                                      <span className="font-semibold">Estudiante:</span>{' '}
                                      {chosenIdx !== null
                                        ? item.options[chosenIdx]
                                        : '— Sin responder —'}
                                    </div>
                                    {!isCorrect && (
                                      <div className="text-emerald-800">
                                        <span className="font-semibold">Correcta:</span>{' '}
                                        {item.options[item.correctIndex]}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              III Parte: Asocie 2 ({grade.matching2 ?? 0}/{grade.matching2Total ?? 5} correctas)
                            </div>
                            <div className="space-y-1.5">
                              {isaCfg.matching2.map((item, idx) => {
                                const val = sub.answers.matching2?.[idx];
                                const chosenIdx =
                                  val !== '' && val !== undefined ? Number(val) : null;
                                const isCorrect = chosenIdx === item.correctIndex;
                                if (itemFilter === 'correct' && !isCorrect) return null;
                                if (itemFilter === 'incorrect' && isCorrect) return null;
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-white border rounded-lg p-2.5 space-y-1 ${
                                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-slate-800">
                                        {idx + 1}. {item.concept}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
                                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {isCorrect ? (
                                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        ) : (
                                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        )}
                                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                                      </span>
                                    </div>
                                    <div className="text-slate-700">
                                      <span className="font-semibold">Estudiante:</span>{' '}
                                      {chosenIdx !== null
                                        ? item.options[chosenIdx]
                                        : '— Sin responder —'}
                                    </div>
                                    {!isCorrect && (
                                      <div className="text-emerald-800">
                                        <span className="font-semibold">Correcta:</span>{' '}
                                        {item.options[item.correctIndex]}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              IV Parte: Completes ({grade.completes}/{grade.completesTotal} correctas)
                            </div>
                            <div className="space-y-1.5">
                              {isaCfg.completes.map((item, idx) => {
                                const rawAns = sub.answers.completes[idx] || '';
                                const isCorrect = isIsabellaCompleteCorrect(
                                  rawAns,
                                  item.acceptableAnswers
                                );
                                if (itemFilter === 'correct' && !isCorrect) return null;
                                if (itemFilter === 'incorrect' && isCorrect) return null;
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-white border rounded-lg p-2.5 space-y-1 ${
                                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-slate-800">
                                        {idx + 1}. {item.prompt}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
                                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {isCorrect ? (
                                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        ) : (
                                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        )}
                                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                                      </span>
                                    </div>
                                    <div className="text-slate-700 font-mono">
                                      <span className="font-sans font-semibold">Estudiante:</span>{' '}
                                      {rawAns.trim() || '— SIN RESPONDER —'}
                                    </div>
                                    {!isCorrect && (
                                      <div className="text-emerald-800 font-mono">
                                        <span className="font-sans font-semibold">Esperada:</span>{' '}
                                        {item.answer}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              V Parte: Desarrollo
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                              <div className="flex items-center justify-between font-semibold text-slate-700">
                                <span>
                                  {sub.student.level === '10-bio-isa'
                                    ? 'Importancias de la fotosíntesis'
                                    : 'Ventajas de las energías limpias'}
                                </span>
                                <span className="font-mono text-teal-700">
                                  {grade.development} / {grade.developmentTotal} pts
                                </span>
                              </div>
                              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {sub.answers.development[0] || '— Sin respuesta —'}
                              </p>
                            </div>
                          </div>

                          {sub.student.level === '10-quim-isa' && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between font-semibold text-slate-800">
                                <span>VI Parte: Pregunta Opcional (+1 pt)</span>
                                <span className="font-mono text-emerald-700">
                                  +{grade.bonus} / {grade.bonusTotal} pt
                                </span>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-lg p-3 text-slate-800 whitespace-pre-wrap">
                                {sub.answers.bonus || 'Omitida por el estudiante.'}
                              </div>
                            </div>
                          )}
                        </>
                      ) : stdConfig ? (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 tabular-nums">
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">I. Selección</span>
                              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                {grade.selection} / {grade.selectionTotal}
                              </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">II. Asocie</span>
                              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                {grade.matching} / {grade.matchingTotal}
                              </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">III. Complete</span>
                              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                {grade.completes} / {grade.completesTotal}
                              </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">IV. Desarrollo</span>
                              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                                {grade.development} / {grade.developmentTotal}
                              </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <span className="text-slate-500">V. Bonificación</span>
                              <div className="font-mono text-sm font-bold text-emerald-700 mt-0.5">
                                +{grade.bonus} / {grade.bonusTotal}
                              </div>
                            </div>
                          </div>

                          {/* I. Selección Única Item-by-Item */}
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              I Parte: Selección Única ({grade.selection}/{grade.selectionTotal} correctas)
                            </div>
                            <div className="space-y-1.5">
                              {stdConfig.selection.map((item, idx) => {
                                const chosen = sub.answers.selection[idx];
                                const isCorrect = chosen === item.correct;
                                if (itemFilter === 'correct' && !isCorrect) return null;
                                if (itemFilter === 'incorrect' && isCorrect) return null;
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-white border rounded-lg p-2.5 space-y-1 ${
                                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-slate-800">
                                        {idx + 1}. {item.q}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
                                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {isCorrect ? (
                                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        ) : (
                                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        )}
                                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                                      </span>
                                    </div>
                                    <div className="text-slate-700">
                                      <span className="font-semibold">Estudiante:</span>{' '}
                                      {chosen !== undefined
                                        ? item.options[chosen]
                                        : '— Sin responder —'}
                                    </div>
                                    {!isCorrect && (
                                      <div className="text-emerald-800">
                                        <span className="font-semibold">Correcta:</span>{' '}
                                        {item.options[item.correct]}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* II. Asocie Item-by-Item */}
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              II Parte: Asocie ({grade.matching}/{grade.matchingTotal} correctas)
                            </div>
                            <div className="space-y-1.5">
                              {stdConfig.matching.map((item, idx) => {
                                const val = sub.answers.matching[idx];
                                const chosenIdx =
                                  val !== '' && val !== undefined ? Number(val) : null;
                                const isCorrect = chosenIdx === item.correctIndex;
                                if (itemFilter === 'correct' && !isCorrect) return null;
                                if (itemFilter === 'incorrect' && isCorrect) return null;
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-white border rounded-lg p-2.5 space-y-1 ${
                                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-slate-800">
                                        {idx + 1}. {item.concept}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
                                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {isCorrect ? (
                                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        ) : (
                                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        )}
                                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                                      </span>
                                    </div>
                                    <div className="text-slate-700">
                                      <span className="font-semibold">Estudiante:</span>{' '}
                                      {chosenIdx !== null
                                        ? item.options[chosenIdx]
                                        : '— Sin responder —'}
                                    </div>
                                    {!isCorrect && (
                                      <div className="text-emerald-800">
                                        <span className="font-semibold">Correcta:</span>{' '}
                                        {item.options[item.correctIndex]}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* III. Complete Item-by-Item */}
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              III Parte: Complete ({grade.completes}/{grade.completesTotal} correctas)
                            </div>
                            <div className="space-y-1.5">
                              {stdConfig.completes.map((item, idx) => {
                                const rawAns = sub.answers.completes[idx] || '';
                                const isCorrect = isCompleteAnswerCorrect(rawAns, item.answer);
                                if (itemFilter === 'correct' && !isCorrect) return null;
                                if (itemFilter === 'incorrect' && isCorrect) return null;
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-white border rounded-lg p-2.5 space-y-1 ${
                                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-slate-800">
                                        {idx + 1}. {item.prompt}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
                                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {isCorrect ? (
                                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        ) : (
                                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        )}
                                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                                      </span>
                                    </div>
                                    <div className="text-slate-700 font-mono">
                                      <span className="font-sans font-semibold">Estudiante:</span>{' '}
                                      {rawAns.trim() || '— SIN RESPONDER —'}
                                    </div>
                                    {!isCorrect && (
                                      <div className="text-emerald-800 font-mono">
                                        <span className="font-sans font-semibold">Esperada:</span>{' '}
                                        {sanitizeCompleteInput(item.answer)}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800">
                              IV Parte: Respuestas de Desarrollo Teórico
                            </div>
                            {Object.keys(sub.answers.development).length === 0 ? (
                              <p className="text-slate-500 italic">Sin respuestas registradas.</p>
                            ) : (
                              Object.entries(sub.answers.development).map(([idx, text]) => (
                                <div
                                  key={idx}
                                  className="bg-white border border-slate-200 rounded-lg p-3 space-y-1"
                                >
                                  <div className="flex items-center justify-between font-semibold text-slate-700">
                                    <span>Pregunta {Number(idx) + 1}</span>
                                    <span className="font-mono text-blue-700">
                                      {grade.developmentDetails[Number(idx)] ?? 0} pts
                                    </span>
                                  </div>
                                  <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                                    {text || '—'}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800">
                              Bonificación (+1 pt)
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3 text-slate-800 whitespace-pre-wrap">
                              {sub.answers.bonus || 'Omitida por el estudiante.'}
                            </div>
                          </div>
                        </>
                      ) : null}

                      {sub.infractions.length > 0 && (
                        <div className="space-y-1">
                          <div className="font-semibold text-rose-800">
                            Bitácora de Infracciones Anti-Fraude
                          </div>
                          <ul className="bg-rose-50 border border-rose-200 rounded-lg p-3 space-y-1 text-rose-900 font-mono">
                            {sub.infractions.map((inf, i) => (
                              <li key={i}>
                                #{i + 1} · {new Date(inf.timestamp).toLocaleTimeString('es-CR')} —{' '}
                                {inf.reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
