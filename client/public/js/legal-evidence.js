document.addEventListener('lexmed:ready', () => {
    const user = window.lexmed.user;
    if (!user) return;

    if (user.role !== 'department_clerk_role') {
        document.querySelector('.container').innerHTML = `<div class="alert alert-danger mt-5">Access Denied. Only Department Clerks can manage evidence.</div>`;
        return;
    }

    const alertBox = document.getElementById('alert-box');

    // Handle searching for evidence trail
    // Since Phase 2 didn't implement a GET /evidence/:id/trail endpoint,
    // we will simulate fetching it, or show that it requires backend support.
    document.getElementById('searchItemBtn').addEventListener('click', () => {
        const itemId = document.getElementById('searchItemId').value;
        if (!itemId) return;

        // In a real app, fetch /evidence/:itemId
        // For demo, just unlock the transfer form for this item.
        document.getElementById('transferItemId').value = itemId;
        document.getElementById('releasedBy').value = user.user_id;
        document.getElementById('submitTransferBtn').disabled = false;
        
        document.getElementById('custodyTimeline').innerHTML = `
            <li class="list-group-item">Item #${itemId} selected for transfer.</li>
            <li class="list-group-item text-muted text-sm">Full trail view requires GET /evidence endpoint (Not implemented in Phase 2).</li>
        `;
    });

    // Handle adding new evidence
    document.getElementById('newEvidenceForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const caseId = document.getElementById('evCaseId').value;
        const itemType = document.getElementById('evType').value;
        const description = document.getElementById('evDesc').value;

        try {
            const res = await window.lexmed.fetchAPI('/evidence', {
                method: 'POST',
                body: JSON.stringify({
                    case_id: caseId,
                    item_type: itemType,
                    description: description,
                    current_status: 'Retained' // Must be Retained initially
                })
            });

            const data = await res.json();

            if (res.ok) {
                alertBox.className = 'alert alert-success d-block';
                alertBox.textContent = `Evidence item logged successfully! Item ID: ${data.data.item_id}`;
                document.getElementById('newEvidenceForm').reset();
            } else {
                alertBox.className = 'alert alert-danger d-block';
                alertBox.textContent = data.error || 'Failed to log evidence';
            }
        } catch (err) {
            alertBox.className = 'alert alert-danger d-block';
            alertBox.textContent = 'Server error.';
        }
    });

    // Handle Transfer
    document.getElementById('transferForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const itemId = document.getElementById('transferItemId').value;
        const receivedBy = document.getElementById('receivedBy').value;
        const newStatus = document.getElementById('newStatus').value;

        try {
            const res = await window.lexmed.fetchAPI(`/evidence/${itemId}/transfer`, {
                method: 'POST',
                body: JSON.stringify({
                    received_by_name: receivedBy,
                    new_status: newStatus
                })
            });

            const data = await res.json();

            if (res.ok) {
                alertBox.className = 'alert alert-success d-block';
                alertBox.textContent = `Transfer logged successfully!`;
                document.getElementById('transferForm').reset();
                document.getElementById('submitTransferBtn').disabled = true;
                document.getElementById('transferItemId').value = '';
                document.getElementById('releasedBy').value = '';
            } else {
                alertBox.className = 'alert alert-danger d-block';
                alertBox.textContent = data.error || 'Failed to transfer evidence';
            }
        } catch (err) {
            alertBox.className = 'alert alert-danger d-block';
            alertBox.textContent = 'Server error.';
        }
    });
});
