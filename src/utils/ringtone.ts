import { alertController, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { add, checkmarkCircle, chevronBackOutline, closeOutline, ellipseOutline, stopCircle, trashOutline } from 'ionicons/icons';
import { computed, defineComponent, onBeforeUnmount, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  addLocalRingtones,
  appRingtones,
  deleteLocalRingtones,
  getSelectedRingtoneName,
  getRingtoneById,
  loadRingtoneLibrary,
  playPreviewRingtone,
  previewRingtoneId,
  selectedRingtoneId,
  setSelectedRingtone,
  stopPreviewRingtone,
  localRingtones,
} from '../services/ringtone';
import { useI18n } from './i18n';

export default defineComponent({
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const fileInput = ref<HTMLInputElement | null>(null);
    const selectedLocalIds = ref<string[]>([]);
    const isSelectionMode = computed(() => selectedLocalIds.value.length > 0);
    const localLongPressTimer = ref<ReturnType<typeof setTimeout> | null>(null);
    const localSoundTouched = ref(false);

    const importState = reactive({
      rejected: 0,
      added: 0,
    });

    loadRingtoneLibrary();

    async function goBack(): Promise<void> {
      if (isSelectionMode.value) {
        clearSelection();
        return;
      }

      if (window.history.length > 1) {
        await router.back();
        return;
      }

      await router.push('/settings');
    }

    function clearSelection(): void {
      selectedLocalIds.value = [];
    }

    function isLocalSelected(soundId: string): boolean {
      return selectedLocalIds.value.includes(soundId);
    }

    function toggleLocalSelection(soundId: string): void {
      if (selectedLocalIds.value.includes(soundId)) {
        selectedLocalIds.value = selectedLocalIds.value.filter((id) => id !== soundId);
        return;
      }

      selectedLocalIds.value = [...selectedLocalIds.value, soundId];
    }

    function startLocalLongPress(soundId: string): void {
      stopLocalLongPress();
      localLongPressTimer.value = setTimeout(() => {
        localSoundTouched.value = true;
        if (!isSelectionMode.value) {
          selectedLocalIds.value = [soundId];
          return;
        }

        toggleLocalSelection(soundId);
      }, 420);
    }

    function stopLocalLongPress(): void {
      if (!localLongPressTimer.value) {
        return;
      }

      clearTimeout(localLongPressTimer.value);
      localLongPressTimer.value = null;
    }

    async function showToast(message: string, icon: string): Promise<void> {
      const toast = await toastController.create({
        message,
        icon,
        duration: 1400,
        position: 'bottom',
      });

      await toast.present();
    }

    async function playSound(soundId: string): Promise<void> {
      if (localSoundTouched.value) {
        localSoundTouched.value = false;
        return;
      }

      if (isSelectionMode.value) {
        toggleLocalSelection(soundId);
        return;
      }

      await playPreviewRingtone(soundId);
    }

    function isPreviewing(soundId: string): boolean {
      return previewRingtoneId.value === soundId;
    }

    function isSelectedRingtone(soundId: string): boolean {
      return selectedRingtoneId.value === soundId;
    }

    function selectRingtone(soundId: string): void {
      if (!getRingtoneById(soundId)) {
        return;
      }

      stopPreviewRingtone();
      setSelectedRingtone(soundId);
    }

    function openPicker(): void {
      fileInput.value?.click();
    }

    async function onFilesSelected(event: Event): Promise<void> {
      const target = event.target as HTMLInputElement;
      const files = Array.from(target.files ?? []);
      target.value = '';

      if (files.length === 0) {
        return;
      }

      const result = await addLocalRingtones(files);
      importState.added = result.added;
      importState.rejected = result.rejected;

      if (result.added > 0) {
        await showToast(`${t('soundAdded')}: ${result.added}`, checkmarkCircle);
      }

      if (result.rejected > 0) {
        await showToast(t('soundOnlyAudio'), trashOutline);
      }
    }

    async function confirmDeleteSelection(): Promise<void> {
      if (selectedLocalIds.value.length === 0) {
        return;
      }

      const alert = await alertController.create({
        header: `${t('soundDeleteSelection')} (${selectedLocalIds.value.length})`,
        buttons: [
          { text: t('cancel'), role: 'cancel' },
          {
            text: t('confirm'),
            role: 'destructive',
            handler: async () => {
              deleteLocalRingtones([...selectedLocalIds.value]);
              clearSelection();
              await showToast(t('deleteSuccess'), trashOutline);
            },
          },
        ],
      });

      await alert.present();
    }

    function stopPreview(): void {
      stopPreviewRingtone();
    }

    onBeforeUnmount(() => {
      stopLocalLongPress();
      stopPreviewRingtone();
    });

    return {
      t,
      fileInput,
      appRingtones,
      localRingtones,
      selectedLocalIds,
      isSelectionMode,
      selectedRingtoneId,
      selectedRingtoneName: getSelectedRingtoneName,
      goBack,
      clearSelection,
      isLocalSelected,
      startLocalLongPress,
      stopLocalLongPress,
      toggleLocalSelection,
      playSound,
      selectRingtone,
      isPreviewing,
      isSelectedRingtone,
      openPicker,
      onFilesSelected,
      confirmDeleteSelection,
      stopPreview,
      chevronBackOutline,
      closeOutline,
      ellipseOutline,
      add,
      stopCircle,
      trashOutline,
      checkmarkCircle,
      importState,
    };
  },
});
