import {
  actionSheetController,
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonReorder,
  IonReorderGroup,
  IonTitle,
  IonToolbar,
  toastController,
} from '@ionic/vue';
import {
  add,
  closeOutline,
  checkmarkCircle,
  checkmarkDoneOutline,
  chevronBackOutline,
  createOutline,
  ellipseOutline,
  ellipsisVertical,
  listOutline,
  pauseOutline,
  playOutline,
  reorderThreeOutline,
  trashOutline,
} from 'ionicons/icons';
import { computed, defineComponent, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  acknowledgeTimerTransition,
  addTask,
  canInteractWithTask,
  canStartProject,
  deleteTask,
  deleteTasks,
  formatCountdown,
  formatProjectDuration,
  formatTaskDuration,
  getProjectById,
  getProjectCurrentTask,
  getProjectProgress,
  getProjectTimerSnapshot,
  getTaskById,
  isProjectRunning,
  markTaskDone,
  reorderTasks,
  timerState,
  toggleProjectPlayPause,
  type Task,
  updateTask,
} from '../services/service';
import { useI18n } from './i18n';

export default defineComponent({
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonModal,
    IonPage,
    IonReorder,
    IonReorderGroup,
    IonTitle,
    IonToolbar,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const isTaskModalOpen = ref(false);
    const editingTaskId = ref<string | null>(null);
    const selectedTaskIds = ref<string[]>([]);
    let taskLongPressTimer: ReturnType<typeof setTimeout> | null = null;
    let longPressTriggered = false;

    const taskForm = reactive({
      title: '',
      durationHours: 0,
      durationMinutes: 25,
      durationSeconds: 0,
    });

    async function goBack(): Promise<void> {
      if (window.history.length > 1) {
        await router.back();
        return;
      }

      await router.push('/home');
    }

    const project = computed(() => {
      const id = route.params.id as string;
      return getProjectById(id);
    });

    const orderedTasks = computed(() => {
      return [...(project.value?.tasks ?? [])].sort((a, b) => a.order - b.order);
    });

    const progress = computed(() => {
      if (!project.value) {
        return { done: 0, total: 0, percent: 0 };
      }

      return getProjectProgress(project.value);
    });

    const isRunning = computed(() => {
      if (!project.value) {
        return false;
      }

      return isProjectRunning(project.value.id);
    });

    const projectTimerSnapshot = computed(() => {
      if (!project.value) {
        return {
          phase: 'work' as const,
          remainingSeconds: 25 * 60,
        };
      }

      return getProjectTimerSnapshot(project.value.id);
    });

    const formattedCountdown = computed(() => formatCountdown(projectTimerSnapshot.value.remainingSeconds));

    const canPlay = computed(() => {
      if (!project.value) {
        return false;
      }

      return canStartProject(project.value.id);
    });

    const canReorder = computed(() => {
      if (!project.value) {
        return false;
      }

      return !isRunning.value;
    });

    const isTaskSelectionMode = computed(() => selectedTaskIds.value.length > 0);

    const currentTaskId = computed(() => {
      if (!project.value) {
        return null;
      }

      return getProjectCurrentTask(project.value.id)?.id ?? null;
    });

    const playButtonStyle = computed(() => {
      const total = projectTimerSnapshot.value.phase === 'work' ? 1500 : 300;
      const remainingRatio = Math.max(0, Math.min(1, projectTimerSnapshot.value.remainingSeconds / total));
      const hue = Math.max(0, 120 * remainingRatio);

      return {
        '--ring-progress': `${(remainingRatio * 100).toFixed(2)}%`,
        '--ring-hue': `${hue.toFixed(0)}`,
      };
    });

    function clearTaskSelection(): void {
      selectedTaskIds.value = [];
    }

    function startTaskLongPress(taskId: string, event: Event): void {
      const target = event.target as HTMLElement;
      if (target.closest('ion-reorder')) {
        return;
      }

      cancelTaskLongPress();
      taskLongPressTimer = setTimeout(() => {
        longPressTriggered = true;
        if (!isTaskSelectionMode.value) {
          selectedTaskIds.value = [taskId];
          return;
        }

        toggleTaskSelection(taskId);
      }, 430);
    }

    function cancelTaskLongPress(): void {
      if (!taskLongPressTimer) {
        return;
      }

      clearTimeout(taskLongPressTimer);
      taskLongPressTimer = null;
    }

    async function onTaskCardClick(taskId: string): Promise<void> {
      if (longPressTriggered) {
        longPressTriggered = false;
        return;
      }

      if (isTaskSelectionMode.value) {
        toggleTaskSelection(taskId);
        return;
      }

      await openTaskDetails(taskId);
    }

    function resetTaskForm(): void {
      taskForm.title = '';
      taskForm.durationHours = 0;
      taskForm.durationMinutes = 25;
      taskForm.durationSeconds = 0;
      editingTaskId.value = null;
    }

    function normalizeDuration(): { hours: number; minutes: number; seconds: number } {
      return {
        hours: Math.max(0, Number(taskForm.durationHours || 0)),
        minutes: Math.max(0, Math.min(59, Number(taskForm.durationMinutes || 0))),
        seconds: Math.max(0, Math.min(59, Number(taskForm.durationSeconds || 0))),
      };
    }

    async function showToast(message: string, icon: string): Promise<void> {
      const toast = await toastController.create({
        message,
        icon,
        duration: 1300,
        position: 'bottom',
      });

      await toast.present();
    }

    function openCreateTaskModal(): void {
      if (isTaskSelectionMode.value) {
        clearTaskSelection();
      }

      resetTaskForm();
      isTaskModalOpen.value = true;
    }

    function closeTaskModal(): void {
      isTaskModalOpen.value = false;
      resetTaskForm();
    }

    async function saveTask(): Promise<void> {
      if (!project.value || !taskForm.title.trim()) {
        return;
      }

      const d = normalizeDuration();
      if (d.hours === 0 && d.minutes === 0 && d.seconds === 0) {
        return;
      }

      if (!editingTaskId.value) {
        await addTask(project.value.id, {
          title: taskForm.title,
          durationHours: d.hours,
          durationMinutes: d.minutes,
          durationSeconds: d.seconds,
        });
        closeTaskModal();
        await showToast(t('taskAddedSuccess'), checkmarkCircle);
        return;
      }

      await updateTask(project.value.id, editingTaskId.value, {
        title: taskForm.title,
        durationHours: d.hours,
        durationMinutes: d.minutes,
        durationSeconds: d.seconds,
      });
      closeTaskModal();
      await showToast(t('taskUpdatedSuccess'), checkmarkCircle);
    }

    async function markDone(taskId: string): Promise<void> {
      if (!project.value) {
        return;
      }

      if (!canInteractWithTask(project.value.id, taskId)) {
        return;
      }

      await markTaskDone(project.value.id, taskId);
    }

    function toggleTaskSelection(taskId: string): void {
      if (selectedTaskIds.value.includes(taskId)) {
        selectedTaskIds.value = selectedTaskIds.value.filter((id) => id !== taskId);
        return;
      }

      selectedTaskIds.value = [...selectedTaskIds.value, taskId];
    }

    function isTaskSelected(taskId: string): boolean {
      return selectedTaskIds.value.includes(taskId);
    }

    async function confirmDeleteTask(taskId: string): Promise<void> {
      if (!project.value) {
        return;
      }

      const alert = await alertController.create({
        header: t('projectDeleteTaskConfirm'),
        buttons: [
          { text: t('cancel'), role: 'cancel' },
          {
            text: t('confirm'),
            role: 'destructive',
            handler: async () => {
              await deleteTask(project.value!.id, taskId);
            },
          },
        ],
      });

      await alert.present();
    }

    async function confirmDeleteSelection(): Promise<void> {
      if (!project.value || selectedTaskIds.value.length === 0) {
        return;
      }

      const ids = [...selectedTaskIds.value];
      const alert = await alertController.create({
        header: `${t('projectDeleteTasksConfirm')} (${ids.length})`,
        buttons: [
          { text: t('cancel'), role: 'cancel' },
          {
            text: t('confirm'),
            role: 'destructive',
            handler: async () => {
              await deleteTasks(project.value!.id, ids);
              selectedTaskIds.value = [];
            },
          },
        ],
      });

      await alert.present();
    }

    async function openTaskActions(taskId: string): Promise<void> {
      if (!project.value) {
        return;
      }

      const task = getTaskById(project.value.id, taskId);
      if (!task) {
        return;
      }

      const actionSheet = await actionSheetController.create({
        header: task.title,
        buttons: [
          {
            text: t('projectEditTask'),
            icon: createOutline,
            handler: () => {
              if (!project.value || task.status === 'done') {
                return;
              }

              editingTaskId.value = task.id;
              taskForm.title = task.title;
              taskForm.durationHours = task.durationHours;
              taskForm.durationMinutes = task.durationMinutes;
              taskForm.durationSeconds = task.durationSeconds;
              isTaskModalOpen.value = true;
            },
          },
          {
            text: t('delete'),
            role: 'destructive',
            icon: trashOutline,
            handler: async () => {
              await confirmDeleteTask(task.id);
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

    async function openTaskDetails(taskId: string): Promise<void> {
      if (!project.value) {
        return;
      }

      await router.push(`/project/${project.value.id}/task/${taskId}`);
    }

    async function togglePlay(): Promise<void> {
      if (!project.value) {
        return;
      }

      if (isTaskSelectionMode.value) {
        clearTaskSelection();
      }

      await toggleProjectPlayPause(project.value.id);

      if (timerState.waitingForConfirm && timerState.activeProjectId === project.value.id) {
        await acknowledgeTimerTransition();
      }
    }

    async function onReorder(event: CustomEvent): Promise<void> {
      if (!project.value) {
        return;
      }

      const detail = event.detail as { from: number; to: number; complete: (list?: string[]) => void };
      const from = detail.from;
      const to = detail.to;
      const ids = orderedTasks.value.map((task) => task.id);
      const [moved] = ids.splice(from, 1);
      if (!moved) {
        detail.complete();
        return;
      }
      ids.splice(to, 0, moved);

      detail.complete(ids);
      await reorderTasks(project.value.id, ids);
    }

    function isTaskDimmed(taskId: string): boolean {
      if (!project.value) {
        return false;
      }

      const task = getTaskById(project.value.id, taskId);
      if (!task) {
        return false;
      }

      if (task.status === 'done') {
        return false;
      }

      if (timerState.activeProjectId !== project.value.id || !timerState.isRunning) {
        return false;
      }

      return timerState.activeTaskId !== taskId;
    }

    return {
      t,
      goBack,
      project,
      progress,
      orderedTasks,
      isTaskModalOpen,
      editingTaskId,
      taskForm,
      selectedTaskIds,
      isTaskSelectionMode,
      clearTaskSelection,
      startTaskLongPress,
      cancelTaskLongPress,
      onTaskCardClick,
      openCreateTaskModal,
      closeTaskModal,
      saveTask,
      toggleTaskSelection,
      isTaskSelected,
      confirmDeleteSelection,
      openTaskActions,
      openTaskDetails,
      markDone,
      onReorder,
      isTaskDimmed,
      canReorder,
      togglePlay,
      isRunning,
      currentTaskId,
      canPlay,
      formattedCountdown,
      playButtonStyle,
      formatProjectDuration,
      formatTaskDuration,
      add,
      closeOutline,
      chevronBackOutline,
      createOutline,
      checkmarkDoneOutline,
      checkmarkCircle,
      ellipseOutline,
      ellipsisVertical,
      listOutline,
      reorderThreeOutline,
      pauseOutline,
      playOutline,
      trashOutline,
    };
  },
});