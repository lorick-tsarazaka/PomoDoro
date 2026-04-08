import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { computed, defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatProjectDuration, getProjectById } from '../services/service';
import { useI18n } from './i18n';

export default defineComponent({
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

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

    return {
      t,
      goBack,
      project,
      formatProjectDuration,
      chevronBackOutline,
    };
  },
});