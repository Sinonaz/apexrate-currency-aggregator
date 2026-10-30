#!/usr/bin/env bash
# Creates a role and a database with the same name for one project and prints its DATABASE_URL.
# Each project role owns only its own database and cannot connect to the others.
#
# Usage: ./scripts/create-db.sh <name>        e.g. ./scripts/create-db.sh apexrate
set -euo pipefail

NAME="${1:-}"
if [[ ! "$NAME" =~ ^[a-z][a-z0-9_]{0,62}$ ]]; then
  echo "Usage: $0 <name>  (lowercase letters, digits and _, starting with a letter)" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
set -a; source .env; set +a
SUPERUSER="${POSTGRES_USER:-postgres}"

psql() { docker exec -i postgres psql -v ON_ERROR_STOP=1 -U "$SUPERUSER" -d postgres -qtA "$@"; }

if [[ -n "$(psql -c "SELECT 1 FROM pg_roles WHERE rolname = '$NAME'")" ]]; then
  echo "Role '$NAME' already exists, nothing to do." >&2
  exit 1
fi

# Hex keeps the password URL-safe for DATABASE_URL.
PASSWORD="$(openssl rand -hex 24)"

psql <<SQL
CREATE ROLE "$NAME" LOGIN PASSWORD '$PASSWORD';
CREATE DATABASE "$NAME" OWNER "$NAME";
REVOKE ALL ON DATABASE "$NAME" FROM PUBLIC;
SQL

echo "Database '$NAME' created. Put this into the project's .env:"
echo
echo "DATABASE_URL=postgresql://$NAME:$PASSWORD@postgres:5432/$NAME?schema=public"
