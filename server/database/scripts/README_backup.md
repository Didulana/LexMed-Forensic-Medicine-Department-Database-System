# LexMed Backup & Restore Strategy

This directory contains automated scripts and SQL procedures used for database reporting, backup, and restore verification for the LexMed Database System.

## Automated Scripts

1. **`backup.sh`**
   - **Purpose**: Runs `mysqldump` to create a point-in-time snapshot of `lexmed_db`.
   - **Logging**: Automatically records the success/failure and timestamp of each run into the `backup_logs` table within the database.
   - **Usage**: Add to `crontab` to run nightly.
     ```bash
     0 2 * * * /path/to/LexMed/server/database/scripts/backup.sh >> /var/log/lexmed_backup.log 2>&1
     ```

2. **`restore_test.sh`**
   - **Purpose**: Verifies backup integrity by restoring the latest dump into a throwaway database (`lexmed_restore_test`) and running row count assertions on key tables (`forensic_cases`, `users`).
   - **Usage**: Run manually or schedule after the backup script.

## Retention Policy Recommendation

Given the highly sensitive medico-legal nature of this data, we recommend the following strict retention strategy:

1. **Daily Backups**: Retain for **30 days**. Provides granular point-in-time recovery for recent accidental deletions or corruption.
2. **Weekly Backups**: Retain for **12 weeks (3 months)**.
3. **Monthly Backups**: Retain for **1 year** locally, and securely archive in cold storage (e.g., AWS S3 Glacier, encrypted) for **7 years** to satisfy legal compliance requirements regarding forensic records.

### Storage & Encryption
- Backup files MUST be stored on a secure, separate disk volume.
- Consider modifying `backup.sh` to pipe output through `gpg` or another encryption utility, ensuring that `.sql` dumps are never stored as plaintext on disk.
