document.addEventListener('lexmed:ready', () => {
    const user = window.lexmed.user;
    if (!user) return;

    const form = document.getElementById('searchForm');
    const input = document.getElementById('searchInput');
    const container = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');
    const tbody = document.querySelector('#resultsTable tbody');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = input.value.trim().toLowerCase();

        try {
            // For this phase, we fetch all cases and filter on the frontend for demo purposes.
            // In production, we'd pass query params: /cases?search=query
            const res = await window.lexmed.fetchAPI('/cases');
            if (!res.ok) throw new Error('Failed to fetch cases');
            
            const cases = await res.json();
            
            const filtered = cases.filter(c => {
                return (
                    (c.case_number && c.case_number.toLowerCase().includes(query)) ||
                    (c.case_id && c.case_id.toString() === query) ||
                    (c.patient_name_encrypted && c.patient_name_encrypted.toLowerCase().includes(query)) ||
                    (c.patient_name && c.patient_name.toLowerCase().includes(query))
                );
            });

            container.classList.remove('d-none');
            tbody.innerHTML = '';

            if (filtered.length === 0) {
                noResults.classList.remove('d-none');
                document.querySelector('.table-responsive').classList.add('d-none');
            } else {
                noResults.classList.add('d-none');
                document.querySelector('.table-responsive').classList.remove('d-none');
                
                filtered.forEach(c => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${c.case_number || c.case_id}</strong></td>
                        <td>${c.case_type}</td>
                        <td><span class="badge bg-secondary">Open</span></td>
                        <td>${c.patient_name || c.patient_name_encrypted || 'REDACTED'}</td>
                        <td>${c.patient_nic_encrypted || 'REDACTED'}</td>
                        <td>${new Date(c.created_at).toLocaleDateString()}</td>
                        <td>
                            <a href="pending-case.html?case_id=${c.case_id}" class="btn btn-sm btn-outline-primary">View Timeline</a>
                            <a href="reports.html?case_id=${c.case_id}" class="btn btn-sm btn-outline-success">Print Report</a>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error(err);
            alert('Error performing search.');
        }
    });
});
