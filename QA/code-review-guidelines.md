# QA Automation Code Review & Mentorship Guidelines

As a QA Automation Engineer, my goal during code reviews is not just to find flaws, but to mentor junior engineers, enforce quality standards, and ensure our test suite remains reliable and maintainable as it scales. 

When reviewing automated test code (such as Playwright) submitted by a junior QA engineer, I evaluate the code against the following core standards.

## 1. Readability & Naming Conventions
Tests serve as living documentation for the application. A developer should know exactly what broke just by reading the test name.

* **Enforce Descriptive Names:** Test names must describe the expected behavior and the context.
  * ❌ **Bad:** `test('api test 1')` or `test('create transaction')`
  * ✅ **Good:** `test('POST /transactions should successfully create a transaction when valid payload is provided')`
* **Clear Structure:** Enforce the Arrange-Act-Assert (AAA) pattern to keep the test logical and easy to read.

## 2. Maintainability & Architecture
Automated tests should be treated as production code. We must avoid spaghetti code and duplication.

* **Avoid Duplicated Code (DRY):** If multiple tests require a user to log in or create a product, that logic should be abstracted into a reusable helper function or an API Service Pattern class (e.g., `UserService.createUser()`).
* **Test Data Management:** Hard-coded payloads inside the test block make tests brittle. Use external fixture files, factories, or builders for test data.
* **Environment Agnosticism:** Tests should never contain hard-coded URLs (e.g., `http://localhost:3000`). They must use environment variables (e.g., `process.env.BASE_URL`) so the same suite can run in Dev, Staging, and CI.

## 3. Strict & Meaningful Assertions
Assertions must be precise to avoid false positives (tests that pass even when the app is broken).

* **Assert Specificity:** Avoid generic truthy checks when a specific value is expected.
  * ❌ **Bad:** `expect(response.status()).toBeTruthy();`
  * ✅ **Good:** `expect(response.status()).toBe(201);`
* **Deep Payload Validation:** Don't just assert the status code. Validate the response schema, data types, and specific business values (e.g., checking that `transaction.userId` matches the user we just created).

## 4. Reliability & Flakiness Prevention
Flaky tests destroy trust in the automation suite. Every PR must be heavily scrutinized for potential race conditions or state leakage.

* **Test Isolation:** Tests must be completely independent. Test B should not fail just because Test A was skipped. Tests should set up their own required data and clean up after themselves.
* **No Hardcoded Waits:** 
  * ❌ **Bad:** `await page.waitForTimeout(5000);` or `sleep(5000)`
  * ✅ **Good:** Await specific API responses, DOM states, or utilize Playwright's auto-retrying assertions (`expect.poll()`).

---

## Example: Mock Pull Request Review
*This is how I would deliver feedback to a junior engineer focusing on education and clear actionable steps.*

**Review Comment on `transaction.spec.ts`:**
> "Great job getting this critical flow automated! The logic follows the business requirements perfectly. I just have a couple of minor adjustments to keep the suite strong:
>
> 1. On line 24, I see we have `expect(res.ok).toBeTruthy()`. Let's change this to `expect(res.status()).toBe(201)` so we are strictly verifying the resource creation.
> 2. On line 12, the test assumes `productId: 1` already exists in the database. Since our CI environment tears down the DB on every run, this test will fail in the pipeline. Let's add a quick API call at the start of this `test()` to dynamically create a product first, and then use that new product's ID for the transaction."