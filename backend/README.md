# CampusHaven backend

Set `MONGODB_URI` to the connection string for the Atlas cluster named `cluster0` and set `MONGODB_DB_NAME` to `campushaven` before starting the server. The backend stores password-authenticated users in `users`, session tokens in `authSessions`, and Google OAuth profiles in the same `users` collection.

```sh
cp .env.example .env
npm install
node index.js
```

Open `campushaven.mongodb.js` in the MongoDB VS Code extension, select the Atlas connection for `cluster0`, and run it to inspect users and sessions. The Playground intentionally excludes password hashes and session token hashes from its result.