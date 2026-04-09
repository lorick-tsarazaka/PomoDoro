import {
  actionSheetController,
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewWillLeave,
  toastController,
} from '@ionic/vue';
import {
  checkmarkDoneOutline,
  checkmarkCircle,
  chevronBackOutline,
  checkmarkOutline,
  closeOutline,
  ellipseOutline,
  ellipsisVertical,
  refreshOutline,
  trashOutline,
} from 'ionicons/icons';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  bulkChangeStatus,
  bulkDeletePermanently,
  deleteProjectPermanently,
  formatProjectDuration,
  projects,
  restoreProject,
  setSelectionHeaderActive,
  type Project,
} from '../services/service';
import { useI18n } from './i18n';

export default defineComponent({
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const selectedIds = ref<string[]>([]);
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;

    async function goBack(): Promise<void> {
      if (window.history.length > 1) {
        await router.back();
        return;
      }

      await router.push('/home');
    }

    const trashProjects = computed(() => {
      return projects.value.filter((project) => project.status === 'trash');
    });

    const isSelectionMode = computed(() => selectedIds.value.length > 0);

    const isAllSelected = computed(() => {
      return trashProjects.value.length > 0 && selectedIds.value.length === trashProjects.value.length;
    });

    function clearSelection(): void {
      selectedIds.value = [];
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

    function startLongPress(projectId: string): void {
      cancelLongPress();
      longPressTimer = setTimeout(() => {
        toggleSelection(projectId);
      }, 450);
    }

    function cancelLongPress(): void {
      if (!longPressTimer) {
        return;
      }

      clearTimeout(longPressTimer);
      longPressTimer = null;
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

      selectedIds.value = trashProjects.value.map((project) => project.id);
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

    async function confirmRestore(projectId: string): Promise<void> {
      await withConfirmation(t('confirmRestore'), async () => {
        await restoreProject(projectId);
        await showToast(t('restoreSuccess'), checkmarkOutline);
      });
    }

    async function confirmDeletePermanent(projectId: string): Promise<void> {
      await withConfirmation(t('confirmPermanentDelete'), async () => {
        await deleteProjectPermanently(projectId);
        await showToast(t('deleteSuccess'), trashOutline);
      });
    }

    async function confirmBulkRestore(): Promise<void> {
      await withConfirmation(t('confirmRestore'), async () => {
        await bulkChangeStatus(Array.from(selectedIds.value), 'todo');
        clearSelection();
        await showToast(t('restoreSuccess'), checkmarkOutline);
      });
    }

    async function confirmBulkDeletePermanently(): Promise<void> {
      await withConfirmation(t('confirmPermanentDelete'), async () => {
        await bulkDeletePermanently(Array.from(selectedIds.value));
        clearSelection();
        await showToast(t('deleteSuccess'), trashOutline);
      });
    }

    async function openProjectActions(project: Project): Promise<void> {
      const actionSheet = await actionSheetController.create({
        header: project.title,
        buttons: [
          {
            text: t('restore'),
            icon: refreshOutline,
            handler: async () => {
              await confirmRestore(project.id);
            },
          },
          {
            text: t('delete'),
            role: 'destructive',
            icon: trashOutline,
            handler: async () => {
              await confirmDeletePermanent(project.id);
            },
          },
          {
            text: t('cancel'),
            role: 'cancel',
          },
        ],
      });

      await actionSheet.present();
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
      checkmarkDoneOutline,
      checkmarkCircle,
      chevronBackOutline,
      checkmarkOutline,
      closeOutline,
      ellipseOutline,
      ellipsisVertical,
      refreshOutline,
      trashOutline,
      trashProjects,
      isSelectionMode,
      selectedIds,
      clearSelection,
      goBack,
      startLongPress,
      cancelLongPress,
      toggleSelection,
      toggleSelectAll,
      confirmBulkRestore,
      confirmBulkDeletePermanently,
      openProjectActions,
      isSelected,
      formatProjectDuration,
    };
  },
});