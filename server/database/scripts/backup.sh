#!/bin/bash
# backup.sh
# Automates backing up the LexMed database and logs the result.

DB_NAME="lexmed_db"
DB_USER="root"
DB_PASS="Nixinc@22214"
BACKUP_DIR="$(dirname "$0")/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/lexmed_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

# Run mysqldump
if mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    STATUS="SUCCESS"
    MESSAGE="Backup completed successfully."
else
    STATUS="FAILED"
    MESSAGE="mysqldump encountered an error."
    rm -f "$BACKUP_FILE"
    BACKUP_FILE="NONE"
fi

# Log to backup_logs table
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
    INSERT INTO backup_logs (backup_file, status, message)
    VALUES ('${BACKUP_FILE}', '${STATUS}', '${MESSAGE}');
" 2>/dev/null

echo "[${TIMESTAMP}] Backup ${STATUS}: ${MESSAGE}"
