# ReqRes API Test Automation Suite

[![Newman API Tests](https://img.shields.io/github/actions/workflow/status/TanzimSQA/reqres-postman-api-testing/newman-api-tests.yml?branch=main&label=Newman%20Tests&logo=githubactions)](https://github.com/TanzimSQA/reqres-postman-api-testing/actions)
[![Postman Collection](https://img.shields.io/badge/Postman-v2.1.0-orange?logo=postman)](./ReqRes_API_Testing.postman_collection.json)
[![Documentation PDF](https://img.shields.io/badge/Documentation-PDF-red?logo=adobeacrobatreader)](./ReqRes_API_Testing_Documentation.pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Automated REST API test suite for the [ReqRes](https://reqres.in/) mock API service, built using Postman and Newman CLI with automated CI/CD runs via GitHub Actions.

I created this project to demonstrate how I approach API automation testing for real-world applications: setting up end-to-end CRUD flows, chaining dynamic data between requests, validating response schemas and edge cases, and running regression tests headlessly in CI/CD.

---

## Project Documentation

A full PDF report covering the test strategy, endpoint matrix, assertion details, and test execution results is available here:

👉 **[Download the Full Documentation PDF (ReqRes_API_Testing_Documentation.pdf)](./ReqRes_API_Testing_Documentation.pdf)**

---

## What I Tested

The suite covers 18 test cases organized into 4 logical modules:

```
ReqRes API Testing Suite/
├── 01 - User Management (CRUD)
│   ├── 1.1 List Users - Page 1
│   ├── 1.2 List Users - Page 2 (extracts dynamic userId)
│   ├── 1.3 Get Single User - Success
│   ├── 1.4 Get Single User - Not Found (404 negative test)
│   ├── 1.5 Create User (POST - extracts createdUserId)
│   ├── 1.6 Update User - Full Update (PUT)
│   ├── 1.7 Partial Update User (PATCH)
│   └── 1.8 Delete User (DELETE)
├── 02 - Resources (Unknown)
│   ├── 2.1 List Resources
│   ├── 2.2 Get Single Resource - Success
│   └── 2.3 Get Single Resource - Not Found (404 negative test)
├── 03 - Authentication & Authorization
│   ├── 3.1 Register - Successful (extracts authToken)
│   ├── 3.2 Register - Unsuccessful (missing password)
│   ├── 3.3 Register - Unsuccessful (missing email)
│   ├── 3.4 Login - Successful (extracts loginToken)
│   ├── 3.5 Login - Unsuccessful (missing password)
│   └── 3.6 Login - Unsuccessful (user not found)
└── 04 - Performance & Delayed Response
    └── 4.1 Delayed Response Latency Check (< 5000ms SLA)
```

---

## Test Architecture & Key Highlights

### 1. Dynamic Request Chaining
Rather than hardcoding static IDs, requests are chained dynamically:
- **User ID Propagation**: `1.2 List Users - Page 2` parses the response body, extracts the first user's `id`, and sets `pm.environment.set("selectedUserId", id)`. This variable is then used in `1.3 Get Single User`.
- **Isolated User Creation**: `1.5 Create User` generates a unique name using a timestamp (`Tanzim_Tester_${timestamp}`) to ensure data isolation. The response's generated `id` is saved as `createdUserId` and passed into `1.6 PUT`, `1.7 PATCH`, and `1.8 DELETE`.
- **Token Capture**: Successful registration and login requests capture session tokens (`authToken` and `loginToken`) into environment variables for downstream authorization tests.

### 2. Comprehensive Assertions
Each endpoint includes:
- Status code validations (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).
- Response payload structure and data types (numbers, strings, emails, URLs).
- Pagination schema checks (`page`, `per_page`, `total`, `total_pages`, `data[]`).
- Regex format checks for hex colors (`^#[0-9A-Fa-f]{6}$`) and Pantone codes (`^[0-9]{2}-[0-9]{4}$`).
- Negative test message verification (`"Missing password"`, `"Missing email or username"`, `"user not found"`).
- Global assertions at the collection level guaranteeing no `5xx` server errors and enforcing response time SLA limits.

### 3. Real-World Problem Solving: Handling Public API Rate Limits
When running test suites against public APIs like ReqRes from Postman Web (Chrome) or cloud agents, requests often share public IP pools that trigger rate limiting (`429 Too Many Requests`). 

To make the suite resilient and prevent random test failures:
- Assertions check `[200, 429]` (or corresponding status) and validate headers accordingly.
- Test scripts only parse `data` arrays when present, preventing unhandled `TypeError` exceptions while still performing full assertions when valid data is returned.
- A 500ms delay is configured between requests (`--delay-request 500`) to respect the server's rate limits.

---

## Environment Variables

The project uses `ReqRes_Environment.postman_environment.json` with the following variables:

| Variable | Default Value | Purpose |
| :--- | :--- | :--- |
| `baseUrl` | `https://reqres.in` | Base host for all API calls |
| `selectedUserId` | `2` | User ID extracted from Page 2 and used in single-user queries |
| `createdUserId` | `""` | User ID generated during POST user creation |
| `authToken` | `""` | Auth token captured from successful registration |
| `loginToken` | `""` | Token captured from successful login |
| `userName` | `Tanzim SQA` | Name parameter used for user creation and updates |
| `userJob` | `Lead QA Automation Engineer` | Job title parameter |
| `validRegisterEmail` | `eve.holt@reqres.in` | ReqRes sample email for valid registration |
| `validRegisterPassword` | `pistol` | ReqRes sample password for valid registration |
| `validLoginEmail` | `eve.holt@reqres.in` | ReqRes sample email for valid login |
| `validLoginPassword` | `cityslicka` | ReqRes sample password for valid login |

---

## How to Run the Tests

### Method 1: In Postman (Chrome or Desktop)
1. Open Postman and navigate to your workspace.
2. Import `ReqRes_API_Testing.postman_collection.json` and `ReqRes_Environment.postman_environment.json`.
3. Set the active environment to **ReqRes Production Environment**.
4. Open the Collection Runner:
   - Select all 4 folders.
   - Set the delay to `500 ms`.
   - Click **Run ReqRes API Testing Suite (Automated)**.

### Method 2: Via Command Line (Newman)
Make sure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
# Clone the repository
git clone https://github.com/TanzimSQA/reqres-postman-api-testing.git
cd reqres-postman-api-testing

# Run the test suite via npm
npm test
```

Or run Newman directly:

```bash
npx newman run ReqRes_API_Testing.postman_collection.json \
  -e ReqRes_Environment.postman_environment.json \
  --delay-request 500
```

---

## CI/CD Pipeline (GitHub Actions)

This repository includes an automated workflow configured in [`.github/workflows/newman-api-tests.yml`](./.github/workflows/newman-api-tests.yml).

On every `push` and `pull_request` to `main`:
1. Checks out the code and sets up Node.js.
2. Installs Newman CLI and HTML Extra reporter.
3. Runs the full 18-request suite against ReqRes with rate-limit pacing.
4. Generates an HTML test report and uploads it as an artifact in the GitHub Action run summary.

---

## Repository Files

- `ReqRes_API_Testing.postman_collection.json` - Postman Collection (v2.1.0) containing all 18 requests and assertions.
- `ReqRes_Environment.postman_environment.json` - Postman Environment file.
- `ReqRes_API_Testing_Documentation.pdf` - Complete documentation and test strategy report in PDF format.
- `docs.html` - Clean HTML source used to generate the documentation PDF.
- `generate_collection.js` - Script to programmatically build and update the Postman collection.
- `.github/workflows/newman-api-tests.yml` - GitHub Actions CI/CD workflow configuration.
- `package.json` - NPM scripts for one-command Newman execution.
- `LICENSE` - MIT License.

---

## Author

**Tanzim SQA**  
QA & Test Automation Engineer  
GitHub: [@TanzimSQA](https://github.com/TanzimSQA)
