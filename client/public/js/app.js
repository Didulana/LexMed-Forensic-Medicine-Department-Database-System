document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent page reload

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const alertBox = document.getElementById('alert-box');

    try {
        // Send POST request to Node.js backend
        const response = await fetch('http://localhost:5005/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (data.success) {
            alertBox.className = 'alert alert-success';
            alertBox.textContent = `Welcome, ${data.data.username}! Role: ${data.data.role}`;
            
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(data.data));
            
            // Redirect to dashboard (we will build this next)
            window.location.href = 'dashboard.html';
        } else {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = data.message;
        }
    } catch (error) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Unable to connect to the server.';
    }
});