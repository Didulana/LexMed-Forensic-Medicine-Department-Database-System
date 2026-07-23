const API_BASE = 'http://localhost:3000'; // Assuming 3000 since server.js uses process.env.PORT || 3000

window.lexmed = {
    user: null,
    accessToken: null,

    /**
     * Initializes the app by fetching a new access token using the refresh cookie.
     * Redirects to index.html if the refresh fails, UNLESS we are already on index.html.
     */
    async init() {
        const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

        try {
            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'GET',
                // This ensures cookies (refreshToken) are sent with the cross-origin request
                // In production with separate domains, this requires proper CORS setup.
                credentials: 'include' // Send cookies (refreshToken) with the cross-origin request
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.accessToken;
                this.user = data.user;

                if (isLoginPage) {
                    // Already logged in, go to dashboard
                    window.location.href = 'dashboard.html';
                }
                
                // Set greeting if exists
                const greetingEl = document.getElementById('userGreeting');
                if (greetingEl) {
                    greetingEl.textContent = `Logged in as: ${this.user.user_id} (${this.user.role})`;
                }
                
                this.setupLogout();
                
                
                // Signal that auth state is ready
                document.dispatchEvent(new Event('lexmed:ready'));
                
            } else {
                if (!isLoginPage) {
                    window.location.href = 'index.html';
                }
            }
        } catch (error) {
            console.error('Failed to init LexMed App:', error);
            if (!isLoginPage) window.location.href = 'index.html';
        }
    },

    /**
     * Wrapper for fetch that automatically injects the Bearer token.
     */
    async fetchAPI(endpoint, options = {}) {
        if (!this.accessToken) {
            console.error('No access token available for request');
            window.location.href = 'index.html';
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            ...(options.headers || {})
        };

        const config = {
            ...options,
            headers
        };

        const response = await fetch(`${API_BASE}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
            // Token might be expired, redirect to login for a fresh one
            window.location.href = 'index.html';
            return;
        }

        return response;
    },
    
    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Clear state
                this.accessToken = null;
                this.user = null;
                // Delete cookie? We don't have a /logout endpoint but we can redirect to login
                // which ignores it until overwritten, but ideally we should have a /logout endpoint.
                // For now, redirect to index.html and let user override cookie on next login.
                window.location.href = 'index.html';
            });
        }
    }
};

// Start the app cycle on load
document.addEventListener('DOMContentLoaded', () => {
    // Only init if it's not the login page form handler overlapping
    if (!window.disableAutoInit) {
        window.lexmed.init();
    }
});