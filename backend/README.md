Finance Tracker API - Backend

Overview:
This directory contains the backend logic for the Finance Tracker app. Built with Express and Firebase, it handles authentication, budget management, and expense tracking.

Directory Structure:
backend/
├── src/
│   ├── config/         - Firebase service initialization
│   ├── controllers/    - Business logic for routes
│   ├── middlewares/    - JWT auth middleware
│   └── routes/         - API endpoints
├── .env                - Firebase secrets
├── package.json        - Dependencies
├── README.md           - Backend guide (this file)

Key Endpoints:
/auth/signup        - Register new user
/auth/login         - User login
/auth/profile       - Authenticated user info
/budget/:month      - GET monthly budget
/budget/set         - POST new budget
/expenses/add       - POST new expense
/expenses/list      - GET all user expenses
/expenses/delete/:id - DELETE expense
/user/update        - PUT user profile update
/user/change-password - PUT password update
/user/delete        - DELETE user account

Security:
- All routes (except auth) are protected via `authMiddleware`
- Tokens are verified using Firebase Admin SDK
