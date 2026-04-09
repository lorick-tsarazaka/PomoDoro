import {
  actionSheetController,
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  onIonViewWillLeave,
  toastController,
} from '@ionic/vue';
import {
  add,
  alertCircleOutline,
  checkmarkCircle,
  checkmarkDoneOutline,
  chevronBackOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  ellipseOutline,
  ellipsisVertical,
  pauseOutline,
  playOutline,
  refreshOutline,
  trashOutline,
} from 'ionicons/icons';
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  activeMode,
  addProject,
  bulkChangeStatus,
  canStartProject,
  formatElapsedSeconds,
  formatProjectDuration,
  getProjectProgress,
  isProjectRunning,
  redoProject,
  redoProjects,
  setSelectionHeaderActive,
  moveProjectToTrash,
  projects,
  toggleProjectPlayPause,
  type Project,
  updateProject,
} from '../services/service';
import { useI18n } from './i18n';

export default defineComponent({
  components: { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonModal, IonPage, IonTextarea, IonTitle, IonToolbar },
  setup() {
    const { t } = useI18n();
    const router = useRouter();

    const isModalOpen = ref(false);
    const editingProjectId = ref<string | null>(null);
    const selectedIds = ref<string[]>([]);

    const form = reactive({
      title: '',
      description: '',
    });

    let longPressTimer: ReturnType<typeof setTimeout> | null = null;

    const filteredProjects = computed(() => {
      return projects.value.filter((project) => project.status === activeMode.value);
    });

    const isSelectionMode = computed(() => selectedIds.value.length > 0);

    const isAllSelected = computed(() => {
      return filteredProjects.value.length > 0 && selectedIds.value.length === filteredProjects.value.length;
    });

    function resetForm(): void {
      form.title = '';
      form.description = '';
      editingProjectId.value = null;
    }

    function clearSelection(): void {
      selectedIds.value = [];
    }

    function openCreateModal(): void {
      resetForm();
      isModalOpen.value = true;
    }

    function closeModal(): void {
      isModalOpen.value = false;
      resetForm();
    }

    async function showToast(message: string, icon: string): Promise<void> {
      const toast = await toastController.create({
        message,
        icon,
        duration: 1500,
        position: 'bottom',
      });

      await toast.present();
    }

    async function saveProject(): Promise<void> {
      if (!form.title.trim()) {
        await showToast(t('requiredFields'), alertCircleOutline);
        return;
      }

      if (!editingProjectId.value) {
        await addProject({
          title: form.title,
          description: form.description,
        });
        closeModal();
        await showToast(t('createSuccess'), checkmarkCircle);
        return;
      }

      const alert = await alertController.create({
        header: t('confirmEdit'),
        buttons: [
          { text: t('cancel'), role: 'cancel' },
          {
            text: t('confirm'),
            handler: async () => {
              await updateProject(editingProjectId.value as string, {
                title: form.title,
                description: form.description,
              });
              closeModal();
              await showToast(t('updateSuccess'), checkmarkCircle);
            },
          },
        ],
      });

      await alert.present();
    }

    async function openProject(projectId: string): Promise<void> {
      await router.push(`/project/${projectId}`);
    }

    function startLongPress(projectId: string): void {
      cancelLongPress();
      longPressTimer = setTimeout(() => {
        toggleSelection(projectId);
      }, 450);
    }

    function cancelLongPress(): void {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }

    function toggleSelection(projectId: string): void {
      if (selectedIds.value.includes(projectId)) {
        selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== projectId);
        return;
      }

      selectedIds.value = [...selectedIds.value, projectId];
    }

    function toggleSelectAll(): void {
      if (isAllSelected.value) {
        clearSelection();
        return;
      }

      selectedIds.value = filteredProjects.value.map((project) => project.id);
    }

    async function withConfirmation(header: string, action: () => Promise<void>): Promise<void> {
      const alert = await alertController.create({
        header,
        buttons: [
          { text: t('cancel'), role: 'cancel' },
          {
            text: t('confirm'),
            handler: async () => {
              await action();
            },
          },
        ],
      });

      await alert.present();
    }

    async function togglePlayPause(projectId: string): Promise<void> {
      await toggleProjectPlayPause(projectId);
    }

    async function confirmDelete(projectId: string): Promise<void> {
      await withConfirmation(t('confirmDelete'), async () => {
        await moveProjectToTrash(projectId);
        selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== projectId);
        await showToast(t('deleteSuccess'), trashOutline);
      });
    }

    async function confirmRedo(projectId: string): Promise<void> {
      await withConfirmation(t('confirmRedo'), async () => {
        await redoProject(projectId);
        await showToast(t('todoSuccess'), checkmarkOutline);
      });
    }

    async function openProjectActions(project: Project): Promise<void> {
      const buttons = activeMode.value === 'todo'
        ? [
            {
              text: t('editProject'),
              icon: createOutline,
              handler: () => {
                editingProjectId.value = project.id;
                form.title = project.title;
                form.description = project.description;
                isModalOpen.value = true;
              },
            },
            {
              text: t('delete'),
              role: 'destructive' as const,
              icon: trashOutline,
              handler: async () => {
                await confirmDelete(project.id);
              },
            },
          ]
        : [
            {
              text: t('markTodo'),
              icon: refreshOutline,
              handler: async () => {
                await confirmRedo(project.id);
              },
            },
            {
              text: t('delete'),
              role: 'destructive' as const,
              icon: trashOutline,
              handler: async () => {
                await confirmDelete(project.id);
              },
            },
          ];

      const actionSheet = await actionSheetController.create({
        header: project.title,
        buttons: [
          ...buttons,
          {
            text: t('cancel'),
            role: 'cancel',
          },
        ],
      });

      await actionSheet.present();
    }

    async function confirmBulkDone(): Promise<void> {
      await withConfirmation(t('confirmDone'), async () => {
        await bulkChangeStatus(Array.from(selectedIds.value), 'done');
        clearSelection();
        await showToast(t('doneSuccess'), checkmarkOutline);
      });
    }

    async function confirmBulkTodo(): Promise<void> {
      await withConfirmation(t('confirmRedo'), async () => {
        await redoProjects(Array.from(selectedIds.value));
        clearSelection();
        await showToast(t('todoSuccess'), checkmarkOutline);
      });
    }

    async function confirmBulkDelete(): Promise<void> {
      await withConfirmation(t('confirmDelete'), async () => {
        await bulkChangeStatus(Array.from(selectedIds.value), 'trash');
        clearSelection();
        await showToast(t('deleteSuccess'), trashOutline);
      });
    }

    onIonViewWillLeave(() => {
      setSelectionHeaderActive(false);
      clearSelection();
      cancelLongPress();
    });

    watch(
      isSelectionMode,
      (active) => {
        setSelectionHeaderActive(active);
      },
      { immediate: true }
    );

    function isSelected(projectId: string): boolean {
      return selectedIds.value.includes(projectId);
    }

    return {
      t,
      activeMode,
      add,
      alertCircleOutline,
      checkmarkCircle,
      checkmarkDoneOutline,
      chevronBackOutline,
      checkmarkOutline,
      closeOutline,
      createOutline,
      ellipseOutline,
      ellipsisVertical,
      pauseOutline,
      playOutline,
      refreshOutline,
      trashOutline,
      filteredProjects,
      isSelectionMode,
      isModalOpen,
      editingProjectId,
      selectedIds,
      form,
      clearSelection,
      openCreateModal,
      closeModal,
      saveProject,
      openProject,
      startLongPress,
      cancelLongPress,
      toggleSelection,
      toggleSelectAll,
      togglePlayPause,
      confirmBulkDone,
      confirmBulkTodo,
      confirmBulkDelete,
      openProjectActions,
      isSelected,
      isProjectRunning,
      canStartProject,
      getProjectProgress,
      formatElapsedSeconds,
      isProjectDimmed: (projectId: string) => activeMode.value === 'todo' && !canStartProject(projectId),
      formatProjectDuration,
    };
  },
});