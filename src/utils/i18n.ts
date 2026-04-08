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
    restoreSelection: 'Restaurer selection',
    createSuccess: 'Projet ajouté',
    updateSuccess: 'Projet modifié',
    deleteSuccess: 'Projet supprimé',
    restoreSuccess: 'Projet restauré',
    doneSuccess: 'Projet marque comme fait',
    todoSuccess: 'Projet remis en à faire',
    requiredFields: 'Tous les champs sont obligatoires',
    noProjects: 'Aucun projet pour le moment.',
    noTrash: 'La corbeille est vide.',
    appDescription: 'Application de gestion de projet orientée productivité.',
    menu: 'Menu',
    projectDetails: 'Détail projet',
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

