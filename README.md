# PomoDoro

PomoDoro is a productivity-focused web and Android project management app. It lets you track tasks as projects, organize them by status, assign precise durations, and manage them through a modern mobile interface built with Ionic and Vue 3.

## Overview

The app follows a simple and direct workflow:

- create and edit projects,
- track Todo, Done, and Trash states,
- use multi-select for bulk actions,
- customize language and font,
- sync natively on Android through SQLite,
- keep content behavior consistent across Web and Android.

## Features

- Full project lifecycle management.
- Configurable duration in hours, minutes, and seconds.
- Long-press multi-selection mode.
- Quick actions from Home and Trash.
- Integrated navigation to Settings, Help, and About.
- Mobile-friendly UI powered by Ionic components.
- Platform-specific persistence strategy.
- Translations available in French, English, and Malagasy.

## Tech Stack

<p align="center">
  <img alt="Vue" src="https://img.shields.io/badge/Vue%203-4FC08D?logo=vue.js&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white">
  <img alt="Ionic" src="https://img.shields.io/badge/Ionic-3880FF?logo=ionic&logoColor=white">
  <img alt="Capacitor" src="https://img.shields.io/badge/Capacitor-119EFF?logo=capacitor&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white">
  <img alt="Android" src="https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white">
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white">
  <img alt="Cypress" src="https://img.shields.io/badge/Cypress-17202C?logo=cypress&logoColor=white">
</p>

- Frontend: Vue 3 + TypeScript
- UI layer: Ionic Vue
- Routing: Vue Router
- Native mobile: Capacitor
- Native database: SQLite
- Web build tool: Vite
- Unit tests: Vitest
- End-to-end tests: Cypress

Main dependencies:

- @ionic/vue
- @capacitor/core
- @capacitor/android
- @capacitor-community/sqlite
- vue
- vue-router

## Architecture

The project is organized into a few clear building blocks:

- [src/services/service.ts](src/services/service.ts) centralizes global state, business logic, and persistence.
- [src/utils/i18n.ts](src/utils/i18n.ts) contains translations and language options.
- [src/views](src/views) contains the application screens.
- [src/router/index.ts](src/router/index.ts) defines navigation.
- [src/theme/variables.css](src/theme/variables.css) defines the global theme and visual variables.

Data flow:

- On startup, the app loads data through `initializeAppData`.
- In Web mode, data is stored in `localStorage`.
- In native Android mode, data is stored in SQLite.
- Every change is persisted immediately after user action.

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- For Android:
  - Android Studio,
  - Android SDK,
  - a JDK compatible with Gradle and Android.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Then open the local address shown by Vite.

## Available Commands

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

This runs the Vue/TypeScript type check and generates the web build in `dist`.

### Preview Build

```bash
npm run preview
```

### Code Linting

```bash
npm run lint
```

### Unit Tests

```bash
npm run test:unit
```

### End-to-End Tests

```bash
npm run test:e2e
```

## Android APK Build

The [build_apk.bat](build_apk.bat) script automates the Android build end to end.

### Automated Steps

1. Copy the source icon into the public folder.
2. Build the web app with Vite.
3. Sync Capacitor for Android.
4. Generate Android launcher icons.
5. Compile the debug APK.
6. Copy the APK to `android/app/outputs/apk`.

### Run It

```bash
build_apk.bat
```

### Inputs and Outputs

- Source icon: `ressources/icon.png`
- Web assets: `public/favicon.png` and `public/app-icon.png`
- APK source: `android/app/build/outputs/apk/debug`
- APK destination: `android/app/outputs/apk`

## Data Persistence

The project uses two storage strategies depending on the platform.

### Web

- stored in `localStorage`,
- storage key: `pomodoro.projects.v1`.

### Native Android

- SQLite database: `pomodoro_db`,
- main tables:
  - `projects`,
  - `settings`.

The service also handles simple migrations to add columns when needed.

## Internationalization

Supported languages:

- French (`fr`)
- English (`en`)
- Malagasy (`mg`)

All text strings are centralized in [src/utils/i18n.ts](src/utils/i18n.ts).

## Tests

The repository includes a baseline for unit and end-to-end tests.

- Unit tests: `tests/unit`
- E2E tests: `tests/e2e`

Note: some sample tests inherited from the original Ionic/Vue template may still need to be updated to match the current UI.

## Project Structure

```text
.
├── android/
├── public/
├── scripts/
├── src/
│   ├── router/
│   ├── services/
│   ├── theme/
│   ├── utils/
│   └── views/
├── tests/
├── build_apk.bat
├── package.json
└── README.md
```

## Troubleshooting

- Missing icon during Android build:
  - verify that `ressources/icon.png` exists.
- Error after Capacitor sync:
  - rerun the workflow with `build_apk.bat`.
- Web persistence issue:
  - clear and reload the browser `localStorage`.
- Android compilation error:
  - check Android Studio, the SDK, and your Java version.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE).

