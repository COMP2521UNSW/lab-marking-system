# lab-marking-system

## How to run

### Setup the server

Run `cd server` from the project root.

1. Install dependencies

    ```
    npm install
    ```

2. Configure environment

    ```
    cp .env.example .env
    ```

    Then generate a secret for the `JWT_SECRET` environment variable.

3. Initialise and seed the database

    ```
    npx drizzle-kit push
    npx tsx src/db/seed/index.ts
    ```

    This will create an SQLite database in the `instance` directory.

4. Run the server

    ```
    npm run dev
    ```

### Setup the client

Run `cd client/lab-marking-system` from the project root.

1. Install dependencies

    ```
    npm install
    ```

2. Configure environment

    ```
    cp .env.example .env
    ```

3. Run the client

    ```
    npm run dev
    ```

### Test the application

Open http://localhost:3000 in the browser.
