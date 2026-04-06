import { alertController } from '@ionic/vue';
import type { Project } from '@/utils/services';
import { useI18n } from '@/utils/i18n';

const confirmAction = async ({
	header,
	message,
	confirmText,
	cancelText,
	onConfirm,
}: {
	header: string;
	message: string;
	confirmText: string;
	cancelText: string;
	onConfirm: () => Promise<void>;
}) => {
	const alert = await alertController.create({
		header,
		message,
		buttons: [
			{ text: cancelText, role: 'cancel' },
			{ text: confirmText, handler: async () => onConfirm() },
		],
	});

	await alert.present();
};

type MainFormsDeps = {
	createProject: (title: string, description: string) => Promise<boolean>;
	updateProject: (projectId: string, title: string, description: string) => Promise<boolean>;
	markAsDone: (projectId: string) => Promise<void>;
	markAsTodo: (projectId: string) => Promise<void>;
	moveToTrash: (projectId: string) => Promise<void>;
};

type TrashFormsDeps = {
	restoreFromTrash: (projectId: string) => Promise<void>;
	deletePermanently: (projectId: string) => Promise<void>;
};

export const useMainForms = ({ createProject, updateProject, markAsDone, markAsTodo, moveToTrash }: MainFormsDeps) => {
	const { t } = useI18n();

	const openCreateProjectAlert = async () => {
		const alert = await alertController.create({
			header: t('forms.project.new'),
			cssClass: 'project-create-alert',
			inputs: [
				{ name: 'title', type: 'text', placeholder: t('forms.project.title'), attributes: { maxlength: 60 } },
				{ name: 'description', type: 'textarea', placeholder: t('forms.project.description'), attributes: { maxlength: 160 } },
			],
			buttons: [
				{ text: t('common.cancel'), role: 'cancel' },
				{ text: t('common.create'), handler: async (value: { title?: string; description?: string }) => createProject(value?.title ?? '', value?.description ?? '') },
			],
		});

		await alert.present();
	};

	const openEditProjectAlert = async (project: Project) => {
		const alert = await alertController.create({
			header: t('forms.project.edit'),
			cssClass: 'project-create-alert',
			inputs: [
				{ name: 'title', type: 'text', placeholder: t('forms.project.title'), value: project.title, attributes: { maxlength: 60 } },
				{ name: 'description', type: 'textarea', placeholder: t('forms.project.description'), value: project.description, attributes: { maxlength: 160 } },
			],
			buttons: [
				{ text: t('common.cancel'), role: 'cancel' },
				{ text: t('common.save'), handler: async (value: { title?: string; description?: string }) => updateProject(project.id, value?.title ?? '', value?.description ?? '') },
			],
		});

		await alert.present();
	};

	const confirmMarkAsDone = async (projectId: string) => {
		await confirmAction({
			header: t('forms.confirm.markDone.header'),
			message: t('forms.confirm.markDone.message'),
			confirmText: t('common.validate'),
			cancelText: t('common.cancel'),
			onConfirm: async () => markAsDone(projectId),
		});
	};

	const confirmMarkAsTodo = async (projectId: string) => {
		await confirmAction({
			header: t('forms.confirm.markTodo.header'),
			message: t('forms.confirm.markTodo.message'),
			confirmText: t('common.validate'),
			cancelText: t('common.cancel'),
			onConfirm: async () => markAsTodo(projectId),
		});
	};

	const confirmMoveToTrash = async (projectId: string) => {
		await confirmAction({
			header: t('forms.confirm.moveTrash.header'),
			message: t('forms.confirm.moveTrash.message'),
			confirmText: t('common.delete'),
			cancelText: t('common.cancel'),
			onConfirm: async () => moveToTrash(projectId),
		});
	};

	return {
		openCreateProjectAlert,
		openEditProjectAlert,
		confirmMarkAsDone,
		confirmMarkAsTodo,
		confirmMoveToTrash,
	};
};

export const useTrashForms = ({ restoreFromTrash, deletePermanently }: TrashFormsDeps) => {
	const { t } = useI18n();

	const confirmRestoreFromTrash = async (projectId: string) => {
		await confirmAction({
			header: t('forms.confirm.restore.header'),
			message: t('forms.confirm.restore.message'),
			confirmText: t('common.restore'),
			cancelText: t('common.cancel'),
			onConfirm: async () => restoreFromTrash(projectId),
		});
	};

	const confirmPermanentDelete = async (projectId: string) => {
		await confirmAction({
			header: t('forms.confirm.permanentDelete.header'),
			message: t('forms.confirm.permanentDelete.message'),
			confirmText: t('forms.confirm.permanentDelete.cta'),
			cancelText: t('common.cancel'),
			onConfirm: async () => deletePermanently(projectId),
		});
	};

	return {
		confirmRestoreFromTrash,
		confirmPermanentDelete,
	};
};
