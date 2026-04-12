# PomoDoro


<img src="public/app-icon.png" alt="PomoDoro app icon" width="160" align="left" style="margin: 0 18px 12px 0;">

PomoDoro is a productivity-focused web and Android project manager built with Ionic and Vue 3. It helps you organize tasks, track status, and manage durations in a clean interface designed for fast everyday use. Instead of forcing a complex workflow, the app gives you a focused space to plan what matters, move quickly between Todo, Done, and Trash, and stay in control of your progress. Native Android persistence, multilingual support, and a mobile-first layout make it suitable for personal planning, study routines, and lightweight project follow-up.

<br clear="left">

## Tech Stack

- Vue 3 + TypeScript
- Ionic Vue + Vue Router
- Capacitor (Android)
- SQLite (`@capacitor-community/sqlite`)
- Vite

## Prerequisites

- Node.js 18+
- npm 9+
- For Android builds: Android SDK, and a compatible JDK

## Quick Start

```bash
npm install
npm run dev
```

## Essential Commands

```bash
npm run dev        # local development
npm run build      # type-check + production build
npm run preview    # preview build
npm run lint       # lint code
npm run test:unit  # unit tests
npm run test:e2e   # end-to-end tests
```

## Android Build (APK)

Use the automated script:

```bash
.\build_apk.bat
```

What it does:

1. Copies `ressources/icon.png` to `public/favicon.png` and `public/app-icon.png`.
2. Builds web assets.
3. Runs Capacitor sync for Android.
4. Generates Android launcher icons.
5. Builds debug APK.
6. Copies APKs to `android/app/outputs/apk`.

Useful Android commands:

```bash
npx cap sync android
npx cap open android
```

## Minimal Structure

```text
android/
public/
scripts/
src/
tests/
build_apk.bat
package.json
README.md
```

## License

MIT License. See [LICENSE](LICENSE).

