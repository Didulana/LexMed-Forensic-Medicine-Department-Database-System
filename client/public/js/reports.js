document.addEventListener('DOMContentLoaded', async () => {
    
    // Fetch Monthly Stats
    try {
        const res = await fetch('http://localhost:5005/api/reports/monthly');
        const data = await res.json();
        const tbody = document.querySelector('#monthlyTable tbody');
        if (data.success && data.data.length > 0) {
            data.data.forEach(row => {
                tbody.innerHTML += \`<tr><td>\${row.case_type}</td><td>\${row.count}</td></tr>\`;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No data for this month.</td></tr>';
        }
    } catch (err) { console.error(err); }

    // Fetch Pending Cases
    try {
        const res = await fetch('http://localhost:5005/api/reports/pending');
        const data = await res.json();
        const tbody = document.querySelector('#pendingTable tbody');
        if (data.success && data.data.length > 0) {
            data.data.forEach(row => {
                const date = new Date(row.incident_time).toLocaleDateString();
                tbody.innerHTML += \`<tr>
                    <td>#\${row.case_id}</td>
                    <td>\${row.first_name}</td>
                    <td><span class="badge bg-secondary">\${row.case_type}</span></td>
                    <td>\${date}</td>
                </tr>\`;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No pending cases.</td></tr>';
        }
    } catch (err) { console.error(err); }

    // Fetch Daily Cases
    try {
        const res = await fetch('http://localhost:5005/api/reports/daily');
        const data = await res.json();
        const tbody = document.querySelector('#dailyTable tbody');
        if (data.success && data.data.length > 0) {
            data.data.forEach(row => {
                const time = new Date(row.incident_time).toLocaleTimeString();
                tbody.innerHTML += \`<tr>
                    <td>#\${row.case_id}</td>
                    <td>\${row.first_name}</td>
                    <td>\${row.case_type}</td>
                    <td>\${row.status}</td>
                    <td>\${time}</td>
                </tr>\`;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No cases opened today.</td></tr>';
        }
    } catch (err) { console.error(err); }

});
