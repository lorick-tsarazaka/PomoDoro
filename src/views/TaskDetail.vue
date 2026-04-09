<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="goBack">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title v-if="!isEditingDescription">Detail tache</ion-title>

        <ion-buttons v-if="isEditingDescription" slot="end">
          <ion-button fill="clear" class="page-back-btn" @click="undoEdit" :disabled="!canUndo">
            <ion-icon :icon="arrowUndoOutline" />
          </ion-button>
          <ion-button fill="clear" class="page-back-btn" @click="redoEdit" :disabled="!canRedo">
            <ion-icon :icon="arrowRedoOutline" />
          </ion-button>
          <ion-button fill="clear" class="page-back-btn" @click="saveDescription">
            <ion-icon :icon="checkmarkOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="page-shell" v-if="project && task">
        <section class="detail-card">
          <h2>Info tache</h2>
          <div class="meta-row">
            <span>Projet</span>
            <strong>{{ project.title }}</strong>
          </div>
          <div class="meta-row">
            <span>Tache</span>
            <strong>{{ task.title }}</strong>
          </div>
          <div class="meta-row">
            <span>Duree</span>
            <strong>{{ formatTaskDuration(task) }}</strong>
          </div>
        </section>

        <section class="detail-card desc-card">
          <h2>Description</h2>
          <textarea
            ref="descriptionInput"
            class="desc-input"
            :value="draftDescription"
            placeholder="Ecrire la description de la tache..."
            @focus="startEdit"
            @input="onDescriptionInput"
          />
        </section>
      </div>

      <div class="page-shell" v-else>
        <section class="detail-card">
          <h2>Detail tache</h2>
          <p>Tache introuvable.</p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import TaskDetailComponent from '../utils/task-detail';

export default TaskDetailComponent;
</script>

<style scoped src="../theme/task-detail.css"></style>
