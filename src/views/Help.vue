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

<script lang="ts">
import HelpComponent from '../utils/help';

export default HelpComponent;
</script>

<style scoped src="../theme/help.css"></style>
