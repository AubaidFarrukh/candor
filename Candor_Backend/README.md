# Candor_Backend

The GraphQL API that powers the [Candor](../Candor) mobile app and the [CandorAdmin](../CandorAdmin) dashboard. Built with Express, Apollo Server, and MongoDB, with GraphQL subscriptions over WebSocket for real-time messaging.

## Tech stack

- **Runtime**: Node.js + Express
- **API**: Apollo Server (`apollo-server-express`), schema built by hand with `graphql`
- **Realtime**: `subscriptions-transport-ws` + `graphql-redis-subscriptions` (Redis-backed pub/sub)
- **Database**: MongoDB (native `mongodb` driver, no ODM)
- **Cache/pub-sub**: Redis
- **Media storage**: AWS S3, served via CloudFront
- **SMS / phone verification**: Twilio
- **Email**: SendGrid
- **Push notifications**: Firebase Cloud Messaging (`fcm-node`)
- **In-app purchases**: Apple receipt verification (`node-apple-receipt-verify`), Google OAuth client for Google-based flows
- **Scheduled jobs**: `node-cron` (see [`cron.js`](cron.js))
- **Error tracking**: Sentry

## Project structure

```
server.js              # Express + Apollo Server + WebSocket subscription server entrypoint
cron.js                 # Scheduled jobs (premium expiry sweep, simulated bot replies)
core/
  db.js                  # MongoDB connection ("candor" database)
  Cache.js                # Redis cache helper
  functions.js             # Shared helpers, incl. ValidateUser (auth from bearer token)
schema/
  schema.js               # Combines all schemas into the root Query/Mutation/Subscription
  types.js                 # Shared GraphQL types
  schemas/
    user.js                  # Auth, profile, phone/SMS verification
    cards.js                  # Anonymous-question "cards" (free + pro/audio/text)
    message.js                 # Sending/receiving anonymous messages, subscriptions
    polls.js                    # Public polls
    groupChat.js                  # Group chat
    phoneContact.js                # Phonebook / contact import
    upload.js                       # S3 media uploads
    admin.js                         # Endpoints used by CandorAdmin
emojis.js               # Emoji data used by schemas
```

## Prerequisites

- Node.js (a version compatible with the pinned dependencies — Node 16/18 recommended) and Yarn or npm
- A MongoDB instance (database name `candor`)
- A Redis instance (used for GraphQL subscriptions/pub-sub and caching)
- Credentials for the third-party services listed below, as needed for the features you're testing

## Setup

1. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```
2. Create a `.env` file in this directory (see [Environment variables](#environment-variables) below).
3. Start the API in development (auto-restarts via `nodemon`):
   ```bash
   yarn start
   # or
   npm start
   ```
   By default the server listens on `PORT` (falls back to `4001`):
   - GraphQL HTTP endpoint: `http://localhost:4001/graphql`
   - GraphQL WebSocket (subscriptions) endpoint: `ws://localhost:4001/graphql`

4. (Optional) Run the scheduled jobs process separately:
   ```bash
   node cron.js
   ```
   This runs independently of `server.js` and is responsible for expiring lapsed premium subscriptions nightly and posting simulated bot replies to cards on a randomized schedule.

## Environment variables

Set these in a `.env` file (loaded via `dotenv`, gitignored — never commit real credentials):

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port for the API server (default `4001`) |
| `MONGO_DB_URL` | MongoDB connection string |
| `REDIS_HOST` | Redis host used for subscriptions/caching |
| `AWS_S3_BUCKET`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_REGION` | S3 credentials for media uploads |
| `CLOUDFRONT_DISTRIBUTION_ID`, `CLOUDFRONT_DOMAIN` | CDN in front of the S3 bucket |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key for push notifications |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | SMS/phone verification via Twilio |
| `SENDGRID_API_KEY`, `SENDGRID_EMAIL` | Transactional email via SendGrid |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `APPLE_RECEIPT_SECRET`, `APPLE_RECEIPT_ENV` | Apple in-app purchase receipt verification |
| `SENTRY_DSN` | Error reporting |
| `PROD_ENV` | Environment flag used to toggle production-only behavior |

## Authentication

Most resolvers expect a bearer token on the `authorization` header. Generate one via the `LoginUser` mutation, then pass it on subsequent requests (and on the `connectionParams` when opening a subscription WebSocket) as:

```
authorization: <token>
```

`ValidateUser` in [`core/functions.js`](core/functions.js) resolves the token to a user for both HTTP requests and WebSocket connections.

## Notes

- There is no automated test suite yet (`npm test` is a placeholder).
- `dump.rdb` in this directory is a local Redis snapshot artifact — safe to ignore/delete, not meant to be committed.
