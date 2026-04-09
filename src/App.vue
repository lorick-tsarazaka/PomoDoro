<template>
  <ion-app>
    <ion-menu content-id="main-content" type="overlay" :swipe-gesture="true" class="side-menu">
      <ion-header class="menu-header">
        <ion-toolbar>
          <ion-title>{{ t('menu') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="menu-content">
        <ion-list class="menu-list" lines="full">
          <ion-item button :detail="false" class="menu-item" @click="goTo('/trash')">
            <ion-icon slot="start" :icon="trashOutline" />
            <ion-label>{{ t('trash') }}</ion-label>
          </ion-item>
          <ion-item button :detail="false" class="menu-item" @click="goTo('/help')">
            <ion-icon slot="start" :icon="helpCircleOutline" />
            <ion-label>{{ t('help') }}</ion-label>
          </ion-item>
          <ion-item button :detail="false" class="menu-item" @click="goTo('/about')">
            <ion-icon slot="start" :icon="informationCircleOutline" />
            <ion-label>{{ t('about') }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <div id="main-content" class="app-shell">
      <header v-if="isHomePage && !isSelectionHeaderActive" class="top-header">
        <button class="icon-btn" type="button" @click="openMenu">
          <ion-icon :icon="menuOutline" />
        </button>

        <div class="mode-switch">
          <button
            class="mode-btn"
            type="button"
            :class="{ active: activeMode === 'todo' }"
            @click="changeMode('todo')"
          >
            <ion-icon :icon="folderOpenOutline" />
          </button>
          <button
            class="mode-btn"
            type="button"
            :class="{ active: activeMode === 'done' }"
            @click="changeMode('done')"
          >
            <ion-icon :icon="checkmarkDoneOutline" />
          </button>
        </div>

        <button class="icon-btn" type="button" @click="goTo('/settings')">
          <ion-icon :icon="settingsOutline" />
        </button>
      </header>

      <ion-router-outlet class="app-content" />
    </div>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  menuController,
} from '@ionic/vue';
import {
  checkmarkDoneOutline,
  folderOpenOutline,
  helpCircleOutline,
  informationCircleOutline,
  menuOutline,
  settingsOutline,
  trashOutline,
} from 'ionicons/icons';
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  activeMode,
  initializeAppData,
  isSelectionHeaderActive,
  setActiveMode,
  type ViewMode,
} from './services/service';
import { useI18n } from './utils/i18n';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const isHomePage = computed(() => route.path === '/home');

function syncModeFromRoute(): void {
  const queryMode = route.query.mode;
  if (queryMode === 'todo' || queryMode === 'done') {
    setActiveMode(queryMode);
  }
}

async function openMenu(): Promise<void> {
  await menuController.open();
}

async function goTo(path: string): Promise<void> {
  await menuController.close();
  await router.push(path);
}

async function changeMode(mode: ViewMode): Promise<void> {
  setActiveMode(mode);
  await router.push({ path: '/home', query: { mode } });
}

watch(
  () => route.query.mode,
  () => syncModeFromRoute(),
  { immediate: true }
);

onMounted(async () => {
  await initializeAppData();
  syncModeFromRoute();
});
</script>

<style scoped>
.app-shell {
  background: var(--app-bg);
  min-height: 100vh;
}

.top-header {
  height: calc(65px + var(--ion-safe-area-top, env(safe-area-inset-top)));
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(8px + var(--ion-safe-area-top, env(safe-area-inset-top))) 14px 8px;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: var(--app-header-shadow);
}

.icon-btn,
.mode-btn {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--app-text-primary);
  display: grid;
  place-items: center;
  transition: all 240ms ease;
}

.icon-btn ion-icon,
.mode-btn ion-icon {
  font-size: 22px;
}

.icon-btn:active,
.mode-btn:active {
  transform: scale(0.96);
}

.mode-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-btn {
  background: transparent;
}

.mode-btn.active {
  background: var(--app-accent);
  color: #ffffff;
}

.app-content {
  --padding-top: 0;
}

.side-menu,
.side-menu ion-content,
.side-menu .menu-content {
  --background: var(--app-surface);
}

.side-menu {
  --width: 75vw;
  --max-width: 340px;
  --min-width: 260px;
  contain: layout paint style;
}

.side-menu::part(container) {
  background: var(--app-surface);
  will-change: transform;
  backface-visibility: hidden;
}

.menu-header ion-toolbar {
  --background: var(--app-surface);
  --color: var(--app-text-primary);
  --min-height: 65px;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 10px;
  --padding-end: 10px;
  min-height: 65px;
  display: flex;
  align-items: center;
  --box-shadow: none;
  border-bottom: 1px solid var(--app-border);
  box-shadow: none;
}

.menu-header ion-title {
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 18px;
  font-weight: 700;
}

.menu-header::after {
  display: none !important;
}

.menu-content {
  --padding-top: 8px;
}

.menu-list {
  margin: 0;
  padding: 0;
  background: transparent;
}

.menu-item {
  --background: var(--app-surface);
  --color: var(--app-text-primary);
  --padding-start: 16px;
  --inner-padding-end: 16px;
  --min-height: 48px;
  --border-color: var(--app-border);
  font-size: 15px;
}

.menu-item ion-icon {
  font-size: 20px;
  color: var(--app-text-primary);
}

.menu-item.item-interactive.ion-activated::part(native) {
  background: var(--app-bg-hover);
}
</style>
