document.addEventListener('lexmed:ready', () => {
    const user = window.lexmed.user;
    if (!user) return;

    // Only Clerk or JMO can usually open cases depending on hospital policy. 
    // We'll allow Clerk and Admin for this demo, JMO might just get cases assigned.
    if (user.role === 'police_officer_role') {
        document.querySelector('.container').innerHTML = `<div class="alert alert-danger mt-5">Access Denied. You do not have permissions to open cases.</div>`;
        return;
    }
    
    // Add restricted view badge for clerks
    if (user.role === 'department_clerk_role') {
        const badge = document.createElement('span');
        badge.className = 'badge bg-warning text-dark ms-3';
        badge.textContent = 'Restricted View';
        document.querySelector('h3').appendChild(badge);
    }

    const form = document.getElementById('intakeForm');
    const alertBox = document.getElementById('alert-box');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nic = document.getElementById('nic').value;
        const patientName = document.getElementById('patientName').value;
        const caseNumber = document.getElementById('caseNumber').value;
        const caseType = document.getElementById('caseType').value;

        const payload = {
            case_number: caseNumber,
            patient_nic_encrypted: nic, // The backend handles encryption/hashing
            patient_nic_hash: nic,      // The backend handles hashing this
            patient_name_encrypted: patientName,
            case_type: caseType
        };

        try {
            const res = await window.lexmed.fetchAPI('/cases', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alertBox.className = 'alert alert-success d-block';
                alertBox.textContent = `Case opened successfully! Case ID: ${data.data.case_id}`;
                form.reset();
            } else {
                alertBox.className = 'alert alert-danger d-block';
                alertBox.textContent = data.error || 'Failed to open case';
            }
        } catch (err) {
            console.error(err);
            alertBox.className = 'alert alert-danger d-block';
            alertBox.textContent = 'Server error occurred.';
        }
    });
});