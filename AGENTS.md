This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Typography & Fonts (MANDATORY FOR ALL SCREENS & COMPONENTS)

The app uses two curated brand font families loaded via `@expo-google-fonts`:
1. **Interface / Body Text**: `Plus Jakarta Sans`
2. **Editorial / Luxury Titles**: `Playfair Display`

**Always import `Fonts` from `@/constants/theme`**:
```tsx
import { Fonts } from '@/constants/theme';
```

- **UI / Body / Labels / Buttons**:
  - Regular: `fontFamily: Fonts.sans`
  - Medium: `fontFamily: Fonts.sansMedium`
  - SemiBold: `fontFamily: Fonts.sansSemiBold`
  - Bold: `fontFamily: Fonts.sansBold`
- **Editorial / Headings / Brand Accents**:
  - Editorial Headings: `<EditorialText first="Drop" second="location." fontSize={18} lineHeight={22} singleLine withDot />`
  - Serif Regular: `fontFamily: Fonts.serifRegular`
  - Serif SemiBold: `fontFamily: Fonts.serifSemiBold`
  - Serif Bold: `fontFamily: Fonts.serifBold`
  - Serif Italic: `fontFamily: Fonts.serifItalic`

**NEVER use bare `<Text>` without specifying brand `fontFamily` from `Fonts` or `<EditorialText>`. Generic system fonts look basic and break brand identity.**

## Performance & Component Optimization (MANDATORY)

- **Memoization**: Wrap reusable subcomponents in `React.memo()`.
- **Stable References**: Wrap all event handlers passed to children in `useCallback()` and expensive calculations in `useMemo()`.
- **Form / Input Isolation**: Keep text input state (e.g. Card Number, CVV, Coupon codes) isolated or memoized so keystrokes do not re-render the entire 1,000-line screen tree.
- **Images**: Always use `expo-image` (`<Image source={{ uri }} contentFit="cover" transition={150} />`) for high-performance memory caching and smooth image transitions.
- **Lists & ScrollViews**: Always specify `showsVerticalScrollIndicator={false}`, `scrollEventThrottle={16}`, and `contentContainerStyle`.

## Commerce UX Benchmark (Ajio & Myntra Standard)

- **Checkout**: Always include 3-step progress stepper (Bag -> Address -> Payment), deliver-to address card with change action, Doorstep Try & Buy toggle, delivery instructions chips, item preview, coupon input with quick-apply chips, comprehensive payment options (UPI apps + VPA, formatted Cards, Net Banking, COD, Kudicash coins), detailed bill breakdown with savings banner, trust badges, sticky bottom bar, and animated confirmation screen.
- **Product Detail**: Include gallery carousel, Try & Buy badge, size selector, specifications matrix, reviews, complete-the-ensemble, and smart bottom bar that reveals related products catalog on scroll.
