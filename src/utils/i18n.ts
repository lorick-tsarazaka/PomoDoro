import { computed } from 'vue';
import { appSettings, type Language } from '../services/service';

type TranslationKey =
  | 'appName'
  | 'todo'
  | 'done'
  | 'settings'
  | 'trash'
  | 'about'
  | 'help'
  | 'language'
  | 'font'
  | 'ringtone'
  | 'addProject'
  | 'editProject'
  | 'title'
  | 'description'
  | 'duration'
  | 'status'
  | 'minutes'
  | 'hours'
  | 'seconds'
  | 'cancel'
  | 'cancelSelection'
  | 'save'
  | 'confirm'
  | 'delete'
  | 'restore'
  | 'markDone'
  | 'markTodo'
  | 'confirmDelete'
  | 'confirmDone'
  | 'confirmRestore'
  | 'confirmPermanentDelete'
  | 'confirmEdit'
  | 'confirmRedo'
  | 'selectActions'
  | 'deleteSelection'
  | 'doneSelection'
  | 'todoSelection'
  | 'restoreSelection'
  | 'createSuccess'
  | 'updateSuccess'
  | 'deleteSuccess'
  | 'restoreSuccess'
  | 'doneSuccess'
  | 'todoSuccess'
  | 'requiredFields'
  | 'noProjects'
  | 'noTrash'
  | 'appDescription'
  | 'menu'
  | 'projectDetails'
  | 'projectProgressLabel'
  | 'projectTaskListTitle'
  | 'projectNoTask'
  | 'projectNotFound'
  | 'projectEditTask'
  | 'projectAddTask'
  | 'projectDeleteTaskConfirm'
  | 'projectDeleteTasksConfirm'
  | 'taskAddedSuccess'
  | 'taskUpdatedSuccess'
  | 'soundPageTitle'
  | 'soundAppTitle'
  | 'soundAppSubtitle'
  | 'soundLocalTitle'
  | 'soundLocalSubtitle'
  | 'soundLocalChip'
  | 'soundAdd'
  | 'soundStop'
  | 'soundDeleteSelection'
  | 'soundOnlyAudio'
  | 'soundAdded'
  | 'selectedItems'
  | 'aboutApkInfoTitle'
  | 'aboutPlatformLabel'
  | 'aboutPlatformValue'
  | 'aboutTechLabel'
  | 'aboutTechValue'
  | 'aboutStorageLabel'
  | 'aboutStorageValue'
  | 'aboutVersionLabel'
  | 'aboutVersionValue'
  | 'helpIconsTitle'
  | 'helpIconMenuTitle'
  | 'helpIconMenuDesc'
  | 'helpIconCreateTitle'
  | 'helpIconCreateDesc'
  | 'helpIconSettingsTitle'
  | 'helpIconSettingsDesc'
  | 'helpIconTodoTitle'
  | 'helpIconTodoDesc'
  | 'helpIconDoneTitle'
  | 'helpIconDoneDesc'
  | 'helpIconOptionsTitle'
  | 'helpIconOptionsDesc'
  | 'helpIconTrashTitle'
  | 'helpIconTrashDesc'
  | 'helpIconAboutTitle'
  | 'helpIconAboutDesc'
  | 'helpQuickStartTitle'
  | 'helpQuickStart1'
  | 'helpQuickStart2'
  | 'helpQuickStart3'
  | 'helpQuickStart4'
  | 'helpMainActionsTitle'
  | 'helpActionCreateTitle'
  | 'helpActionCreateDesc'
  | 'helpActionDoneTitle'
  | 'helpActionDoneDesc'
  | 'helpActionRestoreTitle'
  | 'helpActionRestoreDesc'
  | 'helpProjectPageTitle'
  | 'helpProjectPage1'
  | 'helpProjectPage2'
  | 'helpProjectPage3'
  | 'helpProjectPage4'
  | 'helpTimerTitle'
  | 'helpTimer1'
  | 'helpTimer2'
  | 'helpTimer3'
  | 'helpTimer4'
  | 'helpTagProjects'
  | 'helpTagTasks'
  | 'helpTagTimer'
  | 'helpTagSelection'
  | 'aboutCreatorInfoTitle'
  | 'aboutCreatorLabel'
  | 'aboutCreatorValue'
  | 'aboutCreatorSubtitle'
  | 'aboutGithubLabel'
  | 'aboutLinkedinLabel'
  | 'aboutEmailLabel'
  | 'aboutCopyright';

type Dictionary = Record<Language, Record<TranslationKey, string>>;

const dictionary: Dictionary = {
  fr: {
    appName: 'PomoDoro Projets',
    todo: 'À faire',
    done: 'Fait',
    settings: 'Paramètres',
    trash: 'Corbeille',
    about: 'À propos',
    help: 'Aide',
    language: 'Langue',
    font: 'Police',
    ringtone: 'Sonnerie',
    addProject: 'Ajouter un projet',
    editProject: 'Modifier le projet',
    title: 'Titre',
    description: 'Description',
    duration: 'Durée',
    status: 'Statut',
    hours: 'Heures',
    minutes: 'minutes',
    seconds: 'Secondes',
    cancel: 'Annuler',
    cancelSelection: 'Annuler',
    save: 'Enregistrer',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    restore: 'Restaurer',
    markDone: 'Marquer comme fait',
    markTodo: 'Refaire',
    confirmDelete: 'Confirmer la suppression ?',
    confirmDone: 'Confirmer la validation ?',
    confirmRestore: 'Confirmer la restauration ?',
    confirmPermanentDelete: 'Supprimer définitivement ?',
    confirmEdit: 'Confirmer la modification ?',
    confirmRedo: 'Confirmer le retour en à faire ?',
    selectActions: 'Actions sélectionnées',
    deleteSelection: 'Supprimer sélection',
    doneSelection: 'Valider sélection',
    todoSelection: 'Refaire sélection',
    restoreSelection: 'Restaurer sélection',
    createSuccess: 'Projet ajouté',
    updateSuccess: 'Projet modifié',
    deleteSuccess: 'Projet supprimé',
    restoreSuccess: 'Projet restauré',
    doneSuccess: 'Projet marqué comme fait',
    todoSuccess: 'Projet remis en à faire',
    requiredFields: 'Tous les champs sont obligatoires',
    noProjects: 'Aucun projet pour le moment.',
    noTrash: 'La corbeille est vide.',
    appDescription: 'Application de gestion de projet orientée productivité.',
    menu: 'Menu',
    projectDetails: 'Détail projet',
    projectProgressLabel: 'Progression',
    projectTaskListTitle: 'Liste des tâches',
    projectNoTask: 'Pas de tâche',
    projectNotFound: 'Projet introuvable.',
    projectEditTask: 'Modifier la tâche',
    projectAddTask: 'Ajouter une tâche',
    projectDeleteTaskConfirm: 'Supprimer cette tâche ?',
    projectDeleteTasksConfirm: 'Supprimer ces tâches ?',
    taskAddedSuccess: 'Tâche ajoutée',
    taskUpdatedSuccess: 'Tâche modifiée',
    soundPageTitle: 'Sonnerie',
    soundAppTitle: 'Sonnerie de l’application',
    soundAppSubtitle: 'Sons fournis par l\'application',
    soundLocalTitle: 'Sonnerie locale',
    soundLocalSubtitle: 'Sons envoyés depuis ton appareil.',
    soundLocalChip: 'Local',
    soundAdd: 'Ajouter son',
    soundStop: 'Stop',
    soundDeleteSelection: 'Supprimer',
    soundOnlyAudio: 'Seuls les fichiers audio sont acceptés.',
    soundAdded: 'Son ajouté',
    selectedItems: 'éléments sélectionnés',
    aboutApkInfoTitle: 'Informations APK',
    aboutPlatformLabel: 'Plateforme',
    aboutPlatformValue: 'Android APK',
    aboutTechLabel: 'Technologies',
    aboutTechValue: 'Ionic + Vue js',
    aboutStorageLabel: 'Stockage',
    aboutStorageValue: 'SQLite',
    aboutVersionLabel: 'Version',
    aboutVersionValue: '1.0.0',
    helpIconsTitle: 'Boutons et icônes',
    helpIconMenuTitle: 'Menu',
    helpIconMenuDesc: 'ouvre le panneau latéral.',
    helpIconCreateTitle: 'Créer',
    helpIconCreateDesc: 'ajoute un nouveau projet.',
    helpIconSettingsTitle: 'Paramètres',
    helpIconSettingsDesc: 'langue, police et préférences globales.',
    helpIconTodoTitle: 'À faire',
    helpIconTodoDesc: 'affiche la liste des projets à réaliser.',
    helpIconDoneTitle: 'Valider',
    helpIconDoneDesc: 'marque un projet comme fait.',
    helpIconOptionsTitle: 'Options',
    helpIconOptionsDesc: 'modifier, supprimer, restaurer selon la page.',
    helpIconTrashTitle: 'Corbeille',
    helpIconTrashDesc: 'accès aux projets supprimés.',
    helpIconAboutTitle: 'À propos',
    helpIconAboutDesc: 'affiche les informations détaillées de l\'application.',
    helpQuickStartTitle: 'Démarrage rapide',
    helpQuickStart1: 'Utilise le bouton + pour créer un projet avec titre, description et durée.',
    helpQuickStart2: 'Le switch central du header permet de basculer entre À faire et Fait.',
    helpQuickStart3: 'Appui long sur une carte pour activer la sélection multiple.',
    helpQuickStart4: 'Le menu latéral donne accès à Corbeille, Aide et À propos.',
    helpMainActionsTitle: 'Actions principales',
    helpActionCreateTitle: 'Créer un projet',
    helpActionCreateDesc: 'Depuis la page d\'accueil, appuie sur + puis remplis les champs obligatoires avant d\'enregistrer.',
    helpActionDoneTitle: 'Marquer comme fait',
    helpActionDoneDesc: 'Sur un projet À faire, utilise le bouton validation ou l\'action de sélection multiple.',
    helpActionRestoreTitle: 'Restaurer depuis la corbeille',
    helpActionRestoreDesc: 'Va dans Corbeille, ouvre les options du projet puis choisis Restaurer.',
    helpProjectPageTitle: 'Page projet',
    helpProjectPage1: 'Le titre, la description, la durée totale et la progression du projet sont affichés en haut.',
    helpProjectPage2: 'Appui long sur une tâche pour activer la sélection multiple, puis touche les autres tâches pour les ajouter.',
    helpProjectPage3: 'Le bouton de déplacement à gauche permet de réordonner les tâches par glisser-déposer.',
    helpProjectPage4: 'Le bouton + ajoute une nouvelle tâche, et le bouton play/pause reprend le chrono du projet.',
    helpTimerTitle: 'Chrono et état',
    helpTimer1: 'Le chrono du projet a sa propre mémoire: une pause conserve l’état exact du projet.',
    helpTimer2: 'L’animation du chrono suit la bordure du bouton et se lit de haut milieu vers la droite puis vers la gauche.',
    helpTimer3: 'Quand un projet tourne, les autres projets à faire sont grisés pour éviter les conflits.',
    helpTimer4: 'Quand un projet est en pause, tu peux lancer un autre projet à la place.',
    helpTagProjects: 'Projets',
    helpTagTasks: 'Tâches',
    helpTagTimer: 'Chrono',
    helpTagSelection: 'Sélection',
    aboutCreatorInfoTitle: 'Créé par',
    aboutCreatorLabel: 'Créateur',
    aboutCreatorValue: 'Lorick',
    aboutCreatorSubtitle: 'Développeur passionné',
    aboutGithubLabel: 'GitHub',
    aboutLinkedinLabel: 'LinkedIn',
    aboutEmailLabel: 'Email',
    aboutCopyright: 'Tous droits réservés.',
    
  },
  en: {
    appName: 'PomoDoro Projects',
    todo: 'Todo',
    done: 'Done',
    settings: 'Settings',
    trash: 'Trash',
    about: 'About',
    help: 'Help',
    language: 'Language',
    font: 'Font',
    ringtone: 'Ringtone',
    addProject: 'Add project',
    editProject: 'Edit project',
    title: 'Title',
    description: 'Description',
    duration: 'Duration',
    status: 'Status',
    hours: 'Hours',
    minutes: 'minutes',
    seconds: 'Seconds',
    cancel: 'Cancel',
    cancelSelection: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    delete: 'Delete',
    restore: 'Restore',
    markDone: 'Mark as done',
    markTodo: 'Do again',
    confirmDelete: 'Confirm deletion?',
    confirmDone: 'Confirm completion?',
    confirmRestore: 'Confirm restore?',
    confirmPermanentDelete: 'Delete permanently?',
    confirmEdit: 'Confirm update?',
    confirmRedo: 'Confirm move back to todo?',
    selectActions: 'Selected actions',
    deleteSelection: 'Delete selected',
    doneSelection: 'Complete selected',
    todoSelection: 'Move selected to todo',
    restoreSelection: 'Restore selected',
    createSuccess: 'Project added',
    updateSuccess: 'Project updated',
    deleteSuccess: 'Project deleted',
    restoreSuccess: 'Project restored',
    doneSuccess: 'Project marked as done',
    todoSuccess: 'Project set back to todo',
    requiredFields: 'All fields are required',
    noProjects: 'No projects yet.',
    noTrash: 'Trash is empty.',
    appDescription: 'Project management app focused on productivity.',
    menu: 'Menu',
    projectDetails: 'Project details',
    projectProgressLabel: 'Progress',
    projectTaskListTitle: 'Task list',
    projectNoTask: 'No task',
    projectNotFound: 'Project not found.',
    projectEditTask: 'Edit task',
    projectAddTask: 'Add task',
    projectDeleteTaskConfirm: 'Delete this task?',
    projectDeleteTasksConfirm: 'Delete these tasks?',
    taskAddedSuccess: 'Task added',
    taskUpdatedSuccess: 'Task updated',
    soundPageTitle: 'Ringtone',
    soundAppTitle: 'App ringtones',
    soundAppSubtitle: 'Sounds provided by the application',
    soundLocalTitle: 'Local ringtones',
    soundLocalSubtitle: 'Sounds uploaded from your device.',
    soundLocalChip: 'Local',
    soundAdd: 'Add sound',
    soundStop: 'Stop',
    soundDeleteSelection: 'Delete',
    soundOnlyAudio: 'Only audio files are accepted.',
    soundAdded: 'Sound added',
    selectedItems: 'selected items',
    aboutApkInfoTitle: 'APK Information',
    aboutPlatformLabel: 'Platform',
    aboutPlatformValue: 'Android APK',
    aboutTechLabel: 'Technologies',
    aboutTechValue: 'Ionic + Vue js',
    aboutStorageLabel: 'Storage',
    aboutStorageValue: 'SQLite',
    aboutVersionLabel: 'Version',
    aboutVersionValue: '1.0.0',
    helpIconsTitle: 'Buttons and icons',
    helpIconMenuTitle: 'Menu',
    helpIconMenuDesc: 'opens the side panel.',
    helpIconCreateTitle: 'Create',
    helpIconCreateDesc: 'adds a new project.',
    helpIconSettingsTitle: 'Settings',
    helpIconSettingsDesc: 'language, font and global preferences.',
    helpIconTodoTitle: 'Todo',
    helpIconTodoDesc: 'shows projects to do.',
    helpIconDoneTitle: 'Complete',
    helpIconDoneDesc: 'marks a project as done.',
    helpIconOptionsTitle: 'Options',
    helpIconOptionsDesc: 'edit, delete, restore depending on the page.',
    helpIconTrashTitle: 'Trash',
    helpIconTrashDesc: 'access deleted projects.',
    helpIconAboutTitle: 'About',
    helpIconAboutDesc: 'shows detailed app information.',
    helpQuickStartTitle: 'Quick start',
    helpQuickStart1: 'Use the + button to create a project with title, description and duration.',
    helpQuickStart2: 'The center header switch toggles between Todo and Done.',
    helpQuickStart3: 'Long press a card to enable multiple selection.',
    helpQuickStart4: 'The side menu gives access to Trash, Help and About.',
    helpMainActionsTitle: 'Main actions',
    helpActionCreateTitle: 'Create a project',
    helpActionCreateDesc: 'From home page, tap + and fill required fields before saving.',
    helpActionDoneTitle: 'Mark as done',
    helpActionDoneDesc: 'On a Todo project, use the validation button or multiple selection action.',
    helpActionRestoreTitle: 'Restore from trash',
    helpActionRestoreDesc: 'Go to Trash, open project options then choose Restore.',
    helpProjectPageTitle: 'Project page',
    helpProjectPage1: 'The project title, description, total duration and progress are shown at the top.',
    helpProjectPage2: 'Long press a task to enable multiple selection, then tap other tasks to add them.',
    helpProjectPage3: 'The drag handle on the left lets you reorder tasks by drag and drop.',
    helpProjectPage4: 'The + button adds a new task, and play/pause resumes the project timer.',
    helpTimerTitle: 'Timer and state',
    helpTimer1: 'Each project keeps its own timer state, so pausing preserves the exact progress.',
    helpTimer2: 'The timer animation follows the button border, starting at the top center and sweeping right-to-left.',
    helpTimer3: 'When a project is running, other todo projects are dimmed to prevent conflicts.',
    helpTimer4: 'When a project is paused, you can start another project instead.',
    helpTagProjects: 'Projects',
    helpTagTasks: 'Tasks',
    helpTagTimer: 'Timer',
    helpTagSelection: 'Selection',
    aboutCreatorInfoTitle: 'Created by',
    aboutCreatorLabel: 'Creator',
    aboutCreatorValue: 'Lorick',
    aboutCreatorSubtitle: 'Passionate developer',
    aboutGithubLabel: 'GitHub',
    aboutLinkedinLabel: 'LinkedIn',
    aboutEmailLabel: 'Email',
    aboutCopyright: 'All rights reserved.',
  },
  mg: {
    appName: 'PomoDoro Tetikasa',
    todo: 'Hatao',
    done: 'Vita',
    settings: 'Fikirana',
    trash: 'Fako',
    about: 'Momba',
    help: 'Fanampiana',
    language: 'Fiteny',
    font: 'Soratra',
    ringtone: 'Feon-kira',
    addProject: 'Hanampy tetikasa',
    editProject: 'Hanova tetikasa',
    title: 'Lohateny',
    description: 'Famaritana',
    duration: 'Fotoana',
    status: 'Toetry ny tetikasa',
    hours: 'Ora',
    minutes: 'minitra',
    seconds: 'Segondra',
    cancel: 'Aoka',
    cancelSelection: 'Aoka',
    save: 'Tehirizo',
    confirm: 'Hamarino',
    delete: 'Fafao',
    restore: 'Avereno',
    markDone: 'Ataovy vita',
    markTodo: 'Avereno hatao',
    confirmDelete: 'Hamarino ny famafana?',
    confirmDone: 'Hamarino ny fahavitana?',
    confirmRestore: 'Hamarino ny famerenana?',
    confirmPermanentDelete: 'Fafao tanteraka?',
    confirmEdit: 'Hamarino ny fanovana?',
    confirmRedo: 'Hamarino ny famerenana ho hatao?',
    selectActions: 'Safidy voafantina',
    deleteSelection: 'Fafao voafantina',
    doneSelection: 'Ataovy vita voafantina',
    todoSelection: 'Avereno ho hatao voafantina',
    restoreSelection: 'Avereno voafantina',
    createSuccess: 'Tetikasa nampiana',
    updateSuccess: 'Tetikasa novaina',
    deleteSuccess: 'Tetikasa voafafa',
    restoreSuccess: 'Tetikasa naverina',
    doneSuccess: 'Tetikasa natao vita',
    todoSuccess: 'Tetikasa naverina ho hatao',
    requiredFields: 'Tsy maintsy fenoina ny saha rehetra',
    noProjects: 'Tsy misy tetikasa.',
    noTrash: 'Foana ny fako.',
    appDescription: 'Rindranasa fitantanana tetikasa ho an ny vokatra.',
    menu: 'Menu',
    projectDetails: 'Antsipirian tetikasa',
    projectProgressLabel: 'Fivoarana',
    projectTaskListTitle: 'Lisitry ny asa',
    projectNoTask: 'Tsy misy asa',
    projectNotFound: 'Tetikasa tsy hita.',
    projectEditTask: 'Hanova asa',
    projectAddTask: 'Hanampy asa',
    projectDeleteTaskConfirm: 'Fafana ity asa ity?',
    projectDeleteTasksConfirm: 'Fafana ireto asa ireto?',
    taskAddedSuccess: 'Asa nampiana',
    taskUpdatedSuccess: 'Asa novaina',
    soundPageTitle: 'Feon-kira',
    soundAppTitle: 'Feon-kiran\'ny app',
    soundAppSubtitle: 'Feo omen\'ny fampiharana',
    soundLocalTitle: 'Feon-kira an-toerana',
    soundLocalSubtitle: 'Feo nampidirina avy amin ny fitaovanao.',
    soundLocalChip: 'An-toerana',
    soundAdd: 'Manampy feo',
    soundStop: 'Ajanona',
    soundDeleteSelection: 'Fafao',
    soundOnlyAudio: 'Feo ihany no azo raisina.',
    soundAdded: 'Feo nampiana',
    selectedItems: 'zavatra voafantina',
    aboutApkInfoTitle: 'Mombamomba APK',
    aboutPlatformLabel: 'Sehatra',
    aboutPlatformValue: 'Android APK',
    aboutTechLabel: 'Teknolojia',
    aboutTechValue: 'Ionic + Vue js',
    aboutStorageLabel: 'Fitahirizana',
    aboutStorageValue: 'SQLite',
    aboutVersionLabel: 'Kinova',
    aboutVersionValue: '1.0.0',
    helpIconsTitle: 'Bokotra sy sary famantarana',
    helpIconMenuTitle: 'Menu',
    helpIconMenuDesc: 'manokatra ny tabilao ankavia.',
    helpIconCreateTitle: 'Mamorona',
    helpIconCreateDesc: 'manampy tetikasa vaovao.',
    helpIconSettingsTitle: 'Fikirana',
    helpIconSettingsDesc: 'fiteny, soratra ary safidy maneran-tetikasa.',
    helpIconTodoTitle: 'Hatao',
    helpIconTodoDesc: 'mampiseho ny tetikasa hatao.',
    helpIconDoneTitle: 'Vita',
    helpIconDoneDesc: 'manamarika tetikasa ho vita.',
    helpIconOptionsTitle: 'Safidy',
    helpIconOptionsDesc: 'manova, mamafa, mamerina arakaraka ny pejy.',
    helpIconTrashTitle: 'Fako',
    helpIconTrashDesc: 'miditra amin\'ny tetikasa voafafa.',
    helpIconAboutTitle: 'Momba',
    helpIconAboutDesc: 'mampiseho ny mombamomba ny rindranasa.',
    helpQuickStartTitle: 'Fanombohana haingana',
    helpQuickStart1: 'Ampiasao ny bokotra + hamoronana tetikasa misy lohateny, famaritana ary faharetana.',
    helpQuickStart2: 'Ny switch eo afovoan\'ny header dia manova eo amin\'ny Hatao sy Vita.',
    helpQuickStart3: 'Tsindrio ela ny carte iray hanokafana safidy maro.',
    helpQuickStart4: 'Ny menu ankavia dia mankany amin\'ny Fako, Fanampiana ary Momba.',
    helpMainActionsTitle: 'Asa fototra',
    helpActionCreateTitle: 'Mamorona tetikasa',
    helpActionCreateDesc: 'Avy amin\'ny pejy fandraisana, tsindrio + dia fenoy ny saha takiana vao tehirizina.',
    helpActionDoneTitle: 'Ataovy vita',
    helpActionDoneDesc: 'Amin\'ny tetikasa Hatao dia ampiasao ny bokotra fanamarinana na ny safidy maromaro.',
    helpActionRestoreTitle: 'Avereno avy amin\'ny fako',
    helpActionRestoreDesc: 'Mankanesa any amin\'ny Fako, sokafy ny safidin\'ny tetikasa dia fidio Avereno.',
    helpProjectPageTitle: 'Pejin\'ny tetikasa',
    helpProjectPage1: 'Eo ambony no miseho ny lohateny, ny famaritana, ny faharetana ary ny fivoaran\'ny tetikasa.',
    helpProjectPage2: 'Tsindrio ela ny asa iray mba hampavitrika safidy maro, dia tsindrio ireo asa hafa hanampiana azy ireo.',
    helpProjectPage3: 'Ny tahony eo ankavia no ahafahana mandamina indray ny asa amin\'ny alalan\'ny drag and drop.',
    helpProjectPage4: 'Ny bokotra + dia manampy asa vaovao, ary ny play/pause dia mamerina ny chrono an\'ny tetikasa.',
    helpTimerTitle: 'Chrono sy toe-javatra',
    helpTimer1: 'Mitahiry toe-javatra manokana ny chrono an\'ny tetikasa tsirairay, ka raha miato dia voatahiry ilay fandrosoana.',
    helpTimer2: 'Manaraka ny sisiny ny animation, manomboka eo afovoany ambony ary mandeha miankavanana miankavia.',
    helpTimer3: 'Rehefa mandeha ny tetikasa iray dia maizina ny tetikasa Hatao hafa hisorohana fifandirana.',
    helpTimer4: 'Rehefa miato ny tetikasa iray dia afaka manomboka tetikasa hafa ianao.',
    helpTagProjects: 'Tetikasa',
    helpTagTasks: 'Asa',
    helpTagTimer: 'Chrono',
    helpTagSelection: 'Safidy',
    aboutCreatorInfoTitle: 'Noforonin\'i',
    aboutCreatorLabel: 'Mpamorona',
    aboutCreatorValue: 'Lorick',
    aboutCreatorSubtitle: 'Mpamorona mafana fo',
    aboutGithubLabel: 'GitHub',
    aboutLinkedinLabel: 'LinkedIn',
    aboutEmailLabel: 'Mailaka',
    aboutCopyright: 'Zo rehetra voatokana.',
  },
};

export const languageOptions: Array<{ value: Language; label: string }> = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'mg', label: 'Malagasy' },
];

export function useI18n() {
  const currentLanguage = computed(() => appSettings.language);

  const t = (key: TranslationKey): string => {
    return dictionary[currentLanguage.value][key] ?? key;
  };

  return {
    currentLanguage,
    t,
  };
}

