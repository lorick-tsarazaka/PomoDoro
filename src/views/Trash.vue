<template>
  <ion-page>
    <ion-header v-if="!isSelectionMode" class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="goBack">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ t('trash') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
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
        <section v-if="trashProjects.length === 0" class="empty-state">
            <div class="page-shell-no">
                <p style="text-align: center;">{{ t('noProjects') }}</p>
            </div>
        </section>

      <div class="page-shell" :class="{ selecting: isSelectionMode }">

        <section class="project-list">
          <article
            v-for="project in trashProjects"
            :key="project.id"
            class="project-card"
            :class="{ selected: isSelected(project.id) }"
            @mousedown="startLongPress(project.id)"
            @mouseup="cancelLongPress"
            @mouseleave="cancelLongPress"
            @touchstart="startLongPress(project.id)"
            @touchend="cancelLongPress"
          >
            <div class="project-body">
              <div class="project-info">
                <h3>{{ project.title }}</h3>
                <p>{{ project.description }}</p>
                <span>{{ t('duration') }} : {{ formatProjectDuration(project) }}</span>
              </div>
              <button class="selection-dot" :class="{ visible: isSelectionMode }" @click.stop="toggleSelection(project.id)">
                <ion-icon :icon="isSelected(project.id) ? checkmarkCircle : ellipseOutline" />
              </button>
            </div>

            <div class="project-actions">
              <button class="action-btn" type="button" @click.stop="openProjectActions(project)">
                <ion-icon :icon="ellipsisVertical" />
              </button>
            </div>
          </article>
        </section>
      </div>

      <transition name="bottom-slide">
        <div v-if="isSelectionMode" class="selection-bar">
          <div class="selection-actions">
            <button type="button" class="selection-action" @click="confirmBulkRestore">
              <ion-icon :icon="refreshOutline" />
              <span>{{ t('restoreSelection') }}</span>
            </button>
            <button type="button" class="selection-action danger" @click="confirmBulkDeletePermanently">
              <ion-icon :icon="trashOutline" />
              <span>{{ t('deleteSelection') }}</span>
            </button>
          </div>
        </div>
      </transition>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import TrashComponent from '../utils/trash';

export default TrashComponent;
</script>

<style scoped src="../theme/trash.css"></style>
