# Real Estate Management Backend API

A complete NestJS backend system for real estate management platform with authentication, role-based access control, property management, CRM, and analytics.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 Role-Based Access Control (Agent & Admin)
- 🏠 Property Management with Media Upload
- 📊 CRM & Lead Management
- 📈 Dashboard Analytics
- 🔍 Advanced Search & Filtering
- 📝 API Documentation with Swagger
- 🗄️ Supabase PostgreSQL Database
- ✅ Input Validation & Error Handling
- 📋 Activity Logging

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer + Supabase Storage
- **Testing**: Jest

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:3000
```

3. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration file: `database/migrations/001_initial_schema.sql`

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3001/api/docs
```

## Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth & role guards
│   ├── interceptors/    # Logging interceptors
│   └── pipes/           # Validation pipes
├── auth/                # Authentication module
├── agents/              # Agent management
├── properties/          # Property management
├── leads/               # Lead/CRM management
├── media/               # File upload management
├── dashboard/           # Analytics & dashboard
├── admin/               # Admin operations
├── health/              # Health check
└── supabase/            # Supabase client

database/
├── migrations/          # SQL migration files
└── seeds/              # Seed data (optional)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| SUPABASE_URL | Supabase project URL | - |
| SUPABASE_KEY | Supabase anon key | - |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRATION | JWT token expiration | 24h |
| CORS_ORIGIN | Allowed CORS origin | * |

## Security Features

- Password hashing with bcrypt (10+ salt rounds)
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- SQL injection prevention
- Sensitive data masking in logs

## Database Schema

See `database/README.md` for detailed database schema documentation.

## License

UNLICENSED - Private project
