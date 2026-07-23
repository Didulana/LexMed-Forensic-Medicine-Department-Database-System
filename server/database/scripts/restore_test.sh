#!/bin/bash
# restore_test.sh
# Tests the latest LexMed database backup by restoring to a throwaway database.

DB_USER="root"
DB_PASS="Nixinc@22214"
TEST_DB="lexmed_restore_test"
BACKUP_DIR="$(dirname "$0")/backups"

LATEST_BACKUP=$(ls -t "${BACKUP_DIR}"/*.sql 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "ERROR: No backup files found in ${BACKUP_DIR}"
    exit 1
fi

echo "Testing restore of: $LATEST_BACKUP"

# Recreate test DB
mysql -u "$DB_USER" -p"$DB_PASS" -e "
    DROP DATABASE IF EXISTS ${TEST_DB};
    CREATE DATABASE ${TEST_DB};
" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to recreate test database ${TEST_DB}."
    exit 1
fi

# Restore backup
echo "Restoring database..."
mysql -u "$DB_USER" -p"$DB_PASS" "${TEST_DB}" < "$LATEST_BACKUP" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "ERROR: Restore failed."
    exit 1
fi

# Test assertions
echo "Running verification checks..."

CASE_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASS" -N -s -e "SELECT COUNT(*) FROM ${TEST_DB}.forensic_cases;" 2>/dev/null)
USER_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASS" -N -s -e "SELECT COUNT(*) FROM ${TEST_DB}.users;" 2>/dev/null)

if [[ -z "$CASE_COUNT" || "$CASE_COUNT" -lt 0 ]]; then
    echo "FAIL: forensic_cases table check failed."
    exit 1
fi

if [[ -z "$USER_COUNT" || "$USER_COUNT" -lt 0 ]]; then
    echo "FAIL: users table check failed."
    exit 1
fi

echo "SUCCESS: Restore test passed."
echo "- forensic_cases count: $CASE_COUNT"
echo "- users count: $USER_COUNT"

# Cleanup
mysql -u "$DB_USER" -p"$DB_PASS" -e "DROP DATABASE ${TEST_DB};" 2>/dev/null
echo "Test database cleaned up."
