<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="goBack">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ t('projectDetails') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="page-shell">
        <section v-if="project" class="detail-card">
          <h2>{{ project.title }}</h2>
          <p>{{ project.description }}</p>
          <div class="meta-row">
            <span>{{ t('duration') }}</span>
            <strong>{{ formatProjectDuration(project) }}</strong>
          </div>
          <div class="meta-row">
            <span>{{ t('status') }}</span>
            <strong>{{ t(project.status === 'todo' ? 'todo' : project.status === 'done' ? 'done' : 'trash') }}</strong>
          </div>
        </section>

        <section v-else class="detail-card">
          <h2>{{ t('projectDetails') }}</h2>
          <p>Projet introuvable.</p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatProjectDuration, getProjectById } from '../services/service';
import { useI18n } from '../utils/i18n';

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
</script>

<style scoped>
.page-header {
  --background: var(--app-surface);
  --color: var(--app-text-primary);
  --border-color: var(--app-border);
  box-shadow: var(--app-header-shadow);
  border-bottom: 1px solid var(--app-border);
}

.page-header ion-toolbar {
  --background: var(--app-surface);
  --color: var(--app-text-primary);
  --border-color: var(--app-border);
  --min-height: 65px;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 10px;
  --padding-end: 10px;
  min-height: 65px;
  display: flex;
  align-items: center;
}

.page-header::after {
  display: none;
}

.page-header ion-title {
  font-size: 18px;
  font-weight: 700;
}

.page-back-btn {
  --color: var(--app-accent) !important;
  --color-activated: var(--app-accent);
  --color-focused: var(--app-accent);
  --color-hover: var(--app-accent);
  color: var(--app-accent);
  width: 46px;
  height: 46px;
  margin: 0;
}

.page-back-btn ion-icon {
  font-size: 26px;
  color: var(--app-accent);
}

.page-content {
  --background: var(--app-bg);
}

.page-shell {
  padding: 16px 14px 24px;
}

.detail-card {
  border-radius: 10px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow-soft);
  padding: 16px;
}

.detail-card h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--app-text-primary);
}

.detail-card p {
  margin: 0 0 14px;
  color: var(--app-text-secondary);
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--app-border);
  margin-top: 10px;
}

.meta-row span {
  color: var(--app-text-secondary);
  font-size: 14px;
}

.meta-row strong {
  color: var(--app-text-primary);
  font-size: 14px;
}
</style>
