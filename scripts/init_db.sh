#!/bin/bash

# Load environment variables from .env file in the same directory as the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

# SQL init file (assumed to be next to the script)
INIT_SQL="$SCRIPT_DIR/init.sql"

# Check if DB_PATH is set
if [ -z "$DB_PATH" ]; then
  echo "Error: DB_PATH not set in .env"
  exit 1
fi

# Check if init.sql exists
if [ ! -f "$INIT_SQL" ]; then
  echo "Error: init.sql not found at $INIT_SQL"
  exit 1
fi

# Run the SQL script on the DB
sqlite3 "$SCRIPT_DIR/../models/$DB_PATH" < "$INIT_SQL"

if [ $? -eq 0 ]; then
  echo "Database '$DB_PATH' created and initialized with '$INIT_SQL'"
else
  echo "Failed to initialize the database."
  exit 1
fi
