<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <div class="header-section-group" aria-label="Sections projet">
          <ion-button
            fill="clear"
            class="header-section-button"
            :class="{ active: section === 'todo' }"
            aria-label="Projet à faire"
            @click="section = 'todo'"
          >
            <ion-icon :icon="briefcaseOutline" />
          </ion-button>

          <ion-button
            fill="clear"
            class="header-section-button"
            :class="{ active: section === 'done' }"
            aria-label="Projet fait"
            @click="section = 'done'"
          >
            <ion-icon :icon="checkmarkDoneOutline" />
          </ion-button>
        </div>

        <ion-buttons slot="end">
          <ion-button router-link="/settings" aria-label="Paramètres" class="settings-button">
            <ion-icon :icon="settingsOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <div class="header-section-group" aria-label="Sections projet">
            <ion-button
              fill="clear"
              class="header-section-button"
              :class="{ active: section === 'todo' }"
              aria-label="Projet à faire"
              @click="section = 'todo'"
            >
              <ion-icon :icon="briefcaseOutline" />
            </ion-button>

            <ion-button
              fill="clear"
              class="header-section-button"
              :class="{ active: section === 'done' }"
              aria-label="Projet fait"
              @click="section = 'done'"
            >
              <ion-icon :icon="checkmarkDoneOutline" />
            </ion-button>
          </div>

          <ion-buttons slot="end">
            <ion-button router-link="/settings" aria-label="Paramètres" class="settings-button">
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
          <ion-label>Chargement des projets...</ion-label>
        </ion-item>

        <ion-item v-for="project in currentProjects" v-else :key="project.id" class="project-item">
          <ion-label>
            <h2>{{ project.title }}</h2>
            <p>{{ project.description || 'Aucune description' }}</p>
          </ion-label>

          <ion-button
            fill="clear"
            slot="end"
            class="project-action-button"
            :aria-label="section === 'todo' ? 'Marquer comme fait' : 'Remettre à faire'"
            @click="onProjectAction(project.id)"
          >
            <ion-icon :icon="section === 'todo' ? checkmarkDoneCircleOutline : arrowUndoOutline" />
          </ion-button>
        </ion-item>

        <ion-item v-if="isReady && currentProjects.length === 0" class="project-empty-item" lines="none">
          <ion-label>{{ section === 'todo' ? 'Aucun projet à faire.' : 'Aucun projet terminé.' }}</ion-label>
        </ion-item>
      </ion-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="add-fab">
        <ion-fab-button @click="openCreateProjectAlert">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { alertController, IonPage, IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonItemDivider, IonFab, IonFabButton } from '@ionic/vue';
import { addOutline, arrowUndoOutline, briefcaseOutline, checkmarkDoneCircleOutline, checkmarkDoneOutline, settingsOutline } from 'ionicons/icons';
import { useMainProjects } from '@/utils/main';

const { isReady, section, currentProjects, sectionLabel, createProject, markAsDone, markAsTodo } = useMainProjects();

const onProjectAction = async (projectId: string) => {
  if (section.value === 'todo') {
    await markAsDone(projectId);
    return;
  }

  await markAsTodo(projectId);
};

const openCreateProjectAlert = async () => {
  const alert = await alertController.create({
    header: 'Nouveau projet',
    inputs: [
      {
        name: 'title',
        type: 'text',
        placeholder: 'Titre du projet',
        attributes: { maxlength: 60 },
      },
      {
        name: 'description',
        type: 'textarea',
        placeholder: 'Description (optionnelle)',
        attributes: { maxlength: 160 },
      },
    ],
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
      },
      {
        text: 'Créer',
        handler: async (value: { title?: string; description?: string }) => {
          await createProject(value?.title ?? '', value?.description ?? '');
        },
      },
    ],
  });

  await alert.present();
};
</script>
