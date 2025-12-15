# Database Directory

## Local Development (SQLite)

For local development, we use **SQLite** which requires no Docker or external database server.

- Database file: `./data/dev.sqlite`
- Configure in `.env.local`:
  ```
  DB_PROVIDER=sqlite
  DATABASE_URL=file:./data/dev.sqlite
  ```

The database file will be created automatically when the application starts.

## Production (PostgreSQL on Linux)

For production deployment on Linux, we use **PostgreSQL**.

- Switch by updating environment variables:
  ```
  DB_PROVIDER=postgres
  DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
  ```

Database migration from SQLite to PostgreSQL will be handled by Payload CMS or our migration scripts in a future step.

## Git Ignore

SQLite files are ignored by git:
- `*.sqlite`
- `*.db`
- `*.sqlite-journal`
- `*.sqlite-wal`
- `*.sqlite-shm`

Do not commit database files to the repository.


