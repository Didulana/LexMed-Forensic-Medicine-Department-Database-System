document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }

    const alertBox = document.getElementById('alert-box');
    const step2Container = document.getElementById('step2-container');
    const officerSelect = document.getElementById('officerSelect');
    const linkedPatientIdInput = document.getElementById('linkedPatientId');

    // 2. Fetch Police Officers for Dropdown
    async function loadOfficers() {
        try {
            const response = await fetch('http://localhost:5005/api/cases/officers');
            const data = await response.json();
            
            if (data.success) {
                officerSelect.innerHTML = '<option value="" disabled selected>Select an officer...</option>';
                data.data.forEach(officer => {
                    const option = document.createElement('option');
                    option.value = officer.officer_id;
                    option.textContent = `${officer.badge_no} - ${officer.name}`;
                    officerSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load officers:', error);
        }
    }
    
    // Load officers as soon as the page opens
    loadOfficers();

    // 3. Handle Patient Registration (Step 1)
    document.getElementById('patientForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const nic = document.getElementById('nic').value;
        const firstName = document.getElementById('firstName').value;
        const dob = document.getElementById('dob').value;
        const gender = document.getElementById('gender').value;

        try {
            const response = await fetch('http://localhost:5005/api/patients/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nic_passport: nic, first_name: firstName, dob: dob, gender: gender })
            });

            const data = await response.json();

            if (data.success) {
                alertBox.className = 'alert alert-success d-block';
                alertBox.textContent = `Patient registered! (ID: ${data.data.patient_id}). Please complete Step 2.`;
                
                // Lock Step 1 and Reveal Step 2
                document.getElementById('patientForm').querySelectorAll('input, select, button').forEach(el => el.disabled = true);
                linkedPatientIdInput.value = data.data.patient_id;
                step2Container.classList.remove('d-none');
            } else {
                alertBox.className = 'alert alert-danger d-block';
                alertBox.textContent = data.message;
            }
        } catch (error) {
            alertBox.className = 'alert alert-danger d-block';
            alertBox.textContent = 'Server connection error.';
        }
    });

    // 4. Handle Case Creation (Step 2)
    document.getElementById('caseForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5005/api/cases/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: linkedPatientIdInput.value,
                    officer_id: officerSelect.value,
                    case_type: document.getElementById('caseType').value,
                    incident_time: document.getElementById('incidentTime').value
                })
            });

            const data = await response.json();

            if (data.success) {
                alertBox.className = 'alert alert-success d-block';
                alertBox.innerHTML = `<strong>Success!</strong> ${data.message} Case ID: ${data.data.case_id}. Redirecting to dashboard...`;
                
                // Send back to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                alertBox.className = 'alert alert-danger d-block';
                alertBox.textContent = data.message;
            }
        } catch (error) {
            alertBox.className = 'alert alert-danger d-block';
            alertBox.textContent = 'Server connection error.';
        }
    });
});