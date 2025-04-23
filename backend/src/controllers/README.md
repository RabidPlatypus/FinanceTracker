Finance Tracker - Backend Controllers

This folder contains the actual business logic for each route. Each controller file corresponds to a domain area (auth, user, budget, expense).

authController.js
- signup(req, res)
- login(req, res)
- getProfile(req, res)

userController.js
- updateUser(req, res)
- changePassword(req, res)
- deleteUser(req, res)

budgetController.js
- setBudget(req, res)
- getBudgetByMonth(req, res)
- updateBudget(req, res)

expenseController.js
- addExpense(req, res)
- getExpenses(req, res)
- updateExpense(req, res)
- deleteExpense(req, res)

Notes:
- Uses Firestore collections under each authenticated user’s UID
- Error handling follows try/catch with status codes
