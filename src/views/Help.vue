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
        <section class="help-hero">
          <div class="hero-top">
            <span class="hero-icon"><ion-icon :icon="helpCircleOutline" /></span>
            <div>
              <h2>{{ t('help') }}</h2>
              <p>{{ t('appDescription') }}</p>
            </div>
          </div>
          <div class="hero-tags">
            <span>{{ t('helpTagProjects') }}</span>
            <span>{{ t('helpTagTasks') }}</span>
            <span>{{ t('helpTagTimer') }}</span>
            <span>{{ t('helpTagSelection') }}</span>
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
          <ul class="help-list">
            <li>{{ t('helpActionCreateDesc') }}</li>
            <li>{{ t('helpActionDoneDesc') }}</li>
            <li>{{ t('helpActionRestoreDesc') }}</li>
          </ul>
        </section>

        <section class="help-card">
          <h3>{{ t('helpProjectPageTitle') }}</h3>
          <div class="icon-guide">
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="clipboardOutline" /></span>
              <p>{{ t('helpProjectPage1') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="ellipsisVertical" /></span>
              <p>{{ t('helpProjectPage2') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="reorderThreeOutline" /></span>
              <p>{{ t('helpProjectPage3') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="add" /></span>
              <p>{{ t('helpProjectPage4') }}</p>
            </div>
          </div>
        </section>

        <section class="help-card">
          <h3>{{ t('helpTimerTitle') }}</h3>
          <div class="icon-guide">
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="playOutline" /></span>
              <p>{{ t('helpTimer1') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="pauseOutline" /></span>
              <p>{{ t('helpTimer2') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="checkmarkDoneOutline" /></span>
              <p>{{ t('helpTimer3') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="trashOutline" /></span>
              <p>{{ t('helpTimer4') }}</p>
            </div>
          </div>
        </section>

        <section class="help-card">
          <h3>{{ t('helpIconsTitle') }}</h3>
          <div class="icon-guide">
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="menuOutline" /></span>
              <p><strong>{{ t('helpIconMenuTitle') }}</strong> : {{ t('helpIconMenuDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="settingsOutline" /></span>
              <p><strong>{{ t('helpIconSettingsTitle') }}</strong> : {{ t('helpIconSettingsDesc') }}</p>
            </div>
            <div class="icon-row">
              <span class="icon-chip"><ion-icon :icon="informationCircleOutline" /></span>
              <p><strong>{{ t('helpIconAboutTitle') }}</strong> : {{ t('helpIconAboutDesc') }}</p>
            </div>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import HelpComponent from '../utils/help';

export default HelpComponent;
</script>

<style scoped src="../theme/help.css"></style>
