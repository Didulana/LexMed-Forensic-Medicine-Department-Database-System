document.addEventListener('lexmed:ready', async () => {
    const user = window.lexmed.user;
    if (!user) return;

    try {
        await Promise.all([
            loadMonthlyStats(),
            loadJmoCaseload(),
            loadPendingCases(),
            loadAnomalies()
        ]);
    } catch(err) {
        console.error('Failed to load reports:', err);
    }
});

async function loadMonthlyStats() {
    const res = await window.lexmed.fetchAPI('/reports/monthly');
    if (!res.ok) throw new Error('Failed to fetch monthly stats');
    const { data } = await res.json();

    const labels = [];
    const counts = [];
    
    // Process data to array format for Chart.js
    data.forEach(row => {
        labels.push(`${row.report_month} (${row.case_type})`);
        counts.push(row.total_cases);
    });

    const ctx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Cases',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

async function loadJmoCaseload() {
    const res = await window.lexmed.fetchAPI('/reports/jmo-caseload');
    if (!res.ok) throw new Error('Failed to fetch jmo caseload');
    const { data } = await res.json();

    const labels = [];
    const clinicalCounts = [];
    const pmCounts = [];

    data.forEach(row => {
        labels.push(row.jmo_name);
        clinicalCounts.push(row.total_clinical_exams);
        pmCounts.push(row.total_postmortems);
    });

    const ctx = document.getElementById('jmoChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Caseload',
                    data: data.map(d => d.total_caseload),
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ]
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

async function loadPendingCases() {
    const res = await window.lexmed.fetchAPI('/reports/pending');
    if (!res.ok) throw new Error('Failed to fetch pending cases');
    const { data } = await res.json();

    const tbody = document.querySelector('#pendingTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No pending cases.</td></tr>`;
        return;
    }

    data.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${row.case_id}</strong></td>
                <td>${row.case_type}</td>
                <td>${new Date(row.created_at).toLocaleDateString()}</td>
                <td><span class="badge bg-warning text-dark">${row.days_open} days</span></td>
            </tr>
        `;
    });
}

async function loadAnomalies() {
    const res = await window.lexmed.fetchAPI('/reports/evidence-anomalies');
    if (!res.ok) throw new Error('Failed to fetch evidence anomalies');
    const { data } = await res.json();

    const tbody = document.querySelector('#anomaliesTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No anomalies found.</td></tr>`;
        return;
    }

    data.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td>${row.item_id}</td>
                <td>${row.case_id}</td>
                <td>${row.item_type}</td>
                <td>${row.description}</td>
                <td>${new Date(row.case_created_at).toLocaleDateString()}</td>
            </tr>
        `;
    });
}
