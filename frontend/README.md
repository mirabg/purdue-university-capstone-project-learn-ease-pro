# LearnEase Pro - Frontend

Modern React application for the LearnEase Pro learning management system, built with Vite, Redux Toolkit, and comprehensive testing coverage.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

### Development

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Testing

```bash
# Unit Tests (Vitest)
npm test                    # Run all unit tests
npm test -- --coverage      # Run with coverage report
npm test -- --ui            # Run with interactive UI
npm test -- --watch         # Run in watch mode
npm test UserModal.test     # Run specific test file

# E2E Tests (Cypress)
npm run cypress:open        # Open Cypress Test Runner
npm run cypress:run         # Run Cypress tests headlessly
```

## 🧪 Testing

### Test Coverage: ✅ PRODUCTION READY

- **Overall Coverage**: 79.65% statements, 82.42% branches, 80.25% lines
- **Total Tests**: 789 unit tests + 150+ E2E scenarios
- **Test Files**: 27 unit test files + 6 E2E test files

#### Coverage by Category

| Category     | Coverage | Status |
| ------------ | -------- | ------ |
| Components   | 73.51%   | ✅     |
| Services     | 100%     | ✅     |
| Store/Slices | 91.72%   | ✅     |
| Utils        | 100%     | ✅     |
| Views        | 94.33%   | ✅     |

### Testing Strategy

Our comprehensive testing follows industry best practices:

1. **Unit Tests (Vitest + React Testing Library)**

   - Fast, isolated component and function tests
   - 789 tests covering business logic, UI components, and utilities
   - See [TEST_COVERAGE.md](TEST_COVERAGE.md) for detailed breakdown

2. **End-to-End Tests (Cypress)**

   - Complete user journey validation
   - 150+ scenarios covering critical paths
   - Real browser testing with network mocking

3. **Coverage Philosophy**
   - Files with 50-60% unit coverage are intentionally covered by E2E tests
   - Complex interactions (ChatBoard, PostCard) validate better in E2E environment
   - Error paths and edge cases covered at appropriate test level

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── AdminRoute.jsx
│   │   ├── ChatBoard.jsx
│   │   ├── Header.jsx
│   │   ├── Icon.jsx
│   │   ├── PostCard.jsx
│   │   ├── UserModal.jsx
│   │   └── ...
│   ├── views/          # Page-level components
│   │   ├── AdminDashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── StudentDashboard.jsx
│   ├── store/          # Redux state management
│   │   ├── apiSlice.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── coursesSlice.js
│   │       └── enrollmentsSlice.js
│   ├── services/       # API services
│   ├── utils/          # Helper functions
│   ├── hooks/          # Custom React hooks
│   ├── models/         # Data models
│   ├── App.jsx         # Root component
│   └── main.jsx        # Application entry point
├── __tests__/          # Unit tests
│   ├── components/
│   ├── views/
│   ├── services/
│   ├── store/
│   └── utils/
├── cypress/            # E2E tests
│   ├── e2e/
│   ├── fixtures/
│   └── support/
└── public/            # Static assets
```

## 🔧 Technology Stack

### Core

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **RTK Query** - API data fetching
- **React Router v6** - Client-side routing

### Styling

- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

### Testing

- **Vitest** - Unit test runner
- **React Testing Library** - Component testing
- **Cypress** - E2E testing
- **@testing-library/user-event** - User interaction simulation

## 🔐 Authentication

The application uses JWT-based authentication:

- Tokens stored in localStorage
- Protected routes with `PrivateRoute` and `AdminRoute` components
- Role-based access control (Admin, Student, Faculty)
- Auto-redirect on authentication state changes

## 🎨 Features

### User Management

- User registration and login
- Role-based dashboards (Admin, Student)
- Profile management
- User CRUD operations (Admin)

### Course Management

- Course listing and details
- Course enrollment
- Course materials (upload/download)
- Course search and filtering

### Discussion Board (ChatBoard)

- Create, edit, delete posts
- Reply to posts with threading
- Pin important posts
- Role-based permissions
- Pagination and search

### Feedback System

- Submit course feedback
- Star ratings
- View aggregated feedback (Admin)

## 🌐 API Integration

The frontend connects to the backend API at `http://localhost:5000/api`

### API Endpoints Used

- `/auth/register` - User registration
- `/auth/login` - User authentication
- `/users` - User management
- `/courses` - Course operations
- `/enrollments` - Enrollment management
- `/feedback` - Course feedback
- `/chat` - Discussion board

## 🚢 Production Build

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview
```

The production build will be in the `dist/` folder.

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update the API URL to your production backend.

### Deployment Checklist

- [ ] Set correct `VITE_API_URL` for production
- [ ] Run production build: `npm run build`
- [ ] Verify no console errors in production build
- [ ] Test production build locally: `npm run preview`
- [ ] All tests passing: `npm test -- --run`
- [ ] E2E tests passing: `npm run cypress:run`
- [ ] Configure CORS on backend for production domain
- [ ] Set up CDN/static hosting (Vercel, Netlify, etc.)

## 📚 Documentation

- [TEST_COVERAGE.md](TEST_COVERAGE.md) - Detailed test coverage report
- [REDUX_MIGRATION_GUIDE.md](REDUX_MIGRATION_GUIDE.md) - Redux implementation guide
- [FRONTEND_UNIT_TEST_PLAN.md](FRONTEND_UNIT_TEST_PLAN.md) - Testing strategy

## 🤝 Contributing

### Running Tests Before Commit

```bash
# Run all unit tests
npm test -- --run

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run cypress:run
```

### Code Quality

- Follow existing code patterns
- Write tests for new features
- Maintain > 60% coverage for new code
- Use TypeScript types where available
- Follow accessibility best practices

## 📈 Performance

- Code splitting with React Router
- Lazy loading for routes
- Optimized images in `public/`
- Vite's optimized build output
- Redux state normalized for performance

## 🐛 Troubleshooting

### Tests Failing

```bash
# Clear test cache
npm test -- --clearCache

# Run specific test file
npm test ChatBoard.test.jsx
```

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Cypress Issues

```bash
# Clear Cypress cache
npx cypress cache clear
npx cypress install
```

## 📝 License

This project is part of Purdue University Capstone Project.

---

**Last Updated**: January 2025
**Status**: ✅ Production Ready
**Test Coverage**: 79.65% (Unit) + Comprehensive E2E Coverage
