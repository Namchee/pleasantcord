#!/bin/sh

# Pull the image for GitHub Container Registry
docker pull ghcr.io/namchee/pleasantcord:latest

# Restart the bot script
docker-compose -f docker-compose.prod.yml up -d --no-deps bot

# Run any migration script
docker-compose -f docker-compose.prod.yml exec bot yarn migration:up
