import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import {
  arrowRedoOutline,
  arrowUndoOutline,
  checkmarkOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { computed, defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  formatTaskDuration,
  getProjectById,
  getTaskById,
  updateTaskDescription,
} from '../services/service';

export default defineComponent({
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const isEditingDescription = ref(false);
    const draftDescription = ref('');
    const history = ref<string[]>([]);
    const historyIndex = ref(-1);

    const projectId = computed(() => String(route.params.projectId ?? ''));
    const taskId = computed(() => String(route.params.taskId ?? ''));

    const project = computed(() => getProjectById(projectId.value));
    const task = computed(() => {
      if (!project.value) {
        return undefined;
      }
      return getTaskById(project.value.id, taskId.value);
    });

    const canUndo = computed(() => historyIndex.value > 0);
    const canRedo = computed(() => historyIndex.value >= 0 && historyIndex.value < history.value.length - 1);

    function syncDraftFromTask(): void {
      const value = task.value?.description ?? '';
      draftDescription.value = value;
      history.value = [value];
      historyIndex.value = 0;
    }

    syncDraftFromTask();

    async function goBack(): Promise<void> {
      if (isEditingDescription.value) {
        isEditingDescription.value = false;
      }

      if (window.history.length > 1) {
        await router.back();
        return;
      }

      if (project.value) {
        await router.push(`/project/${project.value.id}`);
        return;
      }

      await router.push('/home');
    }

    function startEdit(): void {
      if (!task.value) {
        return;
      }

      if (!isEditingDescription.value) {
        syncDraftFromTask();
      }

      isEditingDescription.value = true;
    }

    function onDescriptionInput(event: Event): void {
      const target = event.target as HTMLTextAreaElement;
      const value = target.value;
      draftDescription.value = value;

      const currentValue = history.value[historyIndex.value];
      if (value === currentValue) {
        return;
      }

      const sliced = history.value.slice(0, historyIndex.value + 1);
      sliced.push(value);
      history.value = sliced;
      historyIndex.value = sliced.length - 1;
    }

    function undoEdit(): void {
      if (!canUndo.value) {
        return;
      }

      historyIndex.value -= 1;
      draftDescription.value = history.value[historyIndex.value] ?? '';
    }

    function redoEdit(): void {
      if (!canRedo.value) {
        return;
      }

      historyIndex.value += 1;
      draftDescription.value = history.value[historyIndex.value] ?? '';
    }

    async function saveDescription(): Promise<void> {
      if (!project.value || !task.value) {
        return;
      }

      await updateTaskDescription(project.value.id, task.value.id, draftDescription.value);
      syncDraftFromTask();
      isEditingDescription.value = false;
    }

    return {
      project,
      task,
      isEditingDescription,
      draftDescription,
      canUndo,
      canRedo,
      goBack,
      startEdit,
      onDescriptionInput,
      undoEdit,
      redoEdit,
      saveDescription,
      formatTaskDuration,
      chevronBackOutline,
      arrowUndoOutline,
      arrowRedoOutline,
      checkmarkOutline,
    };
  },
});
