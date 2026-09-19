# Printora Android APK (Capacitor)

The Android app is a Capacitor WebView shell that loads your **full** Next.js site (customer, vendor, admin, ops). All Server Actions and Auth.js cookies stay on the web server.

## Prerequisites

- Node.js 20+
- **JDK 17+** (Capacitor 6; Microsoft OpenJDK 17 works)
- Android SDK (`platforms;android-36`, `build-tools`, `platform-tools`)
- Printora Next.js running and reachable from the phone/emulator

> Tip: set `JAVA_HOME` and `ANDROID_HOME` before building. Example (PowerShell):
>
> ```powershell
> $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
> $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
> $env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
> ```


## 1. Start the web app

```powershell
npm run dev
```

Or expose it with ngrok:

```powershell
ngrok http 3000
```

Copy the HTTPS forwarding URL (e.g. `https://xxxx.ngrok-free.app`).

> Next.js 16 blocks unknown tunnel hosts in dev. `next.config.ts` already allows
> `*.ngrok-free.dev` / `*.ngrok-free.app`. If client-side nav does full page reloads
> over a new tunnel host, add that hostname to `allowedDevOrigins` and restart `npm run dev`.

## 2. Point the APK at that origin

Set **both** so auth cookies work:

```powershell
$env:CAPACITOR_SERVER_URL = "https://xxxx.ngrok-free.app"
# In .env used by Next:
# AUTH_URL="https://xxxx.ngrok-free.app"
```

Defaults if unset:

- Emulator → `http://10.0.2.2:3000` (host machine’s localhost)
- Physical phone on LAN → use your PC LAN IP, e.g. `http://192.168.1.10:3000`

## 3. Sync and build the debug APK

```powershell
npm run cap:sync
cd android
.\gradlew.bat assembleDebug
```

Or one shot:

```powershell
npm run cap:build:apk
```

APK path:

`android/app/build/outputs/apk/debug/app-debug.apk`

A copy is also written to the repo root as `printora-debug.apk` after a successful build (gitignored).

## 4. Install on a device

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

Or open Android Studio:

```powershell
npm run cap:open:android
```

## Demo logins

Password for all: `password123`

| Role | Email |
|------|--------|
| Customer | `customer@printora.pk` |
| Vendor | `vendor@printora.pk` |
| Admin | `admin@printora.pk` |

## Notes

- Rebuild/sync after changing `CAPACITOR_SERVER_URL`.
- Free ngrok URLs change each restart — update env and sync again.
- This is a **debug** APK (not Play Store signed). Release signing can be added later in Android Studio.
