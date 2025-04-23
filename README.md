Finance Tracker - Full Stack Budget & Expense App

Overview:
A full-stack web application built with React, Firebase, and Node.js/Express. Users can create accounts, manage their monthly budgets, log expenses, and analyze spending trends with beautiful interactive charts.

🌐 Live App:
Access the deployed app here → https://financetracker-x1143-a5d8e.web.app

Tech Stack:
- Frontend: React 19, React Router, Axios, MUI, Recharts
- Backend: Express + Firebase Admin SDK
- Auth: Firebase JWTs
- Database: Firestore
- Hosting: Firebase (Frontend), Render (Backend)

Directory Structure:
/root
├── backend/        - Express API (src/config, controllers, routes, middlewares)
├── frontend/       - React UI (src/pages, components)
├── .env            - Environment variables
├── README.md       - Project overview (this file)

Deployment:
- Backend: Render (root = /backend, start = npm run dev)
- Frontend: Firebase Hosting (firebase.json configured)

Core Features:
- Signup/Login with JWT
- Monthly budget setting + tracking
- Expense CRUD with filters & export
- Dark mode toggle
- Visual analytics with Recharts
