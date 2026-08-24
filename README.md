# Candor

Candor is an anonymous Q&A / messaging app (in the vein of NGL or Sendit): a user shares a personal card link, anyone can send them anonymous questions or messages, and the user replies from the app. It also supports polls, group chats, "Chat with Me" pro cards, and premium subscriptions.

This workspace holds three independently deployed projects, each with its own Git repository:

| Project | Path | Stack | Purpose |
|---|---|---|---|
| [Candor](Candor/) | `Candor/` | React Native (Expo, TypeScript) | The consumer mobile app (iOS/Android) users install to send/receive anonymous messages, run polls, and manage subscriptions. |
| [CandorAdmin](CandorAdmin/) | `CandorAdmin/` | Next.js | Internal admin dashboard for managing cards, polls, phonebook, notifications, revenue, and feedback. |
| [Candor_Backend](Candor_Backend/) | `Candor_Backend/` | Node.js, Apollo Server (GraphQL), MongoDB, Redis | The API all clients talk to — GraphQL queries/mutations/subscriptions, cron jobs, push notifications, SMS/email, and payments. |

Each subdirectory is its own repo (see `git remote -v` inside each) — there is no shared root repository, root `package.json`, or monorepo tooling (no Yarn/NPM workspaces, no Lerna/Turborepo). Clone, install, and run each project independently using the instructions in its own README.

## Architecture

```
Candor (mobile app, Expo/React Native)
   │  GraphQL queries/mutations over HTTP
   │  GraphQL subscriptions over WebSocket
   ▼
Candor_Backend (Apollo Server + Express)
   │
   ├── MongoDB        — primary data store (users, cards, messages, polls, ...)
   ├── Redis           — GraphQL subscription pub/sub + caching
   ├── AWS S3/CloudFront — media uploads (images/audio) and CDN delivery
   ├── Twilio          — SMS / phone verification
   ├── SendGrid        — transactional email
   ├── FCM             — push notifications
   ├── Apple/Google receipt verification — in-app purchase validation
   └── Sentry          — error tracking

CandorAdmin (Next.js dashboard)
   │  GraphQL queries/mutations over HTTP
   ▼
Candor_Backend (same API as above)
```

## Getting started

Each project has its own dependencies, environment variables, and run scripts. See:

- [Candor/README.md](Candor/README.md) — mobile app setup (Expo)
- [CandorAdmin/README.md](CandorAdmin/README.md) — admin dashboard setup (Next.js)
- [Candor_Backend/README.md](Candor_Backend/README.md) — API setup (Node/GraphQL)

A typical local setup order is: **Candor_Backend** first (so there's an API to talk to), then **Candor** and/or **CandorAdmin** pointed at it.
