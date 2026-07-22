document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }

    const tableBody = document.getElementById('casesTableBody');

    // 2. Fetch Pending Cases
    async function fetchPendingCases() {
        try {
            const response = await fetch('http://localhost:5005/api/cases/pending');
            const data = await response.json();

            if (data.success) {
                if (data.data.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No pending cases at the moment.</td></tr>`;
                    return;
                }

                // Clear the loading message
                tableBody.innerHTML = '';

                // Generate table rows dynamically
                data.data.forEach(c => {
                    const tr = document.createElement('tr');
                    
                    // Format badge style based on case type
                    let badgeClass = 'bg-primary';
                    if (c.case_type === 'Postmortem') badgeClass = 'bg-dark';
                    if (c.case_type === 'Drunkenness') badgeClass = 'bg-warning text-dark';

                    tr.innerHTML = `
                        <td><strong>#${c.case_id}</strong></td>
                        <td>${c.patient_name}</td>
                        <td>${c.nic_passport || 'N/A'}</td>
                        <td>${c.badge_no} (${c.officer_name})</td>
                        <td><span class="badge ${badgeClass}">${c.case_type}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="startExam(${c.case_id})">
                                Start Exam
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Failed to load cases:', error);
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading cases. Please check server connection.</td></tr>`;
        }
    }

    fetchPendingCases();
});

// 3. Action function for clicking "Start Exam"
window.startExam = function(caseId) {
    // Save the selected case ID in localStorage so the next page knows which case we are working on
    localStorage.setItem('activeCaseId', caseId);
    
    // Redirect to the actual MLEF Form page (We will build this next)
    alert(`Starting Exam for Case #${caseId}. Redirecting to Medical Form...`);
    // window.location.href = 'mlef-form.html';
};