# KudiCart Customer App — Dependency & Reproducible Environment Guide

## 1. Runtime Standardization
- **Node.js:** `>=20.0.0 <23.0.0` (LTS, recommended: `v22.17.0`)
- **npm:** `>=10.0.0` (Pinned: `10.9.2`)
- **Expo Framework:** Expo SDK 57 (Expo 57.0.32, React Native 0.86.3, React 19.2.3)
- **Configuration Files:** `.nvmrc`, `.node-version`, `.npmrc`, `package.json`

## 2. Port Architecture
- **Port:** `8081` (Metro Bundler)

## 3. First-Time Setup
```bash
npm ci
npm run validate:deps
```

## 4. Normal Daily Development
```bash
# Metro dev server
npm run start

# Web preview
npm run web
```
Do **not** run `npm install` on normal daily startup.

## 5. Adding/Updating Dependencies
```bash
npm install <package-name>
npm run validate:deps
npx tsc --noEmit
git add package.json package-lock.json
git commit -m "feat(deps): add <package-name>"
```
Colleague pulls and installs via:
```bash
git pull
npm ci
```

