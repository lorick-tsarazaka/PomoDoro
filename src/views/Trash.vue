<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ t('trash.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list inset class="project-list">
        <ion-item-divider>
          <ion-label>{{ t('trash.listTitle') }}</ion-label>
        </ion-item-divider>

        <ion-item v-if="!isReady" class="project-empty-item" lines="none">
          <ion-label>{{ t('trash.loading') }}</ion-label>
        </ion-item>

        <ion-item v-for="project in trashProjects" v-else :key="project.id" class="project-item">
          <ion-label>
            <h2>{{ project.title }}</h2>
            <p>{{ project.description || t('main.noDescription') }}</p>
          </ion-label>

          <ion-button
            fill="clear"
            slot="end"
            class="project-more-button"
            :aria-label="t('main.action.actions')"
            @click="openTrashProjectMenu($event, project)"
          >
            <ion-icon :icon="ellipsisVertical" />
          </ion-button>
        </ion-item>

        <ion-item v-if="isReady && trashProjects.length === 0" class="project-empty-item" lines="none">
          <ion-label>{{ t('trash.empty') }}</ion-label>
        </ion-item>
      </ion-list>

      <ion-popover :is-open="projectMenuOpen" :event="projectMenuEvent" side="bottom" alignment="end" :dismiss-on-select="false" @didDismiss="closeProjectMenu">
        <ion-content class="project-menu-popover" :scroll-y="false">
          <ion-list lines="none">
            <ion-item v-if="activeProject" button :detail="false" @click="restoreActiveProject">
              <ion-icon slot="start" :icon="arrowUndoOutline" />
              <ion-label>{{ t('common.restore') }}</ion-label>
            </ion-item>

            <ion-item v-if="activeProject" button :detail="false" class="destructive-action" @click="deleteActiveProject">
              <ion-icon slot="start" :icon="trashOutline" />
              <ion-label>{{ t('trash.action.permanentDelete') }}</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonItemDivider, IonButton, IonIcon, IonPopover } from '@ionic/vue';
import { arrowUndoOutline, ellipsisVertical, trashOutline } from 'ionicons/icons';
import { useMainProjects } from '@/utils/main';
import { useTrashProjectModalOptions } from '@/utils/modal-options';
import { useI18n } from '@/utils/i18n';

const { isReady, trashProjects, restoreFromTrash, deletePermanently } = useMainProjects();
const { t } = useI18n();

const { projectMenuOpen, projectMenuEvent, activeProject, openTrashProjectMenu, closeProjectMenu, restoreActiveProject, deleteActiveProject } = useTrashProjectModalOptions({
  restoreFromTrash,
  deletePermanently,
});
</script>
