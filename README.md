# lab-marking-system

## How to run

### Install dependencies

```
pnpm install
```

### Set up the backend

From the `backend` directory:

1. Configure environment

   ```
   cp .env.example .env
   ```

   Then set values for `JWT_SECRET` and `MASTER_PASSWORD_HASH` in `.env`.

2. Initialise and seed the database

   ```
   pnpm db:push
   pnpm db:seed
   ```

   This will create an SQLite database in `test.db`.

### Set up the frontend

From the `frontend` directory:

1. Configure environment

   ```
   cp .env.example .env
   ```

### Set up the proxy

From the `proxy` directory:

1. Configure environment

   ```
   cp .env.example .env
   ```

### Start the application

1. From the root directory, run `pnpm dev`
2. Open http://localhost:8080 in the browser.
