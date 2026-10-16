# 🚀 ReqRes REST API Automation Testing Project

[![Newman API Tests](https://img.shields.io/github/actions/workflow/status/TanzimSQA/reqres-postman-api-testing/newman-api-tests.yml?branch=main&label=Newman%20API%20Tests&style=for-the-badge&logo=githubactions)](https://github.com/TanzimSQA/reqres-postman-api-testing/actions)
[![Postman Collection](https://img.shields.io/badge/Postman-v2.1.0-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](./ReqRes_API_Testing.postman_collection.json)
[![Documentation PDF](https://img.shields.io/badge/Full%20Documentation-PDF-E53935?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](./ReqRes_API_Testing_Documentation.pdf)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

---

## 📑 Full Project Documentation PDF
> 📕 **Download or View Full Documentation**:  
> You can download or view the comprehensive, professionally formatted PDF report:  
> 👉 [**`ReqRes_API_Testing_Documentation.pdf`**](./ReqRes_API_Testing_Documentation.pdf)  
> *(Covers complete test strategy, folder architecture, 80+ assertion matrix, dynamic parameter chaining, CI/CD setup, and debugging guide)*

---

## 📌 Project Overview
A production-grade REST API automation testing suite built for **[ReqRes](https://reqres.in/)** (`https://reqres.in`), designed for seamless execution across **Postman (Web on Chrome & Desktop App)** and automated CI/CD pipelines via **Newman CLI**.

### 🌟 Highlights
- **18 Automated Test Cases** covering 100% of ReqRes REST endpoints.
- **80+ Granular Assertions** verifying HTTP status codes, JSON schema integrity, response SLAs, header security, and business payloads.
- **Dynamic Variable Chaining**:
  - Dynamically extracts `id` from user lists and propagates into subsequent requests.
  - Dynamically isolates test usernames with timestamps (`Tanzim_Tester_<timestamp>`).
  - Captures `createdUserId` from `POST /api/users` and passes it to `PUT`, `PATCH`, and `DELETE`.
  - Captures registration and login session tokens (`authToken`, `loginToken`).
- **Resilient Rate-Limit Handling**: Defensive test assertions handle both standard responses and Cloud Agent rate limiting (`429 Too Many Requests`).
- **CI/CD Integrated**: Preconfigured GitHub Actions workflow runs Newman on every push and generates HTML report artifacts.

---

## 📂 Collection Architecture

```
ReqRes API Testing Suite (Automated)/
├── 📁 01 - User Management (CRUD)
│   ├── 1.1 List Users - Page 1               [GET]    /api/users?page=1
│   ├── 1.2 List Users - Page 2               [GET]    /api/users?page=2        (Extracts dynamic userId)
│   ├── 1.3 Get Single User - Success         [GET]    /api/users/{{selectedUserId}}
│   ├── 1.4 Get Single User - Not Found       [GET]    /api/users/23            (Negative Test: 404)
│   ├── 1.5 Create User                       [POST]   /api/users               (Extracts createdUserId)
│   ├── 1.6 Update User - Full Update         [PUT]    /api/users/{{createdUserId}}
│   ├── 1.7 Partial Update User               [PATCH]  /api/users/{{createdUserId}}
│   └── 1.8 Delete User                       [DELETE] /api/users/{{createdUserId}}
├── 📁 02 - Resources (Unknown)
│   ├── 2.1 List Resources                    [GET]    /api/unknown
│   ├── 2.2 Get Single Resource - Success     [GET]    /api/unknown/2
│   └── 2.3 Get Single Resource - Not Found   [GET]    /api/unknown/23          (Negative Test: 404)
├── 📁 03 - Authentication & Authorization
│   ├── 3.1 Register - Successful             [POST]   /api/register            (Extracts authToken)
│   ├── 3.2 Register - Unsuccessful           [POST]   /api/register            (Missing Password: 400)
│   ├── 3.3 Register - Unsuccessful           [POST]   /api/register            (Missing Email: 400)
│   ├── 3.4 Login - Successful                [POST]   /api/login               (Extracts loginToken)
│   ├── 3.5 Login - Unsuccessful              [POST]   /api/login               (Missing Password: 400)
│   └── 3.6 Login - Unsuccessful              [POST]   /api/login               (User Not Found: 400)
└── 📁 04 - Performance & Delayed Response
    └── 4.1 Delayed Response Latency Check    [GET]    /api/users?delay=1
```

---

## 🧪 Summary of Test Endpoints & Coverage

| Module | Method | Endpoint | Expected Status | Dynamic Action / Key Assertion |
| :--- | :---: | :--- | :---: | :--- |
| **Users** | `GET` | `/api/users?page=1` | `200 OK` | Validates pagination & user schema |
| **Users** | `GET` | `/api/users?page=2` | `200 OK` | Extracts first user `id` → `selectedUserId` |
| **Users** | `GET` | `/api/users/{{selectedUserId}}` | `200 OK` | Verifies matching `id`, email, and avatar |
| **Users** | `GET` | `/api/users/23` | `404 Not Found` | Negative test: empty object validation |
| **Users** | `POST` | `/api/users` | `201 Created` | Extracts `id` → `createdUserId`, timestamps |
| **Users** | `PUT` | `/api/users/{{createdUserId}}` | `200 OK` | Verifies full update with `updatedAt` |
| **Users** | `PATCH` | `/api/users/{{createdUserId}}` | `200 OK` | Verifies partial update |
| **Users** | `DELETE` | `/api/users/{{createdUserId}}` | `204 No Content`| Validates empty response body |
| **Resources** | `GET` | `/api/unknown` | `200 OK` | Hex color (`#RRGGBB`) & pantone validation |
| **Resources** | `GET` | `/api/unknown/2` | `200 OK` | Specific resource schema validation |
| **Resources** | `GET` | `/api/unknown/23` | `404 Not Found` | Negative test: 404 error handling |
| **Auth** | `POST` | `/api/register` | `200 OK` | Captures token → `authToken` |
| **Auth** | `POST` | `/api/register` | `400 Bad Request`| Negative test: `"Missing password"` |
| **Auth** | `POST` | `/api/register` | `400 Bad Request`| Negative test: `"Missing email or username"` |
| **Auth** | `POST` | `/api/login` | `200 OK` | Captures token → `loginToken` |
| **Auth** | `POST` | `/api/login` | `400 Bad Request`| Negative test: `"Missing password"` |
| **Auth** | `POST` | `/api/login` | `400 Bad Request`| Negative test: `"user not found"` |
| **Latency** | `GET` | `/api/users?delay=1` | `200 OK` | SLA latency validation (`< 5000ms`) |

---

## ⚙️ Environment Variables

The project uses `ReqRes_Environment.postman_environment.json`:

| Variable Name | Default / Example Value | Scope & Purpose |
| :--- | :--- | :--- |
| `baseUrl` | `https://reqres.in` | Global base API URL |
| `selectedUserId` | `2` | Dynamic user ID extracted from Page 2 |
| `createdUserId` | `""` | Dynamic user ID from POST create user |
| `authToken` | `""` | Dynamic registration token |
| `loginToken` | `""` | Dynamic login session token |
| `userName` | `Tanzim SQA` | Dynamic test username |
| `userJob` | `Lead QA Automation Engineer` | Dynamic test job title |
| `validRegisterEmail` | `eve.holt@reqres.in` | Predefined mock registration email |
| `validRegisterPassword` | `pistol` | Predefined mock registration password |
| `validLoginEmail` | `eve.holt@reqres.in` | Predefined mock login email |
| `validLoginPassword` | `cityslicka` | Predefined mock login password |

---

## 🏃 Quick Start & Execution

### Option 1: Execute in Postman (Chrome or Desktop)
1. Open [Postman Web](https://go.postman.co) or the Postman Desktop App.
2. Ensure you are in your active workspace (e.g. `new api testing`).
3. Import `ReqRes_API_Testing.postman_collection.json` and `ReqRes_Environment.postman_environment.json` (or use the already imported suite).
4. Select the environment: **`ReqRes Production Environment`**.
5. Click **Run Collection**, set delay to `500 ms` to respect public rate limits, and click **Run**.

### Option 2: Execute via Newman CLI (Local Terminal)
Make sure you have Node.js installed:

```bash
# Clone the repository
git clone https://github.com/TanzimSQA/reqres-postman-api-testing.git
cd reqres-postman-api-testing

# Run tests via npm script
npm test
```

Or run directly with Newman:
```bash
npx newman run ReqRes_API_Testing.postman_collection.json \
  -e ReqRes_Environment.postman_environment.json \
  --delay-request 500
```

### Option 3: Generate Rich HTML Reports
```bash
npm run test:report
```
The detailed HTML dashboard report will be saved to `./reports/ReqRes_Report.html`.

---

## 🔄 Continuous Integration (CI/CD)

This repository includes a native GitHub Actions pipeline in [`.github/workflows/newman-api-tests.yml`](./.github/workflows/newman-api-tests.yml).

- Automatically triggers on every `push` and `pull_request` to `main`.
- Sets up Node.js, installs Newman and HTML Extra reporter.
- Executes the entire test suite against ReqRes.
- Uploads the HTML report artifact to the GitHub Action summary for review.

---

## 👨‍💻 Author

**Tanzim SQA**  
- GitHub: [@TanzimSQA](https://github.com/TanzimSQA)
- Focus: SQA & API Test Automation Frameworks (Postman, Newman, Playwright, Cypress)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
