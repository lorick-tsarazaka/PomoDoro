<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ t('settings.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list inset>
        <ion-item-divider>
          <ion-label>{{ t('settings.theme') }}</ion-label>
        </ion-item-divider>

        <ion-item class="theme-settings-item" lines="none">
          <div class="theme-settings-content">
            <div class="theme-setting-row">
              <ion-label slot="start" class="theme-setting-label">{{ t('settings.mode') }}</ion-label>
              <ion-select
                slot="end"
                interface="popover"
                :interface-options="modeSelectOptions"
                :value="mode"
                @ion-change="onModeChange"
              >
                <ion-select-option value="light">{{ t('settings.mode.light') }}</ion-select-option>
                <ion-select-option value="dark">{{ t('settings.mode.dark') }}</ion-select-option>
              </ion-select>
            </div>

            <div class="theme-setting-separator" aria-hidden="true"></div>

            <div class="theme-setting-row">
              <ion-label slot="start" class="theme-setting-label">{{ t('settings.font') }}</ion-label>
              <ion-select
                slot="end"
                interface="popover"
                :interface-options="fontSelectOptions"
                :value="font"
                @ion-change="onFontChange"
              >
                <ion-select-option value="manrope">Manrope</ion-select-option>
                <ion-select-option value="inter">Inter</ion-select-option>
                <ion-select-option value="poppins">Poppins</ion-select-option>
              </ion-select>
            </div>
          </div>
        </ion-item>
      </ion-list>

      <ion-list inset>
        <ion-item-divider>
          <ion-label>{{ t('settings.language') }}</ion-label>
        </ion-item-divider>
        <ion-item class="theme-settings-item" lines="none">
          <div class="theme-settings-content">
            <div class="theme-setting-row">
              <ion-label slot="start" class="theme-setting-label">{{ t('settings.language') }}</ion-label>
              <ion-select
                  slot="end"
                  interface="popover"
                  :interface-options="modeSelectOptions"
                  :value="language"
                  @ion-change="onLanguageChange"
              >
                <ion-select-option value="fr">{{ t('settings.language.fr') }}</ion-select-option>
                <ion-select-option value="en">{{ t('settings.language.en') }}</ion-select-option>
              </ion-select>
            </div>

          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonItemDivider,
} from '@ionic/vue';
import { applyThemeFont, applyThemeMode, getStoredThemeFont, getStoredThemeMode, type ThemeFont, type ThemeMode } from '@/utils/theme';
import { useI18n, type AppLanguage } from '@/utils/i18n';

const mode = ref<ThemeMode>(getStoredThemeMode());
const font = ref<ThemeFont>(getStoredThemeFont());
const { language, t, setLanguage } = useI18n();
const modeSelectOptions = {
  cssClass: 'theme-mode-popover',
  side: 'bottom',
  alignment: 'end',
};
const fontSelectOptions = {
  cssClass: 'theme-font-popover',
  side: 'bottom',
  alignment: 'end',
};
const languageSelectOptions = {
  cssClass: 'theme-language-popover',
  side: 'bottom',
  alignment: 'end',
};

const onModeChange = (event: CustomEvent) => {
  const selectedMode = event.detail.value as ThemeMode;
  if (selectedMode !== 'light' && selectedMode !== 'dark') {
    return;
  }

  mode.value = selectedMode;
  applyThemeMode(selectedMode);
};

const onFontChange = (event: CustomEvent) => {
  const selectedFont = event.detail.value as ThemeFont;
  if (selectedFont !== 'manrope' && selectedFont !== 'inter' && selectedFont !== 'poppins') {
    return;
  }

  font.value = selectedFont;
  applyThemeFont(selectedFont);
};

const onLanguageChange = (event: CustomEvent) => {
  const selectedLanguage = event.detail.value as AppLanguage;
  if (selectedLanguage !== 'fr' && selectedLanguage !== 'en') {
    return;
  }

  setLanguage(selectedLanguage);
};
</script>

<style scoped>
.theme-settings-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
  --border-width: 0;
  --inner-border-width: 0;
  border: none;
}

.theme-settings-item::part(native) {
  border: 1px solid rgba(88, 88, 88, 0.09);
}

.theme-settings-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.theme-setting-row {
  display: grid;
  grid-template-columns: 1fr max-content;
  align-items: center;
  width: 100%;
  column-gap: 16px;
  min-height: 48px;
}

.theme-setting-row:last-of-type {
  padding-bottom: 0;
}

.theme-setting-separator {
  width: 100%;
  height: 1px;
  background: rgba(148, 163, 184, 0.18);
  margin: 2px 0;
}

.theme-setting-label {
  width: auto;
  max-width: 100%;
  margin: 0;
}

.theme-setting-row ion-select {
  width: max-content;
  min-width: 0;
  --padding-start: 0;
  --padding-end: 0;
  justify-self: end;
}

.theme-setting-row ion-select::part(container) {
  width: max-content;
}
</style>
