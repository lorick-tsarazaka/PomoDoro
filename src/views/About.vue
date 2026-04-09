<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="page-back-btn" @click="goBack">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ t('about') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="page-shell">
        <section class="hero-card">
          <img class="app-logo" src="/app-icon.png" alt="App icon" />
          <div>
            <h2>PomoDoro</h2>
            <p>{{ t('appDescription') }}</p>
          </div>
        </section>

        <section class="info-card">
          <h3>{{ t('aboutApkInfoTitle') }}</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="about-label">{{ t('aboutPlatformLabel') }}</span>
              <span class="about-value">{{ t('aboutPlatformValue') }}</span>
            </div>
            <div class="info-row">
              <span class="about-label">{{ t('aboutTechLabel') }}</span>
              <span class="about-value">{{ t('aboutTechValue') }}</span>
            </div>
            <div class="info-row">
              <span class="about-label">{{ t('aboutStorageLabel') }}</span>
              <span class="about-value">{{ t('aboutStorageValue') }}</span>
            </div>
            <div class="info-row">
              <span class="about-label">{{ t('aboutVersionLabel') }}</span>
              <span class="about-value">{{ t('aboutVersionValue') }}</span>
            </div>
          </div>
        </section>

        <section class="info-card creator-card">
          <h3>{{ t('aboutCreatorInfoTitle') }}</h3>
          <div class="creator-card-content">
            <p class="creator-name">Lorick TSARAZAKA</p>
            <p class="creator-subtitle">{{ t('aboutCreatorSubtitle') }}</p>
            <div class="creator-social-row">
              <a
                class="creator-social-btn github"
                href="https://github.com/lorick-tsarazaka"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="t('aboutGithubLabel')"
              >
                <ion-icon :icon="logoGithub" />
              </a>
              <a
                class="creator-social-btn linkedin"
                href="https://www.linkedin.com/in/lorick-tsarazaka"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="t('aboutLinkedinLabel')"
              >
                <ion-icon :icon="logoLinkedin" />
              </a>
              <a class="creator-social-btn mail" href="mailto:lorick.tsarazaka.lk@gmail.com" :aria-label="t('aboutEmailLabel')">
                <ion-icon :icon="mailOutline" />
              </a>
            </div>
          </div>
        </section>

        <footer class="about-footer">
          <p>© {{ currentYear }} PomoDoro.</p>
        </footer>

      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import AboutComponent from '../utils/about';

export default AboutComponent;
</script>

<style scoped src="../theme/about.css"></style>
