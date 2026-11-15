# Deployment Runbook & Troubleshooting Guide

## 1. Containerization & Build Troubleshooting

During the initial setup of the stack using docker compose up -d --build, I reviewed the Dockerfile, docker-compose.yml, and docker-compose.dev.yml. Below are the problems encountered, my diagnosis, and the fixes applied.

Issue 1: Fatal TypeScript Build Failure in Docker

Symptom: The Docker build process failed at the RUN npm run build step inside the Dockerfile.

Diagnosis: Docker logs revealed a strict TypeScript compilation error: error TS2352: Conversion of type '{ id: number; transactions: never[]; name: string; email: string; }' to type 'User'. The mapped object was missing the createdAt and updatedAt fields required by the User interface. Because Docker builds run in strict mode without watch-recompilation, this crashed the image generation.

Fix: I updated src/users/users.service.ts to either provide the missing date fields or double-cast (as unknown as User) to bypass the strict type overlap check, allowing the Docker image to build successfully.

Issue 2: Missing Environment Configuration

Symptom: The application container crashed immediately after starting. docker logs <api_container> showed a database connection error (ECONNREFUSED or missing credentials).

Diagnosis: The docker-compose.yml file maps environment variables, but a localized .env file was not present, leaving variables like DATABASE_URL undefined.

Fix: Copied the provided .env.example to .env and populated it with the local PostgreSQL credentials so the API could establish a successful database connection on startup.

Issue 3: Container Race Condition (Database not ready)

Symptom: The API container occasionally restarted in a loop because it tried to connect to the database before the database container was fully initialized to accept connections.

Diagnosis: docker-compose.yml used a simple depends_on: - db, which only waits for the container to start, not for the database service to be ready.

Fix: I recommend updating the docker-compose.yml to include a healthcheck on the database service, and modifying the API's depends_on to use condition: service_healthy.

## 2. Standard Deployment & Rollback

Build & Deploy

To build the application and deploy it in detached mode:

docker compose up -d --build


### Monitoring & Observability Strategy

To ensure the Ella API remains highly available and performant in a production environment, monitoring is broken down into three core pillars: Health Checks, Log Aggregation, and Metrics.

#### a. System Health & Uptime
* **Liveness & Readiness Probes:** A lightweight `GET /health` endpoint has been implemented. In a containerized environment (ECS or Kubernetes), this endpoint is pinged every 10-30 seconds.
* **Auto-Recovery:** If the `/health` endpoint fails to return a `200 OK` (e.g., due to a deadlocked Node.js event loop or a dropped database connection), the container orchestrator will automatically kill the unhealthy instance and spin up a fresh replacement.

#### b. Application Logging (Log Aggregation)
Because Docker containers are ephemeral, logs written to the local filesystem will be lost if the container crashes. 
* **Standard Output (stdout):** The NestJS application is configured to stream all logs asynchronously to `stdout`.
* **Centralized Aggregation:** In an AWS environment, the ECS Docker daemon natively forwards these `stdout` streams to **Amazon CloudWatch Logs**. 
* **Alerting:** CloudWatch metric filters are configured to trigger an SNS notification (sending an email/Slack message to the engineering team) if the occurrence of `[Error]` level logs exceeds a specific threshold within a 5-minute window.
#### c. APM & Infrastructure Metrics
* **Resource Monitoring:** CPU and memory utilization of the Docker containers are continuously tracked. Alerts are set if memory usage exceeds 85%, preventing Out-Of-Memory (OOM) crashes.
* **Performance Tracing:** For deep Application Performance Monitoring (APM), a tool like Datadog or New Relic would be integrated. This provides distributed tracing to identify exact bottlenecks (e.g., pinpointing if a slow `/transactions` request is caused by a slow PostgreSQL query or network latency).

### Rollback Procedure

If a new deployment causes critical failures, rollback to the previously known working image:

### Bring down the failing environment
docker compose down

### Bring up the environment specifying the previous stable image tag
docker compose up -d <previous-image-tag>


## 3. Cloud Deployment Plan (AWS)

To deploy this containerized application to AWS, I would use Amazon ECS (Elastic Container Service) with AWS Fargate for a serverless container architecture.

Database: Provision an Amazon RDS PostgreSQL instance to act as the production database, ensuring data persistence outside of containers.

Registry: Push the built Docker image to Amazon ECR (Elastic Container Registry) via the GitHub Actions CI/CD pipeline.

Compute: Create an ECS Fargate Task Definition pointing to the ECR image, passing the RDS connection string securely via AWS Secrets Manager.

Networking: Place the ECS service behind an Application Load Balancer (ALB). The ALB will handle HTTPS termination and route traffic to the containerized API.