document.addEventListener('DOMContentLoaded', () => {
    
    // --- Histology Samples Table Logic ---
    const addSampleBtn = document.getElementById('addSampleBtn');
    const samplesTbody = document.querySelector('#samplesTable tbody');

    addSampleBtn.addEventListener('click', () => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="form-control form-control-sm sample-type" placeholder="e.g. Heart tissue" required></td>
            <td><input type="text" class="form-control form-control-sm sample-result" placeholder="Pending / specific instructions" required></td>
            <td><button type="button" class="btn btn-sm btn-danger remove-row">X</button></td>
        `;
        samplesTbody.appendChild(tr);
    });

    // Global event listener for removing rows dynamically
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-row')) {
            e.target.closest('tr').remove();
        }
    });

    // --- Form Submission Logic ---
    document.getElementById('pmrForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('alert-box');
        
        // 1. Gather PMR General and COD Info
        const payload = {
            case_id: parseInt(document.getElementById('caseId').value),
            jmo_id: parseInt(document.getElementById('jmoId').value),
            death_category: document.getElementById('deathCategory').value,
            pm_date: document.getElementById('pmDate').value,
            
            immediate_cause: document.getElementById('immediateCause').value,
            antecedent_cause: document.getElementById('antecedentCause').value,
            contributory: document.getElementById('contributory').value,
            
            histology_samples: []
        };

        // 2. Gather Histology Samples
        document.querySelectorAll('#samplesTable tbody tr').forEach(row => {
            payload.histology_samples.push({
                tissue_type: row.querySelector('.sample-type').value,
                analysis_result: row.querySelector('.sample-result').value
            });
        });

        // 3. POST via Fetch API
        try {
            const response = await fetch('http://localhost:5005/api/pmr/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                alertBox.className = 'alert alert-success';
                alertBox.textContent = `Success: ${result.message} (Postmortem ID: ${result.data.pm_id})`;
                alertBox.classList.remove('d-none');
                
                // Reset form
                document.getElementById('pmrForm').reset();
                samplesTbody.innerHTML = '';
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
