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

<script lang="ts">
import SettingsComponent from '../utils/settings';

export default SettingsComponent;
</script>

<style scoped src="../theme/settings.css"></style>
