document.addEventListener('DOMContentLoaded', () => {
    // Mark that we are on the login page so app.js doesn't auto-redirect us away if not logged in
    // Actually, app.js init handles isLoginPage already.

    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        const alertBox = document.getElementById('alert-box');

        try {
            // We use direct fetch because we are getting the first token
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput }),
                credentials: 'omit' // We are receiving the cookie, not sending one yet
            });

            const data = await response.json();

            if (response.ok && data.accessToken) {
                alertBox.className = 'alert alert-success d-block';
                alertBox.textContent = `Login successful. Redirecting...`;
                
                // Store token in memory via app.js
                window.lexmed.accessToken = data.accessToken;
                
                // Initialize the rest of the user object by calling refresh, 
                // or just redirect and let the next page's init() handle it.
                window.location.href = 'dashboard.html';
            } else {
                alertBox.className = 'alert alert-danger d-block';
                alertBox.textContent = data.error || data.message || 'Invalid credentials';
            }
        } catch (error) {
            alertBox.className = 'alert alert-danger d-block';
            alertBox.textContent = 'Unable to connect to the server.';
        }
    });
});
