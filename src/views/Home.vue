<template>
  <ion-page>
    <ion-content class="page-content">
      <transition name="header-fade">
        <header v-if="isSelectionMode" class="selection-mode-header">
          <button type="button" class="icon-btn" @click="clearSelection">
            <ion-icon :icon="closeOutline" />
          </button>
          <h2>{{ selectedIds.length }} {{ t('selectedItems') }}</h2>
          <button type="button" class="icon-btn" @click="toggleSelectAll">
            <ion-icon :icon="checkmarkDoneOutline" />
          </button>
        </header>
      </transition>

        <section v-if="filteredProjects.length === 0" class="empty-state">
            <div class="page-shell-no">
                <p style="text-align: center;">{{ t('noProjects') }}</p>
            </div>
        </section>
      <div class="page-shell">

        <section class="project-list">
          <article
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            :class="{ selected: isSelected(project.id) }"
            @mousedown="startLongPress(project.id)"
            @mouseup="cancelLongPress"
            @mouseleave="cancelLongPress"
            @touchstart="startLongPress(project.id)"
            @touchend="cancelLongPress"
          >
          
            <button class="project-body" type="button" @click="openProject(project.id)">
                <div class="project-info">
                    <h3>{{ project.title }}</h3>
                    <p>{{ project.description }}</p>
                  <span>{{ t('duration') }} : {{ formatProjectDuration(project) }}</span>
                </div>
                <button
                  class="selection-dot"
                  type="button"
                  :class="{ visible: isSelectionMode }"
                  @click.stop="toggleSelection(project.id)"
                >
                  <ion-icon :icon="isSelected(project.id) ? checkmarkCircle : ellipseOutline" />
                </button>
            </button>
            
            <div class="project-actions" @click.stop>
              <button
                v-if="activeMode === 'todo'"
                class="action-btn"
                type="button"
                @click="confirmMarkDone(project.id)"
              >
                <ion-icon :icon="checkmarkDoneOutline" />
              </button>
              <button class="action-btn" type="button" @click="openProjectActions(project)">
                <ion-icon :icon="ellipsisVertical" />
              </button>
            </div>
        </article>
        </section>
      </div>

      <ion-fab v-if="!isSelectionMode" slot="fixed" vertical="bottom" horizontal="end" class="main-fab-wrap">
        <ion-fab-button class="main-fab" @click="openCreateModal">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <transition name="bottom-slide">
        <div v-if="isSelectionMode" class="selection-bar">
          <div class="selection-actions">
            <button
              v-if="activeMode === 'todo'"
              type="button"
              class="selection-action"
              @click="confirmBulkDone"
            >
              <ion-icon :icon="checkmarkDoneOutline" />
              <span>{{ t('doneSelection') }}</span>
            </button>
            <button
              v-if="activeMode === 'done'"
              type="button"
              class="selection-action"
              @click="confirmBulkTodo"
            >
              <ion-icon :icon="refreshOutline" />
              <span>{{ t('todoSelection') }}</span>
            </button>
            <button type="button" class="selection-action danger" @click="confirmBulkDelete">
              <ion-icon :icon="trashOutline" />
              <span>{{ t('deleteSelection') }}</span>
            </button>
          </div>
        </div>
      </transition>

      <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
        <ion-header class="modal-header">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button fill="clear" class="modal-back-btn" @click="closeModal">
                <ion-icon :icon="chevronBackOutline" />
              </ion-button>
            </ion-buttons>
            <ion-title>{{ editingProjectId ? t('editProject') : t('addProject') }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <form class="form-layout" @submit.prevent="saveProject">
            <label>
              <span>{{ t('title') }}</span>
              <ion-input v-model="form.title" fill="outline" required />
            </label>
            <label>
              <span>{{ t('description') }}</span>
              <ion-textarea v-model="form.description" fill="outline" auto-grow />
            </label>
            <div class="duration-grid">
              <label>
                <span>{{ t('hours') }}</span>
                <ion-input v-model.number="form.durationHours" type="number" min="0" fill="outline" required />
              </label>
              <label>
                <span>{{ t('minutes') }}</span>
                <ion-input v-model.number="form.durationMinutes" type="number" min="0" max="59" fill="outline" required />
              </label>
              <label>
                <span>{{ t('seconds') }}</span>
                <ion-input v-model.number="form.durationSeconds" type="number" min="0" max="59" fill="outline" required />
              </label>
            </div>
            <div class="form-actions">
              <ion-button fill="clear" @click="closeModal">{{ t('cancel') }}</ion-button>
              <ion-button type="submit">{{ t('save') }}</ion-button>
            </div>
          </form>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import HomeComponent from '../utils/home';

export default HomeComponent;
</script>

<style scoped src="../theme/home.css"></style>
