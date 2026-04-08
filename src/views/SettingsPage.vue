<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="goBack">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ t('settings') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="page-shell">
        <section class="settings-card">
          <div class="settings-item">
            <label for="font-select">{{ t('font') }}</label>
            <select id="font-select" :value="appSettings.font" @change="onFontChange">
              <option value="Nunito">Nunito</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Poppins">Poppins</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Playfair Display">Playfair Display</option>
            </select>
          </div>

          <div class="settings-item">
            <label for="language-select">{{ t('language') }}</label>
            <select id="language-select" :value="appSettings.language" @change="onLanguageChange">
              <option
                v-for="option in languageOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { appSettings, setFont, setLanguage, type FontChoice, type Language } from '../services/service';
import { languageOptions, useI18n } from '../utils/i18n';

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

.settings-card {
  border-radius: 10px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow-soft);
  padding: 18px;
  display: grid;
  gap: 18px;
}

.settings-card h2 {
  margin: 0;
  font-size: 20px;
  color: var(--app-text-primary);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0 12px;
  border-bottom: 1px solid var(--app-border);
}

.settings-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.settings-item label {
  color: var(--app-text-primary);
  font-size: 15px;
}

.settings-item select {
  width: fit-content;
  margin-left: auto;
  border: none;
  outline: none;
  border-radius: 8px;
  padding: 8px 10px;
  background: transparent;
  color: var(--app-text-primary);
  font-size: 14px;
  text-align: end;
  text-align-last: end;
}
</style>
