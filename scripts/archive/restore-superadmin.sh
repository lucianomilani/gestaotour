#!/bin/bash
# Quick script to restore SuperAdmin access for tecnico@techx.pt

echo "🔧 Restoring SuperAdmin access for tecnico@techx.pt..."

# Run the SQL migration
npx supabase db execute --file supabase/migrations/ensure_superadmin_persistent.sql

echo "✅ SuperAdmin status restored!"
echo ""
echo "Please refresh your browser and log in again."
