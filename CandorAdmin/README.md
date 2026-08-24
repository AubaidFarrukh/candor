# CandorAdmin

Internal admin dashboard for [Candor](../Candor), the anonymous Q&A app. Built with Next.js, it talks to the [Candor_Backend](../Candor_Backend) GraphQL API and gives the team tools to manage users, cards, polls, notifications, revenue, and support.

## Tech stack

- **Framework**: Next.js 12 (Pages Router), React 17
- **Data**: Apollo Client (`@apollo/client`) over GraphQL, with `apollo3-cache-persist` for cache persistence
- **Charts**: ApexCharts (`react-apexcharts`), Victory, `react-charts`
- **Styling**: Sass modules (`styles/*.module.scss`)
- **Image capture**: `dom-to-image` / `html-to-image` (used for exporting cards/reports as images)

## Project structure

```
pages/
  _app.js          # App shell: Apollo Client setup, nav, contexts, auth-gated layout
  index.js           # Dashboard home
  auth.js              # Admin login
  cards.js              # Manage anonymous-question cards
  submit-poll.js          # Create/manage polls
  phonebook.js              # Phonebook/contacts tooling
  notification.js            # Push notification composer
  revenue.js                   # Revenue / subscriptions view
  feedback.js                    # User feedback / support
  profile.js                       # Admin profile
  api/hello.js                      # Example Next.js API route (unused scaffold)
components/          # Shared UI: Table, Card, Graph, Filter, Create/Edit modals, etc.
context/             # React contexts: ModalData, NotiData, AdminData, PhoneData
graphQL/             # queries.js / mutations.js sent to Candor_Backend
functions/            # Helper utilities (e.g. date formatting)
styles/               # Global and per-page Sass modules
public/                # Static assets, SVG icons
```

## Prerequisites

- Node.js and Yarn or npm

## Setup

1. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```
2. Run the dev server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000). You'll land on `auth.js` first — log in with an admin account that exists in the backend's `users` collection.

## Backend connection

Unlike the mobile app, this dashboard does **not** read the API URL from an environment variable — it's hardcoded in [`pages/_app.js`](pages/_app.js) (`geturl()`), currently pointed at the production API (`https://prod-api.playcandor.com/graphql`). To point the dashboard at a local or staging backend during development, temporarily edit that function.

Auth token handling: after login, the access token is stored in `sessionStorage` (`accessToken`) and attached as a `Bearer` token to every GraphQL request via Apollo's `authLink`.

## Build & deploy

```bash
yarn build
yarn start   # serve the production build
```

The app is a standard Next.js app and deploys well to Vercel or any Node host; see the [Next.js deployment docs](https://nextjs.org/docs/deployment).

## Notes

- There is no automated test suite.
- `pages/api/hello.js` is the default Next.js scaffold API route and isn't used by the dashboard.
