# LexMed 15-Minute Demo Script

This script provides a step-by-step guide to demonstrating the core functionality, role-based access control, and operational security of the LexMed system.

**Prerequisites**:
- Node.js backend is running (`npm start` in `server/`).
- Frontend static server is running (`npx http-server` in `client/public/`).
- The test database is seeded with Phase 1 demo users.

---

### Step 1: JMO Restricted View (3 mins)
1. **Action**: Open browser to `http://127.0.0.1:8080/index.html`.
2. **Action**: Log in with credentials:
   - Username: `dr_silva`
   - Password: `password123`
3. **Talking Point**: Point out the dashboard layout dynamically adapting to the `jmo_role`.
4. **Action**: Click into "Pending Cases" and open a case.
5. **Talking Point**: Highlight that the JMO has full visibility into the clinical exams and postmortems but cannot manually modify the chain of custody beyond their scope.

### Step 2: Department Clerk Workflow (3 mins)
1. **Action**: Click "Logout" and return to the login screen.
2. **Action**: Log in with credentials:
   - Username: `clerk_fernando`
   - Password: `password123`
3. **Talking Point**: Note that the dashboard has changed. The Clerk handles intake and evidence, not clinical reports.
4. **Action**: Go to "Register New Case" (`intake.html`). Fill out the form for a new "Clinical" case and submit it.
5. **Talking Point**: Explain that this triggers the `sp_create_forensic_case` stored procedure, handling patient and case insertion transactionally.

### Step 3: Chain of Custody Transfer (3 mins)
1. **Action**: (Still logged in as the Clerk), navigate to the newly created case's timeline.
2. **Action**: Scroll down to "Legal Evidence" and click "Add Evidence Item". Describe a "Blood Sample".
3. **Action**: Next, click "Transfer Item" and log a transfer to the "Government Analyst".
4. **Talking Point**: Explain that this invokes `sp_add_custody_transfer`, creating an append-only log that cannot be edited or deleted by the clerk.

### Step 4: Auditor / Admin View (3 mins)
1. **Action**: Logout and log back in as:
   - Username: `admin_perera`
   - Password: `password123`
2. **Action**: Navigate to "System Audit Logs" (`audit.html`).
3. **Talking Point**: Point to the exact timestamps matching the case creation and evidence transfer just performed. Explain that these logs are generated automatically by MySQL `AFTER INSERT/UPDATE` triggers, making them tamper-proof against application-level exploits.
4. **Action**: Navigate to "Analytical Reports" (`reports.html`). Show the Chart.js visual graphs querying the new SQL views (Monthly Stats, JMO Caseloads).

### Step 5: Backup & Restore Operations (3 mins)
1. **Action**: Open a terminal window.
2. **Action**: Navigate to `server/database/scripts/`.
3. **Action**: Run `./backup.sh`.
   - **Talking Point**: Show the generated `.sql` file in the `backups/` directory and explain how it logs to the `backup_logs` table.
4. **Action**: Run `./restore_test.sh`.
   - **Talking Point**: Show the script automatically creating a throwaway database, restoring the data, running assertions on table counts, and cleaning up after itself to prove the backup is viable.
