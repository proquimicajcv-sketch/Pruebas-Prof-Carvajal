import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, isVerifiedAdmin } from './firebase';
import { CHEMISTRY_10_CLOSED, TEACHER_SECRET_CODE, examData } from './data/examData';
import { biologyExamData } from './data/biologyExamData';
import { isabellaExamData } from './data/isabellaExamData';
import { isabellaBioExamData } from './data/isabellaBioExamData';
import {
  BiologyModuleId,
  BiologySubmittedMap,
  ExamSectionId,
  InfractionEvent,
  IsabellaSectionId,
  IsabellaSubmittedMap,
  SectionSubmittedMap,
  StoredSubmission,
  StudentSession,
  UserAnswers,
} from './types/exam';
import { playLoudAlarm } from './utils/alarm';
import { subscribeRealtime } from './utils/realtime';
import {
  checkEmailLockedRemote,
  clearExamDraft,
  deleteSubmissionRemote,
  fetchAdminSubmissions,
  fetchBiologyStatus,
  getActiveExamDraft,
  getExamDraft,
  getStoredSubmissions,
  lockEmail,
  saveExamDraft,
  setActiveDraftEmail,
  setBiologyEarlyUnlockLocal,
  setBiologyEarlyUnlockRemote,
  subscribeAdminSubmissions,
  subscribePlatformSettings,
  submitAndGradeExam,
  unlockEmailRemote,
} from './utils/storage';
import { WelcomeView } from './components/WelcomeView';
import { ExamWorkspace } from './components/ExamWorkspace';
import { BiologyWorkspace } from './components/BiologyWorkspace';
import { IsabellaWorkspace } from './components/IsabellaWorkspace';
import { SubmittedView } from './components/SubmittedView';
import { AntiFraudModal } from './components/AntiFraudModal';
import { SecretCodeModal } from './components/SecretCodeModal';
import { TeacherDashboardModal } from './components/TeacherDashboardModal';

type AppView = 'welcome' | 'exam' | 'submitted';

const INITIAL_ANSWERS: UserAnswers = {
  selection: {},
  matching: {},
  matching2: {},
  completes: {},
  development: {},
  bonus: '',
  biology: {},
};

const INITIAL_SUBMITTED: SectionSubmittedMap = {
  selection: false,
  matching: false,
  completes: false,
  development: false,
  bonus: false,
};

const INITIAL_BIOLOGY_SUBMITTED: BiologySubmittedMap = {
  mod1: false,
  mod2: false,
  mod3: false,
};

const INITIAL_ISABELLA_SUBMITTED: IsabellaSubmittedMap = {
  selection: false,
  matching1: false,
  matching2: false,
  completes: false,
  development: false,
  bonus: false,
};

export default function App() {
  const [initialDraft] = useState(() => {
    const draft = getActiveExamDraft();
    if (draft && CHEMISTRY_10_CLOSED && draft.student.level === 10) {
      setActiveDraftEmail(null);
      return null;
    }
    return draft;
  });

  const [view, setView] = useState<AppView>(() => (initialDraft ? 'exam' : 'welcome'));
  const [student, setStudent] = useState<StudentSession | null>(
    () => initialDraft?.student ?? null
  );
  const [answers, setAnswers] = useState<UserAnswers>(
    () => initialDraft?.answers ?? INITIAL_ANSWERS
  );
  const [sectionSubmitted, setSectionSubmitted] = useState<SectionSubmittedMap>(
    () => initialDraft?.sectionSubmitted ?? INITIAL_SUBMITTED
  );
  const [biologySubmitted, setBiologySubmitted] = useState<BiologySubmittedMap>(
    () => initialDraft?.biologySubmitted ?? INITIAL_BIOLOGY_SUBMITTED
  );
  const [isabellaSubmitted, setIsabellaSubmitted] = useState<IsabellaSubmittedMap>(
    () => initialDraft?.isabellaSubmitted ?? INITIAL_ISABELLA_SUBMITTED
  );
  const [infractions, setInfractions] = useState<InfractionEvent[]>(
    () => initialDraft?.infractions ?? []
  );
  const [lockedOut, setLockedOut] = useState<boolean>(
    () => initialDraft?.lockedOut ?? false
  );

  // Anti-fraud warning modal state
  const [antiFraudVisible, setAntiFraudVisible] = useState(false);
  const [fraudCountdown, setFraudCountdown] = useState(5);
  const [lastFraudReason, setLastFraudReason] = useState('');

  // Teacher / secret code modals & scheduled gate override
  const [secretModalOpen, setSecretModalOpen] = useState<boolean>(
    () => initialDraft?.lockedOut ?? false
  );
  const [secretModalMode, setSecretModalMode] = useState<'default' | 'unlock-biology'>('default');
  const [teacherPanelOpen, setTeacherPanelOpen] = useState(false);
  const [verifiedAdminCode, setVerifiedAdminCode] = useState('');
  const [unlockNotice, setUnlockNotice] = useState<string | null>(null);
  const [biologyEarlyUnlocked, setBiologyEarlyUnlocked] = useState(false);

  // Firebase Authentication state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => auth.currentUser);

  // Submissions history
  const [lastSubmission, setLastSubmission] = useState<StoredSubmission | null>(null);
  const [submissions, setSubmissions] = useState<StoredSubmission[]>(() =>
    getStoredSubmissions()
  );

  const lockoutSubmissionIdRef = useRef<string | null>(
    initialDraft?.lockoutSubmissionId ?? null
  );
  const lockSyncPendingRef = useRef<boolean>(false);
  const stopAlarmRef = useRef<(() => void) | null>(null);
  const fraudTimerRef = useRef<number | null>(null);
  const lastInfractionTimeRef = useRef<number>(0);
  const windowSizeRef = useRef<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    void fetchBiologyStatus().then((status) => {
      setBiologyEarlyUnlocked(status.earlyUnlocked);
    });
    const unsubscribeSettings = subscribePlatformSettings(
      ({ biologyEarlyUnlocked: early }) => {
        setBiologyEarlyUnlocked(early);
      }
    );
    return unsubscribeSettings;
  }, []);

  useEffect(() => {
    if (!teacherPanelOpen || !firebaseUser || !isVerifiedAdmin()) {
      return;
    }
    const unsubscribeAdmin = subscribeAdminSubmissions((merged) => {
      setSubmissions(merged);
    });
    if (verifiedAdminCode) {
      void fetchAdminSubmissions(verifiedAdminCode).then(setSubmissions);
    }
    return unsubscribeAdmin;
  }, [teacherPanelOpen, firebaseUser, verifiedAdminCode]);

  // Persist exam progress continuously so lockouts or reloads never lose work
  useEffect(() => {
    if (view !== 'exam' || !student) return;
    saveExamDraft({
      student,
      answers,
      sectionSubmitted,
      biologySubmitted,
      isabellaSubmitted,
      infractions,
      lockedOut,
      lockoutSubmissionId: lockoutSubmissionIdRef.current,
      updatedAt: new Date().toISOString(),
    });
  }, [
    view,
    student,
    answers,
    sectionSubmitted,
    biologySubmitted,
    isabellaSubmitted,
    infractions,
    lockedOut,
  ]);

  // Real-time WebSocket sync across devices (silent updates without intrusive notices)
  useEffect(() => {
    const resumeSilentlyIfUnlocked = async () => {
      if (view !== 'exam' || !lockedOut || !student || lockSyncPendingRef.current) {
        return;
      }
      const stillLocked = await checkEmailLockedRemote(student.email);
      if (!stillLocked && !lockSyncPendingRef.current) {
        if (stopAlarmRef.current) {
          stopAlarmRef.current();
        }
        setLockedOut(false);
        setInfractions([]);
        setAntiFraudVisible(false);
        setSecretModalOpen(false);
        setSecretModalMode('default');
        setLastSubmission(null);
      }
    };

    if (view === 'exam' && lockedOut && student) {
      void resumeSilentlyIfUnlocked();
    }

    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'sync:init') {
        setBiologyEarlyUnlockLocal(event.biologyStatus.earlyUnlocked);
        setBiologyEarlyUnlocked(event.biologyStatus.earlyUnlocked);
        if (view === 'exam' && lockedOut && student) {
          void resumeSilentlyIfUnlocked();
        }
        if (teacherPanelOpen && verifiedAdminCode) {
          void fetchAdminSubmissions(verifiedAdminCode).then(setSubmissions);
        }
        return;
      }

      if (event.type === 'biology:status') {
        setBiologyEarlyUnlockLocal(event.earlyUnlocked);
        setBiologyEarlyUnlocked(event.earlyUnlocked);
        return;
      }

      if (event.type === 'lock:updated') {
        if (
          view === 'exam' &&
          lockedOut &&
          student &&
          (!event.email || event.email === student.email.toLowerCase())
        ) {
          void resumeSilentlyIfUnlocked();
        }
        return;
      }

      if (event.type === 'submissions:updated') {
        if (teacherPanelOpen && verifiedAdminCode) {
          void fetchAdminSubmissions(verifiedAdminCode).then(setSubmissions);
        }
        if (
          !event.locked &&
          view === 'exam' &&
          lockedOut &&
          student &&
          (!event.email || event.email === student.email.toLowerCase())
        ) {
          void resumeSilentlyIfUnlocked();
        }
      }
    });

    return unsubscribe;
  }, [view, lockedOut, student, teacherPanelOpen, verifiedAdminCode]);

  const examActive = view === 'exam' && !lockedOut && !secretModalOpen && !teacherPanelOpen;

  const triggerAntiFraud = useCallback(
    (reason: string) => {
      if (!examActive) return;

      const now = Date.now();
      if (now - lastInfractionTimeRef.current < 1500) {
        return;
      }
      lastInfractionTimeRef.current = now;

      if (stopAlarmRef.current) {
        stopAlarmRef.current();
      }
      stopAlarmRef.current = playLoudAlarm();

      setInfractions((prev) => {
        const nextList = [
          ...prev,
          { timestamp: new Date().toISOString(), reason },
        ];
        const count = nextList.length;

        if (count >= 3) {
          if (fraudTimerRef.current) {
            window.clearInterval(fraudTimerRef.current);
            fraudTimerRef.current = null;
          }
          setAntiFraudVisible(false);
          setLockedOut(true);
          setSecretModalMode('default');
          setSecretModalOpen(true);

          if (student) {
            lockSyncPendingRef.current = true;
            lockEmail(student.email);
            void submitAndGradeExam(student, answers, nextList, true)
              .then((saved) => {
                lockoutSubmissionIdRef.current = saved.id;
                setSubmissions(getStoredSubmissions());
                setLastSubmission(saved);
                saveExamDraft({
                  student,
                  answers,
                  sectionSubmitted,
                  biologySubmitted,
                  isabellaSubmitted,
                  infractions: nextList,
                  lockedOut: true,
                  lockoutSubmissionId: saved.id,
                  updatedAt: new Date().toISOString(),
                });
              })
              .finally(() => {
                lockSyncPendingRef.current = false;
              });
          }
        } else {
          setLastFraudReason(reason);
          setFraudCountdown(5);
          setAntiFraudVisible(true);

          if (fraudTimerRef.current) {
            window.clearInterval(fraudTimerRef.current);
          }
          let remaining = 5;
          fraudTimerRef.current = window.setInterval(() => {
            remaining -= 1;
            setFraudCountdown(remaining);
            if (remaining <= 0) {
              if (fraudTimerRef.current) {
                window.clearInterval(fraudTimerRef.current);
                fraudTimerRef.current = null;
              }
              setAntiFraudVisible(false);
            }
          }, 1000);
        }

        return nextList;
      });
    },
    [
      examActive,
      student,
      answers,
      sectionSubmitted,
      biologySubmitted,
      isabellaSubmitted,
    ]
  );

  useEffect(() => {
    if (!examActive) return;

    windowSizeRef.current = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerAntiFraud('Clic derecho deshabilitado');
    };

    const handleBlur = () => {
      triggerAntiFraud('Pérdida de foco o cambio de ventana');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerAntiFraud('Cambio de pestaña o minimización');
      }
    };

    const handleResize = () => {
      const dw = Math.abs(window.innerWidth - windowSizeRef.current.w);
      const dh = Math.abs(window.innerHeight - windowSizeRef.current.h);
      windowSizeRef.current = {
        w: window.innerWidth,
        h: window.innerHeight,
      };
      if (dw > 20 || dh > 20) {
        triggerAntiFraud('Redimensionamiento de ventana');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [examActive, triggerAntiFraud]);

  useEffect(() => {
    return () => {
      if (fraudTimerRef.current) {
        window.clearInterval(fraudTimerRef.current);
      }
      if (stopAlarmRef.current) {
        stopAlarmRef.current();
      }
    };
  }, []);

  const handleStartExam = (newStudent: StudentSession) => {
    if (CHEMISTRY_10_CLOSED && newStudent.level === 10) {
      return;
    }
    const savedDraft = getExamDraft(newStudent.email);
    const hasMatchingDraft =
      savedDraft !== null && savedDraft.student.level === newStudent.level;

    setStudent(newStudent);
    if (hasMatchingDraft) {
      setAnswers(savedDraft.answers);
      setSectionSubmitted(savedDraft.sectionSubmitted);
      setBiologySubmitted(savedDraft.biologySubmitted);
      setIsabellaSubmitted(savedDraft.isabellaSubmitted);
      lockoutSubmissionIdRef.current = savedDraft.lockoutSubmissionId;
      setUnlockNotice(
        'Se recuperó su avance guardado anteriormente para continuar desde donde quedó.'
      );
      window.setTimeout(() => setUnlockNotice(null), 5000);
    } else {
      setAnswers({
        selection: {},
        matching: {},
        matching2: {},
        completes: {},
        development: {},
        bonus: '',
        biology: {},
      });
      setSectionSubmitted(INITIAL_SUBMITTED);
      setBiologySubmitted(INITIAL_BIOLOGY_SUBMITTED);
      setIsabellaSubmitted(INITIAL_ISABELLA_SUBMITTED);
      lockoutSubmissionIdRef.current = null;
      setUnlockNotice(null);
    }

    setInfractions([]);
    setLockedOut(false);
    setAntiFraudVisible(false);
    setView('exam');
  };

  const handleUpdateAnswer = <K extends keyof UserAnswers>(
    section: K,
    value: UserAnswers[K]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const handleUpdateBiologyAnswer = (subId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      biology: {
        ...(prev.biology || {}),
        [subId]: value,
      },
    }));
  };

  const handleLockSection = (section: ExamSectionId) => {
    setSectionSubmitted((prev) => ({
      ...prev,
      [section]: true,
    }));
  };

  const handleLockBiologyModule = (moduleId: BiologyModuleId) => {
    setBiologySubmitted((prev) => ({
      ...prev,
      [moduleId]: true,
    }));
  };

  const handleLockIsabellaSection = (section: IsabellaSectionId) => {
    setIsabellaSubmitted((prev) => ({
      ...prev,
      [section]: true,
    }));
  };

  const handleSubmitFullExam = async () => {
    if (!student) return;
    setSectionSubmitted({
      selection: true,
      matching: true,
      completes: true,
      development: true,
      bonus: true,
    });
    setBiologySubmitted({
      mod1: true,
      mod2: true,
      mod3: true,
    });
    setIsabellaSubmitted({
      selection: true,
      matching1: true,
      matching2: true,
      completes: true,
      development: true,
      bonus: true,
    });

    if (lockoutSubmissionIdRef.current) {
      await deleteSubmissionRemote(
        verifiedAdminCode || TEACHER_SECRET_CODE,
        lockoutSubmissionIdRef.current,
        student.email
      );
      lockoutSubmissionIdRef.current = null;
    }

    const saved = await submitAndGradeExam(student, answers, infractions, false);
    clearExamDraft(student.email);
    setActiveDraftEmail(null);
    setSubmissions(getStoredSubmissions());
    setLastSubmission(saved);
    setView('submitted');
  };

  const handleUnlockSession = async (code: string) => {
    if (stopAlarmRef.current) {
      stopAlarmRef.current();
    }
    if (fraudTimerRef.current) {
      window.clearInterval(fraudTimerRef.current);
      fraudTimerRef.current = null;
    }

    await unlockEmailRemote(code, student?.email);

    if (student && lockoutSubmissionIdRef.current) {
      const updatedList = await deleteSubmissionRemote(
        code,
        lockoutSubmissionIdRef.current,
        student.email
      );
      setSubmissions(updatedList);
      lockoutSubmissionIdRef.current = null;
    }

    setLockedOut(false);
    setInfractions([]);
    setAntiFraudVisible(false);
    setSecretModalOpen(false);
    setSecretModalMode('default');
    setLastSubmission(null);

    if (student) {
      // Preserve student, answers, locked sections, and stay in exam view
      setView('exam');
      setUnlockNotice(
        'Sesión desbloqueada mediante código docente. Se conservó su avance para continuar desde este punto.'
      );
    } else {
      setView('welcome');
      setUnlockNotice('Todos los bloqueos de correo fueron liberados correctamente.');
    }
    window.setTimeout(() => setUnlockNotice(null), 5000);
  };

  const handleOpenTeacherPanel = async (code: string) => {
    setVerifiedAdminCode(code);
    setSecretModalOpen(false);
    setSecretModalMode('default');
    const [list, bioStatus] = await Promise.all([
      fetchAdminSubmissions(code),
      fetchBiologyStatus(),
    ]);
    setSubmissions(list);
    setBiologyEarlyUnlocked(bioStatus.earlyUnlocked);
    setTeacherPanelOpen(true);
  };

  const handleUnlockBiologyEarly = async (code: string) => {
    await setBiologyEarlyUnlockRemote(code, true);
    setBiologyEarlyUnlocked(true);
    setSecretModalOpen(false);
    setSecretModalMode('default');
    setUnlockNotice(
      'Pruebas de 7.°, 8.°, 9.° y 10.° Biología habilitadas anticipadamente mediante código docente.'
    );
    window.setTimeout(() => setUnlockNotice(null), 5000);
  };

  const handleToggleBiologyEarlyUnlock = async (next: boolean) => {
    await setBiologyEarlyUnlockRemote(verifiedAdminCode, next);
    setBiologyEarlyUnlocked(next);
  };

  const handleExitSubmitted = () => {
    if (student) {
      clearExamDraft(student.email);
    }
    setActiveDraftEmail(null);
    lockoutSubmissionIdRef.current = null;
    setStudent(null);
    setLastSubmission(null);
    setAnswers(INITIAL_ANSWERS);
    setSectionSubmitted(INITIAL_SUBMITTED);
    setBiologySubmitted(INITIAL_BIOLOGY_SUBMITTED);
    setIsabellaSubmitted(INITIAL_ISABELLA_SUBMITTED);
    setInfractions([]);
    setView('welcome');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {unlockNotice && (
        <div
          role="status"
          className="bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 text-center"
        >
          {unlockNotice}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {view === 'welcome' && (
          <WelcomeView
            biologyUnlockedOverride={biologyEarlyUnlocked}
            firebaseUser={firebaseUser}
            onStartExam={handleStartExam}
            onOpenTeacherAccess={() => {
              setSecretModalMode('default');
              setSecretModalOpen(true);
            }}
            onRequestBiologyCodeUnlock={() => {
              setSecretModalMode('unlock-biology');
              setSecretModalOpen(true);
            }}
          />
        )}

        {view === 'exam' && student && student.level === '10-bio' && (
          <BiologyWorkspace
            student={student}
            config={biologyExamData}
            biologyAnswers={answers.biology || {}}
            moduleSubmitted={biologySubmitted}
            infractionCount={infractions.length}
            onUpdateBiologyAnswer={handleUpdateBiologyAnswer}
            onLockModule={handleLockBiologyModule}
            onSubmitFullExam={() => void handleSubmitFullExam()}
            onOpenTeacherModal={() => {
              setSecretModalMode('default');
              setSecretModalOpen(true);
            }}
          />
        )}

        {view === 'exam' &&
          student &&
          (student.level === '10-quim-isa' || student.level === '10-bio-isa') && (
            <IsabellaWorkspace
              student={student}
              config={
                student.level === '10-bio-isa' ? isabellaBioExamData : isabellaExamData
              }
              answers={answers}
              sectionSubmitted={isabellaSubmitted}
              infractionCount={infractions.length}
              onUpdateAnswer={handleUpdateAnswer}
              onLockSection={handleLockIsabellaSection}
              onSubmitFullExam={() => void handleSubmitFullExam()}
              onOpenTeacherModal={() => {
                setSecretModalMode('default');
                setSecretModalOpen(true);
              }}
            />
          )}

        {view === 'exam' &&
          student &&
          student.level !== '10-bio' &&
          student.level !== '10-quim-isa' &&
          student.level !== '10-bio-isa' && (
            <ExamWorkspace
              student={student}
              config={examData[student.level]}
              answers={answers}
              sectionSubmitted={sectionSubmitted}
              infractionCount={infractions.length}
              onUpdateAnswer={handleUpdateAnswer}
              onLockSection={handleLockSection}
              onSubmitFullExam={() => void handleSubmitFullExam()}
              onOpenTeacherModal={() => {
                setSecretModalMode('default');
                setSecretModalOpen(true);
              }}
            />
          )}

        {view === 'submitted' && lastSubmission && (
          <SubmittedView submission={lastSubmission} onExit={handleExitSubmitted} />
        )}
      </div>

      <footer className="bg-slate-900 text-slate-400 py-5 px-4 text-center text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-300">
            Saint Peter&apos;s School and High · Departamento de Ciencias
          </p>
          <p>Lic. Jorge Carvajal Vanegas · Ciclo Lectivo 2026</p>
        </div>
      </footer>

      <AntiFraudModal
        visible={antiFraudVisible}
        infractionCount={infractions.length}
        countdown={fraudCountdown}
        lastReason={lastFraudReason}
      />

      <SecretCodeModal
        open={secretModalOpen}
        isLockedOut={lockedOut}
        hasActiveStudent={student !== null}
        mode={secretModalMode}
        onUnlockSession={(code) => void handleUnlockSession(code)}
        onOpenTeacherPanel={(code) => void handleOpenTeacherPanel(code)}
        onUnlockBiologyEarly={(code) => void handleUnlockBiologyEarly(code)}
        onClose={() => {
          if (!lockedOut) {
            setSecretModalOpen(false);
            setSecretModalMode('default');
          }
        }}
      />

      <TeacherDashboardModal
        open={teacherPanelOpen}
        adminCode={verifiedAdminCode}
        firebaseUser={firebaseUser}
        submissions={submissions}
        biologyEarlyUnlocked={biologyEarlyUnlocked}
        onToggleBiologyEarlyUnlock={handleToggleBiologyEarlyUnlock}
        onUpdateSubmissions={setSubmissions}
        onClose={() => setTeacherPanelOpen(false)}
      />
    </div>
  );
}
