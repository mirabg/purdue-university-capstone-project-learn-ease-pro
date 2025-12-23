# LearnEase Pro - Learning Management System

A comprehensive full-stack learning management system built with modern web technologies. LearnEase Pro provides course management, user authentication, enrollment tracking, discussion boards, and feedback systems.

## 🚀 Project Status

**✅ PRODUCTION READY**

- Comprehensive test coverage (79.65% frontend unit tests + E2E coverage)
- 789 unit tests + 150+ E2E scenarios
- All critical paths validated
- Zero failing tests
- Production deployment ready

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)

## ✨ Features

### User Management

- **Role-based Access Control**: Admin, Faculty, Student roles
- **Authentication**: JWT-based secure authentication
- **User CRUD**: Complete user management (Admin)
- **Profile Management**: Update user information

### Course Management

- **Course Operations**: Create, read, update, delete courses
- **Course Details**: Rich course information with descriptions
- **Course Materials**: Upload and manage documents, videos, presentations
- **Search & Filter**: Advanced course discovery

### Enrollment System

- **Student Enrollment**: Enroll in courses
- **Enrollment Tracking**: View and manage enrollments
- **Analytics**: Course enrollment statistics

### Discussion Board (ChatBoard)

- **Post Management**: Create, edit, delete discussion posts
- **Threaded Replies**: Reply to posts with nested conversations
- **Pin Posts**: Highlight important discussions
- **Pagination**: Efficient browsing of large discussions
- **Search**: Find specific discussions
- **Role Permissions**: Permission-based actions

### Feedback System

- **Course Ratings**: 5-star rating system
- **Written Feedback**: Detailed course reviews
- **Feedback Analytics**: Aggregated feedback (Admin view)

### Dashboards

- **Admin Dashboard**: System statistics, user management, course oversight
- **Student Dashboard**: Personalized learning overview, enrollments, activity
- **Faculty Dashboard**: Course management, student tracking

## 🛠️ Technology Stack

### Frontend

- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **RTK Query** - API data fetching and caching
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Cypress** - End-to-end testing

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for auth
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Jest** - Testing framework

## 📁 Project Structure

```
PurdueUniversity-Capstone-Project-LearnEasePro/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── views/           # Page-level components
│   │   ├── store/           # Redux store and slices
│   │   ├── services/        # API services
│   │   ├── utils/           # Helper functions
│   │   └── hooks/           # Custom React hooks
│   ├── __tests__/           # Unit tests (789 tests)
│   ├── cypress/             # E2E tests (150+ scenarios)
│   └── README.md            # Frontend documentation
│
├── backend/                 # Express backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   └── config/         # Configuration files
│   ├── __tests__/          # Backend tests
│   └── README.md           # Backend documentation
│
└── cypress/                # Shared E2E test resources
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 4.4+ (local or MongoDB Atlas)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd PurdueUniversity-Capstone-Project-LearnEasePro
```

2. **Install dependencies**

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**

**Backend** (`backend/.env`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learneasedb
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
NODE_ENV=development
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start MongoDB**

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in backend/.env
```

5. **Start the application**

```bash
# Terminal 1 - Start backend (from backend/)
cd backend
npm run dev

# Terminal 2 - Start frontend (from frontend/)
cd frontend
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 🧪 Testing

### Comprehensive Test Coverage ✅

#### Frontend Tests

**Unit Tests: 789 passing tests across 27 files**

```bash
cd frontend

# Run all unit tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test
npm test ChatBoard.test.jsx
```

**E2E Tests: 150+ scenarios across 6 files**

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run headlessly
npm run cypress:run
```

**Coverage Metrics:**

- Overall: 79.65% statements, 82.42% branches, 80.25% lines
- Components: 73.51%
- Services: 100%
- Store/Slices: 91.72%
- Utils: 100%
- Views: 94.33%

See [frontend/TEST_COVERAGE.md](frontend/TEST_COVERAGE.md) for detailed breakdown.

#### Backend Tests

```bash
cd backend

# Run all backend tests
npm test

# Run with coverage
npm test -- --coverage
```

See [backend/TEST_COVERAGE_REPORT.md](backend/TEST_COVERAGE_REPORT.md) for details.

## 🚢 Deployment

### Production Build

#### Frontend

```bash
cd frontend

# Create production build
npm run build

# Preview production build
npm run preview
```

Deploy the `frontend/dist/` folder to:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

#### Backend

```bash
cd backend

# Set NODE_ENV to production
export NODE_ENV=production

# Start production server
npm start
```

Deploy to:

- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

### Environment Configuration

**Production Environment Variables:**

Backend:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<strong-secret-key>
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

Frontend:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Production Checklist

- [ ] Update environment variables for production
- [ ] Configure CORS for production domains
- [ ] Set up production MongoDB instance
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CDN for frontend assets
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Run all tests: `npm test -- --run`
- [ ] Run E2E tests: `npm run cypress:run`
- [ ] Verify production builds locally
- [ ] Set up CI/CD pipeline (optional)

## 📚 Documentation

### Main Documentation

- [Frontend README](frontend/README.md) - Frontend setup and architecture
- [Backend README](backend/README.md) - Backend API documentation
- [Frontend Test Coverage](frontend/TEST_COVERAGE.md) - Detailed test coverage
- [Backend Test Coverage](backend/TEST_COVERAGE_REPORT.md) - Backend test report

### Feature Documentation

- [ChatBoard Feature](CHATBOARD_FEATURE.md) - Discussion board implementation
- [Course Materials Upload](COURSE_MATERIALS_UPLOAD.md) - File upload system
- [Redux Implementation](REDUX_IMPLEMENTATION_SUMMARY.md) - State management

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Secure file upload with type validation

## 🎯 User Roles

### Admin

- Full system access
- User management (CRUD)
- Course management
- View all enrollments and feedback
- System analytics

### Faculty

- Create and manage own courses
- View enrolled students
- Access course feedback
- Manage course materials

### Student

- Browse and enroll in courses
- Access course materials
- Participate in discussions
- Submit course feedback

## 🤝 Contributing

### Development Workflow

1. Create a feature branch
2. Make changes with tests
3. Run test suite: `npm test`
4. Ensure coverage stays > 60%
5. Submit pull request

### Code Quality Standards

- Write unit tests for new features
- Maintain test coverage above 60%
- Follow existing code patterns
- Use ESLint and Prettier
- Write meaningful commit messages

## 📊 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### User Endpoints

- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin)

### Course Endpoints

- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create course (Admin/Faculty)
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Enrollment Endpoints

- `GET /enrollments` - Get all enrollments
- `POST /enrollments` - Enroll in course
- `DELETE /enrollments/:id` - Unenroll from course

### Feedback Endpoints

- `GET /feedback` - Get all feedback
- `POST /feedback` - Submit feedback
- `GET /feedback/course/:courseId` - Get course feedback

### Chat Endpoints

- `GET /chat/posts` - Get discussion posts
- `POST /chat/posts` - Create post
- `PUT /chat/posts/:id` - Update post
- `DELETE /chat/posts/:id` - Delete post
- `POST /chat/posts/:id/replies` - Add reply

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

**Port Already in Use**

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
```

**Tests Failing**

```bash
# Clear test cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

This project is part of Purdue University Capstone Project.

## 👥 Team

Purdue University Bootcamp - Capstone Project Team

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Status**: ✅ Production Ready
**Test Coverage**: 79.65% (Frontend) + Comprehensive E2E
