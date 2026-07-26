#!/bin/sh
set -e

echo "=== Job Tracker API ==="

echo "Running database migrations..."
node dist/database/run-migrations.js

echo "Starting API on port ${PORT:-3001}..."
exec node dist/main
