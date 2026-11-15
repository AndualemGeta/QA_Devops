# Ella Tech QA/DevOps Assessment Submission

Thank you for the opportunity to complete this assessment. This repository contains my comprehensive QA, Automation, and DevOps strategy for the Ella API e-commerce backend.

## 1. Overall Approach

My approach to this assessment prioritizes a professional QA engineering mindset: focusing on systematic test design, maintainable automation architecture, robust deployment pipelines, and clear communication.

Instead of treating the API as isolated endpoints, I evaluated it as a complete product ecosystem. This included debugging the developer experience (uncovering a critical TypeScript compilation blocker), writing data-independent end-to-end tests, validating payload schemas, testing performance limits, and designing a scalable CI/CD and Docker environment.

## 2. Repository Structure & Deliverables

### A. Quality Assurance & Automation

/qa/test-strategy.md: High-level QA strategy covering test levels, tooling, and risk mitigation.

/qa/BUGS.md: Professional bug reports detailing critical compilation issues and logical flaws.

/qa/code-review-guidelines.md: Mentorship standards for reviewing automated test code.

/qa/performance-test.js: k6 load testing script designed to simulate concurrent user traffic.

/automation-framework/tests/: Playwright codebase containing:

e2e-critical-flow.spec.ts: Tests the full purchase journey (User Creation -> Product Fetch -> Transaction Validation).

payload-schema.spec.ts: Validates API contracts, data types, and response wrappers.

### B. DevOps & Infrastructure

.github/workflows/ci.yml: GitHub Actions pipeline for automated linting, building, and unit testing.

/devops/ci-notes.md: Explanation of the CI/CD pipeline and Continuous Deployment strategy.

/devops/environment-notes.md: 12-Factor App environment configuration (Dev vs. Test vs. Staging).

/devops/deployment-runbook.md: Documentation on Docker troubleshooting, build fixes, local deployment, and AWS scaling strategy.

/devops/monitoring-observability.md: Production monitoring strategy including logging and metrics.

/src/health/health.controller.ts: Newly implemented GET /health endpoint for container orchestration readiness probes.

## 3. Execution Instructions

### A. Running the Local Environment (Docker)

Ensure Docker Desktop is running (WSL2 recommended for Windows).

Copy .env.example to .env.

Build and spin up the stack: docker compose up -d --build

Verify the API is healthy: curl http://localhost:4000/health

### B. Running the API Automation (Playwright)

Navigate to the automation directory: cd automation-framework

Install dependencies: npm install

Run the test suite: npx playwright test

(Optional) View the HTML report: npx playwright show-report

### C. Running the Load Tests (k6)

Install k6 (e.g., winget install k6 or brew install k6).

Run the load test from the root directory: k6 run qa/performance-test.js

## 4. Performance & Load Testing Analysis (k6)

Test Scenario

The load test targets the GET /products endpoint, which is a high-traffic read operation. The test simulates a gradual ramp-up to 20 concurrent Virtual Users (VUs), sustains that load for 30 seconds, and smoothly ramps back down over a total duration of 50 seconds.

Baseline Metrics & Thresholds

Target Error Rate: < 1% (Zero 500-level errors acceptable)

Target P95 Response Time: < 250ms

Results Summary

Total Requests: 810

Error Rate: 0.00% (Pass)

Average Response Time: 3.87ms

P95 Response Time: 8.23ms (Pass - significantly below the 250ms threshold)

Max Response Time: 73.35ms

Analysis & Conclusion

Under a moderate concurrent load peaking at 20 Virtual Users, the GET /products endpoint demonstrated exceptional performance. All 1,620 data validation checks passed successfully. The API responded near-instantaneously (P95 of 8.23ms), proving that the existing local architecture is highly efficient for read-heavy operations without current need for Redis caching.

## 5. Assumptions & Engineering Decisions

Test Data Independence: I assumed the database might be empty upon initialization or cleared in CI. To prevent flaky tests, the Playwright E2E framework explicitly creates the state it needs (creating a product first) to ensure 100% deterministic execution.

Missing Database Constraints: **Exploratory testing revealed the system allows duplicate emails and negative pricing** . Future iterations should enforce @Unique() constraints on the database level and strict class-validator rules in the DTOs.

Global Response Interceptor: The API wraps all payloads in { statusCode, message, data }. The Playwright test suite was explicitly designed to validate and traverse this global contract.