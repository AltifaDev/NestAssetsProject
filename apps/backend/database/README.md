# Database Setup

## Running Migrations

To set up the database schema, execute the SQL migration files in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration

## Database Schema

The database consists of the following tables:

### Core Tables
- **agents**: User accounts (agents and admins)
- **properties**: Real estate property listings
- **leads**: Customer leads and CRM data
- **media**: File uploads (images, documents)

### Junction Tables
- **properties_images**: Links properties to multiple images
- **properties_nearby_places**: Stores nearby places for properties

### Audit Tables
- **activities**: System activity log

## Indexes

All foreign keys and frequently queried fields have indexes for optimal performance:
- Agent lookups by email, role, status
- Property lookups by agent, type, status, price, date
- Lead lookups by agent, property, status, date
- Media lookups by uploader and related entity

## Seed Data (Optional)

You can create seed data for testing by running the seed scripts in the `seeds/` directory.
