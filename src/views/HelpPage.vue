<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="goBack">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ t('help') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="page-shell">

        <section class="help-card">
          <h3>{{ t('helpIconsTitle') }}</h3>
          <div class="icon-guide">
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="menuOutline" /></span>
              <p><strong>{{ t('helpIconMenuTitle') }}</strong> : {{ t('helpIconMenuDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="add" /></span>
              <p><strong>{{ t('helpIconCreateTitle') }}</strong> : {{ t('helpIconCreateDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="settingsOutline" /></span>
              <p><strong>{{ t('helpIconSettingsTitle') }}</strong> : {{ t('helpIconSettingsDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="clipboardOutline" /></span>
              <p><strong>{{ t('helpIconTodoTitle') }}</strong> : {{ t('helpIconTodoDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="checkmarkDoneOutline" /></span>
              <p><strong>{{ t('helpIconDoneTitle') }}</strong> : {{ t('helpIconDoneDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="ellipsisVertical" /></span>
              <p><strong>{{ t('helpIconOptionsTitle') }}</strong> : {{ t('helpIconOptionsDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="trashOutline" /></span>
              <p><strong>{{ t('helpIconTrashTitle') }}</strong> : {{ t('helpIconTrashDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="informationCircleOutline" /></span>
              <p><strong>{{ t('helpIconAboutTitle') }}</strong> : {{ t('helpIconAboutDesc') }}</p>
            </div>
          </div>
        </section>

        <section class="help-card">
          <h3>{{ t('helpQuickStartTitle') }}</h3>
          <ul class="help-list">
            <li>{{ t('helpQuickStart1') }}</li>
            <li>{{ t('helpQuickStart2') }}</li>
            <li>{{ t('helpQuickStart3') }}</li>
            <li>{{ t('helpQuickStart4') }}</li>
          </ul>
        </section>

        <section class="help-card">
          <h3>{{ t('helpMainActionsTitle') }}</h3>
          <div class="faq-item">
            <strong>{{ t('helpActionCreateTitle') }}</strong>
            <p>{{ t('helpActionCreateDesc') }}</p>
          </div>
          <div class="faq-item">
            <strong>{{ t('helpActionDoneTitle') }}</strong>
            <p>{{ t('helpActionDoneDesc') }}</p>
          </div>
          <div class="faq-item">
            <strong>{{ t('helpActionRestoreTitle') }}</strong>
            <p>{{ t('helpActionRestoreDesc') }}</p>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import {
  add,
  checkmarkDoneOutline,
  chevronBackOutline,
  clipboardOutline,
  ellipsisVertical,
  informationCircleOutline,
  menuOutline,
  settingsOutline,
  trashOutline,
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useI18n } from '../utils/i18n';

const { t } = useI18n();
const router = useRouter();

async function goBack(): Promise<void> {
  if (window.history.length > 1) {
    await router.back();
    return;
  }

  await router.push('/home');
}
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
  display: grid;
  gap: 12px;
}

.help-hero,
.help-card {
  border-radius: 10px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow-soft);
  padding: 18px;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.app-logo {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 10px 24px rgba(58, 134, 255, 0.18);
}

.hero-top h2 {
  margin: 0 0 6px;
  color: var(--app-text-primary);
  font-size: 20px;
}

.hero-top p {
  margin: 0;
  color: var(--app-text-secondary);
  line-height: 1.5;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-tags span {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: var(--app-bg-hover);
  color: var(--app-text-primary);
  font-size: 12px;
}

.help-card h3 {
  margin: 0 0 14px;
  color: var(--app-text-primary);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.2px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 10px;
  border-radius: 7px;
  background: linear-gradient(90deg, rgba(58, 134, 255, 0.12), rgba(58, 134, 255, 0.04));
  border: 1px solid rgba(58, 133, 255, 0.136);
}

.help-card h3::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--app-accent);
  box-shadow: 0 0 0 4px rgba(58, 134, 255, 0.16);
}

.help-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  color: var(--app-text-primary);
}

.help-list li,
.faq-item p {
  line-height: 1.5;
}

.icon-guide {
  display: grid;
  gap: 10px;
}

.icon-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.icon-chip {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--app-bg-hover);
  color: var(--app-accent);
  border: 1px solid var(--app-border);
}

.icon-chip ion-icon {
  font-size: 20px;
}

.icon-row p {
  margin: 0;
  color: var(--app-text-secondary);
  line-height: 1.5;
}

.icon-row strong {
  color: var(--app-text-primary);
}

.faq-item {
  display: grid;
  gap: 4px;
  padding: 10px 0;
  border-bottom: 1px solid var(--app-border);
}

.faq-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.faq-item strong {
  color: var(--app-text-primary);
}

.faq-item p {
  margin: 0;
  color: var(--app-text-secondary);
}

.support-text {
  margin: 0;
  color: var(--app-text-secondary);
  line-height: 1.5;
}
</style>
