import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type {
  AcademicLevel,
  BiologySubmittedMap,
  InfractionEvent,
  IsabellaSubmittedMap,
  SectionSubmittedMap,
  StoredSubmission,
  StudentSession,
  UserAnswers,
} from '../types/exam';
import { CHEMISTRY_10_CLOSED } from '../data/examData';
import { biologyExamData, isBiologyScheduledOpen } from '../data/biologyExamData';
import {
  OperationType,
  auth,
  db,
  handleFirestoreError,
  isVerifiedAdmin,
  sanitizeLockId,
} from '../firebase';
import { buildSubmissionsCsv, evaluateFullSubmission } from './grading';

const SUBMISSIONS_KEY = 'sps_ciencias_submissions_v1';
const LOCKED_EMAILS_KEY = 'sps_ciencias_locked_emails_v1';
const BIOLOGY_EARLY_UNLOCK_KEY = 'sps_biologia10_early_unlock_v1';
const EXAM_DRAFTS_KEY = 'sps_ciencias_exam_drafts_v1';
const ACTIVE_DRAFT_EMAIL_KEY = 'sps_ciencias_active_email_v1';

export interface SavedExamDraft {
  student: StudentSession;
  answers: UserAnswers;
  sectionSubmitted: SectionSubmittedMap;
  biologySubmitted: BiologySubmittedMap;
  isabellaSubmitted: IsabellaSubmittedMap;
  infractions: InfractionEvent[];
  lockedOut: boolean;
  lockoutSubmissionId: string | null;
  updatedAt: string;
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return value;
}

function mergeSubmissionsLists(
  primary: StoredSubmission[],
  secondary: StoredSubmission[]
): StoredSubmission[] {
  const byId = new Map<string, StoredSubmission>();
  for (const item of [...secondary, ...primary]) {
    if (item && item.id) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

function readAllDrafts(): Record<string, SavedExamDraft> {
  try {
    const raw = localStorage.getItem(EXAM_DRAFTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SavedExamDraft>) : {};
  } catch {
    return {};
  }
}

export function saveExamDraft(draft: SavedExamDraft): void {
  const email = draft.student.email.trim().toLowerCase();
  const all = readAllDrafts();
  all[email] = draft;
  try {
    localStorage.setItem(EXAM_DRAFTS_KEY, JSON.stringify(all));
    localStorage.setItem(ACTIVE_DRAFT_EMAIL_KEY, email);
  } catch {
    // Ignore storage quota errors
  }
}

export function getExamDraft(email: string): SavedExamDraft | null {
  const normalized = email.trim().toLowerCase();
  const all = readAllDrafts();
  return all[normalized] ?? null;
}

export function getActiveExamDraft(): SavedExamDraft | null {
  try {
    const activeEmail = localStorage.getItem(ACTIVE_DRAFT_EMAIL_KEY);
    if (!activeEmail) return null;
    return getExamDraft(activeEmail);
  } catch {
    return null;
  }
}

export function setActiveDraftEmail(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(ACTIVE_DRAFT_EMAIL_KEY, email.trim().toLowerCase());
    } else {
      localStorage.removeItem(ACTIVE_DRAFT_EMAIL_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearExamDraft(email: string): void {
  const normalized = email.trim().toLowerCase();
  const all = readAllDrafts();
  delete all[normalized];
  try {
    localStorage.setItem(EXAM_DRAFTS_KEY, JSON.stringify(all));
    if (localStorage.getItem(ACTIVE_DRAFT_EMAIL_KEY) === normalized) {
      localStorage.removeItem(ACTIVE_DRAFT_EMAIL_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getLockedEmails(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LOCKED_EMAILS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function lockEmail(email: string): void {
  const normalized = email.trim().toLowerCase();
  const current = getLockedEmails();
  current[normalized] = true;
  try {
    localStorage.setItem(LOCKED_EMAILS_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage quota errors
  }
}

export function unlockEmail(email: string): void {
  const normalized = email.trim().toLowerCase();
  const current = getLockedEmails();
  delete current[normalized];
  try {
    localStorage.setItem(LOCKED_EMAILS_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage errors
  }
}

export function clearAllLockedEmails(): void {
  try {
    localStorage.removeItem(LOCKED_EMAILS_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function isEmailLocked(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return Boolean(getLockedEmails()[normalized]);
}

export async function checkEmailLockedRemote(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  if (auth.currentUser?.emailVerified) {
    const lockId = sanitizeLockId(normalized);
    const lockPath = `exam_locks/${lockId}`;
    try {
      const snap = await getDoc(doc(db, 'exam_locks', lockId));
      if (snap.exists()) {
        const isLocked = Boolean((snap.data() as { locked?: boolean }).locked);
        if (isLocked) {
          lockEmail(normalized);
          return true;
        }
        unlockEmail(normalized);
      }
    } catch (error) {
      const code = (error as { code?: string })?.code ?? '';
      if (code === 'permission-denied') {
        handleFirestoreError(error, OperationType.GET, lockPath);
      }
    }
  }

  try {
    const res = await fetch(
      `/api/check-lock?email=${encodeURIComponent(normalized)}`
    );
    if (res.ok) {
      const data = (await res.json()) as { locked?: boolean };
      const serverLocked = Boolean(data.locked);
      if (serverLocked) {
        lockEmail(normalized);
      } else {
        unlockEmail(normalized);
      }
      return serverLocked;
    }
  } catch {
    // Fall back to local check when offline
  }
  return isEmailLocked(normalized);
}

export function getBiologyEarlyUnlockLocal(): boolean {
  try {
    return localStorage.getItem(BIOLOGY_EARLY_UNLOCK_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setBiologyEarlyUnlockLocal(val: boolean): void {
  try {
    localStorage.setItem(BIOLOGY_EARLY_UNLOCK_KEY, val ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

export function subscribePlatformSettings(
  onUpdate: (settings: { biologyEarlyUnlocked: boolean }) => void
): () => void {
  const settingsPath = 'settings/platform';
  return onSnapshot(
    doc(db, 'settings', 'platform'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as { biologyEarlyUnlocked?: boolean };
        const early = Boolean(data.biologyEarlyUnlocked);
        setBiologyEarlyUnlockLocal(early);
        onUpdate({ biologyEarlyUnlocked: early });
      }
    },
    (error) => {
      if ((error as { code?: string })?.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      }
    }
  );
}

export async function fetchBiologyStatus(): Promise<{
  unlocked: boolean;
  scheduledOpen: boolean;
  earlyUnlocked: boolean;
}> {
  const localEarly = getBiologyEarlyUnlockLocal();
  const scheduled = isBiologyScheduledOpen();
  let firestoreEarly = false;

  try {
    const snap = await getDoc(doc(db, 'settings', 'platform'));
    if (snap.exists()) {
      firestoreEarly = Boolean(
        (snap.data() as { biologyEarlyUnlocked?: boolean }).biologyEarlyUnlocked
      );
      setBiologyEarlyUnlockLocal(firestoreEarly);
    }
  } catch (error) {
    if ((error as { code?: string })?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, 'settings/platform');
    }
  }

  try {
    const res = await fetch('/api/biology-status');
    if (res.ok) {
      const data = (await res.json()) as {
        unlocked: boolean;
        scheduledOpen: boolean;
        earlyUnlocked: boolean;
      };
      const combinedEarly = Boolean(firestoreEarly || data.earlyUnlocked || localEarly);
      setBiologyEarlyUnlockLocal(combinedEarly);
      return {
        unlocked: Boolean(scheduled || combinedEarly),
        scheduledOpen: Boolean(data.scheduledOpen || scheduled),
        earlyUnlocked: combinedEarly,
      };
    }
  } catch {
    // Fallback to Firestore + local
  }

  const combinedEarly = firestoreEarly || localEarly;
  return {
    unlocked: scheduled || combinedEarly,
    scheduledOpen: scheduled,
    earlyUnlocked: combinedEarly,
  };
}

export async function setBiologyEarlyUnlockRemote(
  code: string,
  earlyUnlocked: boolean
): Promise<boolean> {
  setBiologyEarlyUnlockLocal(earlyUnlocked);

  if (isVerifiedAdmin()) {
    try {
      await setDoc(doc(db, 'settings', 'platform'), {
        biologyEarlyUnlocked: earlyUnlocked,
        chemistry10Closed: CHEMISTRY_10_CLOSED,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/platform');
    }
  }

  try {
    const res = await fetch('/api/admin/biology-unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-teacher-code': code,
      },
      body: JSON.stringify({ earlyUnlocked }),
    });
    if (res.ok) {
      const data = (await res.json()) as { unlocked?: boolean };
      return Boolean(data.unlocked);
    }
  } catch {
    // Fallback to local
  }
  return isBiologyScheduledOpen() || earlyUnlocked;
}

export function getStoredSubmissions(): StoredSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? (JSON.parse(raw) as StoredSubmission[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredSubmissionsCache(list: StoredSubmission[]): void {
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
}

export function saveSubmissionLocal(
  student: StudentSession,
  answers: UserAnswers,
  infractions: InfractionEvent[],
  lockedOut: boolean
): StoredSubmission {
  const breakdown = evaluateFullSubmission(student.level, answers);
  const entry: StoredSubmission = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    student,
    submittedAt: new Date().toISOString(),
    answers,
    infractions,
    lockedOut,
    objectiveScore: {
      selection: breakdown.selection,
      selectionTotal: breakdown.selectionTotal,
      matching: breakdown.matching,
      matchingTotal: breakdown.matchingTotal,
      completes: breakdown.completes,
      completesTotal: breakdown.completesTotal,
      totalEarned: breakdown.selection + breakdown.matching + breakdown.completes,
      totalPossible:
        breakdown.selectionTotal + breakdown.matchingTotal + breakdown.completesTotal,
    },
    gradeBreakdown: breakdown,
  };

  const existing = getStoredSubmissions();
  const updated = [entry, ...existing];
  saveStoredSubmissionsCache(updated);
  lockEmail(student.email);
  return entry;
}

export async function submitAndGradeExam(
  student: StudentSession,
  answers: UserAnswers,
  infractions: InfractionEvent[],
  lockedOut: boolean
): Promise<StoredSubmission> {
  const normalizedStudent: StudentSession = {
    email: student.email.trim().toLowerCase().slice(0, 160),
    name: student.name.trim().slice(0, 160),
    level: student.level,
  };
  const localEntry = saveSubmissionLocal(
    normalizedStudent,
    answers,
    infractions,
    lockedOut
  );

  // Persist permanently in Firestore when authenticated
  if (auth.currentUser && auth.currentUser.emailVerified) {
    const subPath = `submissions/${localEntry.id}`;
    const safeInfractions = infractions.slice(0, 10).map((inf) => ({
      timestamp: String(inf.timestamp || '').slice(0, 40),
      reason: String(inf.reason || '').slice(0, 200),
    }));

    try {
      await setDoc(doc(db, 'submissions', localEntry.id), {
        id: localEntry.id,
        ownerUid: auth.currentUser.uid,
        studentEmail: normalizedStudent.email,
        studentName: normalizedStudent.name,
        studentLevel: String(normalizedStudent.level),
        submittedAt: localEntry.submittedAt.slice(0, 40),
        createdAt: serverTimestamp(),
        lockedOut: Boolean(lockedOut),
        student: {
          email: normalizedStudent.email,
          name: normalizedStudent.name,
          level: normalizedStudent.level,
        },
        answers: stripUndefined(answers),
        infractions: safeInfractions,
        objectiveScore: stripUndefined(localEntry.objectiveScore),
        gradeBreakdown: stripUndefined(localEntry.gradeBreakdown),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, subPath);
    }

    const lockId = sanitizeLockId(normalizedStudent.email);
    const lockPath = `exam_locks/${lockId}`;
    try {
      await setDoc(doc(db, 'exam_locks', lockId), {
        ownerUid: auth.currentUser.uid,
        email: normalizedStudent.email,
        locked: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, lockPath);
    }
  }

  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student: normalizedStudent,
        answers,
        infractions,
        lockedOut,
      }),
    });
    if (res.ok) {
      const receipt = (await res.json()) as { id?: string; submittedAt?: string };
      return {
        ...localEntry,
        id: localEntry.id || receipt.id || localEntry.id,
        submittedAt: localEntry.submittedAt || receipt.submittedAt || localEntry.submittedAt,
      };
    }
  } catch {
    // Kept safely in Firestore + localStorage fallback
  }

  return localEntry;
}

export function subscribeAdminSubmissions(
  onUpdate: (submissions: StoredSubmission[]) => void
): () => void {
  if (!isVerifiedAdmin()) {
    return () => {};
  }
  const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const cloudSubs: StoredSubmission[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as StoredSubmission;
        return {
          ...data,
          id: docSnap.id,
        };
      });
      const merged = mergeSubmissionsLists(cloudSubs, getStoredSubmissions());
      saveStoredSubmissionsCache(merged);
      onUpdate(merged);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    }
  );
}

export async function fetchAdminSubmissions(code: string): Promise<StoredSubmission[]> {
  let cloudSubs: StoredSubmission[] = [];
  if (isVerifiedAdmin()) {
    try {
      const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      cloudSubs = snap.docs.map((docSnap) => ({
        ...(docSnap.data() as StoredSubmission),
        id: docSnap.id,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    }
  }

  let serverSubs: StoredSubmission[] = [];
  try {
    const res = await fetch('/api/admin/submissions', {
      headers: { 'x-teacher-code': code },
    });
    if (res.ok) {
      const data = (await res.json()) as { submissions?: StoredSubmission[] };
      if (Array.isArray(data.submissions)) {
        serverSubs = data.submissions;
      }
    }
  } catch {
    // Fall back to Firestore + local cache
  }

  const merged = mergeSubmissionsLists(cloudSubs, mergeSubmissionsLists(serverSubs, getStoredSubmissions()));
  saveStoredSubmissionsCache(merged);
  return merged;
}

export async function unlockEmailRemote(code: string, email?: string): Promise<void> {
  if (email) {
    unlockEmail(email);
  } else {
    clearAllLockedEmails();
  }

  if (isVerifiedAdmin()) {
    if (email) {
      const lockId = sanitizeLockId(email);
      try {
        await deleteDoc(doc(db, 'exam_locks', lockId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `exam_locks/${lockId}`);
      }
    } else {
      try {
        const snap = await getDocs(collection(db, 'exam_locks'));
        await Promise.all(
          snap.docs.map((d) => deleteDoc(doc(db, 'exam_locks', d.id)))
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'exam_locks');
      }
    }
  }

  try {
    await fetch('/api/admin/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-teacher-code': code,
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Ignore network failure
  }
}

export async function deleteSubmissionRemote(
  code: string,
  id: string,
  email: string
): Promise<StoredSubmission[]> {
  unlockEmail(email);
  const localUpdated = getStoredSubmissions().filter((s) => s.id !== id);
  saveStoredSubmissionsCache(localUpdated);

  if (isVerifiedAdmin()) {
    try {
      await deleteDoc(doc(db, 'submissions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `submissions/${id}`);
    }
    const lockId = sanitizeLockId(email);
    try {
      await deleteDoc(doc(db, 'exam_locks', lockId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `exam_locks/${lockId}`);
    }
  }

  try {
    const res = await fetch(`/api/admin/submissions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-teacher-code': code },
    });
    if (res.ok) {
      const data = (await res.json()) as { submissions?: StoredSubmission[] };
      if (Array.isArray(data.submissions)) {
        return mergeSubmissionsLists(localUpdated, data.submissions);
      }
    }
  } catch {
    // Fall back to localUpdated
  }
  return localUpdated;
}

export async function downloadMasterCsv(
  code: string,
  currentSubmissions: StoredSubmission[]
): Promise<void> {
  if (currentSubmissions.length > 0) {
    const csvContent = buildSubmissionsCsv(currentSubmissions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, 'Registro_Notas_Ciencias_SPS_2026.csv');
    return;
  }

  try {
    const res = await fetch('/api/admin/export/csv', {
      headers: { 'x-teacher-code': code },
    });
    if (res.ok) {
      const blob = await res.blob();
      triggerDownload(blob, 'Registro_Notas_Ciencias_SPS_2026.csv');
      return;
    }
  } catch {
    // Fallback to client-side CSV generation
  }

  const csvContent = buildSubmissionsCsv(currentSubmissions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'Registro_Notas_Ciencias_SPS_2026.csv');
}

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildClientHtmlReport(submissions: StoredSubmission[]): string {
  const generatedAt = new Date().toLocaleString('es-CR');
  const rowsHtml = submissions
    .map((s) => {
      const g = s.gradeBreakdown ?? evaluateFullSubmission(s.student.level, s.answers);
      const levelName =
        s.student.level === '10-bio'
          ? '10.° Biología'
          : s.student.level === '10-quim-isa'
          ? 'Química Isabella Antonino'
          : s.student.level === '10-bio-isa'
          ? 'Biología Isabella Antonino'
          : s.student.level === 10
          ? '10.° Química'
          : `${s.student.level}.° Año`;
      const isBio = s.student.level === '10-bio';
      const isIsa =
        s.student.level === '10-quim-isa' || s.student.level === '10-bio-isa';
      const matchingCell = isBio
        ? '—'
        : isIsa
        ? `${g.matching + (g.matching2 ?? 0)}/${g.matchingTotal + (g.matching2Total ?? 0)}`
        : `${g.matching}/${g.matchingTotal}`;
      const bonusCell =
        isBio || s.student.level === '10-bio-isa' ? '—' : `+${g.bonus}`;
      return `
      <tr>
        <td>${escapeHtml(s.student.name)}</td>
        <td><code>${escapeHtml(s.student.email)}</code></td>
        <td>${escapeHtml(levelName)}</td>
        <td>${escapeHtml(new Date(s.submittedAt).toLocaleString('es-CR'))}</td>
        <td>${isBio ? '—' : `${g.selection}/${g.selectionTotal}`}</td>
        <td>${matchingCell}</td>
        <td>${isBio ? '—' : `${g.completes}/${g.completesTotal}`}</td>
        <td>${isBio ? `${g.biologyEarned ?? 0}/60 (Taller)` : `${g.development}/${g.developmentTotal}`}</td>
        <td>${bonusCell}</td>
        <td><strong>${g.totalEarnedWithBonus}/${g.baseTotal}</strong></td>
        <td><strong>${g.finalPercentage.toFixed(1)}%</strong></td>
        <td>${s.infractions.length}${s.lockedOut ? ' (Bloqueado)' : ''}</td>
      </tr>`;
    })
    .join('');

  const detailsHtml = submissions
    .map((s, idx) => {
      const g = s.gradeBreakdown ?? evaluateFullSubmission(s.student.level, s.answers);
      const levelName =
        s.student.level === '10-bio'
          ? '10.° Biología'
          : s.student.level === '10-quim-isa'
          ? 'Química Isabella Antonino'
          : s.student.level === '10-bio-isa'
          ? 'Biología Isabella Antonino'
          : s.student.level === 10
          ? '10.° Química'
          : `${s.student.level}.° Año`;

      if (s.student.level === '10-bio') {
        const bioAns = s.answers.biology || {};
        const subItemsHtml = biologyExamData.modules
          .map(
            (m) => `
            <h4>${escapeHtml(m.title)}</h4>
            ${m.questions
              .map((q) =>
                q.subquestions
                  .map(
                    (sub) =>
                      `<p><strong>${escapeHtml(sub.id)})</strong> (${g.biologyDetails?.[sub.id] ?? 0}/2 pts) ${escapeHtml(bioAns[sub.id] || 'Sin respuesta')}</p>`
                  )
                  .join('')
              )
              .join('')}`
          )
          .join('');
        return `
        <div class="card">
          <h3>${idx + 1}. ${escapeHtml(s.student.name)} — ${escapeHtml(levelName)} (${g.finalPercentage.toFixed(1)}%)</h3>
          <p class="meta">Correo: ${escapeHtml(s.student.email)} · Fecha: ${escapeHtml(new Date(s.submittedAt).toLocaleString('es-CR'))} · Infracciones: ${s.infractions.length}</p>
          ${subItemsHtml}
        </div>`;
      }

      if (s.student.level === '10-quim-isa' || s.student.level === '10-bio-isa') {
        return `
        <div class="card">
          <h3>${idx + 1}. ${escapeHtml(s.student.name)} — ${escapeHtml(levelName)} (${g.finalPercentage.toFixed(1)}%)</h3>
          <p class="meta">Correo: ${escapeHtml(s.student.email)} · Fecha: ${escapeHtml(new Date(s.submittedAt).toLocaleString('es-CR'))} · Infracciones: ${s.infractions.length}</p>
          <p><strong>V. Desarrollo (${g.development}/2 pts):</strong> ${escapeHtml(s.answers.development[0] || 'Sin respuesta')}</p>
          ${
            s.student.level === '10-quim-isa'
              ? `<p><strong>VI. Opcional (+${g.bonus}/1 pt):</strong> ${escapeHtml(s.answers.bonus || 'Omitida')}</p>`
              : ''
          }
        </div>`;
      }

      return `
      <div class="card">
        <h3>${idx + 1}. ${escapeHtml(s.student.name)} — ${escapeHtml(levelName)} (${g.finalPercentage.toFixed(1)}%)</h3>
        <p class="meta">Correo: ${escapeHtml(s.student.email)} · Fecha: ${escapeHtml(new Date(s.submittedAt).toLocaleString('es-CR'))} · Infracciones: ${s.infractions.length}</p>
        <p><strong>IV. Desarrollo 1:</strong> ${escapeHtml(s.answers.development[0] || 'Sin respuesta')}</p>
        <p><strong>IV. Desarrollo 2:</strong> ${escapeHtml(s.answers.development[1] || 'Sin respuesta')}</p>
        ${s.student.level !== 7 ? `<p><strong>IV. Desarrollo 3:</strong> ${escapeHtml(s.answers.development[2] || 'Sin respuesta')}</p>` : ''}
        <p><strong>V. Bonificación:</strong> ${escapeHtml(s.answers.bonus || 'Omitida')}</p>
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Acta Oficial de Calificaciones — Saint Peter's School</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; line-height: 1.5; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .sub { color: #475569; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 32px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 14px; font-size: 12.5px; }
    .card h3 { margin: 0 0 6px 0; font-size: 14px; }
    .card h4 { margin: 10px 0 4px 0; font-size: 12.5px; color: #065f46; }
    .meta { color: #475569; font-size: 11.5px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>Saint Peter's School and High — Acta Oficial de Calificaciones</h1>
  <div class="sub">Departamento de Ciencias · Lic. Jorge Carvajal Vanegas · Ciclo Lectivo 2026 · Generado el ${escapeHtml(generatedAt)}</div>
  <table>
    <thead>
      <tr>
        <th>Estudiante</th>
        <th>Correo</th>
        <th>Nivel</th>
        <th>Fecha</th>
        <th>Sel.</th>
        <th>Asoc.</th>
        <th>Comp.</th>
        <th>Desarr. / Taller</th>
        <th>Bono</th>
        <th>Puntos</th>
        <th>Nota (%)</th>
        <th>Infrac.</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="12">No hay evaluaciones registradas.</td></tr>'}
    </tbody>
  </table>
  <h2>Detalle de Respuestas Abiertas y Taller</h2>
  ${detailsHtml || '<p>Sin registros disponibles.</p>'}
</body>
</html>`;
}

export async function downloadOfficialReport(
  code: string,
  currentSubmissions: StoredSubmission[] = []
): Promise<void> {
  if (currentSubmissions.length > 0) {
    const html = buildClientHtmlReport(currentSubmissions);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    triggerDownload(blob, 'Acta_Notas_Ciencias_SPS_2026.html');
    return;
  }

  const res = await fetch('/api/admin/export/report', {
    headers: { 'x-teacher-code': code },
  });
  if (res.ok) {
    const blob = await res.blob();
    triggerDownload(blob, 'Acta_Notas_Ciencias_SPS_2026.html');
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getCostaRicaDateKey(isoOrDate: string): string {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Costa_Rica',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(current);
      current = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      current = '';
    } else {
      current += ch;
    }
  }
  row.push(current);
  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row);
  }
  return rows;
}

function parseLevelFromCsvLabel(raw: string): AcademicLevel {
  const v = raw.trim().toLowerCase();
  if ((v.includes('isabella') && (v.includes('biología') || v.includes('biologia'))) || v === '10-bio-isa') {
    return '10-bio-isa';
  }
  if (v.includes('isabella') || v === '10-quim-isa') return '10-quim-isa';
  if (v.includes('biología') || v.includes('biologia') || v === '10-bio') return '10-bio';
  if (v.includes('10') || v.includes('química') || v.includes('quimica')) return 10;
  if (v.startsWith('9')) return 9;
  if (v.startsWith('8')) return 8;
  return 7;
}

function parseFraction(raw: string): [number, number] {
  const match = String(raw || '').match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!match) return [0, 0];
  return [Number(match[1]) || 0, Number(match[2]) || 0];
}

function parseLocaleOrIsoDate(raw: string): string {
  const trimmed = String(raw || '').trim();
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  const crMatch = trimmed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[, ]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (crMatch) {
    const [, dd, mm, yyyy, hh = '12', min = '00', ss = '00'] = crMatch;
    const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${hh.padStart(2, '0')}:${min.padStart(2, '0')}:${ss.padStart(2, '0')}-06:00`;
    const dt = new Date(iso);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString();
  }
  return new Date().toISOString();
}

export async function importSubmissionsBackup(
  rawText: string,
  onlyCostaRicaDate?: string
): Promise<{ importedCount: number; submissions: StoredSubmission[] }> {
  const trimmed = rawText.replace(/^\uFEFF/, '').trim();
  let parsedList: StoredSubmission[] = [];

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const json = JSON.parse(trimmed) as
      | StoredSubmission[]
      | { submissions?: StoredSubmission[] };
    const arr = Array.isArray(json)
      ? json
      : Array.isArray(json?.submissions)
      ? json.submissions
      : [];
    parsedList = arr.filter(
      (item): item is StoredSubmission =>
        Boolean(item?.student?.email && item?.student?.name && item?.student?.level)
    );
  } else {
    const rows = parseCsvRows(trimmed);
    const dataRows = rows.slice(1);
    parsedList = dataRows
      .filter((cols) => cols.length >= 14 && cols[3]?.includes('@sps.ed.cr'))
      .map((cols, idx) => {
        const safeId =
          String(cols[0] || '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 120) || `imp_${Date.now()}_${idx}`;
        const submittedAt = parseLocaleOrIsoDate(cols[1]);
        const name = String(cols[2] || 'Estudiante').trim().slice(0, 160);
        const email = String(cols[3] || '').trim().toLowerCase().slice(0, 160);
        const level = parseLevelFromCsvLabel(cols[4] || '');
        const [sel, selTotal] = parseFraction(cols[5]);
        const [mat, matTotal] = parseFraction(cols[6]);
        const [cmp, cmpTotal] = parseFraction(cols[7]);
        const [dev, devTotal] = parseFraction(cols[8]);
        const bonusVal = Number(String(cols[9] || '0').replace(/[^\d.]/g, '')) || 0;
        const [bio, bioTotal] = parseFraction(cols[10]);
        const totalEarnedWithBonus = Number(cols[11]) || 0;
        const baseTotal = Number(cols[12]) || (level === '10-bio' ? 60 : 40);
        const finalPercentage = Number(cols[13]) || 0;
        const lockedOut = String(cols[15] || '').toUpperCase() === 'SI';
        const devText = String(cols[17] || '').trim();
        const bonusText = String(cols[18] || '').trim();

        const breakdown = {
          selection: sel,
          selectionTotal: selTotal,
          matching: mat,
          matchingTotal: matTotal,
          completes: cmp,
          completesTotal: cmpTotal,
          development: dev,
          developmentTotal: devTotal,
          developmentDetails: [dev],
          bonus: bonusVal,
          bonusTotal: 1,
          ...(level === '10-bio'
            ? { biologyEarned: bio, biologyTotal: bioTotal || 60 }
            : {}),
          baseEarned: Math.max(0, totalEarnedWithBonus - bonusVal),
          baseTotal,
          totalEarnedWithBonus,
          finalPercentage,
        };

        const developmentMap: Record<number, string> = devText ? { 0: devText } : {};
        return {
          id: safeId,
          student: { email, name: name.length >= 3 ? name : `${name} (SPS)`, level },
          submittedAt,
          answers: {
            selection: {},
            matching: {},
            completes: {},
            development: developmentMap,
            bonus: bonusText,
          },
          infractions: [],
          lockedOut,
          objectiveScore: {
            selection: sel,
            selectionTotal: selTotal,
            matching: mat,
            matchingTotal: matTotal,
            completes: cmp,
            completesTotal: cmpTotal,
            totalEarned: sel + mat + cmp,
            totalPossible: selTotal + matTotal + cmpTotal,
          },
          gradeBreakdown: breakdown,
        };
      });
  }

  const filteredByDate = onlyCostaRicaDate
    ? parsedList.filter(
        (item) => getCostaRicaDateKey(item.submittedAt) === onlyCostaRicaDate
      )
    : parsedList;

  const validRecords = filteredByDate.map((item, idx) => {
    const sanitizedId =
      String(item.id || '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 120) || `imp_${Date.now()}_${idx}`;
    const email = item.student.email.trim().toLowerCase().slice(0, 160);
    const rawName = item.student.name.trim().slice(0, 160);
    const name = rawName.length >= 3 ? rawName : `${rawName} SPS`.trim();
    const breakdown =
      item.gradeBreakdown ?? evaluateFullSubmission(item.student.level, item.answers);
    return {
      ...item,
      id: sanitizedId,
      student: {
        email,
        name,
        level: item.student.level,
      },
      gradeBreakdown: breakdown,
    };
  });

  if (isVerifiedAdmin() && auth.currentUser && validRecords.length > 0) {
    for (const rec of validRecords) {
      const subPath = `submissions/${rec.id}`;
      const safeInfractions = (rec.infractions || []).slice(0, 10).map((inf) => ({
        timestamp: String(inf.timestamp || '').slice(0, 40),
        reason: String(inf.reason || '').slice(0, 200),
      }));
      try {
        await setDoc(doc(db, 'submissions', rec.id), {
          id: rec.id,
          ownerUid: auth.currentUser.uid,
          studentEmail: rec.student.email,
          studentName: rec.student.name,
          studentLevel: String(rec.student.level),
          submittedAt: String(rec.submittedAt || new Date().toISOString()).slice(0, 40),
          createdAt: serverTimestamp(),
          lockedOut: Boolean(rec.lockedOut),
          student: {
            email: rec.student.email,
            name: rec.student.name,
            level: rec.student.level,
          },
          answers: stripUndefined(rec.answers || {
            selection: {},
            matching: {},
            completes: {},
            development: {},
            bonus: '',
          }),
          infractions: safeInfractions,
          objectiveScore: stripUndefined(rec.objectiveScore),
          gradeBreakdown: stripUndefined(rec.gradeBreakdown),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, subPath);
      }
    }
  }

  const merged = mergeSubmissionsLists(validRecords, getStoredSubmissions());
  saveStoredSubmissionsCache(merged);
  return {
    importedCount: validRecords.length,
    submissions: merged,
  };
}
