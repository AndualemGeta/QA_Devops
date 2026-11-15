# CI/CD Pipeline Notes

## Pipeline Architecture
The Continuous Integration (CI) pipeline is built using GitHub Actions (`.github/workflows/ci.yml`) and is triggered on every push and pull request to the `main` branch. 

It acts as an automated quality gate by executing the following jobs sequentially:
1. **Environment Setup:** Provisions an Ubuntu runner and configures Node.js caching to speed up pipeline execution times.
2. **Dependency Installation:** Uses `npm ci` for a clean, deterministic installation based strictly on the `package-lock.json`.
3. **Linting:** Runs static code analysis (`npm run lint`) to enforce coding standards. The pipeline will fail immediately if syntax or styling errors are found.
4. **Build:** Compiles the NestJS TypeScript code into JavaScript (`npm run build`). This verifies that there are no fatal TypeScript compilation errors (like the `User` object mapping bug documented in `BUGS.md`).
5. **Unit Testing:** Executes `npm run test` (Jest). If any unit test fails, the step fails, and the Pull Request is blocked from being merged.

## Extending to Continuous Deployment (CD)
To evolve this pipeline from Continuous Integration to Continuous Deployment, I would add a deployment job that triggers only when code is merged into the `main` branch (and all CI steps pass).

The extended CD workflow would look like this:
1. **Docker Build & Push:** Build the production Docker image and push it to a container registry (e.g., AWS ECR or Docker Hub).
   `docker build -t ellatech/api:${{ github.sha }} .`
2. **Deploy to Staging:** Automatically deploy the new image to a staging environment and execute our Playwright API regression suite against it.
3. **Manual Approval Gate (Optional):** Require a QA lead to click "Approve" in GitHub Actions before proceeding.
4. **Deploy to Production:** Trigger a rolling update to the production environment (e.g., updating an AWS ECS service or triggering a Kubernetes rollout) ensuring zero downtime.