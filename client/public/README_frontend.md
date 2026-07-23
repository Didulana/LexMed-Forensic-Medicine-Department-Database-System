# LexMed Frontend

This is the vanilla HTML/JS frontend for the LexMed Forensic Medicine Database System. It is built using **HTML5**, **Bootstrap 5**, and **Vanilla JavaScript**. It consumes the LexMed Node.js backend REST API.

## Architecture & Security

- **Multi-Page Application (MPA)**: The frontend consists of distinct HTML pages for various modules.
- **Stateless Authentication**: Uses short-lived, in-memory JWTs. The global `app.js` fetches an access token from the `/auth/refresh` endpoint on every page load using a secure `httpOnly` refresh token cookie.
- **Global API Wrapper**: All API calls go through `window.lexmed.fetchAPI(url, options)`, which automatically injects the Bearer token and sets `credentials: 'include'` for cookie handling.
- **Role-Based UI**: UI elements dynamically hide, show, or display "Restricted View" badges based on the `user.role` extracted from the JWT.
- **Event-Driven Initialization**: Pages listen for the `lexmed:ready` event dispatched by `app.js` after successful authentication to ensure the DOM scripts execute only when the user is authenticated.

## Modules & Structure

| Page | Script | Description |
|---|---|---|
| `index.html` | `js/login.js` | Login screen. Submits credentials and handles redirects. |
| `dashboard.html` | `js/dashboard.js` | Role-aware dashboard with quick actions and stats. |
| `intake.html` | `js/intake.js` | Registers new cases and patients transactionally. |
| `pending-case.html` | `js/pending.js` | Timeline view for a specific forensic case (`?case_id=X`). |
| `mlef-form.html` | `js/mlef.js` | Clinical exam (MLEF) creation form (JMO only). |
| `pmr-form.html` | `js/pmr.js` | Postmortem report and COD form (JMO only). |
| `legal-evidence-form.html`| `js/legal-evidence.js` | Evidence logging and Chain of Custody transfers (Clerks). |
| `admin.html` | (inline) | Admin interface for deactivating accounts. |
| `audit.html` | (inline) | UI for viewing system-wide audit logs. |
| `search.html` | `js/search.js` | Global search for cases and patients. |
| `reports.html` | `js/reports.js` | Generates printable statistical reports. |

## Running the Frontend

To run the frontend, you must serve it via a static file server while the backend API is running locally (e.g., on `http://localhost:3000`).

1. Ensure the Node.js backend is running.
2. In the `client/public/` directory, use a tool like `http-server`, `live-server`, or python's `http.server`:
   ```bash
   npx http-server ./client/public
   ```
3. Open `http://127.0.0.1:8080/index.html` in your browser.

## Security Notes

1. **No LocalStorage JWT**: The access token is strictly kept in the JavaScript memory space `window.lexmed.token`.
2. **Cross-Site Scripting (XSS)**: Data is securely bound to DOM text nodes via `textContent` rather than `innerHTML` where user input is involved.
3. **Restricted Views**: Sensitive information like unencrypted patient names or clinical findings are redacted on the backend for non-privileged roles. The frontend explicitly warns users when they are in a "Restricted View".
