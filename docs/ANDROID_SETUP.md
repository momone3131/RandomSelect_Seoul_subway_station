# Random Seoul — Android development setup

This document records Android-specific setup that must stay outside the shared product logic.

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

Android builds read the Places key from either:

- Gradle property: `RANDOM_SEOUL_PLACES_API_KEY`
- environment variable: `RANDOM_SEOUL_PLACES_API_KEY`

GitHub Actions reads the repository secret:

`RANDOM_SEOUL_PLACES_API_KEY`

If that secret does not exist, CI still builds an APK with `DEFAULT_API_KEY`, but restaurant search is intentionally disabled at runtime.

Do not reuse the GitHub Pages HTTP-referrer key in the native app.

## Why stable development signing is required

Google Android application restrictions use both:

- package name
- signing-certificate SHA-1

A default debug keystore created on an ephemeral CI runner is not a durable identity. Therefore Random Seoul supports a **separate stable development keystore supplied only through GitHub Actions secrets**.

The keystore itself must never be committed to this public repository.

When the stable signing secrets exist, `assembleDebug` uses that development key. Android CI then writes the stable SHA-1 to the workflow summary, which can be copied into the Google Cloud Android application restriction.

## Development signing secrets

GitHub Actions recognizes these optional secrets:

- `RANDOM_SEOUL_DEV_KEYSTORE_BASE64`
- `RANDOM_SEOUL_DEV_STORE_PASSWORD`
- `RANDOM_SEOUL_DEV_KEY_ALIAS`
- `RANDOM_SEOUL_DEV_KEY_PASSWORD`

If all four exist, CI decodes the keystore into the temporary runner directory and signs the debug APK with it.

If they do not exist, CI falls back to the normal debug signing behavior so development builds remain available, but that fallback certificate should **not** be treated as the long-lived Google API restriction fingerprint.

## Creating one development keystore

Create this once and keep the original file backed up privately. A typical JDK `keytool` command is:

```text
keytool -genkeypair -v -keystore random-seoul-dev.jks -alias random-seoul-dev -keyalg RSA -keysize 2048 -validity 10000
```

Use passwords that are different from important personal passwords.

On Windows PowerShell, the keystore can be converted to a single-line Base64 value for the GitHub secret with:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("random-seoul-dev.jks"))
```

Store the resulting string as `RANDOM_SEOUL_DEV_KEYSTORE_BASE64`; store the passwords and alias in the other three secrets.

## Getting the Android SHA-1

After the four development-signing secrets are configured, run `Android CI` again.

The `Report Android debug certificate fingerprint` step writes to the workflow summary:

- package: `io.github.momone3131.randomseoul`
- stable debug SHA-1

Use exactly that package/SHA-1 pair when restricting the development Android Places key.

## Creating the Android Places key

In Google Cloud Console:

1. Create a **new key dedicated to Android Random Seoul**.
2. Ensure `Places API (New)` / the required Places SDK service is enabled for the project.
3. Add Android application restriction using:
   - package: `io.github.momone3131.randomseoul`
   - SHA-1: the stable development fingerprint reported by Android CI
4. Restrict API access to only the Places APIs required by Random Seoul.
5. Keep a deliberately low quota during development.
6. Add the key to GitHub Actions as `RANDOM_SEOUL_PLACES_API_KEY`.

Production signing is a separate later step; do not assume the development SHA-1 is the final Play production certificate.

## Adding secrets to GitHub Actions

Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Required for live Android restaurant search:

`RANDOM_SEOUL_PLACES_API_KEY`

Required for stable development identity:

- `RANDOM_SEOUL_DEV_KEYSTORE_BASE64`
- `RANDOM_SEOUL_DEV_STORE_PASSWORD`
- `RANDOM_SEOUL_DEV_KEY_ALIAS`
- `RANDOM_SEOUL_DEV_KEY_PASSWORD`

After saving the secrets, re-run `Android CI` from GitHub Actions.

## Debug APK

The `Android CI` workflow performs:

1. shared TypeScript tests
2. native Vite build
3. Capacitor Android sync
4. optional stable development-signing setup
5. Gradle `assembleDebug`
6. SHA-1 report when stable signing is configured
7. upload of `random-seoul-debug-apk`

Download the artifact from the GitHub Actions run, unzip it, and install `app-debug.apk` on an Android device after allowing installation from the browser/file-manager source used to open the APK.

## Native behavior already wired

The Android debug app currently includes:

- native Places Text Search bridge
- native result sharing
- haptic feedback on finalized draws
- Android back handling
- Google Maps app launch with Web fallback
- Naver Map app launch with Web fallback
- restaurant-specific external Google Maps links
- online/offline runtime indication
- line/station/food draws remaining usable while offline

GPS/location permission is intentionally not required.

## Architecture boundary

Android Places SDK only returns common place candidate data through the Capacitor plugin:

`Android Places SDK → RandomSeoulPlacesPlugin → NativePlaceSearchService → shared RandomSeoulController → shared restaurant ranking → shared UI`

Restaurant ranking, the 2 km hard limit, line/station/food draws, and product state remain shared TypeScript and must not be duplicated in Java/Kotlin.

## Release hardening later

Before Play production release:

- create/secure the production upload/signing setup separately from development signing
- use a production Android key restricted to the final relevant signing certificate
- verify Play App Signing certificate fingerprints after the Play app is created
- keep only required API targets enabled for the key
- prepare signed AAB rather than the debug APK
- keep the Web key independently restricted to the GitHub Pages origin
