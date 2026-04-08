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
              <ion-textarea v-model="form.description" fill="outline" auto-grow required />
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

<script setup lang="ts">
import {
  actionSheetController,
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  onIonViewWillLeave,
  toastController,
} from '@ionic/vue';
import {
  add,
  alertCircleOutline,
  checkmarkCircle,
  checkmarkDoneOutline,
  chevronBackOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  ellipseOutline,
  ellipsisVertical,
  refreshOutline,
  trashOutline,
} from 'ionicons/icons';
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  activeMode,
  addProject,
  bulkChangeStatus,
  formatProjectDuration,
  setSelectionHeaderActive,
  markProjectDone,
  markProjectTodo,
  moveProjectToTrash,
  projects,
  type Project,
  updateProject,
} from '../services/service';
import { useI18n } from '../utils/i18n';

const { t } = useI18n();
const router = useRouter();

const isModalOpen = ref(false);
const editingProjectId = ref<string | null>(null);
const selectedIds = ref<string[]>([]);

const form = reactive({
  title: '',
  description: '',
  durationHours: 0,
  durationMinutes: 25,
  durationSeconds: 0,
});

let longPressTimer: ReturnType<typeof setTimeout> | null = null;

const filteredProjects = computed(() => {
  return projects.value.filter((project) => project.status === activeMode.value);
});

const isSelectionMode = computed(() => selectedIds.value.length > 0);

const isAllSelected = computed(() => {
  return filteredProjects.value.length > 0 && selectedIds.value.length === filteredProjects.value.length;
});

function resetForm(): void {
  form.title = '';
  form.description = '';
  form.durationHours = 0;
  form.durationMinutes = 25;
  form.durationSeconds = 0;
  editingProjectId.value = null;
}

function clearSelection(): void {
  selectedIds.value = [];
}

function openCreateModal(): void {
  resetForm();
  isModalOpen.value = true;
}

function closeModal(): void {
  isModalOpen.value = false;
  resetForm();
}

function normalizeDuration(): { hours: number; minutes: number; seconds: number } {
  const safeHours = Math.max(0, Number(form.durationHours || 0));
  const safeMinutes = Math.min(59, Math.max(0, Number(form.durationMinutes || 0)));
  const safeSeconds = Math.min(59, Math.max(0, Number(form.durationSeconds || 0)));

  return {
    hours: safeHours,
    minutes: safeMinutes,
    seconds: safeSeconds,
  };
}

async function showToast(message: string, icon: string): Promise<void> {
  const toast = await toastController.create({
    message,
    icon,
    duration: 1500,
    position: 'bottom',
  });

  await toast.present();
}

async function saveProject(): Promise<void> {
  const duration = normalizeDuration();

  if (!form.title.trim() || !form.description.trim()) {
    await showToast(t('requiredFields'), alertCircleOutline);
    return;
  }

  if (duration.hours === 0 && duration.minutes === 0 && duration.seconds === 0) {
    await showToast(t('requiredFields'), alertCircleOutline);
    return;
  }

  if (!editingProjectId.value) {
    await addProject({
      title: form.title,
      description: form.description,
      durationHours: duration.hours,
      durationMinutes: duration.minutes,
      durationSeconds: duration.seconds,
    });
    closeModal();
    await showToast(t('createSuccess'), checkmarkCircle);
    return;
  }

  const alert = await alertController.create({
    header: t('confirmEdit'),
    buttons: [
      { text: t('cancel'), role: 'cancel' },
      {
        text: t('confirm'),
        handler: async () => {
          await updateProject(editingProjectId.value as string, {
            title: form.title,
            description: form.description,
            durationHours: duration.hours,
            durationMinutes: duration.minutes,
            durationSeconds: duration.seconds,
          });
          closeModal();
          await showToast(t('updateSuccess'), checkmarkCircle);
        },
      },
    ],
  });

  await alert.present();
}

async function openProject(projectId: string): Promise<void> {
  await router.push(`/project/${projectId}`);
}

function startLongPress(projectId: string): void {
  cancelLongPress();
  longPressTimer = setTimeout(() => {
    toggleSelection(projectId);
  }, 450);
}

function cancelLongPress(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function toggleSelection(projectId: string): void {
  if (selectedIds.value.includes(projectId)) {
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== projectId);
    return;
  }

  selectedIds.value = [...selectedIds.value, projectId];
}

function toggleSelectAll(): void {
  if (isAllSelected.value) {
    clearSelection();
    return;
  }

  selectedIds.value = filteredProjects.value.map((project) => project.id);
}

async function withConfirmation(header: string, action: () => Promise<void>): Promise<void> {
  const alert = await alertController.create({
    header,
    buttons: [
      { text: t('cancel'), role: 'cancel' },
      {
        text: t('confirm'),
        handler: async () => {
          await action();
        },
      },
    ],
  });

  await alert.present();
}

async function confirmMarkDone(projectId: string): Promise<void> {
  await withConfirmation(t('confirmDone'), async () => {
    await markProjectDone(projectId);
    await showToast(t('doneSuccess'), checkmarkOutline);
  });
}

async function confirmDelete(projectId: string): Promise<void> {
  await withConfirmation(t('confirmDelete'), async () => {
    await moveProjectToTrash(projectId);
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== projectId);
    await showToast(t('deleteSuccess'), trashOutline);
  });
}

async function confirmRedo(projectId: string): Promise<void> {
  await withConfirmation(t('confirmRedo'), async () => {
    await markProjectTodo(projectId);
    await showToast(t('todoSuccess'), checkmarkOutline);
  });
}

async function openProjectActions(project: Project): Promise<void> {
  const buttons = activeMode.value === 'todo'
    ? [
        {
          text: t('editProject'),
          icon: createOutline,
          handler: () => {
            editingProjectId.value = project.id;
            form.title = project.title;
            form.description = project.description;
            form.durationHours = project.durationHours;
            form.durationMinutes = project.durationMinutes;
            form.durationSeconds = project.durationSeconds;
            isModalOpen.value = true;
          },
        },
        {
          text: t('delete'),
          role: 'destructive' as const,
          icon: trashOutline,
          handler: async () => {
            await confirmDelete(project.id);
          },
        },
      ]
    : [
        {
          text: t('markTodo'),
          icon: refreshOutline,
          handler: async () => {
            await confirmRedo(project.id);
          },
        },
        {
          text: t('delete'),
          role: 'destructive' as const,
          icon: trashOutline,
          handler: async () => {
            await confirmDelete(project.id);
          },
        },
      ];

  const actionSheet = await actionSheetController.create({
    header: project.title,
    buttons: [
      ...buttons,
      {
        text: t('cancel'),
        role: 'cancel',
      },
    ],
  });

  await actionSheet.present();
}

async function confirmBulkDone(): Promise<void> {
  await withConfirmation(t('confirmDone'), async () => {
    await bulkChangeStatus(Array.from(selectedIds.value), 'done');
    clearSelection();
    await showToast(t('doneSuccess'), checkmarkOutline);
  });
}

async function confirmBulkTodo(): Promise<void> {
  await withConfirmation(t('confirmRedo'), async () => {
    await bulkChangeStatus(Array.from(selectedIds.value), 'todo');
    clearSelection();
    await showToast(t('todoSuccess'), checkmarkOutline);
  });
}

async function confirmBulkDelete(): Promise<void> {
  await withConfirmation(t('confirmDelete'), async () => {
    await bulkChangeStatus(Array.from(selectedIds.value), 'trash');
    clearSelection();
    await showToast(t('deleteSuccess'), trashOutline);
  });
}

onIonViewWillLeave(() => {
  setSelectionHeaderActive(false);
  clearSelection();
  cancelLongPress();
});

watch(
  isSelectionMode,
  (active) => {
    setSelectionHeaderActive(active);
  },
  { immediate: true }
);

function isSelected(projectId: string): boolean {
  return selectedIds.value.includes(projectId);
}
</script>

<style scoped>

.page-content {
  --background: var(--app-bg);
}

.page-shell {
  padding: calc(84px + var(--ion-safe-area-top, env(safe-area-inset-top))) 14px 112px;
}
.page-shell-no {
    background: #ffffff00 !important;
  padding: calc(84px + var(--ion-safe-area-top, env(safe-area-inset-top))) 14px 112px;
}

.selection-mode-header {
  height: calc(65px + var(--ion-safe-area-top, env(safe-area-inset-top)));
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(8px + var(--ion-safe-area-top, env(safe-area-inset-top))) 14px 8px;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: var(--app-header-shadow);
}

.selection-mode-header h2 {
  margin: 0;
  font-size: 16px;
  color: var(--app-text-primary);
  font-weight: 700;
}

.icon-btn {
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--app-text-primary);
  display: grid;
  place-items: center;
}

.icon-btn ion-icon {
  font-size: 22px;
}

.card-like,
.project-card {
  border-radius: 10px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow-soft);
}

.empty-state {
  padding: 16px;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--app-text-primary);
}

.empty-state p {
  margin: 0;
  color: var(--app-text-secondary);
}

.project-list {
  display: grid;
  gap: 12px;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  transition: transform 240ms ease, box-shadow 240ms ease, background-color 240ms ease;
}

.project-card:active {
  transform: translateY(-1px);
  background: transparent;
}

.project-card.selected {
  outline: 2px solid var(--app-accent);
}

.selection-dot {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--app-accent);
  opacity: 0;
  pointer-events: none;
}

.selection-dot.visible {
  opacity: 1;
  pointer-events: auto;
}

.selection-dot ion-icon {
  font-size: 22px;
}

.project-body {
  border: none;
  background: transparent;
  display: flex;
  justify-content: space-between;
  padding: 5px;
}
.project-info{
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: 5px;
}

.project-body h3 {
  margin: 0;
  color: var(--app-text-primary);
  text-align: start;
  font-size: 18px;
}

.project-body p {
  margin: 6px 0;
  color: var(--app-text-secondary);
  text-align: start;
  font-size: 16px;
}

.project-body span {
    color: var(--app-text-secondary);
    text-align: start;
    font-size: 16px;
}

.project-actions {
  display: flex;
  justify-content: end;
  width: 100%;
  gap: 8px;
}

.action-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--app-accent);
  display: grid;
  place-items: center;
  font-size: large;
  transition: transform 200ms ease, background-color 200ms ease;
}

.action-btn:active {
  transform: scale(0.95);
}

.main-fab-wrap {
  margin-bottom: 22px;
  margin-right: 12px;
}

.main-fab {
  --background: var(--app-accent);
}

.selection-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  border-radius: 0;
  border-top: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: var(--app-header-shadow);
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  display: grid;
}

.selection-actions {
  display: flex;
  gap: 8px;
  justify-content: space-around;
}

.selection-action {
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  background: transparent;
  color: var(--app-text-primary);
  font-size: 11px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  gap: 4px;
}

.selection-action.danger {
  color: var(--app-danger);
}

.selection-action ion-icon {
  font-size: 20px;
}

.header-fade-enter-active,
.header-fade-leave-active {
  transition: opacity 200ms ease;
}

.header-fade-enter-from,
.header-fade-leave-to {
  opacity: 0;
}

.form-layout {
  display: grid;
  gap: 14px;
}

.modal-header {
  --background: var(--app-surface);
  --color: var(--app-text-primary);
  --border-color: var(--app-border);
  --min-height: 65px;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 10px;
  --padding-end: 10px;
  min-height: 65px;
  display: flex;
  align-items: center;
  box-shadow: var(--app-header-shadow);
  border-bottom: 1px solid var(--app-border);
}

.modal-header ion-title {
  font-size: 18px;
  font-weight: 700;
}

.modal-back-btn {
  --color: var(--app-accent) !important;
  --color-activated: var(--app-accent);
  --color-focused: var(--app-accent);
  --color-hover: var(--app-accent);
  color: var(--app-accent);
  width: 52px;
  height: 52px;
  margin: 0;
}

.modal-back-btn ion-icon {
  font-size: 30px;
  color: var(--app-accent);
}

.modal-header::after {
  display: none;
}

.form-layout label {
  display: grid;
  gap: 8px;
}

.input-fill-outline.sc-ion-input-md-h , .textarea-fill-outline.sc-ion-textarea-md-h{
    --border-color: rgba(100, 118, 150, 0.142) !important;
}
.form-layout label span {
  color: var(--app-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.duration-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.bottom-slide-enter-active,
.bottom-slide-leave-active {
  transition: all 240ms ease;
}

.bottom-slide-enter-from,
.bottom-slide-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>
