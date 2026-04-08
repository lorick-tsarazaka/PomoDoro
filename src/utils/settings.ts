import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { appSettings, setFont, setLanguage, type FontChoice, type Language } from '../services/service';
import { languageOptions, useI18n } from './i18n';

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

    async function onFontChange(event: Event): Promise<void> {
      const target = event.target as HTMLSelectElement;
      await setFont(target.value as FontChoice);
    }

    async function onLanguageChange(event: Event): Promise<void> {
      const target = event.target as HTMLSelectElement;
      await setLanguage(target.value as Language);
    }

    return {
      t,
      goBack,
      onFontChange,
      onLanguageChange,
      appSettings,
      languageOptions,
      chevronBackOutline,
    };
  },
});