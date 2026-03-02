# lab-marking-system

## How to run

### Install dependencies

```
pnpm install
```

### Run the backend

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

3. Run the server

   ```
   pnpm dev
   ```

### Run the frontend

From the `frontend` directory:

1. Configure environment

   ```
   cp .env.example .env
   ```

2. Run the client

   ```
   pnpm dev
   ```

3. Open http://localhost:3000 in the browser.
