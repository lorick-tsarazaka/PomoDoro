<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="isTaskSelectionMode ? clearTaskSelection() : goBack()">
            <ion-icon :icon="isTaskSelectionMode ? closeOutline : chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title v-if="!isTaskSelectionMode">{{ t('projectDetails') }}</ion-title>
        <ion-buttons v-if="isTaskSelectionMode" slot="end">
          <ion-button fill="clear" class="delete-select-btn" @click="confirmDeleteSelection">
            <ion-icon :icon="trashOutline" />
            <span>{{ t('delete') }} ({{ selectedTaskIds.length }})</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="page-shell" v-if="project">
        <section class="detail-card">
          <h2>{{ project.title }}</h2>
          <div class="description-row">
            <span>{{ t('description') }} :</span>
            <p style="margin: 0">{{ project.description }}</p>
          </div>
          <div class="meta-row">
            <span>{{ t('duration') }}</span>
            <strong>{{ formatProjectDuration(project) }}</strong>
          </div>
          <div class="meta-row">
            <span>{{ t('projectProgressLabel') }}</span>
            <strong>{{ progress.done }}/{{ progress.total }} ({{ progress.percent }}%)</strong>
          </div>
        </section>

        <section class="task-list-wrap">
          <div class="task-list-head">
            <h3>{{ t('projectTaskListTitle') }}</h3>
          </div>

          <section v-if="orderedTasks.length === 0" class="task-empty">
            <ion-icon :icon="listOutline" />
            <p>{{ t('projectNoTask') }}</p>
          </section>

          <ion-reorder-group v-else :disabled="!canReorder" @ionItemReorder="onReorder">
            <article
              v-for="task in orderedTasks"
              :key="task.id"
              class="task-card"
              :class="{
                done: task.status === 'done',
                selected: isTaskSelected(task.id),
                dimmed: isTaskDimmed(task.id)
              }"
              @click="onTaskCardClick(task.id)"
            >
              <div class="task-main">
                <ion-reorder>
                  <ion-icon :icon="reorderThreeOutline" />
                </ion-reorder>
                <div
                  class="task-info"
                  @mousedown="startTaskLongPress(task.id, $event)"
                  @mouseup="cancelTaskLongPress"
                  @mouseleave="cancelTaskLongPress"
                  @touchstart="startTaskLongPress(task.id, $event)"
                  @touchend="cancelTaskLongPress"
                >
                  <strong>{{ task.title }}</strong>
                  <span>{{ formatTaskDuration(task) }}</span>
                </div>
              </div>

              <div class="task-actions" @click.stop>
                <button v-if="isTaskSelectionMode" class="task-select right" type="button" @click.stop="toggleTaskSelection(task.id)">
                  <ion-icon :icon="isTaskSelected(task.id) ? checkmarkCircle : ellipseOutline" />
                </button>
                <button v-if="!isTaskSelectionMode && isRunning && currentTaskId === task.id && projectTimerSnapshot.phase === 'work'" class="mini-action" type="button" :disabled="task.status === 'done' || isTaskDimmed(task.id)" @click="markDone(task.id)">
                  <ion-icon :icon="checkmarkDoneOutline" />
                </button>
                <button v-if="!isTaskSelectionMode" class="mini-action" type="button" @click="openTaskActions(task.id)">
                  <ion-icon :icon="ellipsisVertical" />
                </button>
              </div>
            </article>
          </ion-reorder-group>
        </section>

        <div v-if="project.status === 'todo'" class="bottom-controls">
          <button
            type="button"
            class="play-pill"
            :class="{ paused: !isRunning, running: isRunning }"
            :style="playButtonStyle"
            :disabled="!canPlay"
            @click="togglePlay"
          >
            <span>{{ formattedCountdown }}</span>
            <ion-icon :icon="isRunning ? pauseOutline : playOutline" />
          </button>
          <button class="add-task-btn" type="button" @click="openCreateTaskModal">
            <ion-icon :icon="add" />
          </button>
        </div>
      </div>

      <div class="page-shell" v-else>
        <section class="detail-card">
          <h2>{{ t('projectDetails') }}</h2>
          <p>{{ t('projectNotFound') }}</p>
        </section>
      </div>

      <ion-modal :is-open="isTaskModalOpen" @did-dismiss="closeTaskModal">
        <ion-header class="page-header">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button fill="clear" class="page-back-btn" @click="closeTaskModal">
                <ion-icon :icon="chevronBackOutline" />
              </ion-button>
            </ion-buttons>
            <ion-title>{{ editingTaskId ? t('projectEditTask') : t('projectAddTask') }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <form class="form-layout" @submit.prevent="saveTask">
            <label>
              <span>{{ t('title') }}</span>
              <ion-input v-model="taskForm.title" fill="outline" required />
            </label>
            <div class="duration-grid">
              <label>
                <span>{{ t('hours') }}</span>
                <ion-input v-model.number="taskForm.durationHours" type="number" min="0" fill="outline" required />
              </label>
              <label>
                <span>{{ t('minutes') }}</span>
                <ion-input v-model.number="taskForm.durationMinutes" type="number" min="0" max="59" fill="outline" required />
              </label>
              <label>
                <span>{{ t('seconds') }}</span>
                <ion-input v-model.number="taskForm.durationSeconds" type="number" min="0" max="59" fill="outline" required />
              </label>
            </div>
            <div class="form-actions">
              <ion-button fill="clear" @click="closeTaskModal">{{ t('cancel') }}</ion-button>
              <ion-button type="submit">{{ t('save') }}</ion-button>
            </div>
          </form>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import ProjectComponent from '../utils/project';

export default ProjectComponent;
</script>

<style scoped src="../theme/project.css"></style>
