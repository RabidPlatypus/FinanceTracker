Finance Tracker - Frontend (React)

Overview:
A responsive and interactive React SPA that allows users to log, visualize, and manage financial data.

Directory Structure:
frontend/
├── src/
│   ├── components/      - Navbar with dark mode & auth
│   ├── pages/           - Dashboard, Analytics, Auth, Profile
│   ├── api.js           - Axios config with token injection
│   ├── App.js           - Route definitions
│   ├── ProtectedRoute.js- Wrapper for secured views

Routing:
- /login        -> Login form
- /signup       -> Registration form
- /dashboard    -> Budget & expenses
- /analytics    -> Charts and trends
- /profile      -> Account settings

Theming:
- Dark mode toggle with `localStorage` persistence
- Global and scoped stylesheets with MUI + custom CSS

State:
- Auth state persists across refresh
- useEffect checks token validity

Integration:
- Axios sends token via interceptor
- ProtectedRoute blocks access without token
