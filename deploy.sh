#!/bin/bash

set -e

echo "Building images..."
docker compose build

echo "Bringing up the database..."
docker compose up -d db

echo "Waiting for database to be healthy..."
while [ "$(docker inspect -f {{.State.Health.Status}} schedularr-db)" != "healthy" ]; do
    sleep 1
done
echo "Database is healthy!"

echo "Running database migrations..."
docker compose run --rm api uv run manage.py migrate --noinput

echo "Starting services..."
docker compose up -d --remove-orphans

echo "Deployment complete!"
