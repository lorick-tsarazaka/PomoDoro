<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ t('about.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list inset>
        <ion-item lines="none">
          <ion-label>
            <h2>PomoDoro</h2>
            <p>Version 0.0.1</p>
            <p>{{ t('about.description') }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/vue';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
</script>
