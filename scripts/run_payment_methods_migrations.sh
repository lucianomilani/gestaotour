#!/bin/bash

# Script to run payment methods migrations
# This script applies the database migrations to add payment methods support

echo "🚀 Running Payment Methods Migrations..."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Read Supabase connection details from .env
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Extract Supabase URL (remove https:// and get host)
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2 | sed 's/https:\/\///')

echo "📊 Connecting to Supabase at: $SUPABASE_URL"
echo ""

# You'll need to provide the database password
echo "Please enter your Supabase database password:"
read -s DB_PASSWORD

# Database connection details
DB_HOST="$SUPABASE_URL"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Run migration 1: Create payment_methods table
echo "1️⃣  Creating payment_methods table..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f supabase/migrations/create_payment_methods_table.sql

if [ $? -eq 0 ]; then
    echo "✅ Payment methods table created successfully"
else
    echo "❌ Failed to create payment methods table"
    exit 1
fi

echo ""

# Run migration 2: Alter bookings table
echo "2️⃣  Updating bookings table..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f supabase/migrations/alter_bookings_payment_type.sql

if [ $? -eq 0 ]; then
    echo "✅ Bookings table updated successfully"
else
    echo "❌ Failed to update bookings table"
    exit 1
fi

echo ""
echo "🎉 All migrations completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Test the booking form to see dynamic payment methods"
echo "  2. Test the booking details page to edit payment methods"
echo "  3. Verify existing bookings still display correctly"
