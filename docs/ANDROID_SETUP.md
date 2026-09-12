# Random Seoul — Android development setup

This document records the Android-specific setup that must stay outside the shared product logic.

## App identity

- App name: `Random Seoul`
- Android application ID: `io.github.momone3131.randomseoul`
- `minSdk`: 24
- `compileSdk`: 36
- `targetSdk`: 36
- Java toolchain used in CI: 21

## Google Places API key policy

The Web API key and Android API key must be separate.

Do **not** commit any Google API key into this repository.

Android builds read the key from either:

- Gradle property: `RANDOM_SEOUL_PLACES_API_KEY`
- environment variable: `RANDOM_SEOUL_PLACES_API_KEY`

GitHub Actions reads the repository secret named:

`RANDOM_SEOUL_PLACES_API_KEY`

If that secret does not exist, CI still builds an APK with `DEFAULT_API_KEY`, but restaurant search is intentionally disabled at runtime.

## Creating the Android key

In Google Cloud Console:

1. Create a **new key dedicated to Android Random Seoul**.
2. Ensure `Places API (New)` is enabled for the project.
3. Restrict the key's API access to the Places APIs actually used by Random Seoul.
4. During early debug testing, keep the quota deliberately low.
5. Before production release, add Android application restriction for:
   - package: `io.github.momone3131.randomseoul`
   - certificate fingerprint: the final Play App Signing / release certificate SHA fingerprint

Do not reuse the GitHub Pages HTTP-referrer key in the native app.

## Adding the key to GitHub Actions

Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Name:

`RANDOM_SEOUL_PLACES_API_KEY`

Value:

The Android-only Google Places key.

After saving the secret, re-run the `Android CI` workflow or push a new commit to `feature/random-seoul-android`.

## Debug APK

The `Android CI` workflow performs:

1. shared TypeScript tests
2. native Vite build
3. Capacitor Android sync
4. Gradle `assembleDebug`
5. upload of `random-seoul-debug-apk`

Download the artifact from the GitHub Actions run, unzip it, and install `app-debug.apk` on an Android device after allowing installation from the browser/file-manager source used to open the APK.

## Architecture boundary

Android Places SDK only returns common place candidate data through the Capacitor plugin:

`Android Places SDK → RandomSeoulPlacesPlugin → NativePlaceSearchService → shared RandomSeoulController → shared restaurant ranking → shared UI`

Restaurant ranking, the 2 km hard limit, line/station/food draws, and product state remain shared TypeScript and must not be duplicated in Java/Kotlin.

## Release hardening later

Before Play production release:

- use a release-restricted Android key
- restrict by the final signing certificate fingerprint
- keep only required API targets enabled for the key
- prepare signed AAB rather than the debug APK
- verify Play App Signing certificate fingerprints after the Play app is created
- keep the Web key independently restricted to the GitHub Pages origin
