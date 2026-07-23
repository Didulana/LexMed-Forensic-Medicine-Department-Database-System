document.addEventListener('lexmed:ready', () => {
    const user = window.lexmed.user;
    if (!user) return;

    if (user.role !== 'jmo_role') {
        document.querySelector('.container').innerHTML = `<div class="alert alert-danger mt-5">Access Denied. Only JMOs can fill out PMR.</div>`;
        return;
    }

    // Auto-fill JMO ID
    const jmoInput = document.getElementById('jmoId');
    if (jmoInput) {
        jmoInput.value = user.user_id;
        jmoInput.readOnly = true;
    }

    // Pre-fill caseId if passed in URL
    const params = new URLSearchParams(window.location.search);
    const caseIdFromUrl = params.get('case_id');
    if (caseIdFromUrl) {
        document.getElementById('caseId').value = caseIdFromUrl;
        document.getElementById('caseId').readOnly = true;
    }

    const form = document.getElementById('pmrForm');
    const alertBox = document.getElementById('alert-box');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const caseId = document.getElementById('caseId').value;
        const deathCategory = document.getElementById('deathCategory').value;
        const autopsyDate = document.getElementById('pmDate').value;
        const externalFindings = document.getElementById('externalFindings').value;
        const internalFindings = document.getElementById('internalFindings').value;
        
        const immediateCause = document.getElementById('immediateCause').value;
        const antecedentCause = document.getElementById('antecedentCause').value;
        const contributory = document.getElementById('contributory').value;

        // Note: the backend createPmr expects:
        // case_id, death_category, autopsy_date, external_findings, internal_findings

        try {
            // 1. Create PMR
            const pmrRes = await window.lexmed.fetchAPI('/clinical/postmortems', {
                method: 'POST',
                body: JSON.stringify({
                    case_id: caseId,
                    death_category: deathCategory,
                    autopsy_date: autopsyDate,
                    external_findings: externalFindings,
                    internal_findings: internalFindings
                })
            });

            const pmrData = await pmrRes.json();

            if (!pmrRes.ok) {
                alertBox.className = 'alert alert-danger d-block';
                alertBox.textContent = pmrData.error || 'Failed to submit PMR details';
                return;
            }

            const pmId = pmrData.pm_id;

            // 2. Add COD
            const codRes = await window.lexmed.fetchAPI(`/clinical/postmortems/${pmId}/cause-of-death`, {
                method: 'POST',
                body: JSON.stringify({
                    immediate_cause: immediateCause,
                    antecedent_cause: antecedentCause,
                    contributory: contributory
                })
            });

            const codData = await codRes.json();

            if (!codRes.ok) {
                alertBox.className = 'alert alert-warning d-block';
                alertBox.textContent = `PMR created (ID: ${pmId}), but COD failed: ${codData.error}`;
            } else {
                alertBox.className = 'alert alert-success d-block';
                alertBox.textContent = `PMR and Cause of Death recorded successfully! (PMR ID: ${pmId})`;
                form.reset();
                if(caseIdFromUrl) document.getElementById('caseId').value = caseIdFromUrl;
                document.getElementById('jmoId').value = user.user_id;
            }

        } catch (err) {
            console.error(err);
            alertBox.className = 'alert alert-danger d-block';
            alertBox.textContent = 'Server error.';
        }
    });
});
