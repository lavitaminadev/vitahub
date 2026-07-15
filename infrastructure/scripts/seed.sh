#!/bin/bash
# VITAHUB Database Seed Script
# Usage: ./infrastructure/scripts/seed.sh

set -e

DB_NAME=${DB_NAME:-vitahub}
DB_USER=${DB_USER:-vitahub}
DB_PASSWORD=${DB_PASSWORD:-vitahub_secret}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
SEED_FILE=${SEED_FILE:-./database/seeds/seed.sql}

echo "🌱 Seeding $DB_NAME from $SEED_FILE ..."

if [ ! -f "$SEED_FILE" ]; then
  echo "❌ Seed file not found: $SEED_FILE"
  exit 1
fi

mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  "$DB_NAME" < "$SEED_FILE"

echo "✅ Seed complete"
