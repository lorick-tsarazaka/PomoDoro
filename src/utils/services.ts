import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';

export type ProjectStatus = 'todo' | 'done' | 'trash';

export interface Project {
	id: string;
	title: string;
	description: string;
	status: ProjectStatus;
	createdAt: string;
	completedAt?: string;
	deletedAt?: string;
}

const STORAGE_KEY = 'pomodoro-projects';
const DB_NAME = 'pomodoro_db';
const PROJECTS_KEY = 'projects';

const SQL_CREATE_KV_TABLE = 'CREATE TABLE IF NOT EXISTS app_kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);';
const SQL_SELECT_PROJECTS = 'SELECT value FROM app_kv WHERE key = ? LIMIT 1;';
const SQL_UPSERT_PROJECTS = 'INSERT OR REPLACE INTO app_kv (key, value) VALUES (?, ?);';

let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;

const fallbackProjects = (): Project[] => [];

const parseProjects = (raw: string | null): Project[] => {
	try {
		if (!raw) {
			return fallbackProjects();
		}

		const parsed = JSON.parse(raw) as Project[];
		if (!Array.isArray(parsed)) {
			return fallbackProjects();
		}

		return parsed.filter((project) => Boolean(project?.id) && Boolean(project?.title) && (project?.status === 'todo' || project?.status === 'done' || project?.status === 'trash'));
	} catch {
		return fallbackProjects();
	}
};

const ensureSqliteDb = async (): Promise<SQLiteDBConnection | null> => {
	if (Capacitor.getPlatform() === 'web') {
		return null;
	}

	if (!sqlite) {
		sqlite = new SQLiteConnection(CapacitorSQLite);
	}

	if (!db) {
		const consistency = await sqlite.checkConnectionsConsistency();
		const isConnection = (await sqlite.isConnection(DB_NAME, false)).result;

		if (consistency.result && isConnection) {
			db = await sqlite.retrieveConnection(DB_NAME, false);
		} else {
			db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
		}

		await db.open();
		await db.execute(SQL_CREATE_KV_TABLE);
	}

	return db;
};

export const loadProjectsFromStorage = async (): Promise<Project[]> => {
	if (Capacitor.getPlatform() === 'web') {
		return parseProjects(localStorage.getItem(STORAGE_KEY));
	}

	try {
		const sqliteDb = await ensureSqliteDb();
		if (!sqliteDb) {
			return fallbackProjects();
		}

		const result = await sqliteDb.query(SQL_SELECT_PROJECTS, [PROJECTS_KEY]);
		const raw = result.values?.[0]?.value as string | undefined;
		return parseProjects(raw ?? null);
	} catch {
		return fallbackProjects();
	}
};

export const persistProjectsToStorage = async (projects: Project[]): Promise<void> => {
	if (Capacitor.getPlatform() === 'web') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
		return;
	}

	const sqliteDb = await ensureSqliteDb();
	if (!sqliteDb) {
		return;
	}

	await sqliteDb.run(SQL_UPSERT_PROJECTS, [PROJECTS_KEY, JSON.stringify(projects)]);
};
