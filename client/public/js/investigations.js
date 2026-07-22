document.addEventListener('DOMContentLoaded', () => {
    const alertBox = document.getElementById('alert-box');

    function showAlert(message, isSuccess) {
        alertBox.className = \`alert alert-\${isSuccess ? 'success' : 'danger'}\`;
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
        window.scrollTo(0, 0);
    }

    document.getElementById('radiologyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            case_id: parseInt(document.getElementById('radCaseId').value),
            modality: document.getElementById('radModality').value,
            body_region: document.getElementById('radRegion').value,
            findings: document.getElementById('radFindings').value
        };

        try {
            const res = await fetch('http://localhost:5005/api/investigations/radiology', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showAlert(\`Success: \${data.message} (Scan ID: \${data.data.scan_id})\`, true);
                e.target.reset();
            } else {
                showAlert(\`Error: \${data.message}\`, false);
            }
        } catch (err) {
            showAlert('Network error.', false);
        }
    });

    document.getElementById('toxicologyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            case_id: parseInt(document.getElementById('toxCaseId').value),
            sample_material: document.getElementById('toxSample').value,
            substance_tested: document.getElementById('toxSubstance').value,
            result_text: document.getElementById('toxResult').value
        };

        try {
            const res = await fetch('http://localhost:5005/api/investigations/toxicology', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showAlert(\`Success: \${data.message} (Tox ID: \${data.data.tox_id})\`, true);
                e.target.reset();
            } else {
                showAlert(\`Error: \${data.message}\`, false);
            }
        } catch (err) {
            showAlert('Network error.', false);
        }
    });
});
