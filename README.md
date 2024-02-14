# webapp

## Prerequisites

- Node.js and npm installed.

- MySQL database running locally.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ChenChenChen99/webapp.git
cd webapp
```

2. Install dependencies:

```bash
npm install
```

3. Set up the MySQL database:

- Create a MySQL database named csye6225.

- Update the MySQL credentials in user.js file if necessary.

4. Start the server:

```bash
npm start
```

The server should now be running on http://localhost:8080.

## Endpoints

- /healthz: Check server health.

- POST /v1/user: Create a new user.

- GET /v1/user/self: Get user details (requires authentication).

- PUT /v1/user/self: Update user details (requires authentication).

## Authentication

- The application uses Basic Authentication for user creation and token generation.

- Tokens are required for accessing authenticated endpoints.

## Contributors

Qian Chen
--



