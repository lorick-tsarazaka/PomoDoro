<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="goBack">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ t('projectDetails') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="page-shell">
        <section v-if="project" class="detail-card">
          <h2>{{ project.title }}</h2>
          <p>{{ project.description }}</p>
          <div class="meta-row">
            <span>{{ t('duration') }}</span>
            <strong>{{ formatProjectDuration(project) }}</strong>
          </div>
          <div class="meta-row">
            <span>{{ t('status') }}</span>
            <strong>{{ t(project.status === 'todo' ? 'todo' : project.status === 'done' ? 'done' : 'trash') }}</strong>
          </div>
        </section>

        <section v-else class="detail-card">
          <h2>{{ t('projectDetails') }}</h2>
          <p>Projet introuvable.</p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import ProjectComponent from '../utils/project';

export default ProjectComponent;
</script>

<style scoped src="../theme/project.css"></style>
