import { ref } from 'vue';

export type AppLanguage = 'fr' | 'en';

const LANGUAGE_STORAGE_KEY = 'pomodoro-app-language';

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
	fr: {
		'common.cancel': 'Annuler',
		'common.save': 'Enregistrer',
		'common.create': 'Créer',
		'common.validate': 'Valider',
		'common.delete': 'Supprimer',
		'common.restore': 'Restaurer',
		'common.edit': 'Modifier',

		'settings.title': 'Paramètres',
		'settings.theme': 'Thème',
		'settings.mode': 'Mode',
		'settings.mode.light': 'Clair',
		'settings.mode.dark': 'Sombre',
		'settings.font': 'Police',
		'settings.language': 'Langue',
		'settings.languageLabel': 'Choisir la langue',
		'settings.language.fr': 'Français',
		'settings.language.en': 'Anglais',

		'main.menu': 'Menu',
		'main.trash': 'Corbeille',
		'main.about': 'À propos',
		'main.section.todo': 'Projets à faire',
		'main.section.done': 'Projets faits',
		'main.loading': 'Chargement des projets...',
		'main.empty.todo': 'Aucun projet à faire.',
		'main.empty.done': 'Aucun projet terminé.',
		'main.noDescription': 'Aucune description',
		'main.action.markDone': 'Marquer comme fait',
		'main.action.doneToTodo': 'Remettre à faire',
		'main.action.delete': 'Supprimer',
		'main.action.actions': 'Actions',
		'main.action.todoSection': 'Projet à faire',
		'main.action.doneSection': 'Projet fait',
		'main.action.settings': 'Paramètres',

		'trash.title': 'Corbeille',
		'trash.listTitle': 'Projets supprimés',
		'trash.loading': 'Chargement...',
		'trash.empty': 'Aucun projet supprimé.',
		'trash.action.permanentDelete': 'Supprimer définitivement',

		'about.title': 'À propos',
		'about.description': 'Application de gestion de projets et tâches.',

		'forms.project.new': 'Nouveau projet',
		'forms.project.edit': 'Modifier le projet',
		'forms.project.title': 'Titre du projet',
		'forms.project.description': 'Description (optionnelle)',
		'forms.confirm.markDone.header': 'Marquer ce projet comme fait ?',
		'forms.confirm.markDone.message': 'Le projet passera dans la section projets faits.',
		'forms.confirm.markTodo.header': 'Remettre ce projet à faire ?',
		'forms.confirm.markTodo.message': 'Le projet repassera dans la section à faire.',
		'forms.confirm.moveTrash.header': 'Supprimer ce projet ?',
		'forms.confirm.moveTrash.message': 'Le projet sera déplacé vers la corbeille.',
		'forms.confirm.restore.header': 'Restaurer ce projet ?',
		'forms.confirm.restore.message': 'Le projet sera restauré dans la section à faire.',
		'forms.confirm.permanentDelete.header': 'Suppression définitive ?',
		'forms.confirm.permanentDelete.message': 'Cette action est irréversible.',
		'forms.confirm.permanentDelete.cta': 'Supprimer définitivement',
	},
	en: {
		'common.cancel': 'Cancel',
		'common.save': 'Save',
		'common.create': 'Create',
		'common.validate': 'Confirm',
		'common.delete': 'Delete',
		'common.restore': 'Restore',
		'common.edit': 'Edit',

		'settings.title': 'Settings',
		'settings.theme': 'Theme',
		'settings.mode': 'Mode',
		'settings.mode.light': 'Light',
		'settings.mode.dark': 'Dark',
		'settings.font': 'Font family',
		'settings.language': 'Language',
		'settings.language.fr': 'French',
		'settings.language.en': 'English',

		'main.menu': 'Menu',
		'main.trash': 'Trash',
		'main.about': 'About',
		'main.section.todo': 'To-do projects',
		'main.section.done': 'Done projects',
		'main.loading': 'Loading projects...',
		'main.empty.todo': 'No project to do.',
		'main.empty.done': 'No completed project.',
		'main.noDescription': 'No description',
		'main.action.markDone': 'Mark as done',
		'main.action.doneToTodo': 'Move back to to-do',
		'main.action.delete': 'Delete',
		'main.action.actions': 'Actions',
		'main.action.todoSection': 'To-do projects',
		'main.action.doneSection': 'Done projects',
		'main.action.settings': 'Settings',

		'trash.title': 'Trash',
		'trash.listTitle': 'Deleted projects',
		'trash.loading': 'Loading...',
		'trash.empty': 'No deleted project.',
		'trash.action.permanentDelete': 'Delete permanently',

		'about.title': 'About',
		'about.description': 'Project and task management app.',

		'forms.project.new': 'New project',
		'forms.project.edit': 'Edit project',
		'forms.project.title': 'Project title',
		'forms.project.description': 'Description (optional)',
		'forms.confirm.markDone.header': 'Mark this project as done? ',
		'forms.confirm.markDone.message': 'The project will move to done projects.',
		'forms.confirm.markTodo.header': 'Move this project back to to-do? ',
		'forms.confirm.markTodo.message': 'The project will move back to to-do projects.',
		'forms.confirm.moveTrash.header': 'Delete this project? ',
		'forms.confirm.moveTrash.message': 'The project will be moved to trash.',
		'forms.confirm.restore.header': 'Restore this project? ',
		'forms.confirm.restore.message': 'The project will be restored to to-do projects.',
		'forms.confirm.permanentDelete.header': 'Permanent deletion? ',
		'forms.confirm.permanentDelete.message': 'This action cannot be undone.',
		'forms.confirm.permanentDelete.cta': 'Delete permanently',
	},
};

export const getStoredLanguage = (): AppLanguage => {
	const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
	return savedLanguage === 'en' ? 'en' : 'fr';
};

const applyLanguageSideEffects = (language: AppLanguage) => {
	document.documentElement.lang = language;
	localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

const currentLanguage = ref<AppLanguage>(getStoredLanguage());

export const setAppLanguage = (language: AppLanguage) => {
	if (language !== 'fr' && language !== 'en') {
		return;
	}

	currentLanguage.value = language;
	applyLanguageSideEffects(language);
};

export const initializeLanguage = (): AppLanguage => {
	const language = getStoredLanguage();
	setAppLanguage(language);
	return language;
};

export const useI18n = () => {
	const t = (key: string): string => {
		const current = TRANSLATIONS[currentLanguage.value][key];
		if (current) {
			return current;
		}

		return TRANSLATIONS.fr[key] ?? key;
	};

	return {
		language: currentLanguage,
		t,
		setLanguage: setAppLanguage,
	};
};