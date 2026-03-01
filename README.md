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

   Then generate a secret for the `JWT_SECRET` environment variable.

2. Initialise and seed the database

   ```
   pnpm db:push
   pnpm db:seed
   ```

This will create an SQLite database in the `instance` directory.

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
