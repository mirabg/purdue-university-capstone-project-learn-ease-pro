# LearnEasePro Backend API

A robust Express.js REST API with MongoDB, featuring JWT authentication, role-based authorization, and comprehensive test coverage.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Admin, Student, and Faculty roles
- 🔒 **Optimistic Locking** - Version control for concurrent updates
- ✅ **100% Test Coverage** - 190 tests (144 unit + 46 integration)
- 🏗️ **Layered Architecture** - Repository pattern with separation of concerns
- 🔑 **Password Security** - Bcrypt hashing with salt rounds
- ✨ **Input Validation** - Mongoose schema validation
- 📝 **Comprehensive API** - Full CRUD operations for user management

- 🌱 **Database Seeding** - Initial admin user setup

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 4.18.2
- **Database:** MongoDB with Mongoose 8.0.3
- **Authentication:** JSON Web Tokens (jsonwebtoken 9.0.2)
- **Password Hashing:** bcrypt 5.1.1
- **Testing:** Jest 29.7.0 with mongodb-memory-server
- **HTTP Testing:** Supertest 6.3.3

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the backend directory:

   ```env
   # Server
   PORT=5001
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/learneasepro

   # JWT
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=7d

   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB**

   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   ```

5. **Seed the database with initial data**

   **Option A: Quick Start (Admin Only)**

   ```bash
   npm run seed:admin
   ```

   **Option B: Full Database Setup (Recommended)**

   ```bash
   # Step 1: Seed admin and sample users (includes faculty, students)
   node src/scripts/seedUsers.js

   # Step 2: Seed courses (requires users with faculty role)
   npm run seed:courses

   # Step 3: Seed course enrollments (requires courses and students)
   npm run seed:enrollments

   # Step 4: (Optional) Seed course materials
   npm run seed:materials
   ```

   **Default Admin Credentials:**

   - **Email:** admin@nowhere.com
   - **Password:** changeme
   - **Role:** admin

   **Sample Faculty Users:**

   - emily.johnson@example.com / password123
   - sarah.brown@example.com / password123
   - ashley.rodriguez@example.com / password123

   **Sample Student Users:**

   - michael.wilson@example.com / password123
   - jessica.martinez@example.com / password123

   ⚠️ **Important:** Change default passwords after first login!

6. **Run the server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5001`

## Quick Start

After installation and seeding, test the API:

```bash
# Login with the admin account
curl -X POST http://localhost:5001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nowhere.com",
    "password": "changeme"
  }'

# Save the returned token and use it for authenticated requests
export TOKEN="your_token_here"

# Get all users
curl -X GET http://localhost:5001/api/users \
  -H "Authorization: Bearer $TOKEN"
```

## API Endpoints

### Authentication

| Method | Endpoint              | Description       | Access |
| ------ | --------------------- | ----------------- | ------ |
| POST   | `/api/users/register` | Register new user | Public |
| POST   | `/api/users/login`    | Login user        | Public |

### User Management

| Method | Endpoint         | Description    | Access         |
| ------ | ---------------- | -------------- | -------------- |
| GET    | `/api/users`     | Get all users  | Admin          |
| GET    | `/api/users/:id` | Get user by ID | Admin or Owner |
| PUT    | `/api/users/:id` | Update user    | Admin or Owner |
| DELETE | `/api/users/:id` | Delete user    | Admin or Owner |

### Course Management

| Method | Endpoint                    | Description            | Access        |
| ------ | --------------------------- | ---------------------- | ------------- |
| POST   | `/api/courses`              | Create new course      | Admin/Faculty |
| GET    | `/api/courses`              | Get all courses        | Authenticated |
| GET    | `/api/courses/:id`          | Get course by ID       | Authenticated |
| PUT    | `/api/courses/:id`          | Update course          | Admin/Faculty |
| DELETE | `/api/courses/:id`          | Delete course          | Admin         |
| POST   | `/api/courses/:id/upload`   | Upload course material | Admin/Faculty |
| POST   | `/api/courses/:id/details`  | Add course detail      | Admin/Faculty |
| GET    | `/api/courses/:id/details`  | Get course details     | Authenticated |
| PUT    | `/api/courses/:id/details`  | Update course detail   | Admin/Faculty |
| DELETE | `/api/courses/:id/details`  | Delete course detail   | Admin/Faculty |
| POST   | `/api/courses/:id/feedback` | Add course feedback    | Student       |
| GET    | `/api/courses/:id/feedback` | Get course feedback    | Authenticated |

### Course Enrollment Management

| Method | Endpoint                                    | Description                       | Access                   |
| ------ | ------------------------------------------- | --------------------------------- | ------------------------ |
| POST   | `/api/enrollments`                          | Create enrollment                 | Student (self) or Admin  |
| GET    | `/api/enrollments`                          | Get all enrollments (filtered)    | Authenticated            |
| GET    | `/api/enrollments/:id`                      | Get enrollment by ID              | Owner, Faculty, or Admin |
| PUT    | `/api/enrollments/:id`                      | Update enrollment                 | Admin/Faculty            |
| PATCH  | `/api/enrollments/:id/status`               | Update enrollment status          | Admin/Faculty            |
| DELETE | `/api/enrollments/:id`                      | Delete enrollment                 | Owner or Admin           |
| GET    | `/api/enrollments/course/:courseId`         | Get enrollments for a course      | Faculty/Admin            |
| GET    | `/api/enrollments/student/:studentId`       | Get enrollments for a student     | Owner or Admin           |
| GET    | `/api/enrollments/course/:courseId/stats`   | Get course enrollment statistics  | Faculty/Admin            |
| GET    | `/api/enrollments/student/:studentId/stats` | Get student enrollment statistics | Owner or Admin           |

### Health Check

| Method | Endpoint      | Description  | Access |
| ------ | ------------- | ------------ | ------ |
| GET    | `/api/health` | Health check | Public |
| GET    | `/`           | API info     | Public |

## API Usage Examples

### Register User

```bash
curl -X POST http://localhost:5001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST http://localhost:5001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Users (Admin Only)

```bash
curl -X GET http://localhost:5001/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User with Optimistic Locking

```bash
curl -X PUT http://localhost:5001/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "city": "Boston",
    "__v": 0
  }'
```

## User Roles

- **Admin** - Full access to all endpoints
- **Student** - Can manage own profile
- **Faculty** - Can manage own profile

## User Schema

```javascript
{
  firstName: String (required, max 50 chars)
  lastName: String (required, max 50 chars)
  email: String (required, unique, validated)
  password: String (required, min 6 chars, hashed)
  role: String (admin|student|faculty, default: student)
  address: String (max 75 chars)
  city: String (max 35 chars)
  state: String (max 25 chars)
  zipcode: String (max 10 chars)
  phone: String (format: xxx-xxx-xxxx)
  isActive: Boolean (default: true)
  __v: Number (version for optimistic locking)
  createdAt: Date
  updatedAt: Date
}
```

## Course Schema

```javascript
{
  courseCode: String (required, unique, uppercase, max 20 chars)
  name: String (required, max 100 chars)
  description: String (required, max 1000 chars)
  instructor: ObjectId (ref: User, required, must be faculty role)
  isActive: Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## Course Enrollment Schema

```javascript
{
  course: ObjectId (ref: Course, required)
  student: ObjectId (ref: User, required, must be student role)
  status: String (pending|accepted|denied, default: pending)
  comments: String (max 500 chars)
  createdAt: Date
  updatedAt: Date
}
```

**Features:**

- Compound unique index on `course + student` prevents duplicate enrollments
- Pre-save validation ensures student has student role
- Automatic population of course and student details
- Status workflow: pending → accepted/denied

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   └── jwt.js       # JWT utilities
│   ├── controllers/     # Request handlers
│   │   ├── courseController.js
│   │   ├── courseEnrollmentController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   └── upload.js    # File upload handling
│   ├── models/          # Mongoose schemas
│   │   ├── Course.js
│   │   ├── CourseDetail.js
│   │   ├── CourseEnrollment.js
│   │   ├── CourseFeedback.js
│   │   └── User.js
│   ├── repositories/    # Data access layer
│   │   ├── courseDetailRepository.js
│   │   ├── courseEnrollmentRepository.js
│   │   ├── courseFeedbackRepository.js
│   │   ├── courseRepository.js
│   │   └── userRepository.js
│   ├── routes/          # Route definitions
│   │   ├── index.js
│   │   ├── courseRoutes.js
│   │   ├── courseEnrollmentRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/         # Utility scripts
│   │   ├── seedAdmin.js # Seed initial admin user
│   │   ├── seedUsers.js # Seed sample users (faculty, students)
│   │   ├── seedCourses.js # Seed sample courses
│   │   ├── seedEnrollments.js # Seed student enrollments
│   │   ├── seedCourseMaterials.js # Seed course materials
│   │   ├── redistributeCourses.js # Redistribute courses among faculty
│   │   ├── migrateCourseInstructors.js # Assign instructors to existing courses
│   │   └── verifyCourseInstructors.js # Verify instructor assignments
│   └── services/        # Business logic
│       ├── courseEnrollmentService.js
│       ├── courseService.js
│       └── userService.js
├── __tests__/           # Test files
│   ├── integration/     # Integration tests
│   └── *.test.js        # Unit tests
├── .env                 # Environment variables
├── .gitignore
├── jest.config.js       # Jest configuration
├── package.json
├── server.js            # Application entry point
└── README.md
```

## Testing

The project includes comprehensive test coverage with both unit and integration tests.

### Run All Tests

```bash
npm test
```

### Run Unit Tests Only

```bash
npm test -- --selectProjects=unit
```

### Run Integration Tests Only

```bash
NODE_ENV=test npm test -- --selectProjects=integration
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Generate Coverage Report

```bash
npm test -- --coverage
```

### Test Coverage

- **Statements:** 100%
- **Branches:** 98%
- **Functions:** 100%
- **Lines:** 100%

**Test Suites:** 10 (9 unit, 1 integration)  
**Total Tests:** 190 (144 unit, 46 integration)

**Note:** Tests use an in-memory MongoDB instance and do not affect your development database.

## Database Management

### Seeding the Database

The application provides several seeding scripts to populate your database with sample data.

#### 1. Seed Admin User

Create the initial admin user (safe to run multiple times):

```bash
npm run seed:admin
```

**Creates:**

- 1 admin user (admin@nowhere.com / changeme)

#### 2. Seed Sample Users

Create faculty, student, and additional admin users:

```bash
node src/scripts/seedUsers.js
```

**Creates:**

- 1 admin user
- 4 faculty members (required for courses)
- 5 student users

**Sample Credentials:**

- Faculty: emily.johnson@example.com / password123
- Student: michael.wilson@example.com / password123

#### 3. Seed Courses

Create sample courses with instructors:

```bash
npm run seed:courses
```

**Prerequisites:** Must run `seedUsers.js` first (requires faculty members)

**Creates:**

- 50 sample courses across multiple departments
- Each course automatically assigned to a faculty instructor
- Courses include: CS, MATH, PHYS, ENG, BIO, ECE, ME, CE, etc.

#### 4. Seed Course Materials

Add materials (documents, videos, presentations) to courses:

```bash
npm run seed:materials
```

**Prerequisites:** Must run `seed:courses` first

**Creates:**

- Sample course materials for each course
- Various material types (documents, videos, presentations)

#### 4. Seed Course Enrollments

Create realistic enrollment data for students:

```bash
npm run seed:enrollments
```

**Prerequisites:** Must run both `seedUsers.js` and `seed:courses` first

**Creates:**

- 40+ student enrollment records
- Each student enrolled in 3-8 courses
- Realistic status distribution:
  - 70% accepted enrollments
  - 20% pending enrollments
  - 10% denied enrollments
- Appropriate comments for each status

**Note:** Running the script multiple times will clear existing enrollments and create fresh data.

#### Complete Setup Workflow

For a full development environment with all sample data:

```bash
# 1. Seed users (admin, faculty, students)
node src/scripts/seedUsers.js

# 2. Seed courses with instructors
npm run seed:courses

# 3. Seed student enrollments
npm run seed:enrollments

# 4. (Optional) Seed course materials
npm run seed:materials
```

### Migration Scripts

#### Assign Instructors to Existing Courses

If you have courses without instructors (after updating the schema):

```bash
node src/scripts/migrateCourseInstructors.js
```

This script:

- Finds all courses missing an instructor
- Assigns faculty members in rotation
- Updates course records

#### Verify Course Instructors

Check that all courses have instructors assigned:

```bash
node src/scripts/verifyCourseInstructors.js
```

Shows:

- Total courses
- Courses with/without instructors
- Sample course listings with instructor details

### Default Admin Credentials

**Email:** `admin@nowhere.com`  
**Password:** `changeme`

⚠️ **Security:** Change the default password immediately after first login in production!

### Reset Database

To clear all data from the database:

```bash
# Connect to MongoDB shell
mongosh

# Select the database
use learneasepro

# Drop all collections
db.dropDatabase()

# Exit MongoDB shell
exit

# Reseed with fresh data (recommended full setup)
node src/scripts/seedUsers.js
npm run seed:courses
npm run seed:materials
```

## Optimistic Locking

The API supports optimistic locking to handle concurrent updates:

1. When fetching a user, note the `__v` (version) field
2. Include `__v` in the update request
3. If the version doesn't match (concurrent update), you'll receive an error
4. Refresh the data and retry the update

**Example:**

```javascript
// First, get the current version
GET /api/users/123
// Response: { ..., "__v": 0 }

// Update with version
PUT /api/users/123
{
  "firstName": "Updated Name",
  "__v": 0
}
// Success: { ..., "__v": 1 }

// If another update happened first, you'll get an error
PUT /api/users/123
{
  "firstName": "Another Update",
  "__v": 0
}
// Error: "User not found or has been modified by another process"
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Password Hashing:** All passwords are hashed using bcrypt with salt rounds
- **JWT Tokens:** Stateless authentication with configurable expiration
- **Role-Based Access:** Middleware enforces role-based permissions
- **Input Validation:** Mongoose schemas validate all input data
- **No Password Exposure:** Passwords are never returned in API responses

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run all tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run seed:admin` - Seed database with admin user only
- `npm run seed:courses` - Seed database with sample courses
- `npm run seed:materials` - Seed database with course materials
- `npm run lint` - Run ESLint (if configured)

### Adding New Features

1. Create model in `src/models/`
2. Create repository in `src/repositories/`
3. Create service in `src/services/`
4. Create controller in `src/controllers/`
5. Add routes in `src/routes/`
6. Write unit tests in `__tests__/`
7. Write integration tests in `__tests__/integration/`

## Troubleshooting

### Port Already in Use

If port 5001 is in use, either:

- Change `PORT` in `.env`
- Kill the process using the port:
  ```bash
  lsof -ti:5001 | xargs kill -9
  ```

### MongoDB Connection Error

- Ensure MongoDB is running: `brew services list`
- Check MongoDB URI in `.env`
- Verify MongoDB is accessible: `mongosh`

### Test Failures

- Ensure MongoDB memory server can start
- Set `NODE_ENV=test` for integration tests
- Clear Jest cache: `npx jest --clearCache`

### Database Seeding Issues

- **No faculty members found error:** Run `node src/scripts/seedUsers.js` before seeding courses
- **Courses missing instructors:** Run `node src/scripts/migrateCourseInstructors.js` to assign instructors
- **Verify instructor assignments:** Run `node src/scripts/verifyCourseInstructors.js`

### Admin User Issues

- If you can't login with admin credentials, reseed the database:
  ```bash
  npm run seed:admin
  ```
- The script will skip creation if admin already exists
- To recreate the admin user, delete it first via MongoDB shell or another admin account

## Production Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Update `MONGODB_URI` to production database
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to your frontend domain
- [ ] Change default admin password immediately
- [ ] Enable HTTPS/TLS
- [ ] Set up proper logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Review and update security headers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is part of the Purdue University Capstone Project.

## Contact

For questions or support, please contact the development team.

---

**Note:** This is a development version. Additional security measures should be implemented before deploying to production.
