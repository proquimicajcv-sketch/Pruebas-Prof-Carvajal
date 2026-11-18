import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';
import type { InfractionEvent, StoredSubmission, StudentSession, UserAnswers } from './src/types/exam.ts';
import { CHEMISTRY_10_CLOSED, TEACHER_SECRET_CODE } from './src/data/examData.ts';
import { BIOLOGY_UNLOCK_ISO, biologyExamData, isBiologyScheduledOpen } from './src/data/biologyExamData.ts';
import { buildSubmissionsCsv, evaluateFullSubmission } from './src/utils/grading.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const SUBMISSIONS_JSON_PATH = path.join(DATA_DIR, 'registro_notas_sps.json');
const SUBMISSIONS_CSV_PATH = path.join(DATA_DIR, 'registro_notas_sps.csv');
const LOCKED_EMAILS_PATH = path.join(DATA_DIR, 'locked_emails.json');
const UNLOCKED_EMAILS_PATH = path.join(DATA_DIR, 'unlocked_emails.json');
const BIOLOGY_UNLOCK_PATH = path.join(DATA_DIR, 'biology_unlock.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSubmissions(): StoredSubmission[] {
  ensureDataDir();
  if (!fs.existsSync(SUBMISSIONS_JSON_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(SUBMISSIONS_JSON_PATH, 'utf-8');
    return JSON.parse(raw) as StoredSubmission[];
  } catch {
    return [];
  }
}

function writeSubmissions(submissions: StoredSubmission[]): void {
  ensureDataDir();
  fs.writeFileSync(SUBMISSIONS_JSON_PATH, JSON.stringify(submissions, null, 2), 'utf-8');
  const csv = buildSubmissionsCsv(submissions);
  fs.writeFileSync(SUBMISSIONS_CSV_PATH, csv, 'utf-8');
}

function readLockedEmails(): Record<string, boolean | number> {
  ensureDataDir();
  if (!fs.existsSync(LOCKED_EMAILS_PATH)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(LOCKED_EMAILS_PATH, 'utf-8');
    return JSON.parse(raw) as Record<string, boolean | number>;
  } catch {
    return {};
  }
}

function writeLockedEmails(locked: Record<string, boolean | number>): void {
  ensureDataDir();
  fs.writeFileSync(LOCKED_EMAILS_PATH, JSON.stringify(locked, null, 2), 'utf-8');
}

function readUnlockedTimestamps(): Record<string, number> {
  ensureDataDir();
  if (!fs.existsSync(UNLOCKED_EMAILS_PATH)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(UNLOCKED_EMAILS_PATH, 'utf-8');
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeUnlockedTimestamps(unlocked: Record<string, number>): void {
  ensureDataDir();
  fs.writeFileSync(UNLOCKED_EMAILS_PATH, JSON.stringify(unlocked, null, 2), 'utf-8');
}

function recordUnlockedTimestamp(email?: string, ts: number = Date.now()): number {
  const unlocked = readUnlockedTimestamps();
  if (email) {
    unlocked[email] = Math.max(unlocked[email] || 0, ts);
  } else {
    unlocked._global = Math.max(unlocked._global || 0, ts);
  }
  writeUnlockedTimestamps(unlocked);
  return ts;
}

function readBiologyEarlyUnlock(): boolean {
  ensureDataDir();
  if (!fs.existsSync(BIOLOGY_UNLOCK_PATH)) {
    return false;
  }
  try {
    const raw = fs.readFileSync(BIOLOGY_UNLOCK_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as { earlyUnlocked?: boolean };
    return Boolean(parsed.earlyUnlocked);
  } catch {
    return false;
  }
}

function writeBiologyEarlyUnlock(earlyUnlocked: boolean): void {
  ensureDataDir();
  fs.writeFileSync(BIOLOGY_UNLOCK_PATH, JSON.stringify({ earlyUnlocked }, null, 2), 'utf-8');
}

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOfficialHtmlReport(submissions: StoredSubmission[]): string {
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

function requireTeacherCode(req: Request, res: Response, next: NextFunction): void {
  const headerCode = String(req.headers['x-teacher-code'] ?? '').trim();
  const queryCode = String(req.query.code ?? '').trim();
  const provided = headerCode || queryCode;

  if (provided !== TEACHER_SECRET_CODE) {
    res.status(401).json({ error: 'Código de administrador inválido o no autorizado.' });
    return;
  }
  next();
}

function collectFilesSignature(dirPath: string, hash: crypto.Hash): void {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'data' || entry.name.startsWith('.')) {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFilesSignature(fullPath, hash);
    } else if (entry.isFile()) {
      const stat = fs.statSync(fullPath);
      hash.update(`${fullPath}:${stat.size}:${Math.floor(stat.mtimeMs)}|`);
    }
  }
}

function computeBuildHash(): string {
  const hash = crypto.createHash('sha256');
  const distIndex = path.resolve(__dirname, 'dist', 'index.html');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distIndex)) {
    collectFilesSignature(path.resolve(__dirname, 'dist'), hash);
  } else {
    collectFilesSignature(path.resolve(__dirname, 'src'), hash);
    const pkgPath = path.resolve(__dirname, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const stat = fs.statSync(pkgPath);
      hash.update(`package.json:${stat.size}:${Math.floor(stat.mtimeMs)}`);
    }
  }
  return hash.digest('hex').slice(0, 16);
}

type RealtimeBroadcastEvent =
  | {
      type: 'sync:init';
      buildHash: string;
      biologyStatus: {
        unlocked: boolean;
        scheduledOpen: boolean;
        earlyUnlocked: boolean;
      };
    }
  | {
      type: 'biology:status';
      unlocked: boolean;
      scheduledOpen: boolean;
      earlyUnlocked: boolean;
    }
  | {
      type: 'lock:updated';
      email: string | null;
      locked: boolean;
      unlockedAt?: number;
    }
  | {
      type: 'submissions:updated';
      email: string | null;
      locked: boolean;
      unlockedAt?: number;
    };

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '3mb' }));

  ensureDataDir();
  const buildHash = computeBuildHash();
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const broadcast = (payload: RealtimeBroadcastEvent): void => {
    const serialized = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    }
  };

  interface AliveWebSocket extends WebSocket {
    isAlive?: boolean;
  }

  wss.on('connection', (ws: AliveWebSocket) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    const earlyUnlocked = readBiologyEarlyUnlock();
    const scheduledOpen = isBiologyScheduledOpen();
    const initPayload: RealtimeBroadcastEvent = {
      type: 'sync:init',
      buildHash,
      biologyStatus: {
        unlocked: scheduledOpen || earlyUnlocked,
        scheduledOpen,
        earlyUnlocked,
      },
    };
    ws.send(JSON.stringify(initPayload));
  });

  const heartbeatInterval = setInterval(() => {
    for (const rawClient of wss.clients) {
      const client = rawClient as AliveWebSocket;
      if (client.isAlive === false) {
        client.terminate();
        continue;
      }
      client.isAlive = false;
      client.ping();
    }
  }, 25000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  app.get('/api/biology-status', (_req: Request, res: Response) => {
    const earlyUnlocked = readBiologyEarlyUnlock();
    const scheduledOpen = isBiologyScheduledOpen();
    res.json({
      unlocked: scheduledOpen || earlyUnlocked,
      scheduledOpen,
      earlyUnlocked,
      unlockAtIso: BIOLOGY_UNLOCK_ISO,
    });
  });

  app.get('/api/check-lock', (req: Request, res: Response) => {
    const email = String(req.query.email ?? '').trim().toLowerCase();
    if (!email) {
      res.json({ locked: false, unlockedAt: 0 });
      return;
    }
    const locked = readLockedEmails();
    const unlocked = readUnlockedTimestamps();
    const rawLocked = locked[email];
    const unlockedAt = Math.max(unlocked._global || 0, unlocked[email] || 0);
    res.json({
      locked: Boolean(rawLocked),
      lockedAt: typeof rawLocked === 'number' ? rawLocked : rawLocked ? 1 : 0,
      unlockedAt,
    });
  });

  app.post('/api/lock', (req: Request, res: Response) => {
    const email = String((req.body as { email?: string })?.email ?? '')
      .trim()
      .toLowerCase();
    if (!email || !email.endsWith('@sps.ed.cr')) {
      res.status(400).json({ error: 'Correo institucional inválido.' });
      return;
    }
    const locked = readLockedEmails();
    const now = Date.now();
    locked[email] = now;
    writeLockedEmails(locked);
    broadcast({
      type: 'lock:updated',
      email,
      locked: true,
    });
    res.json({ ok: true, lockedAt: now });
  });

  app.post('/api/submissions', (req: Request, res: Response) => {
    const body = req.body as {
      id?: string;
      submittedAt?: string;
      student?: StudentSession;
      answers?: UserAnswers;
      infractions?: InfractionEvent[];
      lockedOut?: boolean;
    };

    if (!body?.student?.email || !body?.student?.name || !body?.student?.level || !body?.answers) {
      res.status(400).json({ error: 'Datos de evaluación incompletos.' });
      return;
    }

    const email = body.student.email.trim().toLowerCase();
    if (!email.endsWith('@sps.ed.cr')) {
      res.status(400).json({ error: 'Correo institucional inválido.' });
      return;
    }

    if (
      (body.student.level === '10-quim-isa' || body.student.level === '10-bio-isa') &&
      email !== 'iantonino@sps.ed.cr'
    ) {
      res.status(403).json({ error: 'Evaluación no disponible para este usuario.' });
      return;
    }

    if (body.student.level === 10 && CHEMISTRY_10_CLOSED) {
      res.status(403).json({ error: 'La prueba de 10.° Química se encuentra cerrada.' });
      return;
    }

    const isScheduledLevel =
      body.student.level === 7 ||
      body.student.level === 8 ||
      body.student.level === 9 ||
      body.student.level === '10-bio';
    if (isScheduledLevel && !isBiologyScheduledOpen() && !readBiologyEarlyUnlock()) {
      res.status(403).json({ error: 'Esta evaluación aún no se encuentra habilitada.' });
      return;
    }

    const student: StudentSession = {
      email,
      name: body.student.name.trim(),
      level: body.student.level,
    };

    const safeId =
      typeof body.id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(body.id)
        ? body.id
        : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const safeSubmittedAt =
      typeof body.submittedAt === 'string' && !Number.isNaN(Date.parse(body.submittedAt))
        ? body.submittedAt
        : new Date().toISOString();

    const gradeBreakdown = evaluateFullSubmission(student.level, body.answers);
    const submission: StoredSubmission = {
      id: safeId,
      student,
      submittedAt: safeSubmittedAt,
      answers: body.answers,
      infractions: Array.isArray(body.infractions) ? body.infractions : [],
      lockedOut: Boolean(body.lockedOut),
      objectiveScore: {
        selection: gradeBreakdown.selection,
        selectionTotal: gradeBreakdown.selectionTotal,
        matching: gradeBreakdown.matching,
        matchingTotal: gradeBreakdown.matchingTotal,
        completes: gradeBreakdown.completes,
        completesTotal: gradeBreakdown.completesTotal,
        totalEarned:
          gradeBreakdown.selection + gradeBreakdown.matching + gradeBreakdown.completes,
        totalPossible:
          gradeBreakdown.selectionTotal +
          gradeBreakdown.matchingTotal +
          gradeBreakdown.completesTotal,
      },
      gradeBreakdown,
    };

    const existing = readSubmissions().filter((s) => s.id !== submission.id);
    const updated = [submission, ...existing];
    writeSubmissions(updated);

    const locked = readLockedEmails();
    locked[email] = Date.now();
    writeLockedEmails(locked);

    broadcast({
      type: 'submissions:updated',
      email,
      locked: true,
    });

    res.status(201).json({
      ok: true,
      id: submission.id,
      submittedAt: submission.submittedAt,
    });
  });

  app.post('/api/admin/verify', (req: Request, res: Response) => {
    const code = String((req.body as { code?: string })?.code ?? '').trim();
    if (code !== TEACHER_SECRET_CODE) {
      res.status(401).json({ ok: false, error: 'Código incorrecto.' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/admin/biology-unlock', requireTeacherCode, (req: Request, res: Response) => {
    const earlyUnlocked = Boolean((req.body as { earlyUnlocked?: boolean })?.earlyUnlocked);
    writeBiologyEarlyUnlock(earlyUnlocked);
    const scheduledOpen = isBiologyScheduledOpen();
    const unlocked = scheduledOpen || earlyUnlocked;
    broadcast({
      type: 'biology:status',
      earlyUnlocked,
      scheduledOpen,
      unlocked,
    });
    res.json({
      ok: true,
      earlyUnlocked,
      unlocked,
    });
  });

  app.get('/api/admin/submissions', requireTeacherCode, (_req: Request, res: Response) => {
    const submissions = readSubmissions();
    res.json({ submissions });
  });

  app.post('/api/admin/sync-submissions', requireTeacherCode, (req: Request, res: Response) => {
    const incoming = (req.body as { submissions?: StoredSubmission[] })?.submissions;
    if (!Array.isArray(incoming)) {
      res.status(400).json({ error: 'Lista de entregas inválida.' });
      return;
    }
    const existing = readSubmissions();
    const byId = new Map<string, StoredSubmission>();
    for (const item of [...existing, ...incoming]) {
      if (item && item.id && item.student?.email) {
        byId.set(item.id, item);
      }
    }
    const merged = Array.from(byId.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    writeSubmissions(merged);
    res.json({ ok: true, submissions: merged });
  });

  app.get('/api/admin/export/csv', requireTeacherCode, (_req: Request, res: Response) => {
    const submissions = readSubmissions();
    const csv = buildSubmissionsCsv(submissions);
    writeSubmissions(submissions);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Registro_Notas_Ciencias_SPS_2026.csv"'
    );
    res.send(csv);
  });

  app.get('/api/admin/export/report', requireTeacherCode, (_req: Request, res: Response) => {
    const submissions = readSubmissions();
    const html = buildOfficialHtmlReport(submissions);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Acta_Notas_Ciencias_SPS_2026.html"'
    );
    res.send(html);
  });

  app.post('/api/admin/unlock', requireTeacherCode, (req: Request, res: Response) => {
    const email = String((req.body as { email?: string })?.email ?? '')
      .trim()
      .toLowerCase();
    const unlockedAt = recordUnlockedTimestamp(email || undefined);
    if (email) {
      const locked = readLockedEmails();
      delete locked[email];
      writeLockedEmails(locked);
    } else {
      writeLockedEmails({});
    }
    broadcast({
      type: 'lock:updated',
      email: email || null,
      locked: false,
      unlockedAt,
    });
    res.json({ ok: true, unlockedAt });
  });

  app.delete('/api/admin/submissions/:id', requireTeacherCode, (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = readSubmissions();
    const target = existing.find((s) => s.id === id);
    const updated = existing.filter((s) => s.id !== id);
    writeSubmissions(updated);

    let unlockedEmail: string | null = null;
    let unlockedAt: number | undefined;
    if (target) {
      unlockedEmail = target.student.email.toLowerCase();
      const locked = readLockedEmails();
      delete locked[unlockedEmail];
      writeLockedEmails(locked);
      unlockedAt = recordUnlockedTimestamp(unlockedEmail);
    }

    broadcast({
      type: 'submissions:updated',
      email: unlockedEmail,
      locked: false,
      unlockedAt,
    });

    res.json({ ok: true, submissions: updated });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Saint Peter's School Assessment server listening on port ${PORT}`);
  });
}

void startServer();
