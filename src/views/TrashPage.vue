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

<script setup lang="ts">
import {
  actionSheetController,
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewWillLeave,
  toastController,
} from '@ionic/vue';
import {
  checkmarkDoneOutline,
  checkmarkCircle,
  chevronBackOutline,
  checkmarkOutline,
  closeOutline,
  ellipseOutline,
  ellipsisVertical,
  refreshOutline,
  trashOutline,
} from 'ionicons/icons';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  bulkChangeStatus,
  bulkDeletePermanently,
  deleteProjectPermanently,
  formatProjectDuration,
  projects,
  restoreProject,
  setSelectionHeaderActive,
  type Project,
} from '../services/service';
import { useI18n } from '../utils/i18n';

const { t } = useI18n();
const router = useRouter();
const selectedIds = ref<string[]>([]);
let longPressTimer: ReturnType<typeof setTimeout> | null = null;

async function goBack(): Promise<void> {
  if (window.history.length > 1) {
    await router.back();
    return;
  }

  await router.push('/home');
}

const trashProjects = computed(() => {
  return projects.value.filter((project) => project.status === 'trash');
});

const isSelectionMode = computed(() => selectedIds.value.length > 0);

const isAllSelected = computed(() => {
  return trashProjects.value.length > 0 && selectedIds.value.length === trashProjects.value.length;
});

function clearSelection(): void {
  selectedIds.value = [];
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

function startLongPress(projectId: string): void {
  cancelLongPress();
  longPressTimer = setTimeout(() => {
    toggleSelection(projectId);
  }, 450);
}

function cancelLongPress(): void {
  if (!longPressTimer) {
    return;
  }

  clearTimeout(longPressTimer);
  longPressTimer = null;
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

  selectedIds.value = trashProjects.value.map((project) => project.id);
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

async function confirmRestore(projectId: string): Promise<void> {
  await withConfirmation(t('confirmRestore'), async () => {
    await restoreProject(projectId);
    await showToast(t('restoreSuccess'), checkmarkOutline);
  });
}

async function confirmDeletePermanent(projectId: string): Promise<void> {
  await withConfirmation(t('confirmPermanentDelete'), async () => {
    await deleteProjectPermanently(projectId);
    await showToast(t('deleteSuccess'), trashOutline);
  });
}

async function confirmBulkRestore(): Promise<void> {
  await withConfirmation(t('confirmRestore'), async () => {
    await bulkChangeStatus(Array.from(selectedIds.value), 'todo');
    clearSelection();
    await showToast(t('restoreSuccess'), checkmarkOutline);
  });
}

async function confirmBulkDeletePermanently(): Promise<void> {
  await withConfirmation(t('confirmPermanentDelete'), async () => {
    await bulkDeletePermanently(Array.from(selectedIds.value));
    clearSelection();
    await showToast(t('deleteSuccess'), trashOutline);
  });
}

async function openProjectActions(project: Project): Promise<void> {
  const actionSheet = await actionSheetController.create({
    header: project.title,
    buttons: [
      {
        text: t('restore'),
        icon: refreshOutline,
        handler: async () => {
          await confirmRestore(project.id);
        },
      },
      {
        text: t('delete'),
        role: 'destructive',
        icon: trashOutline,
        handler: async () => {
          await confirmDeletePermanent(project.id);
        },
      },
      {
        text: t('cancel'),
        role: 'cancel',
      },
    ],
  });

  await actionSheet.present();
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
.page-header {
  --background: var(--app-surface);
  --color: var(--app-text-primary);
  --border-color: var(--app-border);
  box-shadow: var(--app-header-shadow);
  border-bottom: 1px solid var(--app-border);
}

.page-header ion-toolbar {
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
}

.page-header::after {
  display: none;
}

.page-header ion-title {
  font-size: 18px;
  font-weight: 700;
}

.page-back-btn {
  --color: var(--app-accent) !important;
  --color-activated: var(--app-accent);
  --color-focused: var(--app-accent);
  --color-hover: var(--app-accent);
  color: var(--app-accent);
  width: 46px;
  height: 46px;
  margin: 0;
}

.page-back-btn ion-icon {
  font-size: 26px;
  color: var(--app-accent);
}

.page-content {
  --background: var(--app-bg);
}

.page-shell {
  padding: 16px 14px 112px;
}

.page-shell-no {
  padding: 10px 14px 112px;
}

.page-shell.selecting {
  padding-top: calc(84px + var(--ion-safe-area-top, env(safe-area-inset-top)));
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

.project-info {
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
  font-size: 16px;
  text-align: start;
}

.project-body span {
  font-size: 16px;
  color: var(--app-text-secondary);
  text-align: start;
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
  font-size: large;
  display: grid;
  place-items: center;
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
