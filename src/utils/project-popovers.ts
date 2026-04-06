import { ref, type Ref } from 'vue';
import type { Project } from '@/utils/services';
import type { ProjectSection } from '@/utils/main';

type MainPopoverDeps = {
	section: Ref<ProjectSection>;
	onProjectAction: (projectId: string) => Promise<void>;
	confirmMoveToTrash: (projectId: string) => Promise<void>;
	openEditProjectAlert: (project: Project) => Promise<void>;
};

type TrashPopoverDeps = {
	restoreFromTrash: (projectId: string) => Promise<void>;
	deletePermanently: (projectId: string) => Promise<void>;
};

export const useMainProjectPopover = ({ section, onProjectAction, confirmMoveToTrash, openEditProjectAlert }: MainPopoverDeps) => {
	const projectMenuOpen = ref(false);
	const projectMenuEvent = ref<Event | undefined>(undefined);
	const activeProject = ref<Project | null>(null);

	const openProjectMenu = (event: Event, project: Project) => {
		projectMenuEvent.value = event;
		activeProject.value = project;
		projectMenuOpen.value = true;
	};

	const closeProjectMenu = () => {
		projectMenuOpen.value = false;
		projectMenuEvent.value = undefined;
		activeProject.value = null;
	};

	const editActiveProject = async () => {
		const project = activeProject.value;
		if (!project) {
			return;
		}

		closeProjectMenu();
		await openEditProjectAlert(project);
	};

	const moveActiveProjectToTrash = async () => {
		const project = activeProject.value;
		if (!project) {
			return;
		}

		closeProjectMenu();
		await confirmMoveToTrash(project.id);
	};

	const restoreActiveProject = async () => {
		const project = activeProject.value;
		if (!project) {
			return;
		}

		closeProjectMenu();
		await onProjectAction(project.id);
	};

	return {
		section,
		projectMenuOpen,
		projectMenuEvent,
		activeProject,
		openProjectMenu,
		closeProjectMenu,
		editActiveProject,
		moveActiveProjectToTrash,
		restoreActiveProject,
	};
};

export const useTrashProjectPopover = ({ restoreFromTrash, deletePermanently }: TrashPopoverDeps) => {
	const projectMenuOpen = ref(false);
	const projectMenuEvent = ref<Event | undefined>(undefined);
	const activeProject = ref<Project | null>(null);

	const openTrashProjectMenu = (event: Event, project: Project) => {
		projectMenuEvent.value = event;
		activeProject.value = project;
		projectMenuOpen.value = true;
	};

	const closeProjectMenu = () => {
		projectMenuOpen.value = false;
		projectMenuEvent.value = undefined;
		activeProject.value = null;
	};

	const restoreActiveProject = async () => {
		const project = activeProject.value;
		if (!project) {
			return;
		}

		closeProjectMenu();
		await restoreFromTrash(project.id);
	};

	const deleteActiveProject = async () => {
		const project = activeProject.value;
		if (!project) {
			return;
		}

		closeProjectMenu();
		await deletePermanently(project.id);
	};

	return {
		projectMenuOpen,
		projectMenuEvent,
		activeProject,
		openTrashProjectMenu,
		closeProjectMenu,
		restoreActiveProject,
		deleteActiveProject,
	};
};