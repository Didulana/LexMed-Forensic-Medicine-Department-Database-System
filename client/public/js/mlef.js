document.addEventListener('DOMContentLoaded', () => {
    
    // --- Injury Table Logic ---
    const addInjuryBtn = document.getElementById('addInjuryBtn');
    const injuriesTbody = document.querySelector('#injuriesTable tbody');

    addInjuryBtn.addEventListener('click', () => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="form-control form-control-sm injury-type" placeholder="e.g. Laceration" required></td>
            <td><input type="text" class="form-control form-control-sm injury-weapon" placeholder="e.g. Blunt object" required></td>
            <td><input type="text" class="form-control form-control-sm injury-part" placeholder="e.g. Right forearm" required></td>
            <td>
                <select class="form-select form-select-sm injury-category" required>
                    <option value="" disabled selected>Select...</option>
                    <option value="Non-grievous">Non-grievous</option>
                    <option value="Grievous">Grievous</option>
                    <option value="Fatal">Fatal</option>
                </select>
            </td>
            <td><button type="button" class="btn btn-sm btn-danger remove-row">X</button></td>
        `;
        injuriesTbody.appendChild(tr);
    });

    // --- Referral Table Logic ---
    const addReferralBtn = document.getElementById('addReferralBtn');
    const referralsTbody = document.querySelector('#referralsTable tbody');

    addReferralBtn.addEventListener('click', () => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="form-control form-control-sm ref-dept" placeholder="e.g. Orthopedics" required></td>
            <td><input type="date" class="form-control form-control-sm ref-date" required></td>
            <td><input type="text" class="form-control form-control-sm ref-findings" placeholder="Findings"></td>
            <td><button type="button" class="btn btn-sm btn-danger remove-row">X</button></td>
        `;
        referralsTbody.appendChild(tr);
    });

    // Global event listener for removing rows dynamically
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-row')) {
            e.target.closest('tr').remove();
        }
    });

    // --- Form Submission Logic ---
    document.getElementById('mlefForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('alert-box');
        
        // 1. Gather Header Info
        const payload = {
            case_id: parseInt(document.getElementById('caseId').value),
            jmo_id: parseInt(document.getElementById('jmoId').value),
            consent_status: document.getElementById('consentStatus').value,
            history_given: document.getElementById('historyGiven').value,
            injuries: [],
            referrals: []
        };

        // 2. Gather Injuries
        document.querySelectorAll('#injuriesTable tbody tr').forEach(row => {
            payload.injuries.push({
                injury_type: row.querySelector('.injury-type').value,
                weapon: row.querySelector('.injury-weapon').value,
                body_part: row.querySelector('.injury-part').value,
                hurt_category: row.querySelector('.injury-category').value
            });
        });

        // 3. Gather Referrals
        document.querySelectorAll('#referralsTable tbody tr').forEach(row => {
            payload.referrals.push({
                department: row.querySelector('.ref-dept').value,
                referral_date: row.querySelector('.ref-date').value,
                findings: row.querySelector('.ref-findings').value
            });
        });

        // 4. POST via Fetch API
        try {
            const response = await fetch('http://localhost:5005/api/mlef/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                alertBox.className = 'alert alert-success';
                alertBox.textContent = `Success: ${result.message} (Exam ID: ${result.data.exam_id})`;
                alertBox.classList.remove('d-none');
                
                // Reset form
                document.getElementById('mlefForm').reset();
                injuriesTbody.innerHTML = '';
                referralsTbody.innerHTML = '';
                window.scrollTo(0, 0);
            } else {
                alertBox.className = 'alert alert-danger';
                alertBox.textContent = `Error: ${result.message}`;
                alertBox.classList.remove('d-none');
                window.scrollTo(0, 0);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = 'Network error. Make sure the backend server is running.';
            alertBox.classList.remove('d-none');
            window.scrollTo(0, 0);
        }
    });

});
