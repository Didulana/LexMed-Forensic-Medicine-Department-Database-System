document.addEventListener('DOMContentLoaded', () => {
    const alertBox = document.getElementById('alert-box');

    function showAlert(message, isSuccess) {
        alertBox.className = `alert alert-\${isSuccess ? 'success' : 'danger'}`;
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
        window.scrollTo(0, 0);
    }

    async function submitForm(url, payload, successCallback, event) {
        event.preventDefault();
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showAlert(data.message + ': Success!', true);
                event.target.reset();
            } else {
                showAlert(`Error: \${data.message}`, false);
            }
        } catch (err) {
            showAlert('Network error.', false);
        }
    }

    document.getElementById('evidenceForm').addEventListener('submit', (e) => {
        submitForm('http://localhost:5005/api/legal/evidence', {
            case_id: parseInt(document.getElementById('evCaseId').value),
            item_type: document.getElementById('evType').value,
            description: document.getElementById('evDesc').value,
            current_status: document.getElementById('evStatus').value
        }, null, e);
    });

    document.getElementById('custodyForm').addEventListener('submit', (e) => {
        submitForm('http://localhost:5005/api/legal/custody', {
            item_id: parseInt(document.getElementById('cocItemId').value),
            released_by_user: parseInt(document.getElementById('cocReleasedBy').value),
            received_by_name: document.getElementById('cocReceivedBy').value
        }, null, e);
    });

    document.getElementById('summonsForm').addEventListener('submit', (e) => {
        submitForm('http://localhost:5005/api/legal/summons', {
            jmo_id: parseInt(document.getElementById('sumJmoId').value),
            case_id: parseInt(document.getElementById('sumCaseId').value),
            appearance_date: document.getElementById('sumDate').value,
            status: document.getElementById('sumStatus').value
        }, null, e);
    });

    document.getElementById('documentForm').addEventListener('submit', (e) => {
        submitForm('http://localhost:5005/api/legal/document', {
            case_id: parseInt(document.getElementById('docCaseId').value),
            doc_type: document.getElementById('docType').value,
            reference_no: document.getElementById('docRef').value
        }, null, e);
    });
});
