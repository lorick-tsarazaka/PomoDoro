import { Capacitor } from '@capacitor/core';
import {
	CapacitorSQLite,
	SQLiteConnection,
	SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { reactive, ref } from 'vue';

export type ProjectStatus = 'todo' | 'done' | 'trash';
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

export interface Project {
	id: string;
	title: string;
	description: string;
	durationHours: number;
	durationMinutes: number;
	durationSeconds: number;
	status: ProjectStatus;
	createdAt: string;
	updatedAt: string;
}

interface AppSettings {
	language: Language;
	font: FontChoice;
}

interface LocalPayload {
	projects: Project[];
	settings: AppSettings;
}

const LOCAL_STORAGE_KEY = 'pomodoro.projects.v1';

const defaultSettings: AppSettings = {
	language: 'fr',
	font: 'Nunito',
};

export const projects = ref<Project[]>([]);
export const activeMode = ref<ViewMode>('todo');
export const appSettings = reactive<AppSettings>({ ...defaultSettings });
export const isReady = ref(false);
export const isSelectionHeaderActive = ref(false);

let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;
let initialized = false;

function generateId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isNative(): boolean {
	return Capacitor.getPlatform() !== 'web';
}

function parseLocalStoragePayload(rawValue: string | null): LocalPayload {
	if (!rawValue) {
		return {
			projects: [],
			settings: { ...defaultSettings },
		};
	}

	try {
		const parsed = JSON.parse(rawValue) as Partial<LocalPayload>;

		const parsedProjects = Array.isArray(parsed.projects)
			? parsed.projects.map((project: Partial<Project> & { duration?: number }) => ({
				id: project.id ?? generateId(),
				title: project.title ?? '',
				description: project.description ?? '',
				durationHours: Number(project.durationHours ?? 0),
				durationMinutes: Number(project.durationMinutes ?? project.duration ?? 25),
				durationSeconds: Number(project.durationSeconds ?? 0),
				status: (project.status ?? 'todo') as ProjectStatus,
				createdAt: project.createdAt ?? new Date().toISOString(),
				updatedAt: project.updatedAt ?? new Date().toISOString(),
			}))
			: [];

		return {
			projects: parsedProjects,
			settings: {
				language: parsed.settings?.language ?? defaultSettings.language,
				font: parsed.settings?.font ?? defaultSettings.font,
			},
		};
	} catch {
		return {
			projects: [],
			settings: { ...defaultSettings },
		};
	}
}

function applySettingsToDocument(): void {
	document.documentElement.setAttribute('lang', appSettings.language);
	document.documentElement.style.setProperty('--app-font-family', `'${appSettings.font}', sans-serif`);
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
			status TEXT NOT NULL,
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

	await db.execute(`
		CREATE TABLE IF NOT EXISTS settings (
			id INTEGER PRIMARY KEY CHECK (id = 1),
			language TEXT NOT NULL,
			font TEXT NOT NULL
		);
	`);
}

async function loadFromSQLite(): Promise<void> {
	await connectDb();

	if (!db) {
		return;
	}

	const projectsResult = await db.query(
		'SELECT id, title, description, duration_hours, duration_minutes, duration_seconds, status, created_at, updated_at FROM projects ORDER BY created_at DESC;'
	);

	projects.value = (projectsResult.values ?? []).map((row) => ({
		id: row.id as string,
		title: row.title as string,
		description: row.description as string,
		durationHours: Number(row.duration_hours ?? 0),
		durationMinutes: Number(row.duration_minutes ?? 25),
		durationSeconds: Number(row.duration_seconds ?? 0),
		status: row.status as ProjectStatus,
		createdAt: row.created_at as string,
		updatedAt: row.updated_at as string,
	}));

	const settingsResult = await db.query('SELECT language, font FROM settings WHERE id = 1;');
	const row = settingsResult.values?.[0];

	appSettings.language = (row?.language as Language | undefined) ?? defaultSettings.language;
	appSettings.font = (row?.font as FontChoice | undefined) ?? defaultSettings.font;
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
			INSERT INTO projects (id, title, description, duration_hours, duration_minutes, duration_seconds, status, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
			`,
			[
				project.id,
				project.title,
				project.description,
				project.durationHours,
				project.durationMinutes,
				project.durationSeconds,
				project.status,
				project.createdAt,
				project.updatedAt,
			]
		);
	}

	await db.run(
		`
		INSERT OR REPLACE INTO settings (id, language, font)
		VALUES (1, ?, ?);
		`,
		[appSettings.language, appSettings.font]
	);
}

function loadFromLocalStorage(): void {
	const payload = parseLocalStoragePayload(localStorage.getItem(LOCAL_STORAGE_KEY));
	projects.value = payload.projects;
	appSettings.language = payload.settings.language;
	appSettings.font = payload.settings.font;
}

function saveToLocalStorage(): void {
	const payload: LocalPayload = {
		projects: projects.value,
		settings: {
			language: appSettings.language,
			font: appSettings.font,
		},
	};

	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
}

async function persistAll(): Promise<void> {
	if (isNative()) {
		await saveToSQLite();
	} else {
		saveToLocalStorage();
	}

	applySettingsToDocument();
}

export async function initializeAppData(): Promise<void> {
	if (initialized) {
		return;
	}

	if (isNative()) {
		await loadFromSQLite();
	} else {
		loadFromLocalStorage();
	}

	applySettingsToDocument();
	initialized = true;
	isReady.value = true;
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
	durationHours: number;
	durationMinutes: number;
	durationSeconds: number;
}): Promise<void> {
	const now = new Date().toISOString();

	projects.value = [
		{
			id: generateId(),
			title: input.title.trim(),
			description: input.description.trim(),
			durationHours: input.durationHours,
			durationMinutes: input.durationMinutes,
			durationSeconds: input.durationSeconds,
			status: 'todo',
			createdAt: now,
			updatedAt: now,
		},
		...projects.value,
	];

	await persistAll();
}

export async function updateProject(
	projectId: string,
	updates: { title: string; description: string; durationHours: number; durationMinutes: number; durationSeconds: number }
): Promise<void> {
	projects.value = projects.value.map((project) => {
		if (project.id !== projectId) {
			return project;
		}

		return {
			...project,
			title: updates.title.trim(),
			description: updates.description.trim(),
			durationHours: updates.durationHours,
			durationMinutes: updates.durationMinutes,
			durationSeconds: updates.durationSeconds,
			updatedAt: new Date().toISOString(),
		};
	});

	await persistAll();
}

export async function moveProjectToTrash(projectId: string): Promise<void> {
	projects.value = projects.value.map((project) => {
		if (project.id !== projectId) {
			return project;
		}

		return {
			...project,
			status: 'trash',
			updatedAt: new Date().toISOString(),
		};
	});

	await persistAll();
}

export async function markProjectDone(projectId: string): Promise<void> {
	projects.value = projects.value.map((project) => {
		if (project.id !== projectId) {
			return project;
		}

		return {
			...project,
			status: 'done',
			updatedAt: new Date().toISOString(),
		};
	});

	await persistAll();
}

export async function markProjectTodo(projectId: string): Promise<void> {
	projects.value = projects.value.map((project) => {
		if (project.id !== projectId) {
			return project;
		}

		return {
			...project,
			status: 'todo',
			updatedAt: new Date().toISOString(),
		};
	});

	await persistAll();
}

export async function restoreProject(projectId: string): Promise<void> {
	await markProjectTodo(projectId);
}

export async function deleteProjectPermanently(projectId: string): Promise<void> {
	projects.value = projects.value.filter((project) => project.id !== projectId);
	await persistAll();
}

export async function bulkChangeStatus(projectIds: string[], status: ProjectStatus): Promise<void> {
	const idSet = new Set(projectIds);

	projects.value = projects.value.map((project) => {
		if (!idSet.has(project.id)) {
			return project;
		}

		return {
			...project,
			status,
			updatedAt: new Date().toISOString(),
		};
	});

	await persistAll();
}

export async function bulkDeletePermanently(projectIds: string[]): Promise<void> {
	const idSet = new Set(projectIds);
	projects.value = projects.value.filter((project) => !idSet.has(project.id));
	await persistAll();
}

export function getProjectById(projectId: string): Project | undefined {
	return projects.value.find((project) => project.id === projectId);
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
