<template>
  <ion-page>
    <ion-menu side="start" menu-id="main-left-menu" content-id="main-home-content" class="main-side-menu">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ t('main.menu') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list lines="none">
          <ion-item button :detail="false" @click="openTrashFromMenu">
            <ion-icon slot="start" :icon="trashOutline" />
            <ion-label>{{ t('main.trash') }}</ion-label>
          </ion-item>

          <ion-item button :detail="false" @click="openAboutFromMenu">
            <ion-icon slot="start" :icon="informationCircleOutline" />
            <ion-label>{{ t('main.about') }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button :aria-label="t('main.menu')" class="menu-button" @click="openHeaderMenu">
            <ion-icon :icon="menuOutline" />
          </ion-button>
        </ion-buttons>

        <div class="header-section-group" aria-label="Sections projet">
          <ion-button
            fill="clear"
            class="header-section-button"
            :class="{ active: section === 'todo' }"
            :aria-label="t('main.action.todoSection')"
            @click="section = 'todo'"
          >
            <ion-icon :icon="briefcaseOutline" />
          </ion-button>

          <ion-button
            fill="clear"
            class="header-section-button"
            :class="{ active: section === 'done' }"
            :aria-label="t('main.action.doneSection')"
            @click="section = 'done'"
          >
            <ion-icon :icon="checkmarkDoneOutline" />
          </ion-button>
        </div>

        <ion-buttons slot="end">
          <ion-button router-link="/settings" :aria-label="t('main.action.settings')" class="settings-button">
            <ion-icon :icon="settingsOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content id="main-home-content" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button :aria-label="t('main.menu')" class="menu-button" @click="openHeaderMenu">
              <ion-icon :icon="menuOutline" />
            </ion-button>
          </ion-buttons>

          <div class="header-section-group" aria-label="Sections projet">
            <ion-button
              fill="clear"
              class="header-section-button"
              :class="{ active: section === 'todo' }"
              :aria-label="t('main.action.todoSection')"
              @click="section = 'todo'"
            >
              <ion-icon :icon="briefcaseOutline" />
            </ion-button>

            <ion-button
              fill="clear"
              class="header-section-button"
              :class="{ active: section === 'done' }"
              :aria-label="t('main.action.doneSection')"
              @click="section = 'done'"
            >
              <ion-icon :icon="checkmarkDoneOutline" />
            </ion-button>
          </div>

          <ion-buttons slot="end">
            <ion-button router-link="/settings" :aria-label="t('main.action.settings')" class="settings-button">
              <ion-icon :icon="settingsOutline" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-list inset class="project-list">
        <ion-item-divider>
          <ion-label>{{ sectionLabel }}</ion-label>
        </ion-item-divider>

        <ion-item v-if="!isReady" class="project-empty-item" lines="none">
          <ion-label>{{ t('main.loading') }}</ion-label>
        </ion-item>

        <ion-item v-for="project in currentProjects" v-else :key="project.id" class="project-item">
          <ion-label>
            <h2>{{ project.title }}</h2>
            <p>{{ project.description || t('main.noDescription') }}</p>
          </ion-label>

          <ion-button
            v-if="section === 'todo'"
            fill="clear"
            slot="end"
            class="project-action-button"
            :aria-label="t('main.action.markDone')"
            @click="confirmMarkAsDone(project.id)"
          >
            <ion-icon :icon="checkmarkDoneCircleOutline" />
          </ion-button>

          <ion-button
            fill="clear"
            slot="end"
            class="project-more-button"
            :aria-label="t('main.action.actions')"
            @click="openProjectMenu($event, project)"
          >
            <ion-icon :icon="ellipsisVertical" />
          </ion-button>
        </ion-item>

        <ion-item v-if="isReady && currentProjects.length === 0" class="project-empty-item" lines="none">
          <ion-label>{{ section === 'todo' ? t('main.empty.todo') : t('main.empty.done') }}</ion-label>
        </ion-item>
      </ion-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="add-fab">
        <ion-fab-button @click="openCreateProjectAlert">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <ion-popover :is-open="projectMenuOpen" :event="projectMenuEvent" side="bottom" alignment="end" :dismiss-on-select="false" @didDismiss="closeProjectMenu">
        <ion-content class="project-menu-popover" :scroll-y="false">
          <ion-list lines="none">
            <ion-item v-if="activeProject && section === 'todo'" button :detail="false" @click="editActiveProject">
              <ion-icon slot="start" :icon="createOutline" />
              <ion-label>{{ t('common.edit') }}</ion-label>
            </ion-item>

            <ion-item v-if="activeProject && section === 'todo'" button :detail="false" @click="moveActiveProjectToTrash">
              <ion-icon slot="start" :icon="trashOutline" />
              <ion-label>{{ t('common.delete') }}</ion-label>
            </ion-item>

            <ion-item v-if="activeProject && section === 'done'" button :detail="false" @click="restoreActiveProject">
              <ion-icon slot="start" :icon="arrowUndoOutline" />
              <ion-label>{{ t('main.action.doneToTodo') }}</ion-label>
            </ion-item>

            <ion-item v-if="activeProject && section === 'done'" button :detail="false" @click="moveActiveProjectToTrash">
              <ion-icon slot="start" :icon="trashOutline" />
              <ion-label>{{ t('common.delete') }}</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonItemDivider, IonFab, IonFabButton, IonMenu, IonPopover } from '@ionic/vue';
import { addOutline, arrowUndoOutline, briefcaseOutline, checkmarkDoneCircleOutline, checkmarkDoneOutline, createOutline, ellipsisVertical, informationCircleOutline, menuOutline, settingsOutline, trashOutline } from 'ionicons/icons';
import { useMainPageActions, useMainProjects } from '@/utils/main';
import { useMainForms } from '@/utils/main-forms';
import { useMainProjectModalOptions } from '@/utils/modal-options';
import { useI18n } from '@/utils/i18n';

const { isReady, section, currentProjects, sectionLabel, createProject, updateProject, markAsDone, markAsTodo, moveToTrash } = useMainProjects();
const { t } = useI18n();
const router = useRouter();

const { openHeaderMenu, openTrashFromMenu, openAboutFromMenu } = useMainPageActions({ router });

const { openCreateProjectAlert, openEditProjectAlert, confirmMarkAsDone, confirmMarkAsTodo, confirmMoveToTrash } = useMainForms({
  createProject,
  updateProject,
  markAsDone,
  markAsTodo,
  moveToTrash,
});

const {
  projectMenuOpen,
  projectMenuEvent,
  activeProject,
  openProjectMenu,
  closeProjectMenu,
  editActiveProject,
  moveActiveProjectToTrash,
  restoreActiveProject,
} = useMainProjectModalOptions({
  section,
  openEditProjectAlert,
  confirmMoveToTrash,
  confirmMarkAsTodo,
});
</script>
