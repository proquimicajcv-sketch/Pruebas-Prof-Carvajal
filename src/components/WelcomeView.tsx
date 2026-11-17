import React, { useEffect, useState } from 'react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { ArrowRight, CalendarClock, CheckCircle2, Lock, Mail, User as UserIcon } from 'lucide-react';
import { AcademicLevel, StudentSession } from '../types/exam';
import { CHEMISTRY_10_CLOSED } from '../data/examData';
import { BIOLOGY_UNLOCK_ISO, isBiologyScheduledOpen } from '../data/biologyExamData';
import { auth, googleProvider } from '../firebase';
import { checkEmailLockedRemote, fetchBiologyStatus } from '../utils/storage';
import { subscribeRealtime } from '../utils/realtime';

const CAMPUS_IMAGE_URL =
  'https://fce.unsa.edu.pe/wp-content/uploads/2025/11/frontis2-600x411.png';
const CREST_IMAGE_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-IEQt1mwp49TJ_lYdMbheDtD9Wwz0pswjnGdjHGfjVzvfDjneSbS0i0A&s=10';

interface WelcomeViewProps {
  biologyUnlockedOverride?: boolean;
  firebaseUser: User | null;
  onStartExam: (student: StudentSession) => void;
  onOpenTeacherAccess: () => void;
  onRequestBiologyCodeUnlock: () => void;
}

const LEVELS: {
  value: AcademicLevel;
  label: string;
  topic: string;
  requiresSchedule: boolean;
  closed?: boolean;
  accent?: 'emerald' | 'teal';
}[] = [
  {
    value: 7,
    label: '7.° Año',
    topic: 'ENOS · Recurso Hídrico · Clima',
    requiresSchedule: true,
  },
  {
    value: 8,
    label: '8.° Año',
    topic: 'Geósfera · Tectónica · Suelos',
    requiresSchedule: true,
  },
  {
    value: 9,
    label: '9.° Año',
    topic: 'Histología · Biotecnología · Bioética',
    requiresSchedule: true,
  },
  {
    value: 10,
    label: '10.° Química',
    topic: 'Mol · Estequiometría · Rendimiento',
    requiresSchedule: false,
    closed: CHEMISTRY_10_CLOSED,
  },
  {
    value: '10-quim-isa',
    label: 'Química Isabella Antonino',
    topic: '10.° Año (Adaptación Significativa) · Luz y Energías (37 pts)',
    requiresSchedule: false,
    accent: 'teal',
  },
  {
    value: '10-bio-isa',
    label: 'Biología Isabella Antonino',
    topic: 'Prueba de Biología (Adecuación Significativa) · 37 pts',
    requiresSchedule: false,
    accent: 'teal',
  },
  {
    value: '10-bio',
    label: '10.° Biología',
    topic: 'Taller Libro Abierto · Origen, Evolución y Genética (60 pts)',
    requiresSchedule: true,
    accent: 'emerald',
  },
];

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  biologyUnlockedOverride = false,
  firebaseUser,
  onStartExam,
  onOpenTeacherAccess,
  onRequestBiologyCodeUnlock,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockedConflict, setLockedConflict] = useState(false);
  const [scheduleGateBlocked, setScheduleGateBlocked] = useState(false);
  const [scheduledExamsOpen, setScheduledExamsOpen] = useState(false);
  const [checkingLock, setCheckingLock] = useState(false);
  const [signingInGoogle, setSigningInGoogle] = useState(false);
  const [crestError, setCrestError] = useState(false);
  const [campusError, setCampusError] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    if (firebaseUser.email && firebaseUser.email.toLowerCase().endsWith('@sps.ed.cr') && !email) {
      setEmail(firebaseUser.email.toLowerCase());
    }
    if (firebaseUser.displayName && !name) {
      setName(firebaseUser.displayName);
    }
  }, [firebaseUser, email, name]);

  useEffect(() => {
    let mounted = true;
    void fetchBiologyStatus().then((status) => {
      if (mounted) {
        setScheduledExamsOpen(status.unlocked || biologyUnlockedOverride);
      }
    });

    const unsubscribe = subscribeRealtime((event) => {
      if (!mounted) return;
      if (event.type === 'sync:init') {
        const isOpen = event.biologyStatus.unlocked || biologyUnlockedOverride;
        setScheduledExamsOpen(isOpen);
        if (isOpen && scheduleGateBlocked) {
          setScheduleGateBlocked(false);
          setErrorMsg(null);
        }
        return;
      }
      if (event.type === 'biology:status') {
        const isOpen = event.unlocked || biologyUnlockedOverride;
        setScheduledExamsOpen(isOpen);
        if (isOpen && scheduleGateBlocked) {
          setScheduleGateBlocked(false);
          setErrorMsg(null);
        }
        return;
      }
      if (
        (event.type === 'lock:updated' ||
          (event.type === 'submissions:updated' && !event.locked)) &&
        lockedConflict
      ) {
        const currentEmail = email.trim().toLowerCase();
        if (!event.email || event.email === currentEmail) {
          setLockedConflict(false);
          setErrorMsg(null);
        }
      }
    });

    const msUntilScheduled = Date.parse(BIOLOGY_UNLOCK_ISO) - Date.now();
    const scheduledTimer =
      msUntilScheduled > 0 && msUntilScheduled <= 86_400_000 * 2
        ? window.setTimeout(() => {
            if (mounted && isBiologyScheduledOpen()) {
              setScheduledExamsOpen(true);
              if (scheduleGateBlocked) {
                setScheduleGateBlocked(false);
                setErrorMsg(null);
              }
            }
          }, msUntilScheduled + 100)
        : null;

    return () => {
      mounted = false;
      if (scheduledTimer !== null) {
        window.clearTimeout(scheduledTimer);
      }
      unsubscribe();
    };
  }, [biologyUnlockedOverride, scheduleGateBlocked, lockedConflict, email]);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSigningInGoogle(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const googleEmail = cred.user.email?.toLowerCase() ?? '';
      if (googleEmail.endsWith('@sps.ed.cr') && !email.trim()) {
        setEmail(googleEmail);
      }
      if (cred.user.displayName && !name.trim()) {
        setName(cred.user.displayName);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/popup-blocked') {
        setErrorMsg(
          'El navegador bloqueó la ventana de Google. Permita ventanas emergentes e intente de nuevo.'
        );
      } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setErrorMsg('No se pudo conectar la cuenta de Google. Intente nuevamente.');
      }
    } finally {
      setSigningInGoogle(false);
    }
  };

  const handleGoogleSwitch = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore signOut failures before re-opening Google selector
    }
    await handleGoogleSignIn();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLockedConflict(false);
    setScheduleGateBlocked(false);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail.endsWith('@sps.ed.cr')) {
      setErrorMsg('El correo institucional debe terminar estrictamente en @sps.ed.cr');
      return;
    }

    if (trimmedName.length < 3) {
      setErrorMsg('Ingrese su nombre y apellidos completos para registrar la prueba.');
      return;
    }

    if (!selectedLevel) {
      setErrorMsg('Seleccione su nivel académico antes de ingresar a la evaluación.');
      return;
    }

    if (
      (selectedLevel === '10-quim-isa' || selectedLevel === '10-bio-isa') &&
      trimmedEmail !== 'iantonino@sps.ed.cr'
    ) {
      setErrorMsg('La evaluación seleccionada no está disponible para este usuario.');
      return;
    }

    const levelMeta = LEVELS.find((l) => l.value === selectedLevel);
    if (levelMeta?.closed) {
      setErrorMsg(`La prueba de ${levelMeta.label} se encuentra cerrada en este momento.`);
      return;
    }

    // Trigger signInWithPopup immediately inside click gesture before any other async awaits
    if (!auth.currentUser) {
      setSigningInGoogle(true);
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-blocked') {
          setErrorMsg(
            'El navegador bloqueó la ventana de inicio con Google. Permita las ventanas emergentes e intente nuevamente.'
          );
        } else {
          setErrorMsg(
            'Debe conectar una cuenta de Google para respaldar permanentemente su evaluación antes de ingresar.'
          );
        }
        setSigningInGoogle(false);
        return;
      } finally {
        setSigningInGoogle(false);
      }
    }

    if (levelMeta?.requiresSchedule) {
      const status = await fetchBiologyStatus();
      const isOpenNow = status.unlocked || biologyUnlockedOverride;
      setScheduledExamsOpen(isOpenNow);
      if (!isOpenNow) {
        setScheduleGateBlocked(true);
        setErrorMsg(
          `La prueba de ${levelMeta.label} se habilitará automáticamente el miércoles 18 de noviembre de 2026 a las 7:20 a.m. (o antes mediante código docente).`
        );
        return;
      }
    }

    setCheckingLock(true);
    let locked = false;
    try {
      locked = await checkEmailLockedRemote(trimmedEmail);
    } catch {
      locked = true;
    } finally {
      setCheckingLock(false);
    }

    if (locked) {
      setLockedConflict(true);
      setErrorMsg(
        'Este correo ya registró una evaluación o fue bloqueado en este dispositivo. Solicite al docente ingresar el código secreto para habilitar un nuevo acceso.'
      );
      return;
    }

    onStartExam({
      email: trimmedEmail,
      name: trimmedName,
      level: selectedLevel,
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Institutional Blue Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-slate-100 p-8 sm:p-10 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              {!crestError ? (
                <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-sm border border-white/20 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={CREST_IMAGE_URL}
                    alt="Escudo oficial Saint Peter's School"
                    referrerPolicy="no-referrer"
                    onError={() => setCrestError(true)}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-blue-800/70 border border-blue-400/30 shrink-0 flex items-center justify-center text-xs font-bold text-white">
                  SPS
                </div>
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-sky-300 tracking-wide">
                  Departamento de Ciencias
                </p>
                <p className="text-sm font-semibold text-white">
                  Saint Peter&apos;s School and High
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight [text-wrap:balance]">
                Plataforma de Evaluaciones
              </h1>
              <p className="text-sm text-slate-200 leading-relaxed max-w-sm">
                Sistema oficial de prácticas y pruebas sumativas de Ciencias para Secundaria.
              </p>
            </div>

            {/* Compact Campus Image with top logo band cropped out */}
            <div className="w-full max-w-[260px] h-28 rounded-xl overflow-hidden border border-white/15 bg-blue-950/60 shadow-sm relative">
              {!campusError ? (
                <img
                  src={CAMPUS_IMAGE_URL}
                  alt="Instalaciones institucionales"
                  referrerPolicy="no-referrer"
                  onError={() => setCampusError(true)}
                  className="w-full h-[145%] object-cover object-center -translate-y-[26%] block"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-900/50 text-xs text-blue-200">
                  Saint Peter&apos;s School · Sede Secundaria
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-200/80">Niveles</span>
                <span className="font-mono tabular-nums text-white">7.° · 8.° · 9.° · 10.°</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200/80">Supervisión</span>
                <span className="text-white">Control anti-fraude activo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200/80">Dominio autorizado</span>
                <span className="font-mono text-sky-300">@sps.ed.cr</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
            <span>Lic. Jorge Carvajal Vanegas</span>
            <span className="font-mono tabular-nums">Ciclo 2026</span>
          </div>
        </div>

        {/* Right Student Access Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Acceso Estudiantil
            </h2>
            <p className="text-sm text-slate-600">
              Ingrese sus datos institucionales y seleccione su nivel académico para iniciar.
            </p>
          </div>

          {firebaseUser ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="text-emerald-800 font-semibold block">
                  Respaldo en la nube conectado
                </span>
                <span className="font-mono text-emerald-700 truncate block">
                  {firebaseUser.email}
                </span>
              </div>
              <button
                type="button"
                disabled={signingInGoogle}
                onClick={() => void handleGoogleSwitch()}
                className="text-xs font-semibold text-emerald-900 underline underline-offset-2 whitespace-nowrap shrink-0 hover:text-emerald-700"
              >
                Cambiar cuenta
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <span className="text-slate-600">
                Conecte su cuenta de Google para respaldar sus respuestas permanentemente en la nube.
              </span>
              <button
                type="button"
                disabled={signingInGoogle}
                onClick={() => void handleGoogleSignIn()}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold whitespace-nowrap shrink-0 transition-colors"
              >
                {signingInGoogle ? 'Conectando...' : 'Conectar con Google'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="input-student-email"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Correo institucional
                </label>
                <div className="relative">
                  <Mail
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="input-student-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      const nextEmail = e.target.value;
                      setEmail(nextEmail);
                      if (
                        (selectedLevel === '10-quim-isa' || selectedLevel === '10-bio-isa') &&
                        nextEmail.trim().toLowerCase() !== 'iantonino@sps.ed.cr'
                      ) {
                        setSelectedLevel(null);
                      }
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="nombre.apellido@sps.ed.cr"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="input-student-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Nombre completo
                </label>
                <div className="relative">
                  <UserIcon
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="input-student-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Nombre y dos apellidos"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700">
                Nivel académico
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LEVELS.filter(
                  (lvl) =>
                    (lvl.value !== '10-quim-isa' && lvl.value !== '10-bio-isa') ||
                    email.trim().toLowerCase() === 'iantonino@sps.ed.cr'
                ).map((lvl) => {
                  const active = selectedLevel === lvl.value;
                  const isClosed = Boolean(lvl.closed);
                  const isBio = lvl.value === '10-bio';
                  const isIsa = lvl.value === '10-quim-isa' || lvl.value === '10-bio-isa';
                  const isBioFullWidth = isBio;
                  return (
                    <label
                      key={String(lvl.value)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors min-h-[44px] ${
                        isBioFullWidth ? 'sm:col-span-2' : ''
                      } ${
                        isClosed
                          ? 'border-slate-200 bg-slate-100/80 opacity-65 cursor-not-allowed'
                          : active
                          ? isBio
                            ? 'border-emerald-600 bg-emerald-50/70 cursor-pointer'
                            : isIsa
                            ? 'border-teal-600 bg-teal-50/70 cursor-pointer'
                            : 'border-blue-600 bg-blue-50/70 cursor-pointer'
                          : isBio
                          ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:bg-emerald-50/60 cursor-pointer'
                          : isIsa
                          ? 'border-teal-200 bg-teal-50/30 hover:border-teal-400 hover:bg-teal-50/60 cursor-pointer'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="academic-level"
                        value={String(lvl.value)}
                        checked={active}
                        disabled={isClosed}
                        onChange={() => {
                          if (isClosed) return;
                          setSelectedLevel(lvl.value);
                          if (errorMsg) setErrorMsg(null);
                          setScheduleGateBlocked(false);
                        }}
                        className={`mt-0.5 ${
                          isBio
                            ? 'text-emerald-600 focus:ring-emerald-600'
                            : isIsa
                            ? 'text-teal-600 focus:ring-teal-600'
                            : 'text-blue-600 focus:ring-blue-600'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm font-bold truncate ${
                              isClosed
                                ? 'text-slate-500'
                                : isBio
                                ? 'text-emerald-900'
                                : isIsa
                                ? 'text-teal-900'
                                : 'text-slate-900'
                            }`}
                          >
                            {lvl.label}
                          </span>
                          {isClosed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 whitespace-nowrap shrink-0">
                              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Cerrada</span>
                            </span>
                          ) : lvl.requiresSchedule ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap shrink-0 ${
                                scheduledExamsOpen
                                  ? isBio
                                    ? 'text-emerald-700'
                                    : 'text-blue-700'
                                  : 'text-slate-500'
                              }`}
                            >
                              <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>
                                {scheduledExamsOpen ? 'Habilitada' : '18 nov · 7:20 a.m.'}
                              </span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                                isIsa ? 'text-teal-700' : 'text-blue-700'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Disponible</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 truncate">{lvl.topic}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <span>{errorMsg}</span>
                {(lockedConflict || scheduleGateBlocked) && (
                  <button
                    type="button"
                    onClick={
                      scheduleGateBlocked
                        ? onRequestBiologyCodeUnlock
                        : onOpenTeacherAccess
                    }
                    className="text-xs font-semibold text-rose-900 underline underline-offset-2 whitespace-nowrap shrink-0 text-left"
                  >
                    {scheduleGateBlocked
                      ? 'Habilitar con código docente'
                      : 'Desbloquear con código'}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={checkingLock || signingInGoogle}
              className={`w-full min-h-[44px] disabled:opacity-60 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 ${
                selectedLevel === '10-bio'
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600'
                  : selectedLevel === '10-quim-isa' || selectedLevel === '10-bio-isa'
                  ? 'bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-600'
                  : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600'
              }`}
            >
              <span>
                {signingInGoogle
                  ? 'Conectando cuenta Google...'
                  : checkingLock
                  ? 'Verificando acceso...'
                  : 'Ingresar a la Evaluación'}
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              ¿Requiere desbloqueo o panel administrador?
            </span>
            <button
              type="button"
              onClick={onOpenTeacherAccess}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ingresar Código Docente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
