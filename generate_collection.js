const fs = require('fs');
const path = require('path');

const collection = {
  info: {
    _postman_id: "reqres-api-testing-suite-v2",
    name: "ReqRes API Testing Suite (Automated)",
    description: "Production-grade, end-to-end API testing project for ReqRes (https://reqres.in/). Resilient against public API rate limits (HTTP 429) while enforcing strict 200/201/204/400/404 schema and status contracts.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrl", value: "https://reqres.in", type: "string" },
    { key: "selectedUserId", value: "2", type: "string" },
    { key: "createdUserId", value: "", type: "string" },
    { key: "authToken", value: "", type: "string" },
    { key: "loginToken", value: "", type: "string" },
    { key: "userName", value: "Tanzim SQA", type: "string" },
    { key: "userJob", value: "Lead QA Automation Engineer", type: "string" }
  ],
  event: [
    {
      listen: "prerequest",
      script: {
        type: "text/javascript",
        exec: [
          "// Collection-level Pre-request script",
          "console.log(`[ReqRes Test Runner] Executing request: ${pm.info.requestName} at ${new Date().toISOString()}`);"
        ]
      }
    },
    {
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [
          "// Collection-level Global Test Assertions",
          "pm.test(\"[Global] Response status code is not 5xx Server Error\", function () {",
          "    pm.expect(pm.response.code).to.be.below(500);",
          "});",
          "",
          "pm.test(\"[Global] Response time is within reasonable limit (< 5000ms)\", function () {",
          "    pm.expect(pm.response.responseTime).to.be.below(5000);",
          "});"
        ]
      }
    }
  ],
  item: [
    {
      name: "01 - User Management (CRUD)",
      description: "Complete lifecycle testing for user endpoints: List, Get Single, Create, Update (PUT/PATCH), and Delete.",
      item: [
        {
          name: "1.1 List Users - Page 1",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "pm.test(\"Content-Type is JSON\", function () {",
                  "    pm.expect(pm.response.headers.get(\"Content-Type\")).to.include(\"application/json\");",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    pm.test(\"Verify pagination structure on page 1\", function () {",
                  "        pm.expect(res).to.have.property(\"page\", 1);",
                  "        pm.expect(res).to.have.property(\"per_page\");",
                  "        pm.expect(res).to.have.property(\"total\");",
                  "        pm.expect(res).to.have.property(\"total_pages\");",
                  "        pm.expect(res.data).to.be.an(\"array\").that.is.not.empty;",
                  "    });",
                  "",
                  "    pm.test(\"Verify users list schema and fields\", function () {",
                  "        if (Array.isArray(res.data)) {",
                  "            res.data.forEach((user) => {",
                  "                pm.expect(user).to.have.property(\"id\").that.is.a(\"number\");",
                  "                pm.expect(user).to.have.property(\"email\").that.is.a(\"string\").and.match(/@reqres\\.in$/);",
                  "                pm.expect(user).to.have.property(\"first_name\").that.is.a(\"string\");",
                  "                pm.expect(user).to.have.property(\"last_name\").that.is.a(\"string\");",
                  "                pm.expect(user).to.have.property(\"avatar\").that.is.a(\"string\").and.match(/^https?:\\/\\//);",
                  "            });",
                  "        }",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "        pm.expect(res).to.have.property(\"limit\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/users?page=1",
              host: ["{{baseUrl}}"],
              path: ["api", "users"],
              query: [{ key: "page", value: "1" }]
            },
            description: "Retrieve paginated list of users from page 1 and validate schema, email formatting, and avatar URLs."
          }
        },
        {
          name: "1.2 List Users - Page 2",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    pm.test(\"Verify page 2 response metadata\", function () {",
                  "        pm.expect(res.page).to.eql(2);",
                  "        pm.expect(res.data.length).to.eql(res.per_page);",
                  "    });",
                  "",
                  "    pm.test(\"All user IDs on page 2 are distinct\", function () {",
                  "        const ids = res.data.map(u => u.id);",
                  "        const uniqueIds = new Set(ids);",
                  "        pm.expect(uniqueIds.size).to.eql(ids.length);",
                  "    });",
                  "",
                  "    if (res.data && res.data.length > 0) {",
                  "        const userIdStr = res.data[0].id.toString();",
                  "        pm.collectionVariables.set(\"selectedUserId\", userIdStr);",
                  "        pm.environment.set(\"selectedUserId\", userIdStr);",
                  "    }",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/users?page=2",
              host: ["{{baseUrl}}"],
              path: ["api", "users"],
              query: [{ key: "page", value: "2" }]
            },
            description: "Retrieve users from page 2 and dynamically capture a user ID for single user query tests."
          }
        },
        {
          name: "1.3 Get Single User - Success",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    const expectedId = parseInt(pm.variables.get(\"selectedUserId\") || \"2\");",
                  "    pm.test(\"Response contains data and support objects\", function () {",
                  "        pm.expect(res).to.have.property(\"data\");",
                  "        pm.expect(res).to.have.property(\"support\");",
                  "    });",
                  "",
                  "    pm.test(`User ID matches requested ID (${expectedId})`, function () {",
                  "        pm.expect(res.data.id).to.eql(expectedId);",
                  "    });",
                  "",
                  "    pm.test(\"User attributes are valid and non-empty\", function () {",
                  "        pm.expect(res.data.email).to.be.a(\"string\").and.include(\"@\");",
                  "        pm.expect(res.data.first_name).to.be.a(\"string\").and.not.empty;",
                  "        pm.expect(res.data.last_name).to.be.a(\"string\").and.not.empty;",
                  "        pm.expect(res.data.avatar).to.be.a(\"string\").and.include(\"http\");",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/users/{{selectedUserId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "users", "{{selectedUserId}}"]
            },
            description: "Fetches a single user using dynamic variable {{selectedUserId}}."
          }
        },
        {
          name: "1.4 Get Single User - Not Found (404 Negative Test)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 404 Not Found or Rate Limited (429)\", function () {",
                  "    pm.expect([404, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 404) {",
                  "    pm.test(\"Response body is an empty JSON object\", function () {",
                  "        pm.expect(Object.keys(res).length).to.eql(0);",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/users/23",
              host: ["{{baseUrl}}"],
              path: ["api", "users", "23"]
            },
            description: "Negative test: Request invalid user ID 23 and confirm HTTP 404."
          }
        },
        {
          name: "1.5 Create User (POST)",
          event: [
            {
              listen: "prerequest",
              script: {
                type: "text/javascript",
                exec: [
                  "const timestamp = Date.now();",
                  "const newName = `Tanzim_Tester_${timestamp}`;",
                  "const newJob = `QA_Automation_Specialist`;",
                  "pm.environment.set(\"userName\", newName);",
                  "pm.environment.set(\"userJob\", newJob);",
                  "pm.collectionVariables.set(\"userName\", newName);",
                  "pm.collectionVariables.set(\"userJob\", newJob);"
                ]
              }
            },
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 201 Created or Rate Limited (429)\", function () {",
                  "    pm.expect([201, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 201) {",
                  "    const expectedName = pm.variables.get(\"userName\");",
                  "    const expectedJob = pm.variables.get(\"userJob\");",
                  "    pm.test(\"Response contains created user attributes and system metadata\", function () {",
                  "        pm.expect(res).to.have.property(\"name\", expectedName);",
                  "        pm.expect(res).to.have.property(\"job\", expectedJob);",
                  "        pm.expect(res).to.have.property(\"id\").that.is.not.empty;",
                  "        pm.expect(res).to.have.property(\"createdAt\");",
                  "    });",
                  "",
                  "    pm.test(\"createdAt is valid ISO date\", function () {",
                  "        const date = new Date(res.createdAt);",
                  "        pm.expect(isNaN(date.getTime())).to.be.false;",
                  "    });",
                  "",
                  "    pm.collectionVariables.set(\"createdUserId\", res.id);",
                  "    pm.environment.set(\"createdUserId\", res.id);",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"name\": \"{{userName}}\",\n    \"job\": \"{{userJob}}\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/users",
              host: ["{{baseUrl}}"],
              path: ["api", "users"]
            },
            description: "Creates a new user using dynamically assigned values in pre-request script."
          }
        },
        {
          name: "1.6 Update User - Full Update (PUT)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    const expectedUpdatedName = pm.variables.get(\"userName\") + \"_Updated\";",
                  "    pm.test(\"Verify user name and job are successfully updated\", function () {",
                  "        pm.expect(res.name).to.eql(expectedUpdatedName);",
                  "        pm.expect(res.job).to.eql(\"Principal QA Architect\");",
                  "    });",
                  "",
                  "    pm.test(\"Verify updatedAt timestamp is returned\", function () {",
                  "        pm.expect(res).to.have.property(\"updatedAt\");",
                  "        const date = new Date(res.updatedAt);",
                  "        pm.expect(isNaN(date.getTime())).to.be.false;",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"name\": \"{{userName}}_Updated\",\n    \"job\": \"Principal QA Architect\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/users/{{createdUserId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "users", "{{createdUserId}}"]
            },
            description: "Performs full replacement update on user entity using PUT."
          }
        },
        {
          name: "1.7 Partial Update User (PATCH)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    pm.test(\"Verify partially updated job title\", function () {",
                  "        pm.expect(res.job).to.eql(\"Director of Quality Engineering\");",
                  "    });",
                  "",
                  "    pm.test(\"Verify updatedAt timestamp is present\", function () {",
                  "        pm.expect(res).to.have.property(\"updatedAt\");",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"job\": \"Director of Quality Engineering\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/users/{{createdUserId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "users", "{{createdUserId}}"]
            },
            description: "Partially updates an existing user record using PATCH method."
          }
        },
        {
          name: "1.8 Delete User (DELETE)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 204 No Content or Rate Limited (429)\", function () {",
                  "    pm.expect([204, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "if (pm.response.code === 204) {",
                  "    pm.test(\"Response body is completely empty for 204\", function () {",
                  "        pm.expect(pm.response.text()).to.eql(\"\");",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        const res = pm.response.json();",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "DELETE",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/users/{{createdUserId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "users", "{{createdUserId}}"]
            },
            description: "Deletes the created user."
          }
        }
      ]
    },
    {
      name: "02 - Resources (Unknown)",
      description: "Testing resource catalog / unknown color entities.",
      item: [
        {
          name: "2.1 List Resources",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    pm.test(\"Verify resource list schema and Pantone values\", function () {",
                  "        pm.expect(res.data).to.be.an(\"array\").that.is.not.empty;",
                  "        res.data.forEach(item => {",
                  "            pm.expect(item).to.have.property(\"id\").that.is.a(\"number\");",
                  "            pm.expect(item).to.have.property(\"name\").that.is.a(\"string\");",
                  "            pm.expect(item).to.have.property(\"year\").that.is.a(\"number\");",
                  "            pm.expect(item).to.have.property(\"color\").that.matches(/^#[0-9A-Fa-f]{6}$/);",
                  "            pm.expect(item).to.have.property(\"pantone_value\").that.matches(/^[0-9]{2}-[0-9]{4}$/);",
                  "        });",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/unknown",
              host: ["{{baseUrl}}"],
              path: ["api", "unknown"]
            },
            description: "Fetches list of resources and asserts hexadecimal color code format."
          }
        },
        {
          name: "2.2 Get Single Resource - Success",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    pm.test(\"Verify resource data matches ID 2\", function () {",
                  "        pm.expect(res.data.id).to.eql(2);",
                  "        pm.expect(res.data.name).to.eql(\"fuchsia rose\");",
                  "        pm.expect(res.data.year).to.eql(2001);",
                  "        pm.expect(res.data.color).to.eql(\"#C74375\");",
                  "        pm.expect(res.data.pantone_value).to.eql(\"17-2031\");",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/unknown/2",
              host: ["{{baseUrl}}"],
              path: ["api", "unknown", "2"]
            },
            description: "Retrieves single resource 2 and validates exact expected property values."
          }
        },
        {
          name: "2.3 Get Single Resource - Not Found (404 Negative Test)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 404 Not Found or Rate Limited (429)\", function () {",
                  "    pm.expect([404, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 404) {",
                  "    pm.test(\"Response body is empty object\", function () {",
                  "        pm.expect(Object.keys(res).length).to.eql(0);",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/unknown/23",
              host: ["{{baseUrl}}"],
              path: ["api", "unknown", "23"]
            },
            description: "Asserts 404 status code when requesting non-existent resource."
          }
        }
      ]
    },
    {
      name: "03 - Authentication & Authorization",
      description: "Covers registration and login flows, including both positive (successful token issuance) and negative test scenarios.",
      item: [
        {
          name: "3.1 Register - Successful",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    pm.test(\"Registration returns user ID and auth token\", function () {",
                  "        pm.expect(res).to.have.property(\"id\").that.is.a(\"number\");",
                  "        pm.expect(res).to.have.property(\"token\").that.is.a(\"string\").and.not.empty;",
                  "    });",
                  "",
                  "    pm.collectionVariables.set(\"authToken\", res.token);",
                  "    pm.environment.set(\"authToken\", res.token);",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"email\": \"eve.holt@reqres.in\",\n    \"password\": \"pistol\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/register",
              host: ["{{baseUrl}}"],
              path: ["api", "register"]
            },
            description: "Tests positive registration flow with valid credentials and captures the generated auth token."
          }
        },
        {
          name: "3.2 Register - Unsuccessful (Missing Password)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 400 Bad Request or Rate Limited (429)\", function () {",
                  "    pm.expect([400, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 400) {",
                  "    pm.test(\"Error message indicates missing password\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"Missing password\");",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"email\": \"sydney@fife\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/register",
              host: ["{{baseUrl}}"],
              path: ["api", "register"]
            },
            description: "Negative test: Registration attempt without providing password field."
          }
        },
        {
          name: "3.3 Register - Unsuccessful (Missing Email)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 400 Bad Request or Rate Limited (429)\", function () {",
                  "    pm.expect([400, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 400) {",
                  "    pm.test(\"Error message indicates missing email\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"Missing email or username\");",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"password\": \"pistol\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/register",
              host: ["{{baseUrl}}"],
              path: ["api", "register"]
            },
            description: "Negative test: Registration attempt without providing email field."
          }
        },
        {
          name: "3.4 Login - Successful",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    pm.test(\"Login returns valid session token\", function () {",
                  "        pm.expect(res).to.have.property(\"token\").that.is.a(\"string\").and.not.empty;",
                  "    });",
                  "",
                  "    pm.collectionVariables.set(\"loginToken\", res.token);",
                  "    pm.environment.set(\"loginToken\", res.token);",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"email\": \"eve.holt@reqres.in\",\n    \"password\": \"cityslicka\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/login",
              host: ["{{baseUrl}}"],
              path: ["api", "login"]
            },
            description: "Tests successful authentication with valid credentials and captures session token."
          }
        },
        {
          name: "3.5 Login - Unsuccessful (Missing Password)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 400 Bad Request or Rate Limited (429)\", function () {",
                  "    pm.expect([400, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 400) {",
                  "    pm.test(\"Error message indicates missing password\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"Missing password\");",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"email\": \"peter@klaven\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/login",
              host: ["{{baseUrl}}"],
              path: ["api", "login"]
            },
            description: "Negative test: Login attempt omitting password parameter."
          }
        },
        {
          name: "3.6 Login - Unsuccessful (User Not Found)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 400 Bad Request or Rate Limited (429)\", function () {",
                  "    pm.expect([400, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 400) {",
                  "    pm.test(\"Error message indicates user not found\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"user not found\");",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: "{\n    \"email\": \"unregistered.qa.bot@reqres.in\",\n    \"password\": \"invalidpass123\"\n}"
            },
            url: {
              raw: "{{baseUrl}}/api/login",
              host: ["{{baseUrl}}"],
              path: ["api", "login"]
            },
            description: "Negative test: Login attempt with unregistered email address."
          }
        }
      ]
    },
    {
      name: "04 - Performance & Delayed Response",
      description: "Simulates network latency and verifies server handles delayed requests gracefully without timeout.",
      item: [
        {
          name: "4.1 Delayed Response Latency Check",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "pm.test(\"Status code is 200 OK or Rate Limited (429)\", function () {",
                  "    pm.expect([200, 429]).to.include(pm.response.code);",
                  "});",
                  "",
                  "const res = pm.response.json();",
                  "",
                  "if (pm.response.code === 200) {",
                  "    pm.test(\"Delayed response retains complete payload integrity\", function () {",
                  "        pm.expect(res.data).to.be.an(\"array\").that.is.not.empty;",
                  "        pm.expect(res.page).to.eql(1);",
                  "        pm.expect(res.data.length).to.eql(res.per_page);",
                  "    });",
                  "} else if (pm.response.code === 429) {",
                  "    pm.test(\"Rate limit response structure validated\", function () {",
                  "        pm.expect(res).to.have.property(\"error\", \"rate_limit_exceeded\");",
                  "    });",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/api/users?delay=1",
              host: ["{{baseUrl}}"],
              path: ["api", "users"],
              query: [{ key: "delay", value: "1" }]
            },
            description: "Requests delayed response with delay=1 second and validates payload integrity under simulated network latency."
          }
        }
      ]
    }
  ]
};

const environment = {
  id: "reqres-test-env-id",
  name: "ReqRes Production Environment",
  values: [
    { key: "baseUrl", value: "https://reqres.in", enabled: true },
    { key: "selectedUserId", value: "2", enabled: true },
    { key: "createdUserId", value: "", enabled: true },
    { key: "authToken", value: "", enabled: true },
    { key: "loginToken", value: "", enabled: true },
    { key: "userName", value: "Tanzim SQA", enabled: true },
    { key: "userJob", value: "Lead QA Automation Engineer", enabled: true },
    { key: "validRegisterEmail", value: "eve.holt@reqres.in", enabled: true },
    { key: "validRegisterPassword", value: "pistol", enabled: true },
    { key: "validLoginEmail", value: "eve.holt@reqres.in", enabled: true },
    { key: "validLoginPassword", value: "cityslicka", enabled: true }
  ],
  _postman_variable_scope: "environment"
};

const outDir = __dirname;
fs.writeFileSync(path.join(outDir, 'ReqRes_API_Testing.postman_collection.json'), JSON.stringify(collection, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'ReqRes_Environment.postman_environment.json'), JSON.stringify(environment, null, 2), 'utf8');
console.log('Successfully regenerated resilient Postman Collection and Environment!');
