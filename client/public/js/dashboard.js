document.addEventListener('DOMContentLoaded', async () => {
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
    
    if (user.role === 'JMO') {
        greetingElement.textContent = \`Welcome, Dr. \${user.username} (\${user.role})\`;
    } else {
        greetingElement.textContent = \`Welcome, \${user.username} (\${user.role})\`;
    }

    // 3. Logout Functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // 4. Fetch Live Analytics
    try {
        const response = await fetch('http://localhost:5005/api/dashboard/stats');
        const result = await response.json();
        if (result.success) {
            document.getElementById('statTotalCases').textContent = result.data.total_cases;
            document.getElementById('statOpenCases').textContent = result.data.open_cases;
            document.getElementById('statMlefCount').textContent = result.data.mlef_count;
            document.getElementById('statPmrCount').textContent = result.data.pmr_count;
        }
    } catch (error) {
        console.error('Failed to load dashboard statistics', error);
    }
});