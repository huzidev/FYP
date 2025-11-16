# FYP - University Management System

A comprehensive university management system built with Next.js, Prisma, and PostgreSQL. This system manages students, staff, admins, departments, subjects, enrollments, and fees.

## 🚀 Features

### Core Features
- **Multi-role Authentication**: Admin, Staff (Teacher/Admission), and Student login systems
- **Student Management**: Complete student lifecycle management with bulk upload
- **Staff Management**: Teacher and admission staff management with subject assignments
- **Department Management**: Department creation and management
- **Subject Management**: Subject creation with department and teacher assignments
- **Enrollment System**: Student subject enrollment tracking
- **Fee Management**: Fee tracking with payment status
- **Grade Management**: Student grade recording and tracking

### Technical Features
- **RESTful API**: Comprehensive API endpoints for all entities
- **Global API Utility**: Centralized fetch utility with error handling
- **Authentication**: Secure login system with role-based access
- **Database**: PostgreSQL with Prisma ORM
- **Responsive UI**: Modern, mobile-friendly interface
- **File Upload**: Bulk student upload via CSV

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd FYP
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE fyp_db;
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your database connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fyp_db?schema=public"
```

### 3. Initialize Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📡 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/staff/login` - Staff login  
- `POST /api/students/login` - Student login

### CRUD Operations
All entities follow RESTful conventions:
- `GET /api/{entity}` - List all
- `POST /api/{entity}` - Create new
- `GET /api/{entity}/{id}` - Get by ID
- `PUT /api/{entity}/{id}` - Update by ID
- `DELETE /api/{entity}/{id}` - Delete by ID

### Special Endpoints
- `POST /api/students/bulk` - Bulk student upload
- `PATCH /api/fees/{id}/status` - Update fee status

## 🗄️ Database Schema

The system includes the following entities:
- **Admin**: Multi-level admin system
- **Staff**: Role-based staff (TEACHER, ADMISSION)
- **Student**: Complete student profiles
- **Department**: Academic departments
- **Subject**: Course management
- **Enrollment**: Student-subject relationships
- **Fee**: Fee tracking and payments
- **Grade**: Academic performance

## 🎯 Usage Examples

### Using the Global API Utility

```javascript
import { StudentService, ApiError } from '@/lib/api';

// Get all students
try {
  const response = await StudentService.getAll();
  const students = response.data.data;
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
  }
}
```

### Authentication

```javascript
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('Logged in as:', user.fullName);
}
```

## 🔧 Development

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

### Code Quality

```bash
# Run linting
npm run lint

# Run development server
npm run dev
```

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
NODE_ENV="production"
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL in .env.local
   - Ensure PostgreSQL is running

2. **Prisma Client Error**
   - Run `npx prisma generate`
   - Restart development server

3. **API Routes Not Working**
   - Check API route file names and exports
   - Verify request methods
