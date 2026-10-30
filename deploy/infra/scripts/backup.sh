#!/usr/bin/env bash
# Dumps every project database into /srv/backups/<db>/<date>.dump and keeps the last 7 days.
# Restore: docker exec -i postgres pg_restore -U postgres -d <db> --clean --if-exists < file.dump
#
# Cron (crontab -e), daily at 03:30:
#   30 3 * * * /srv/infra/scripts/backup.sh >> /srv/backups/backup.log 2>&1
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/srv/backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"

cd "$(dirname "$0")/.."
set -a; source .env; set +a
SUPERUSER="${POSTGRES_USER:-postgres}"

DATABASES="$(docker exec postgres psql -U "$SUPERUSER" -d postgres -qtA \
  -c "SELECT datname FROM pg_database WHERE NOT datistemplate AND datname <> 'postgres'")"

STAMP="$(date +%F_%H%M)"
for DB in $DATABASES; do
  mkdir -p "$BACKUP_DIR/$DB"
  docker exec postgres pg_dump -U "$SUPERUSER" -Fc "$DB" > "$BACKUP_DIR/$DB/$STAMP.dump"
  echo "$(date -Is) $DB -> $BACKUP_DIR/$DB/$STAMP.dump"
done

find "$BACKUP_DIR" -name '*.dump' -mtime +"$KEEP_DAYS" -delete
