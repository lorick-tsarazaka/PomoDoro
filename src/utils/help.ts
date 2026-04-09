import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import {
  add,
  checkmarkDoneOutline,
  clipboardOutline,
  chevronBackOutline,
  ellipsisVertical,
  helpCircleOutline,
  pauseOutline,
  playOutline,
  reorderThreeOutline,
  informationCircleOutline,
  menuOutline,
  settingsOutline,
  trashOutline,
} from 'ionicons/icons';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from './i18n';

export default defineComponent({
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar },
  setup() {
    const { t } = useI18n();
    const router = useRouter();

    async function goBack(): Promise<void> {
      if (window.history.length > 1) {
        await router.back();
        return;
      }

      await router.push('/home');
    }

    return {
      t,
      goBack,
      add,
      checkmarkDoneOutline,
      chevronBackOutline,
      clipboardOutline,
      ellipsisVertical,
      helpCircleOutline,
      informationCircleOutline,
      menuOutline,
      pauseOutline,
      playOutline,
      reorderThreeOutline,
      settingsOutline,
      trashOutline,
    };
  },
});