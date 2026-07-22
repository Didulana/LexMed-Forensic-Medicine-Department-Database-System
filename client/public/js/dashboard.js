document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check: Is the user actually logged in?
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
        // Not logged in! Kick them back to the login page immediately.
        window.location.href = 'index.html';
        return;
    }

    // 2. Parse the user data and display a personalized greeting
    const user = JSON.parse(userStr);
    const greetingElement = document.getElementById('userGreeting');
    
    // Formatting the greeting based on role
    if (user.role === 'JMO') {
        greetingElement.textContent = `Welcome, Dr. ${user.username} (${user.role})`;
    } else {
        greetingElement.textContent = `Welcome, ${user.username} (${user.role})`;
    }

    // 3. Logout Functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Destroy the session data
        localStorage.removeItem('user');
        // Redirect to login
        window.location.href = 'index.html';
    });
});