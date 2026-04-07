# TalentFlow LMS Backend

A scalable and production-ready backend for a web-based Learning Management System (LMS) platform.

## Features

- **User Authentication** - JWT-based auth with email confirmation
- **Role-based Access** - Students and Tutors with distinct capabilities
- **Course Management** - Create, enroll, and manage courses
- **Progress Tracking** - Track student progress across courses
- **Assignments & Submissions** - Create assignments, submit work, grade submissions
- **Collaboration** - Course-based chat channels
- **AI Tutor Matching** - Intelligent tutor matching when students need help
- **Notifications** - Real-time notification system

##  Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Architecture**: MVC/Clean Architecture

##  Project Structure

```
TalentFlow/
├── config/           # Configuration files
│   ├── database.js   # PostgreSQL connection pool
│   └── initDb.js     # Database initialization
├── controllers/      # Request handlers
├── middlewares/      # Express middleware
│   ├── auth.js       # JWT authentication
│   ├── validate.js   # Input validation
│   └── errorHandler.js
├── models/           # Database models
├── routes/           # API route definitions
├── services/         # Business logic
├── utils/            # Utility functions
├── seeds/            # Seed data
└── src/
    └── index.js      # Application entry point
```

##  Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)

### Installation

```bash
# Clone the repository
cd "Talent Flow"

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your database credentials

# Initialize database (creates tables)
npm run seed

# Start the server
npm run dev
```

### Database Setup

Create a PostgreSQL database named `Talent FlowDb` or update the `DB_NAME` in `.env`.

```sql
CREATE DATABASE "Talent FlowDb";
```

##  API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/confirm/:token` | Confirm email |
| GET | `/api/auth/me` | Get current user |

### Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/onboarding` | Complete user onboarding |

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/enrolled` | Get enrolled courses |
| GET | `/api/courses/:id` | Get course details |
| GET | `/api/courses/:id/lessons` | Get course lessons |
| POST | `/api/courses` | Create course (Tutor) |
| POST | `/api/courses/:id/lessons` | Add lesson (Tutor) |
| POST | `/api/courses/:id/enroll` | Enroll in course |

### Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/progress` | Update progress |
| GET | `/api/progress/overall` | Get overall progress |
| GET | `/api/progress/course/:courseId` | Get course progress |

### Assignments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | Get student assignments |
| GET | `/api/assignments/:id` | Get assignment |
| POST | `/api/assignments` | Create assignment (Tutor) |
| POST | `/api/assignments/:id/submit` | Submit assignment |
| GET | `/api/assignments/:id/submissions` | Get submissions (Tutor) |
| POST | `/api/assignments/:id/grade` | Grade submission (Tutor) |

### Collaboration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels` | Get user channels |
| GET | `/api/channels/:id` | Get channel |
| GET | `/api/channels/:id/messages` | Get messages |
| POST | `/api/channels` | Create channel |
| POST | `/api/channels/messages` | Send message |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/query` | Query AI assistant |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

## Example Requests

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "student"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Update Progress

```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "courseId": "COURSE_UUID",
    "lessonId": "LESSON_UUID",
    "progress": 50
  }'
```

## AI Tutor Matching

When a student requests help via the AI endpoint:

1. System analyzes the query for help keywords
2. Matches student with tutors teaching the relevant course
3. Sends notifications to matched tutors
4. Confirms match to student

##  Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiration
- Input validation on all endpoints
- Role-based access control
- SQL injection prevention via parameterized queries

##  Test Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Tutor | john@tutor.com | Password123 |
| Tutor | sarah@tutor.com | Password123 |
| Student | alice@student.com | Password123 |
| Student | bob@student.com | Password123 |

##  License

MIT License
