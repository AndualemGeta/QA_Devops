# Environment Configuration Notes

Following the 12-Factor App methodology, the Ella API extracts all configuration out of the codebase and into environment variables. This ensures the application can be seamlessly deployed across different environments without code changes.

Using the provided `.env.example` as a baseline, below is the strategy for configuring the application across Development, Testing, and Staging environments.

## Environment Variable Breakdown

| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | Defines the runtime environment (development, test, staging, production) to enable/disable framework-level optimizations. |
| `PORT` | The internal port the NestJS application listens on (default: 4000). |
| `DATABASE_URL` | The connection string for the PostgreSQL/MySQL database. |
| `JWT_SECRET` | Secret key used for signing authentication tokens (if applicable). |
| `LOG_LEVEL` | Determines the verbosity of application logs (debug, info, warn, error). |

## Environment Profiles & Differences

### 1. Development (`.env.development`)
Optimized for developer experience, rapid iteration, and debugging.
*   **`NODE_ENV=development`**
*   **`DATABASE_URL=postgres://user:pass@localhost:5432/ella_dev`**: Connects to a local database spun up via `docker-compose.dev.yml`.
*   **`LOG_LEVEL=debug`**: Verbose logging enabled (SQL queries, stack traces) to aid in local troubleshooting.
*   **Secrets:** Dummy secrets (e.g., `JWT_SECRET=super_secret_dev_key`) are acceptable here since the environment is strictly local.

### 2. Testing (`.env.test`)
Optimized for automated test execution (CI/CD pipeline and local test runs).
*   **`NODE_ENV=test`**
*   **`DATABASE_URL=postgres://user:pass@localhost:5432/ella_test`**: **Critical Difference:** Must point to an entirely separate, isolated database. Automated tests frequently wipe and re-seed data; sharing this with development will destroy the developer's local state.
*   **`LOG_LEVEL=error`**: Minimal logging to keep test console output clean and readable, unless a test explicitly fails.
*   **Secrets:** Static mock credentials used to ensure deterministic test results.

### 3. Staging (`.env.staging`)
A production-replica environment optimized for load testing, QA sign-off, and final regression checks.
*   **`NODE_ENV=staging`**
*   **`DATABASE_URL=postgres://staging_user:***@staging-db.internal:5432/ella_staging`**: Points to a managed, cloud-hosted database populated with sanitized, production-like data.
*   **`LOG_LEVEL=info`**: Debugging is turned off. Logs output standard HTTP requests and system events, mirroring production observability.
*   **Secrets:** Managed securely. Unlike Dev/Test where secrets live in a `.env` file, Staging variables should be injected directly by the CI/CD pipeline or fetched dynamically from a Secrets Manager (e.g., AWS Secrets Manager, HashiCorp Vault) at runtime.