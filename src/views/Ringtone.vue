<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="goBack">
            <ion-icon :icon="isSelectionMode ? closeOutline : chevronBackOutline" />
          </ion-button>
        </ion-buttons>

        <ion-title v-if="!isSelectionMode">{{ t('soundPageTitle') }}</ion-title>

        <ion-buttons v-if="isSelectionMode" slot="end">
          <ion-button fill="clear" class="delete-select-btn" @click="confirmDeleteSelection">
            <ion-icon :icon="trashOutline" />
            <span>{{ t('delete') }} ({{ selectedLocalIds.length }})</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="page-shell">
        <section class="sound-group">
          <div class="list-wrap">
            <div class="group-head">
              <h2>{{ t('soundAppTitle') }}</h2>
              <p>{{ t('soundAppSubtitle') }}</p>
            </div>

          <article
            v-for="sound in appRingtones"
            :key="sound.id"
            class="sound-card"
            :class="{ playing: isPreviewing(sound.id), selected: isSelectedRingtone(sound.id) }"
            @click="playSound(sound.id)"
          >
            <div class="sound-info">
              <strong>{{ sound.name }}</strong>
              <span>{{ sound.url.split('/').pop() }}</span>
            </div>
            <div v-if="isPreviewing(sound.id)" class="sound-inline-actions" @click.stop>
              <button class="sound-check-btn" type="button" @click.stop="selectRingtone(sound.id)">
                <ion-icon :icon="checkmarkCircle" />
              </button>
              <button class="sound-stop-btn" type="button" @click.stop="stopPreview">
                <ion-icon :icon="stopCircle" />
              </button>
            </div>
            <ion-icon v-else-if="isSelectedRingtone(sound.id)" class="sound-selected-icon" :icon="checkmarkCircle" />
          </article>
          </div>
        </section>

        <section class="sound-group">
          <div class="list-wrap">
            <div class="group-head">
              <h2>{{ t('soundLocalTitle') }}</h2>
              <p>{{ t('soundLocalSubtitle') }}</p>
            </div>

          <article
            v-for="sound in localRingtones"
            :key="sound.id"
            class="sound-card"
            :class="{ playing: isPreviewing(sound.id), selected: isLocalSelected(sound.id) || isSelectedRingtone(sound.id) }"
            @click="playSound(sound.id)"
            @mousedown="startLocalLongPress(sound.id)"
            @mouseup="stopLocalLongPress"
            @mouseleave="stopLocalLongPress"
            @touchstart="startLocalLongPress(sound.id)"
            @touchend="stopLocalLongPress"
          >
            <button v-if="isSelectionMode" class="sound-select-btn" type="button" @click.stop="toggleLocalSelection(sound.id)">
              <ion-icon :icon="isLocalSelected(sound.id) ? checkmarkCircle : ellipseOutline" />
            </button>
            <div class="sound-info">
              <strong>{{ sound.name }}</strong>
              <span>{{ t('soundLocalChip') }}</span>
            </div>
            <div v-if="!isSelectionMode && isPreviewing(sound.id)" class="sound-inline-actions" @click.stop>
              <button class="sound-check-btn" type="button" @click.stop="selectRingtone(sound.id)">
                <ion-icon :icon="checkmarkCircle" />
              </button>
              <button class="sound-stop-btn" type="button" @click.stop="stopPreview">
                <ion-icon :icon="stopCircle" />
              </button>
            </div>
            <ion-icon v-else-if="!isSelectionMode && isSelectedRingtone(sound.id)" class="sound-selected-icon" :icon="checkmarkCircle" />
          </article>

          <button class="sound-add-card" type="button" @click="openPicker">
            <ion-icon :icon="add" />
            <span>{{ t('soundAdd') }}</span>
          </button>
          </div>
          <input
            ref="fileInput"
            class="sound-file-input"
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
            multiple
            @change="onFilesSelected"
          />
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import RingtoneComponent from '../utils/ringtone';

export default RingtoneComponent;
</script>

<style scoped src="../theme/ringtone.css"></style>
