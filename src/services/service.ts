import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { reactive, ref } from 'vue';
import { loadRingtoneLibrary, startAlarmRingtoneLoop, stopAlarmRingtone } from '@/services/ringtone';

export type ProjectStatus = 'todo' | 'done' | 'trash';
export type TaskStatus = 'todo' | 'done';
export type PomodoroPhase = 'work' | 'break';
export type Language = 'fr' | 'en' | 'mg';
export type FontChoice =
  | 'Inter'
  | 'Roboto'
  | 'Nunito'
  | 'Poppins'
  | 'Lato'
  | 'Montserrat'
  | 'Open Sans'
  | 'Playfair Display';
export type ViewMode = 'todo' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  status: TaskStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  elapsedSeconds: number;
  status: ProjectStatus;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

interface TimerState {
  activeProjectId: string | null;
  activeTaskId: string | null;
  phase: PomodoroPhase;
  remainingSeconds: number;
  isRunning: boolean;
  waitingForConfirm: boolean;
  projectTimers: Record<string, ProjectTimerSnapshot>;
}

interface ProjectTimerSnapshot {
  activeTaskId: string | null;
  phase: PomodoroPhase;
  remainingSeconds: number;
  waitingForConfirm: boolean;
}

interface AppSettings {
  language: Language;
  font: FontChoice;
}

interface LocalPayload {
  projects: Project[];
  settings: AppSettings;
  timer: TimerState;
}

const LOCAL_STORAGE_KEY = 'pomodoro.projects.v2';
const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const NOTIFICATION_CHANNEL_ID = 'pomodoro-timer';
const RUNNING_NOTIFICATION_ID = 61001;
const TRANSITION_NOTIFICATION_ID = 61002;

const defaultSettings: AppSettings = {
  language: 'fr',
  font: 'Nunito',
};

const defaultTimer: TimerState = {
  activeProjectId: null,
  activeTaskId: null,
  phase: 'work',
  remainingSeconds: WORK_SECONDS,
  isRunning: false,
  waitingForConfirm: false,
  projectTimers: {},
};

export const projects = ref<Project[]>([]);
export const activeMode = ref<ViewMode>('todo');
export const appSettings = reactive<AppSettings>({ ...defaultSettings });
export const timerState = reactive<TimerState>({ ...defaultTimer });
export const isReady = ref(false);
export const isSelectionHeaderActive = ref(false);

let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;
let initialized = false;
let timerHandle: ReturnType<typeof setInterval> | null = null;
let bellHandle: ReturnType<typeof setInterval> | null = null;
let nativeNotificationsConfigured = false;
let nativeNotificationListenersBound = false;
let lastRunningNotificationSync = 0;

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isNative(): boolean {
  return Capacitor.getPlatform() !== 'web';
}

function canUseNativeNotifications(): boolean {
  return isNative();
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return fallback;
  }
  return n;
}

function parseTask(raw: Partial<Task> & { duration?: number; name?: string }, projectId: string, index: number): Task {
  return {
    id: raw.id ?? generateId(),
    projectId,
    title: (raw.title ?? raw.name ?? '').toString(),
    description: (raw.description ?? '').toString(),
    durationHours: Math.max(0, sanitizeNumber(raw.durationHours, 0)),
    durationMinutes: Math.max(0, Math.min(59, sanitizeNumber(raw.durationMinutes ?? raw.duration, 25))),
    durationSeconds: Math.max(0, Math.min(59, sanitizeNumber(raw.durationSeconds, 0))),
    status: raw.status === 'done' ? 'done' : 'todo',
    order: Math.max(0, sanitizeNumber(raw.order, index)),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

function parseProject(raw: Partial<Project> & { duration?: number; tasks?: Array<Partial<Task>> }): Project {
  const id = raw.id ?? generateId();
  const parsedTasks = Array.isArray(raw.tasks)
    ? raw.tasks.map((task, index) => parseTask(task, id, index)).sort((a, b) => a.order - b.order)
    : [];

  const parsed: Project = {
    id,
    title: (raw.title ?? '').toString(),
    description: (raw.description ?? '').toString(),
    durationHours: Math.max(0, sanitizeNumber(raw.durationHours, 0)),
    durationMinutes: Math.max(0, Math.min(59, sanitizeNumber(raw.durationMinutes ?? raw.duration, 25))),
    durationSeconds: Math.max(0, Math.min(59, sanitizeNumber(raw.durationSeconds, 0))),
    elapsedSeconds: Math.max(0, sanitizeNumber(raw.elapsedSeconds, 0)),
    status: (raw.status ?? 'todo') as ProjectStatus,
    tasks: parsedTasks,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };

  return recomputeProjectMetrics(parsed);
}

function parseTimer(raw: Partial<TimerState> | undefined): TimerState {
  if (!raw) {
    return { ...defaultTimer };
  }

  const parsedProjectTimers: Record<string, ProjectTimerSnapshot> = {};
  if (raw.projectTimers && typeof raw.projectTimers === 'object') {
    for (const [projectId, snapshot] of Object.entries(raw.projectTimers)) {
      const safe = snapshot as Partial<ProjectTimerSnapshot>;
      parsedProjectTimers[projectId] = {
        activeTaskId: safe.activeTaskId ?? null,
        phase: safe.phase === 'break' ? 'break' : 'work',
        remainingSeconds: Math.max(0, sanitizeNumber(safe.remainingSeconds, WORK_SECONDS)),
        waitingForConfirm: Boolean(safe.waitingForConfirm),
      };
    }
  }

  return {
    activeProjectId: raw.activeProjectId ?? null,
    activeTaskId: raw.activeTaskId ?? null,
    phase: raw.phase === 'break' ? 'break' : 'work',
    remainingSeconds: Math.max(0, sanitizeNumber(raw.remainingSeconds, WORK_SECONDS)),
    isRunning: Boolean(raw.isRunning),
    waitingForConfirm: Boolean(raw.waitingForConfirm),
    projectTimers: parsedProjectTimers,
  };
}

function parseLocalStoragePayload(rawValue: string | null): LocalPayload {
  if (!rawValue) {
    return {
      projects: [],
      settings: { ...defaultSettings },
      timer: { ...defaultTimer },
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<LocalPayload>;

    return {
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((project) => parseProject(project as Partial<Project> & { duration?: number; tasks?: Array<Partial<Task>> }))
        : [],
      settings: {
        language: parsed.settings?.language ?? defaultSettings.language,
        font: parsed.settings?.font ?? defaultSettings.font,
      },
      timer: parseTimer(parsed.timer),
    };
  } catch {
    return {
      projects: [],
      settings: { ...defaultSettings },
      timer: { ...defaultTimer },
    };
  }
}

function applySettingsToDocument(): void {
  document.documentElement.setAttribute('lang', appSettings.language);
  document.documentElement.style.setProperty('--app-font-family', `'${appSettings.font}', sans-serif`);
}

function durationToSeconds(hours: number, minutes: number, seconds: number): number {
  return (Math.max(0, hours) * 3600) + (Math.max(0, minutes) * 60) + Math.max(0, seconds);
}

function secondsToDuration(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return { hours, minutes, seconds };
}

function recomputeProjectMetrics(project: Project): Project {
  const sorted = [...project.tasks].sort((a, b) => a.order - b.order).map((task, index) => ({ ...task, order: index }));
  const totalSeconds = sorted.reduce((acc, task) => acc + durationToSeconds(task.durationHours, task.durationMinutes, task.durationSeconds), 0);
  const computedDuration = secondsToDuration(totalSeconds);
  const hasTasks = sorted.length > 0;
  const allDone = hasTasks && sorted.every((task) => task.status === 'done');

  const status = project.status === 'trash' ? 'trash' : (allDone ? 'done' : 'todo');

  return {
    ...project,
    tasks: sorted,
    durationHours: computedDuration.hours,
    durationMinutes: computedDuration.minutes,
    durationSeconds: computedDuration.seconds,
    status,
    elapsedSeconds: Math.min(project.elapsedSeconds, totalSeconds),
  };
}

function sortAndFixProjects(projectList: Project[]): Project[] {
  return projectList
    .map((project) => recomputeProjectMetrics(project))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function connectDb(): Promise<void> {
  if (!isNative()) {
    return;
  }

  if (db) {
    return;
  }

  sqlite = new SQLiteConnection(CapacitorSQLite);
  db = await sqlite.createConnection('pomodoro_db', false, 'no-encryption', 1, false);
  await db.open();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_hours INTEGER NOT NULL DEFAULT 0,
      duration_minutes INTEGER NOT NULL DEFAULT 25,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      elapsed_seconds INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      tasks_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const tableInfo = await db.query('PRAGMA table_info(projects);');
  const columnNames = new Set((tableInfo.values ?? []).map((column) => String(column.name)));

  if (!columnNames.has('duration_hours')) {
    await db.execute('ALTER TABLE projects ADD COLUMN duration_hours INTEGER NOT NULL DEFAULT 0;');
  }
  if (!columnNames.has('duration_minutes')) {
    await db.execute('ALTER TABLE projects ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 25;');
  }
  if (!columnNames.has('duration_seconds')) {
    await db.execute('ALTER TABLE projects ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 0;');
  }
  if (!columnNames.has('elapsed_seconds')) {
    await db.execute('ALTER TABLE projects ADD COLUMN elapsed_seconds INTEGER NOT NULL DEFAULT 0;');
  }
  if (!columnNames.has('tasks_json')) {
    await db.execute("ALTER TABLE projects ADD COLUMN tasks_json TEXT NOT NULL DEFAULT '[]';");
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      language TEXT NOT NULL,
      font TEXT NOT NULL,
      timer_state TEXT NOT NULL DEFAULT '{}'
    );
  `);

  const settingsInfo = await db.query('PRAGMA table_info(settings);');
  const settingsColumns = new Set((settingsInfo.values ?? []).map((column) => String(column.name)));
  if (!settingsColumns.has('timer_state')) {
    await db.execute("ALTER TABLE settings ADD COLUMN timer_state TEXT NOT NULL DEFAULT '{}';");
  }
}

async function loadFromSQLite(): Promise<void> {
  await connectDb();

  if (!db) {
    return;
  }

  const projectsResult = await db.query(
    'SELECT id, title, description, duration_hours, duration_minutes, duration_seconds, elapsed_seconds, status, tasks_json, created_at, updated_at FROM projects ORDER BY created_at DESC;'
  );

  projects.value = sortAndFixProjects((projectsResult.values ?? []).map((row) => {
    let parsedTasks: Task[] = [];

    try {
      const raw = JSON.parse(String(row.tasks_json ?? '[]')) as Array<Partial<Task>>;
      parsedTasks = raw.map((task, index) => parseTask(task, String(row.id), index));
    } catch {
      parsedTasks = [];
    }

    return parseProject({
      id: String(row.id),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      durationHours: sanitizeNumber(row.duration_hours, 0),
      durationMinutes: sanitizeNumber(row.duration_minutes, 25),
      durationSeconds: sanitizeNumber(row.duration_seconds, 0),
      elapsedSeconds: sanitizeNumber(row.elapsed_seconds, 0),
      status: (row.status as ProjectStatus) ?? 'todo',
      tasks: parsedTasks,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    });
  }));

  const settingsResult = await db.query('SELECT language, font, timer_state FROM settings WHERE id = 1;');
  const row = settingsResult.values?.[0];

  appSettings.language = (row?.language as Language | undefined) ?? defaultSettings.language;
  appSettings.font = (row?.font as FontChoice | undefined) ?? defaultSettings.font;

  let timer: TimerState = { ...defaultTimer };
  if (row?.timer_state) {
    try {
      timer = parseTimer(JSON.parse(String(row.timer_state)) as Partial<TimerState>);
    } catch {
      timer = { ...defaultTimer };
    }
  }

  setTimerState(timer);
}

async function saveToSQLite(): Promise<void> {
  await connectDb();

  if (!db) {
    return;
  }

  await db.execute('DELETE FROM projects;');

  for (const project of projects.value) {
    await db.run(
      `
      INSERT INTO projects (id, title, description, duration_hours, duration_minutes, duration_seconds, elapsed_seconds, status, tasks_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        project.id,
        project.title,
        project.description,
        project.durationHours,
        project.durationMinutes,
        project.durationSeconds,
        project.elapsedSeconds,
        project.status,
        JSON.stringify(project.tasks),
        project.createdAt,
        project.updatedAt,
      ]
    );
  }

  await db.run(
    `
    INSERT OR REPLACE INTO settings (id, language, font, timer_state)
    VALUES (1, ?, ?, ?);
    `,
    [appSettings.language, appSettings.font, JSON.stringify(timerState)]
  );
}

function loadFromLocalStorage(): void {
  const payload = parseLocalStoragePayload(localStorage.getItem(LOCAL_STORAGE_KEY));
  projects.value = sortAndFixProjects(payload.projects);
  appSettings.language = payload.settings.language;
  appSettings.font = payload.settings.font;
  setTimerState(payload.timer);
}

function saveToLocalStorage(): void {
  const payload: LocalPayload = {
    projects: projects.value,
    settings: {
      language: appSettings.language,
      font: appSettings.font,
    },
    timer: { ...timerState },
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
}

function setTimerState(next: TimerState): void {
  timerState.activeProjectId = next.activeProjectId;
  timerState.activeTaskId = next.activeTaskId;
  timerState.phase = next.phase;
  timerState.remainingSeconds = next.remainingSeconds;
  timerState.isRunning = next.isRunning;
  timerState.waitingForConfirm = next.waitingForConfirm;
  timerState.projectTimers = { ...(next.projectTimers ?? {}) };
}

function saveActiveProjectSnapshot(): void {
  if (!timerState.activeProjectId) {
    return;
  }

  timerState.projectTimers[timerState.activeProjectId] = {
    activeTaskId: timerState.activeTaskId,
    phase: timerState.phase,
    remainingSeconds: timerState.remainingSeconds,
    waitingForConfirm: timerState.waitingForConfirm,
  };
}

function clearProjectSnapshot(projectId: string): void {
  if (!timerState.projectTimers[projectId]) {
    return;
  }

  delete timerState.projectTimers[projectId];
}

function resolveProjectTimerState(project: Project): ProjectTimerSnapshot {
  const snapshot = timerState.projectTimers[project.id];
  const snapshotTask = snapshot?.activeTaskId ? getTaskById(project.id, snapshot.activeTaskId) : undefined;
  const activeTaskId = snapshotTask && snapshotTask.status === 'todo'
    ? snapshotTask.id
    : (findFirstTodoTask(project)?.id ?? null);

  if (snapshot?.phase === 'break') {
    return {
      activeTaskId,
      phase: 'work',
      remainingSeconds: WORK_SECONDS,
      waitingForConfirm: false,
    };
  }

  return {
    activeTaskId,
    phase: 'work',
    remainingSeconds: Math.max(0, snapshot?.remainingSeconds ?? WORK_SECONDS),
    waitingForConfirm: Boolean(snapshot?.waitingForConfirm),
  };
}

async function persistAll(): Promise<void> {
  if (isNative()) {
    await saveToSQLite();
  } else {
    saveToLocalStorage();
  }

  applySettingsToDocument();
}

function findFirstTodoTask(project: Project): Task | undefined {
  return [...project.tasks]
    .sort((a, b) => a.order - b.order)
    .find((task) => task.status === 'todo');
}

function updateProjectInState(projectId: string, updater: (project: Project) => Project): void {
  projects.value = projects.value.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    const updated = updater(project);
    return recomputeProjectMetrics({
      ...updated,
      updatedAt: new Date().toISOString(),
    });
  });
}

function stopBell(): void {
  if (bellHandle) {
    clearInterval(bellHandle);
    bellHandle = null;
  }

  stopAlarmRingtone();
}

function playBellLoop(): void {
  stopBell();
  void startAlarmRingtoneLoop();
}

async function clearNativeNotifications(ids: number[]): Promise<void> {
  if (!canUseNativeNotifications() || ids.length === 0) {
    return;
  }

  try {
    await LocalNotifications.removeDeliveredNotifications({
      notifications: ids.map((id) => ({ id, title: '', body: '' })),
    });
  } catch {
    // Ignore plugin errors to keep timer flow resilient.
  }

  try {
    await LocalNotifications.cancel({
      notifications: ids.map((id) => ({ id })),
    });
  } catch {
    // Ignore plugin errors to keep timer flow resilient.
  }
}

async function clearRunningNotification(): Promise<void> {
  await clearNativeNotifications([RUNNING_NOTIFICATION_ID]);
}

async function clearTransitionNotification(): Promise<void> {
  await clearNativeNotifications([TRANSITION_NOTIFICATION_ID]);
}

async function configureNativeNotifications(): Promise<void> {
  if (!canUseNativeNotifications()) {
    return;
  }

  if (!nativeNotificationListenersBound) {
    nativeNotificationListenersBound = true;

    await LocalNotifications.addListener('localNotificationActionPerformed', () => {
      if (timerState.waitingForConfirm) {
        void acknowledgeTimerTransition();
      }
    });
  }

  if (nativeNotificationsConfigured) {
    return;
  }

  const status = await LocalNotifications.checkPermissions();
  if (status.display !== 'granted') {
    const requested = await LocalNotifications.requestPermissions();
    if (requested.display !== 'granted') {
      return;
    }
  }

  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Pomodoro Timer',
      description: 'Notifications du chronometre Pomodoro',
      importance: 5,
      vibration: true,
      visibility: 1,
    });
  } catch {
    // Channel may already exist on Android; safe to ignore.
  }

  nativeNotificationsConfigured = true;
}

async function syncRunningNotification(force = false): Promise<void> {
  if (!canUseNativeNotifications()) {
    return;
  }

  if (!timerState.isRunning || !timerState.activeProjectId || timerState.waitingForConfirm) {
    await clearRunningNotification();
    return;
  }

  await configureNativeNotifications();
  if (!nativeNotificationsConfigured) {
    return;
  }

  const now = Date.now();
  if (!force && now - lastRunningNotificationSync < 1000) {
    return;
  }
  lastRunningNotificationSync = now;

  const project = getProjectById(timerState.activeProjectId);
  if (!project) {
    return;
  }

  const activeTask = timerState.activeTaskId ? getTaskById(project.id, timerState.activeTaskId) : undefined;
  const taskName = activeTask?.title?.trim() || 'Tache en cours';
  const chrono = formatCountdown(timerState.remainingSeconds);

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: RUNNING_NOTIFICATION_ID,
          title: project.title || 'Pomodoro',
          body: `${taskName} - ${chrono}`,
          channelId: NOTIFICATION_CHANNEL_ID,
          ongoing: true,
          autoCancel: false,
          extra: {
            type: 'running',
            projectId: project.id,
            taskId: activeTask?.id ?? null,
          },
        },
      ],
    });
  } catch {
    // Notification update failure should not stop timer updates.
  }
}

async function showNativeTransitionNotification(title: string, body: string): Promise<void> {
  if (!canUseNativeNotifications()) {
    return;
  }

  await configureNativeNotifications();
  if (!nativeNotificationsConfigured) {
    return;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: TRANSITION_NOTIFICATION_ID,
          title,
          body,
          channelId: NOTIFICATION_CHANNEL_ID,
          ongoing: true,
          autoCancel: false,
          extra: {
            type: 'transition',
            projectId: timerState.activeProjectId,
            taskId: timerState.activeTaskId,
          },
        },
      ],
    });
  } catch {
    // Ignore plugin notification failures and keep app responsive.
  }
}

async function showNotification(title: string, body: string): Promise<void> {
  if (canUseNativeNotifications()) {
    await showNativeTransitionNotification(title, body);
    return;
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    const n = new Notification(title, { body, requireInteraction: true });
    n.onclick = () => {
      void acknowledgeTimerTransition();
      n.close();
      window.focus();
    };
  }
}

function clearTimerLoop(): void {
  if (!timerHandle) {
    return;
  }

  clearInterval(timerHandle);
  timerHandle = null;
}

function stopSessionInternal(resetCountdown: boolean): void {
  clearTimerLoop();
  timerState.isRunning = false;
  timerState.waitingForConfirm = false;
  void clearRunningNotification();
  void clearTransitionNotification();
  stopBell();
  if (resetCountdown) {
    timerState.phase = 'work';
    timerState.remainingSeconds = WORK_SECONDS;
  }
}

async function onWorkSegmentFinished(): Promise<void> {
  const previousProjectId = timerState.activeProjectId;
  const project = timerState.activeProjectId ? getProjectById(timerState.activeProjectId) : undefined;
  const taskId = timerState.activeTaskId;

  if (project && taskId) {
    updateProjectInState(project.id, (current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId || task.status === 'done') {
          return task;
        }
        return {
          ...task,
          status: 'done',
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }

  const updatedProject = timerState.activeProjectId ? getProjectById(timerState.activeProjectId) : undefined;
  const nextTask = updatedProject ? findFirstTodoTask(updatedProject) : undefined;

  if (!updatedProject || !nextTask) {
    timerState.activeTaskId = null;
    timerState.activeProjectId = null;
    if (previousProjectId) {
      clearProjectSnapshot(previousProjectId);
    }
    stopSessionInternal(true);
    await persistAll();
    return;
  }

  timerState.activeTaskId = nextTask.id;
  saveActiveProjectSnapshot();
}

async function handleIntervalFinished(): Promise<void> {
  clearTimerLoop();
  timerState.isRunning = false;
  timerState.waitingForConfirm = true;
  await clearRunningNotification();

  const activeProject = timerState.activeProjectId ? getProjectById(timerState.activeProjectId) : undefined;
  const activeTask = activeProject?.tasks.find((task) => task.id === timerState.activeTaskId);

  if (timerState.phase === 'work') {
    await onWorkSegmentFinished();
  }

  if (!timerState.activeProjectId) {
    timerState.waitingForConfirm = false;
    stopBell();
    await persistAll();
    return;
  }

  const title = activeProject?.title ?? 'Pomodoro';
  const body = timerState.phase === 'work'
    ? `Fin de tache ${activeTask?.title ?? ''}. Cliquer pour continuer.`
    : 'Fin de pause. Cliquer pour continuer.';

  playBellLoop();
  await showNotification(title, body);
  await persistAll();
}

function tickRunningProject(): void {
  if (!timerState.isRunning || !timerState.activeProjectId || timerState.waitingForConfirm) {
    return;
  }

  timerState.remainingSeconds = Math.max(0, timerState.remainingSeconds - 1);
  saveActiveProjectSnapshot();

  if (timerState.phase === 'work') {
    updateProjectInState(timerState.activeProjectId, (project) => ({
      ...project,
      elapsedSeconds: project.elapsedSeconds + 1,
    }));
  }

  if (timerState.remainingSeconds % 5 === 0) {
    void syncRunningNotification();
  }

  if (timerState.remainingSeconds === 0) {
    void handleIntervalFinished();
  }
}

function ensureTimerLoop(): void {
  clearTimerLoop();

  if (!timerState.isRunning) {
    void clearRunningNotification();
    return;
  }

  void syncRunningNotification(true);

  timerHandle = setInterval(() => {
    tickRunningProject();
  }, 1000);
}

function getProjectSafe(projectId: string): Project | undefined {
  const p = getProjectById(projectId);
  if (!p || p.status !== 'todo') {
    return undefined;
  }
  return p;
}

function isProjectInteractionLocked(projectId: string): boolean {
  return Boolean(timerState.isRunning && timerState.activeProjectId && timerState.activeProjectId !== projectId);
}

function isTaskInteractionLocked(projectId: string, taskId: string): boolean {
  if (!timerState.isRunning || timerState.activeProjectId !== projectId) {
    return false;
  }

  const task = getTaskById(projectId, taskId);
  if (!task) {
    return false;
  }

  if (task.status === 'done' || timerState.activeTaskId === taskId) {
    return false;
  }

  return true;
}

export async function initializeAppData(): Promise<void> {
  if (initialized) {
    return;
  }

  loadRingtoneLibrary();

  if (isNative()) {
    await loadFromSQLite();
  } else {
    loadFromLocalStorage();
  }

  applySettingsToDocument();
  await configureNativeNotifications();
  initialized = true;
  isReady.value = true;
  ensureTimerLoop();
}

export function setActiveMode(mode: ViewMode): void {
  activeMode.value = mode;
}

export function setSelectionHeaderActive(active: boolean): void {
  isSelectionHeaderActive.value = active;
}

export async function setLanguage(language: Language): Promise<void> {
  appSettings.language = language;
  await persistAll();
}

export async function setFont(font: FontChoice): Promise<void> {
  appSettings.font = font;
  await persistAll();
}

export async function addProject(input: {
  title: string;
  description: string;
}): Promise<void> {
  const now = new Date().toISOString();

  projects.value = [
    {
      id: generateId(),
      title: input.title.trim(),
      description: input.description.trim(),
      durationHours: 0,
      durationMinutes: 0,
      durationSeconds: 0,
      elapsedSeconds: 0,
      status: 'todo',
      tasks: [],
      createdAt: now,
      updatedAt: now,
    },
    ...projects.value,
  ];

  await persistAll();
}

export async function updateProject(
  projectId: string,
  updates: { title: string; description: string }
): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    title: updates.title.trim(),
    description: updates.description.trim(),
  }));

  await persistAll();
}

export async function moveProjectToTrash(projectId: string): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    status: 'trash',
  }));

  if (timerState.activeProjectId === projectId) {
    stopSessionInternal(true);
    timerState.activeProjectId = null;
    timerState.activeTaskId = null;
  }

  clearProjectSnapshot(projectId);

  await persistAll();
}

export async function markProjectDone(projectId: string): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    status: 'done',
  }));

  await persistAll();
}

export async function markProjectTodo(projectId: string): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    status: 'todo',
  }));

  await persistAll();
}

export async function redoProject(projectId: string): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    status: 'todo',
    elapsedSeconds: 0,
    tasks: project.tasks.map((task) => ({
      ...task,
      status: 'todo',
      updatedAt: new Date().toISOString(),
    })),
  }));

  if (timerState.activeProjectId === projectId) {
    stopSessionInternal(true);
    timerState.activeProjectId = null;
    timerState.activeTaskId = null;
  }

  await persistAll();
}

export async function redoProjects(projectIds: string[]): Promise<void> {
  const idSet = new Set(projectIds);

  projects.value = projects.value.map((project) => {
    if (!idSet.has(project.id)) {
      return project;
    }

    return recomputeProjectMetrics({
      ...project,
      status: 'todo',
      elapsedSeconds: 0,
      tasks: project.tasks.map((task) => ({
        ...task,
        status: 'todo',
        updatedAt: new Date().toISOString(),
      })),
      updatedAt: new Date().toISOString(),
    });
  });

  if (timerState.activeProjectId && idSet.has(timerState.activeProjectId)) {
    stopSessionInternal(true);
    timerState.activeProjectId = null;
    timerState.activeTaskId = null;
  }

  await persistAll();
}

export async function restoreProject(projectId: string): Promise<void> {
  await markProjectTodo(projectId);
}

export async function deleteProjectPermanently(projectId: string): Promise<void> {
  projects.value = projects.value.filter((project) => project.id !== projectId);

  if (timerState.activeProjectId === projectId) {
    stopSessionInternal(true);
    timerState.activeProjectId = null;
    timerState.activeTaskId = null;
  }

  await persistAll();
}

export async function bulkChangeStatus(projectIds: string[], status: ProjectStatus): Promise<void> {
  const idSet = new Set(projectIds);

  projects.value = projects.value.map((project) => {
    if (!idSet.has(project.id)) {
      return project;
    }

    return recomputeProjectMetrics({
      ...project,
      status,
      updatedAt: new Date().toISOString(),
    });
  });

  if (timerState.activeProjectId && idSet.has(timerState.activeProjectId) && status !== 'todo') {
    stopSessionInternal(true);
    timerState.activeProjectId = null;
    timerState.activeTaskId = null;
  }

  await persistAll();
}

export async function bulkDeletePermanently(projectIds: string[]): Promise<void> {
  const idSet = new Set(projectIds);
  projects.value = projects.value.filter((project) => !idSet.has(project.id));

  if (timerState.activeProjectId && idSet.has(timerState.activeProjectId)) {
    stopSessionInternal(true);
    timerState.activeProjectId = null;
    timerState.activeTaskId = null;
  }

  await persistAll();
}

export async function addTask(projectId: string, input: {
  title: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
}): Promise<void> {
  const project = getProjectById(projectId);
  if (!project || project.status === 'trash') {
    return;
  }

  const now = new Date().toISOString();
  const task: Task = {
    id: generateId(),
    projectId,
    title: input.title.trim(),
    description: '',
    durationHours: Math.max(0, input.durationHours),
    durationMinutes: Math.max(0, Math.min(59, input.durationMinutes)),
    durationSeconds: Math.max(0, Math.min(59, input.durationSeconds)),
    status: 'todo',
    order: project.tasks.length,
    createdAt: now,
    updatedAt: now,
  };

  updateProjectInState(projectId, (current) => ({
    ...current,
    status: 'todo',
    tasks: [...current.tasks, task],
  }));

  if (timerState.activeProjectId === projectId && !timerState.activeTaskId) {
    timerState.activeTaskId = task.id;
  }

  await persistAll();
}

export async function updateTask(projectId: string, taskId: string, updates: {
  title: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
}): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    tasks: project.tasks.map((task) => {
      if (task.id !== taskId || task.status === 'done') {
        return task;
      }

      return {
        ...task,
        title: updates.title.trim(),
        durationHours: Math.max(0, updates.durationHours),
        durationMinutes: Math.max(0, Math.min(59, updates.durationMinutes)),
        durationSeconds: Math.max(0, Math.min(59, updates.durationSeconds)),
        updatedAt: new Date().toISOString(),
      };
    }),
  }));

  await persistAll();
}

export async function updateTaskDescription(projectId: string, taskId: string, description: string): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    tasks: project.tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      return {
        ...task,
        description,
        updatedAt: new Date().toISOString(),
      };
    }),
  }));

  await persistAll();
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    tasks: project.tasks.filter((task) => task.id !== taskId),
  }));

  if (timerState.activeTaskId === taskId) {
    const project = getProjectById(projectId);
    timerState.activeTaskId = project ? (findFirstTodoTask(project)?.id ?? null) : null;

    if (!timerState.activeTaskId) {
      stopSessionInternal(true);
      timerState.activeProjectId = null;
      clearProjectSnapshot(projectId);
    } else {
      saveActiveProjectSnapshot();
    }
  }

  await persistAll();
}

export async function deleteTasks(projectId: string, taskIds: string[]): Promise<void> {
  const idSet = new Set(taskIds);

  updateProjectInState(projectId, (project) => ({
    ...project,
    tasks: project.tasks.filter((task) => !idSet.has(task.id)),
  }));

  if (timerState.activeProjectId === projectId && timerState.activeTaskId && idSet.has(timerState.activeTaskId)) {
    const project = getProjectById(projectId);
    timerState.activeTaskId = project ? (findFirstTodoTask(project)?.id ?? null) : null;

    if (!timerState.activeTaskId) {
      stopSessionInternal(true);
      timerState.activeProjectId = null;
      clearProjectSnapshot(projectId);
    } else {
      saveActiveProjectSnapshot();
    }
  }

  await persistAll();
}

export async function reorderTasks(projectId: string, orderedTaskIds: string[]): Promise<void> {
  updateProjectInState(projectId, (project) => {
    const map = new Map(project.tasks.map((task) => [task.id, task]));

    const reordered: Task[] = orderedTaskIds
      .map((id, index) => {
        const task = map.get(id);
        if (!task) {
          return null;
        }

        return {
          ...task,
          order: index,
          updatedAt: new Date().toISOString(),
        };
      })
      .filter((task): task is Task => task !== null);

    const missing = project.tasks
      .filter((task) => !orderedTaskIds.includes(task.id))
      .map((task, index) => ({
        ...task,
        order: reordered.length + index,
      }));

    return {
      ...project,
      tasks: [...reordered, ...missing],
    };
  });

  await persistAll();
}

export async function markTaskDone(projectId: string, taskId: string): Promise<void> {
  updateProjectInState(projectId, (project) => ({
    ...project,
    tasks: project.tasks.map((task) => {
      if (task.id !== taskId || task.status === 'done') {
        return task;
      }

      return {
        ...task,
        status: 'done',
        updatedAt: new Date().toISOString(),
      };
    }),
  }));

  if (timerState.activeProjectId === projectId && timerState.activeTaskId === taskId) {
    const project = getProjectById(projectId);
    timerState.activeTaskId = project ? (findFirstTodoTask(project)?.id ?? null) : null;

    if (!timerState.activeTaskId) {
      stopSessionInternal(true);
      timerState.activeProjectId = null;
      clearProjectSnapshot(projectId);
    } else {
      saveActiveProjectSnapshot();
    }
  }

  await persistAll();
}

export async function toggleProjectPlayPause(projectId: string): Promise<void> {
  const project = getProjectSafe(projectId);
  if (!project || project.tasks.length === 0) {
    return;
  }

  if (timerState.activeProjectId === projectId) {
    if (timerState.waitingForConfirm) {
      await acknowledgeTimerTransition();
      return;
    }

    timerState.isRunning = !timerState.isRunning;
    if (!timerState.isRunning && timerState.phase === 'break') {
      timerState.phase = 'work';
      timerState.remainingSeconds = WORK_SECONDS;
    }
    ensureTimerLoop();
    if (!timerState.isRunning) {
      await clearRunningNotification();
    }
    saveActiveProjectSnapshot();
    await persistAll();
    return;
  }

  if (timerState.activeProjectId && timerState.activeProjectId !== projectId) {
    if (timerState.isRunning) {
      return;
    }

    saveActiveProjectSnapshot();
  }

  const nextState = resolveProjectTimerState(project);
  if (!nextState.activeTaskId) {
    clearProjectSnapshot(projectId);
    return;
  }

  timerState.activeProjectId = projectId;
  timerState.activeTaskId = nextState.activeTaskId;
  timerState.phase = nextState.phase;
  timerState.remainingSeconds = nextState.remainingSeconds;
  timerState.waitingForConfirm = false;
  timerState.isRunning = true;
  stopBell();
  await clearTransitionNotification();
  saveActiveProjectSnapshot();

  ensureTimerLoop();
  await syncRunningNotification(true);
  await persistAll();
}

export async function acknowledgeTimerTransition(): Promise<void> {
  if (!timerState.activeProjectId || !timerState.waitingForConfirm) {
    return;
  }

  stopBell();
  await clearTransitionNotification();

  if (timerState.phase === 'work') {
    timerState.phase = 'break';
    timerState.remainingSeconds = BREAK_SECONDS;
  } else {
    timerState.phase = 'work';
    timerState.remainingSeconds = WORK_SECONDS;
  }

  timerState.waitingForConfirm = false;
  timerState.isRunning = true;
  saveActiveProjectSnapshot();

  ensureTimerLoop();
  await syncRunningNotification(true);
  await persistAll();
}

export function getProjectTimerSnapshot(projectId: string): {
  phase: PomodoroPhase;
  remainingSeconds: number;
} {
  if (timerState.activeProjectId === projectId) {
    if (timerState.phase === 'break' && !timerState.isRunning) {
      return {
        phase: 'work',
        remainingSeconds: WORK_SECONDS,
      };
    }

    return {
      phase: timerState.phase,
      remainingSeconds: timerState.remainingSeconds,
    };
  }

  const snapshot = timerState.projectTimers[projectId];
  if (!snapshot) {
    return {
      phase: 'work',
      remainingSeconds: WORK_SECONDS,
    };
  }

  if (snapshot.phase === 'break') {
    return {
      phase: 'work',
      remainingSeconds: WORK_SECONDS,
    };
  }

  return {
    phase: snapshot.phase,
    remainingSeconds: snapshot.remainingSeconds,
  };
}

export function getProjectById(projectId: string): Project | undefined {
  return projects.value.find((project) => project.id === projectId);
}

export function getTaskById(projectId: string, taskId: string): Task | undefined {
  const project = getProjectById(projectId);
  return project?.tasks.find((task) => task.id === taskId);
}

export function getProjectProgress(project: Project): { done: number; total: number; percent: number } {
  const total = project.tasks.length;
  const done = project.tasks.filter((task) => task.status === 'done').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { done, total, percent };
}

export function getProjectCurrentTask(projectId: string): Task | undefined {
  if (timerState.activeProjectId !== projectId || !timerState.activeTaskId) {
    return undefined;
  }

  return getTaskById(projectId, timerState.activeTaskId);
}

export function isProjectRunning(projectId: string): boolean {
  return timerState.activeProjectId === projectId && timerState.isRunning;
}

export function isProjectPaused(projectId: string): boolean {
  return timerState.activeProjectId === projectId && !timerState.isRunning;
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const seconds = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function formatElapsedSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export function formatProjectDuration(project: Project): string {
  const chunks: string[] = [];

  if (project.durationHours > 0) {
    chunks.push(`${project.durationHours}h`);
  }

  chunks.push(`${project.durationMinutes}m`);

  if (project.durationSeconds > 0) {
    chunks.push(`${project.durationSeconds}s`);
  }

  return chunks.join(' ');
}

export function formatTaskDuration(task: Task): string {
  const chunks: string[] = [];

  if (task.durationHours > 0) {
    chunks.push(`${task.durationHours}h`);
  }
  if (task.durationMinutes > 0 || (task.durationHours === 0 && task.durationSeconds === 0)) {
    chunks.push(`${task.durationMinutes}m`);
  }
  if (task.durationSeconds > 0) {
    chunks.push(`${task.durationSeconds}s`);
  }

  return chunks.join(' ');
}

export function canStartProject(projectId: string): boolean {
  return !isProjectInteractionLocked(projectId);
}

export function canInteractWithTask(projectId: string, taskId: string): boolean {
  return !isTaskInteractionLocked(projectId, taskId);
}
