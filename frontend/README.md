# LearnEasePro Frontend

React frontend application built with Vite, React Router, Redux Toolkit, and Tailwind CSS.

## Tech Stack

- **React** 18.3.1 - UI library
- **Vite** 6.0.3 - Build tool and dev server
- **React Router** 6.28.0 - Client-side routing
- **Redux Toolkit** 2.2.1 - State management
- **Tailwind CSS** 3.4.1 - Utility-first CSS framework
- **Axios** 1.6.5 - HTTP client

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── views/          # Page-level components (routes)
│   ├── store/          # Redux store and slices
│   ├── services/       # API service layers
│   ├── models/         # Data models and classes
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles with Tailwind
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies and scripts
```

## MVC-Type Architecture

The project follows an MVC-inspired structure:

- **Models** (`src/models/`) - Data structures and business logic
- **Views** (`src/views/`) - Page components that display data
- **Controllers** (`src/store/`) - Redux slices that manage state and actions
- **Services** (`src/services/`) - API communication layer

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

3. **Build for production**

   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

### Path Aliases

Configured path aliases for cleaner imports:

- `@/` → `src/`
- `@components/` → `src/components/`
- `@views/` → `src/views/`
- `@store/` → `src/store/`
- `@services/` → `src/services/`
- `@utils/` → `src/utils/`
- `@models/` → `src/models/`
- `@hooks/` → `src/hooks/`

### API Proxy

Development server proxies `/api` requests to `http://localhost:5001` (backend server).

### Pre-configured Services

- **authService** - Authentication operations (login, register, logout)
- **userService** - User CRUD operations
- **api** - Axios instance with interceptors for auth and error handling

### State Management

Redux store is configured and ready. Add slices in `src/store/` as features are developed.

### Styling

Tailwind CSS is configured with a custom primary color palette. Global styles are in `src/index.css`.

## Development Guidelines

### Adding a New Page

1. Create component in `src/views/`
2. Add route in `src/App.jsx`
3. Create Redux slice if needed in `src/store/`
4. Add service methods in `src/services/` if API calls are needed

### Adding a Component

1. Create component in `src/components/`
2. Export from the component file
3. Import using path alias: `import Button from '@components/Button'`

### Making API Calls

Use the pre-configured services:

```javascript
import { authService } from "@services/authService";
import { userService } from "@services/userService";

// Login
const response = await authService.login({ email, password });

// Get users
const users = await userService.getAllUsers();
```

### Redux Store

Add slices to the store:

```javascript
// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false },
  reducers: {
    // reducers here
  },
});

export default authSlice.reducer;

// Add to store.js
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
```

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_URL=http://localhost:5001
```

Access in code: `import.meta.env.VITE_API_URL`

## Backend Integration

The frontend is configured to work with the LearnEasePro backend:

- Base API URL: `/api` (proxied to `http://localhost:5001`)
- Authentication: JWT tokens stored in localStorage
- Auto-redirects to login on 401 responses

## Next Steps

Pages and features will be added stepwise:

1. Authentication pages (Login, Register)
2. Dashboard
3. User management (admin)
4. Profile management
5. Additional features as needed

---

**Note:** This is the initial setup. Components, pages, and features will be added incrementally.
