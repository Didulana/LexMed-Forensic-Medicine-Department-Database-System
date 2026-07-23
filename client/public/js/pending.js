document.addEventListener('lexmed:ready', async () => {
    const user = window.lexmed.user;
    if (!user) return;

    // Get case_id from URL query string ?case_id=X
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('case_id');

    if (!caseId) {
        document.querySelector('.container').innerHTML = `<div class="alert alert-danger mt-5">No case ID provided in URL. Please select a case from the Dashboard or Search.</div>`;
        return;
    }

    // Role-based visibility for action buttons
    document.querySelectorAll('.role-jmo-only').forEach(el => {
        if (user.role !== 'jmo_role') el.style.display = 'none';
        else el.href = `${el.getAttribute('href')}?case_id=${caseId}`;
    });

    document.querySelectorAll('.role-clerk-only').forEach(el => {
        if (user.role !== 'department_clerk_role') el.style.display = 'none';
        else el.href = `${el.getAttribute('href')}?case_id=${caseId}`;
    });
    
    // Add restricted view badge for police or clerks viewing clinical data
    if (user.role === 'police_officer_role' || user.role === 'department_clerk_role') {
        const badge = document.createElement('span');
        badge.className = 'badge bg-warning text-dark ms-3';
        badge.textContent = 'Restricted View';
        document.getElementById('caseTitle').appendChild(badge);
    }

    try {
        // Fetch case info
        // Wait, there's no single case GET endpoint in Phase 2 except the one inside v_case_full which we didn't expose directly by ID (only GET /cases).
        // Let's fetch all cases and find the one.
        const res = await window.lexmed.fetchAPI('/cases');
        if (res.ok) {
            const cases = await res.json();
            const caseInfo = cases.find(c => c.case_id == caseId);
            
            if (caseInfo) {
                document.getElementById('caseTitle').textContent += ` - ${caseInfo.case_number}`;
                // For restricted roles, name might be redacted or missing from v_case_public
                document.getElementById('patientInfo').textContent = `Patient: ${caseInfo.patient_name || caseInfo.patient_name_encrypted || 'REDACTED'} | Type: ${caseInfo.case_type}`;
            } else {
                document.getElementById('patientInfo').textContent = `Patient: Unknown or Access Denied`;
            }
        }

        // Fetch Timeline Data (For demo, we'll try to fetch what we can, though some endpoints might not support filtering by case_id yet, we filter on client)
        
        // 1. MLEFs
        if (user.role === 'jmo_role') {
            const mlefRes = await window.lexmed.fetchAPI('/clinical/clinical-exams');
            if (mlefRes.ok) {
                const exams = await mlefRes.json();
                const caseExams = exams.filter(e => e.case_id == caseId);
                const ul = document.getElementById('mlef-list');
                ul.innerHTML = '';
                if (caseExams.length === 0) ul.innerHTML = `<li class="list-group-item text-muted">No clinical exams found.</li>`;
                caseExams.forEach(e => {
                    ul.innerHTML += `<li class="list-group-item">
                        <strong>Exam Date:</strong> ${new Date(e.examination_date).toLocaleString()} <br>
                        <strong>History:</strong> ${e.history_given || 'N/A'} <br>
                        <strong>Injuries:</strong> ${e.injuries_noted || 'N/A'}
                    </li>`;
                });
            }
        } else {
            document.getElementById('mlef-list').innerHTML = `<li class="list-group-item text-muted"><i class="fas fa-lock"></i> Clinical data restricted to JMO.</li>`;
        }

        // 2. PMRs
        if (user.role === 'jmo_role') {
            const pmrRes = await window.lexmed.fetchAPI('/clinical/postmortems');
            if (pmrRes.ok) {
                const pmrs = await pmrRes.json();
                const casePmrs = pmrs.filter(p => p.case_id == caseId);
                const ul = document.getElementById('pmr-list');
                ul.innerHTML = '';
                if (casePmrs.length === 0) ul.innerHTML = `<li class="list-group-item text-muted">No postmortem reports found.</li>`;
                casePmrs.forEach(p => {
                    ul.innerHTML += `<li class="list-group-item">
                        <strong>Date:</strong> ${new Date(p.autopsy_date).toLocaleString()} <br>
                        <strong>External Findings:</strong> ${p.external_findings || 'N/A'} <br>
                        <strong>Internal Findings:</strong> ${p.internal_findings || 'N/A'}
                    </li>`;
                });
            }
        } else {
            document.getElementById('pmr-list').innerHTML = `<li class="list-group-item text-muted"><i class="fas fa-lock"></i> Postmortem data restricted to JMO.</li>`;
        }

        // 3. Evidence
        // Actually /evidence might need specific item_id, but the prompt says view case timeline...
        // If we don't have a GET /evidence by case_id endpoint in Phase 2, we just mock it for now
        document.getElementById('evidence-list').innerHTML = `<li class="list-group-item text-muted">Evidence tracking requires item IDs. (See Search / Reports for full view).</li>`;
        

    } catch (err) {
        console.error('Error fetching timeline data:', err);
    }
});