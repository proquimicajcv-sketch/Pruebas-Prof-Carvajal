import type {
  BiologySubmittedMap,
  InfractionEvent,
  IsabellaSubmittedMap,
  SectionSubmittedMap,
  StoredSubmission,
  StudentSession,
  UserAnswers,
} from '../types/exam';
import { isBiologyScheduledOpen } from '../data/biologyExamData';
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

export async function fetchBiologyStatus(): Promise<{
  unlocked: boolean;
  scheduledOpen: boolean;
  earlyUnlocked: boolean;
}> {
  const localEarly = getBiologyEarlyUnlockLocal();
  const scheduled = isBiologyScheduledOpen();
  try {
    const res = await fetch('/api/biology-status');
    if (res.ok) {
      const data = (await res.json()) as {
        unlocked: boolean;
        scheduledOpen: boolean;
        earlyUnlocked: boolean;
      };
      setBiologyEarlyUnlockLocal(Boolean(data.earlyUnlocked));
      return {
        unlocked: Boolean(data.unlocked || localEarly),
        scheduledOpen: Boolean(data.scheduledOpen),
        earlyUnlocked: Boolean(data.earlyUnlocked || localEarly),
      };
    }
  } catch {
    // Fallback to local
  }
  return {
    unlocked: scheduled || localEarly,
    scheduledOpen: scheduled,
    earlyUnlocked: localEarly,
  };
}

export async function setBiologyEarlyUnlockRemote(
  code: string,
  earlyUnlocked: boolean
): Promise<boolean> {
  setBiologyEarlyUnlockLocal(earlyUnlocked);
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
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
  lockEmail(student.email);
  return entry;
}

export async function submitAndGradeExam(
  student: StudentSession,
  answers: UserAnswers,
  infractions: InfractionEvent[],
  lockedOut: boolean
): Promise<StoredSubmission> {
  const localEntry = saveSubmissionLocal(student, answers, infractions, lockedOut);

  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, answers, infractions, lockedOut }),
    });
    if (res.ok) {
      const receipt = (await res.json()) as { id?: string; submittedAt?: string };
      return {
        ...localEntry,
        id: receipt.id || localEntry.id,
        submittedAt: receipt.submittedAt || localEntry.submittedAt,
      };
    }
  } catch {
    // Kept safely in localStorage fallback
  }

  return localEntry;
}

export async function fetchAdminSubmissions(code: string): Promise<StoredSubmission[]> {
  try {
    const res = await fetch('/api/admin/submissions', {
      headers: { 'x-teacher-code': code },
    });
    if (res.ok) {
      const data = (await res.json()) as { submissions?: StoredSubmission[] };
      if (Array.isArray(data.submissions)) {
        return data.submissions;
      }
    }
  } catch {
    // Fall back to local cache
  }
  return getStoredSubmissions();
}

export async function unlockEmailRemote(code: string, email?: string): Promise<void> {
  if (email) {
    unlockEmail(email);
  } else {
    clearAllLockedEmails();
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
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(localUpdated));
  } catch {
    // Ignore storage errors
  }

  try {
    const res = await fetch(`/api/admin/submissions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-teacher-code': code },
    });
    if (res.ok) {
      const data = (await res.json()) as { submissions?: StoredSubmission[] };
      if (Array.isArray(data.submissions)) {
        return data.submissions;
      }
    }
  } catch {
    // Fall back to localUpdated
  }
  return localUpdated;
}

export async function downloadMasterCsv(
  code: string,
  fallbackSubmissions: StoredSubmission[]
): Promise<void> {
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

  const csvContent = buildSubmissionsCsv(fallbackSubmissions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'Registro_Notas_Ciencias_SPS_2026.csv');
}

export async function downloadOfficialReport(code: string): Promise<void> {
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
