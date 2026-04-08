import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { chevronBackOutline, logoGithub, logoLinkedin, mailOutline } from 'ionicons/icons';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from './i18n';

export default defineComponent({
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const currentYear = new Date().getFullYear();

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
      currentYear,
      chevronBackOutline,
      logoGithub,
      logoLinkedin,
      mailOutline,
    };
  },
});