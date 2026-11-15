# Ella Tech QA/DevOps Assessment Submission

Thank you for the opportunity to complete this assessment. This repository contains my comprehensive QA and DevOps strategy for the Ella API e-commerce backend.

## 1. Overall Approach

My approach to this assessment prioritizes a **professional QA engineering mindset**: focusing on systematic test design, maintainable automation architecture, and clear communication. 

Instead of just testing endpoints in isolation, I treated the API as a complete product ecosystem. This meant investigating the developer experience (uncovering a critical TypeScript compilation blocker), writing robust, data-independent end-to-end tests using Playwright, and considering deployment scalability through Docker and CI/CD pipelines. My goal is to ensure quality at every stage of the software development lifecycle.

## 2. Repository Structure & Deliverables

* **`/qa/test-strategy.md`**: High-level QA strategy covering test levels, tooling, and risk mitigation.
* **`/qa/BUGS.md`**: Professional bug reports detailing critical compilation issues and logical flaws.
* **`/qa/performance-test.js`**: k6 load testing script.
* **`/qa/code-review-guidelines.md`**: Mentorship standards for reviewing automated test code. *(Pending/Drafting)*
* **`/automation-framework/`**: Playwright codebase containing the critical E2E user flow and schema validation tests.
* **`/devops/`**: Notes on CI/CD pipelines, Docker deployment runbooks, and environment configurations. *(Pending/Drafting)*

## 3. Execution Instructions

### A. Running the E2E API Tests (Playwright)
The automation framework is built with Playwright to ensure fast, reliable API testing.

1. Ensure the API is running locally via Docker (`docker compose up -d --build`).
2. Navigate to the automation directory: `cd automation-framework`
3. Install dependencies: `npm install`
4. Run the test suite: `npx playwright test`
5. *(Optional)* View the HTML report: `npx playwright show-report`

### B. Running the Load Tests (k6)
1. Ensure the API is running locally.
2. Install k6 (e.g., `winget install k6` or `brew install k6`).
3. Run the script: `k6 run qa/performance-test.js`

---

## 4. Performance & Load Testing Analysis (k6)

### Test Scenario
The load test targets the `GET /products` endpoint, which is a high-traffic read operation expected to be hit frequently by users browsing the e-commerce storefront. The test simulates a gradual ramp-up to 20 concurrent Virtual Users (VUs), sustains that load for 30 seconds, and smoothly ramps back down over a total duration of 50 seconds.

### Assumptions
* The test is executed against the local Docker container (`localhost:3000`).
* Network latency is minimal since execution is local; therefore, any degraded response time is directly attributable to the application or database layer.
* The database contains a representative set of product data to simulate a real-world table scan/fetch operation.

### Baseline Metrics & Thresholds
* **Target Error Rate:** < 1% (Zero 500-level errors acceptable)
* **Target P95 Response Time:** < 250ms

### Results Summary
* **Total Requests:** 810
* **Error Rate:** 0.00% (Pass)
* **Average Response Time:** 3.87ms
* **P95 Response Time:** 8.23ms (Pass - significantly below the 250ms threshold)
* **Max Response Time:** 73.35ms
* **Throughput:** 16.08 req/sec

### Analysis & Conclusion
Under a moderate concurrent load peaking at 20 Virtual Users, the `GET /products` endpoint demonstrated exceptional performance and stability. All 1,620 data validation checks passed successfully, yielding a 0% error rate. 

The API responded near-instantaneously, with an average response time of just 3.87ms and a P95 of 8.23ms—well under the 250ms threshold. The maximum observed latency across all 810 requests was only 73.35ms. Because this read-only endpoint handles current traffic with virtually zero strain, the existing local architecture (NestJS + Docker) is highly efficient. If future traffic scales exponentially, database indexing or Redis caching strategies can be implemented, but they are currently unnecessary for this load profile.

---

## 5. Assumptions, Limitations, & Improvements

1. **Test Data Independence:** I assumed the database might be empty upon initialization. To prevent flaky E2E tests, the Playwright framework explicitly creates a product before attempting a transaction, ensuring 100% deterministic execution.
2. **Missing Database Constraints:** Discovered during exploratory testing, the system allows duplicate emails and negative pricing. Future improvements should enforce `@Unique()` constraints on the database level and strict class-validator rules in the DTOs.
3. **Data Wrapping:** The API uses a global response interceptor wrapping payloads in `{ statusCode, message, data }`. The automation framework was specifically adapted to handle this contract.