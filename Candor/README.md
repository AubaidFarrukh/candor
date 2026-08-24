<!-- @format -->

# Candor

The Candor mobile app (iOS/Android) — anonymous Q&A / messaging built with React Native and Expo. Users share a personal card link, receive anonymous questions or messages, reply, run public polls, chat in groups, and can subscribe to a paid tier (pro cards, audio cards, "Chat with Me", donations/revenue share).

It talks to the [Candor_Backend](../Candor_Backend) GraphQL API; see also the [CandorAdmin](../CandorAdmin) dashboard used internally to manage the backend data.

## Tech stack.

- **Framework**: React Native 0.70 on Expo SDK 47 (TypeScript), Hermes JS engine
- **Navigation**: React Navigation (native stack + stack), split into `authStack` / `userStack`
- **Data**: Apollo Client over GraphQL (HTTP for queries/mutations, WebSocket subscriptions via `subscriptions-transport-ws`), with `apollo3-cache-persist` caching to `AsyncStorage`
- **Push/analytics**: `@react-native-firebase` (app, analytics, messaging)
- **In-app purchases**: `react-native-iap`
- **Error tracking**: `@sentry/react-native`
- **Native builds**: EAS Build (`eas.json`), plus native `ios/` and `android/` projects
- **Social**: Snapchat Snap Kit integration

## Project structure

```
App.tsx                 # App entrypoint: providers, Sentry init, splash/loading
index.js                  # Expo/RN entry, registers root component
navigation/
  RootNavition.tsx           # Top-level navigator (auth vs. authenticated user)
  authStack.tsx                 # Sign in / sign up / forgot password flow
  userStack.tsx                  # Authenticated app flow
  screens.ts                      # Route name constants
screens/
  SignIn.tsx / SignUp.tsx / ForgotPassword/   # Auth screens
  Onboarding.tsx                                # First-run onboarding/tutorial
  Home/                                           # Inbox, messages, cards, subscriptions, group chat, donations
  Polls/                                           # Public polls: create, view, share
  Ad.tsx, OutdatedVerstion.tsx                       # Misc/forced-update screens
components/               # Shared UI: cards, carousel items, toasts, menus, v2/main component sets
graphQL/
  queries.ts / mutations.ts / subscriptions.ts    # GraphQL operations sent to Candor_Backend
context/                    # App-wide React context
utils/
  hooks/useApolloClient.ts    # Apollo Client + auth + subscription link setup
  Linking.ts, calc.ts, getIP.ts, countries.ts, app.ts, hooks/
theme/                     # Theming
constants/                 # Static data: carousel copy, benefits, emoji, permission copy, APP_VERSION
functions/                 # Firebase Cloud Functions used by the app (if deployed separately)
layouts/                   # Shared layout wrappers
patches/                   # patch-package patches applied via postinstall
android/ , ios/            # Native project files (Expo prebuild / bare workflow)
```

## Prerequisites

- Node.js and Yarn or npm
- Expo CLI (`npx expo`) — no global install required, scripts use `expo` via `npx`/local devDependency
- For native builds: Xcode (iOS) and/or Android Studio (Android), and an EAS account if using `eas build`

## Setup

1. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

   This project uses [`patch-package`](patches/) — patches are applied automatically via the `postinstall` script.

2. Start the Metro bundler with a dev client:

   ```bash
   yarn start
   # or: npm run start
   ```

   Alternatively, run in classic Expo Go:

   ```bash
   npm run start:go
   ```

3. Run on a platform:
   ```bash
   npm run ios       # expo run:ios (requires Xcode)
   npm run android    # expo run:android (requires Android Studio/SDK)
   npm run web         # expo start --web
   ```

## Backend connection

The GraphQL endpoint is hardcoded in [`utils/hooks/useApolloClient.ts`](utils/hooks/useApolloClient.ts) rather than read from an environment variable — it currently points at the production API (`https://prod-api.playcandor.com/graphql`, `wss://prod-api.playcandor.com/graphql`). To develop against a local or staging backend, temporarily edit the `uri` in `httpLink` and the URL passed to `SubscriptionClient` in that file.

Auth token handling: the access token is stored in `AsyncStorage` (`accessToken`) and attached as a `Bearer` token to both HTTP requests (`authLink`) and the subscription WebSocket (`connectionParams.authToken`).

## Native builds (EAS)

Build profiles are defined in [`eas.json`](eas.json):

```bash
eas build --profile development --platform ios
eas build --profile preview --platform android
eas build --profile production --platform all
```

App identifiers: `com.besocial.candor` (both iOS and Android). EAS project ID and Expo owner (`bsocial_inc`) are set in [`app.json`](app.json).

## Notes

- There is no automated test suite.
- `legacy.ts` and `jot.js` at the repo root contain older/legacy code retained for reference — check before extending them.
