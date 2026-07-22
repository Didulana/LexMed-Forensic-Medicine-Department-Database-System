document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('searchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = document.getElementById('searchInput').value.trim();
        const resultsContainer = document.getElementById('resultsContainer');
        const tbody = document.querySelector('#resultsTable tbody');
        const noResults = document.getElementById('noResults');

        if (!query) return;

        try {
            const response = await fetch(`http://localhost:5005/api/search?q=\${encodeURIComponent(query)}`);
            const result = await response.json();

            resultsContainer.classList.remove('d-none');
            tbody.innerHTML = '';
            noResults.classList.add('d-none');

            if (result.success && result.data.length > 0) {
                result.data.forEach(item => {
                    const tr = document.createElement('tr');
                    
                    const date = new Date(item.incident_time).toLocaleDateString();
                    
                    // Route the "View" button depending on the case type
                    let viewLink = '#';
                    if(item.case_type === 'Clinical Exam') viewLink = 'mlef-form.html';
                    if(item.case_type === 'Postmortem') viewLink = 'pmr-form.html';

                    tr.innerHTML = `
                        <td><strong>#\${item.case_id}</strong></td>
                        <td><span class="badge \${item.case_type === 'Postmortem' ? 'bg-success' : 'bg-primary'}">\${item.case_type}</span></td>
                        <td>\${item.status}</td>
                        <td>\${item.first_name}</td>
                        <td>\${item.nic_passport}</td>
                        <td>\${date}</td>
                        <td><a href="\${viewLink}" class="btn btn-sm btn-outline-dark">Open</a></td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                noResults.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Search error', error);
            alert('Failed to connect to search server');
        }
    });

});
