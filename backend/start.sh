#!/bin/sh
set -e

echo "================================================"
echo " FleetPilot Backend — Starting Up"
echo "================================================"

echo "⏳ Syncing database schema..."
npx prisma db push --accept-data-loss

echo "🌱 Seeding database (idempotent)..."
npx tsx prisma/seed.ts

echo "🚀 Starting server..."
node dist/index.js
