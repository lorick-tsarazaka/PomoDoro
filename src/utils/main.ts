import { computed, ref } from 'vue';
import { menuController } from '@ionic/vue';
import type { Router } from 'vue-router';
import { loadProjectsFromStorage, persistProjectsToStorage, type Project, type ProjectStatus } from '@/utils/services';
import { useI18n } from '@/utils/i18n';

export type ProjectSection = 'todo' | 'done';

const sharedSection = ref<ProjectSection>('todo');
const sharedProjects = ref<Project[]>([]);
const sharedIsReady = ref(false);
let initializePromise: Promise<void> | null = null;

const makeProjectId = (): string => `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useMainProjects = () => {
	const { t } = useI18n();
	const todoProjects = computed(() => sharedProjects.value.filter((project) => project.status === 'todo'));
	const doneProjects = computed(() => sharedProjects.value.filter((project) => project.status === 'done'));
	const trashProjects = computed(() => sharedProjects.value.filter((project) => project.status === 'trash'));
	const currentProjects = computed(() => (sharedSection.value === 'todo' ? todoProjects.value : doneProjects.value));
	const sectionLabel = computed(() => (sharedSection.value === 'todo' ? t('main.section.todo') : t('main.section.done')));

	const initialize = async () => {
		if (sharedIsReady.value) {
			return;
		}

		if (!initializePromise) {
			initializePromise = (async () => {
				sharedProjects.value = await loadProjectsFromStorage();
				sharedIsReady.value = true;
			})();
		}

		await initializePromise;
	};

	void initialize();

	const sync = async () => {
		await persistProjectsToStorage(sharedProjects.value);
	};

	const createProject = async (title: string, description: string): Promise<boolean> => {
		const normalizedTitle = title.trim();
		const normalizedDescription = description.trim();
		if (!normalizedTitle) {
			return false;
		}

		sharedProjects.value = [
			{
				id: makeProjectId(),
				title: normalizedTitle,
				description: normalizedDescription,
				status: 'todo',
				createdAt: new Date().toISOString(),
			},
			...sharedProjects.value,
		];
		sharedSection.value = 'todo';
		await sync();
		return true;
	};

	const updateProject = async (projectId: string, title: string, description: string): Promise<boolean> => {
		const normalizedTitle = title.trim();
		const normalizedDescription = description.trim();
		if (!normalizedTitle) {
			return false;
		}

		let updated = false;
		sharedProjects.value = sharedProjects.value.map((project) => {
			if (project.id !== projectId) {
				return project;
			}

			updated = true;
			return {
				...project,
				title: normalizedTitle,
				description: normalizedDescription,
			};
		});

		if (!updated) {
			return false;
		}

		await sync();
		return true;
	};

	const setProjectStatus = async (projectId: string, status: ProjectStatus): Promise<void> => {
		sharedProjects.value = sharedProjects.value.map((project) => {
			if (project.id !== projectId) {
				return project;
			}

			return {
				...project,
				status,
				completedAt: status === 'done' ? new Date().toISOString() : undefined,
				deletedAt: status === 'trash' ? new Date().toISOString() : undefined,
			};
		});
		await sync();
	};

	const deletePermanently = async (projectId: string): Promise<void> => {
		sharedProjects.value = sharedProjects.value.filter((project) => project.id !== projectId);
		await sync();
	};

	return {
		isReady: sharedIsReady,
		section: sharedSection,
		currentProjects,
		trashProjects,
		sectionLabel,
		createProject,
		updateProject,
		markAsDone: async (projectId: string) => setProjectStatus(projectId, 'done'),
		markAsTodo: async (projectId: string) => setProjectStatus(projectId, 'todo'),
		moveToTrash: async (projectId: string) => setProjectStatus(projectId, 'trash'),
		restoreFromTrash: async (projectId: string) => setProjectStatus(projectId, 'todo'),
		deletePermanently,
	};
};

type MainActionsDeps = {
	router: Router;
};

export const useMainPageActions = ({ router }: MainActionsDeps) => {
	const openHeaderMenu = async () => {
		await menuController.open('main-left-menu');
	};

	const openTrashFromMenu = async () => {
		await menuController.close('main-left-menu');
		await router.push('/trash');
	};

	const openAboutFromMenu = async () => {
		await menuController.close('main-left-menu');
		await router.push('/about');
	};

	return {
		openHeaderMenu,
		openTrashFromMenu,
		openAboutFromMenu,
	};
};

