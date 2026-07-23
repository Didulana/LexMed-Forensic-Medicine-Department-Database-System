document.addEventListener('lexmed:ready', async () => {
    const user = window.lexmed.user;
    if (!user) return;

    // Show appropriate modules based on role
    const show = (id) => { const el = document.getElementById(id); if(el) el.style.display = 'block'; };

    if (user.role === 'jmo_role') {
        show('mod-mlef');
        show('mod-pmr');
        show('mod-investigations');
        show('mod-pending');
    } else if (user.role === 'department_clerk_role') {
        show('mod-intake');
        show('mod-evidence');
        show('mod-pending');
    } else if (user.role === 'police_officer_role') {
        show('mod-pending'); // They can only view
    } else if (user.role === 'db_admin_role') {
        show('mod-admin');
        show('mod-audit');
        // Admin might also need to see other things or everything for troubleshooting
        show('mod-intake');
    } else if (user.role === 'auditor_role') {
        show('mod-audit');
    }

    // Fetch dashboard stats (aggregate locally from /cases for now)
    try {
        const res = await window.lexmed.fetchAPI('/cases');
        if (res.ok) {
            const cases = await res.json();
            
            document.getElementById('statTotalCases').textContent = cases.length;
            
            // Simple logic assuming 'Closed' vs 'Open' isn't explicitly on the case table in this version,
            // or we just count all as open for the demo
            document.getElementById('statOpenCases').textContent = cases.length;
        }
        
        // JMOs can fetch their MLEF/PMR counts
        if (user.role === 'jmo_role') {
            const mlefRes = await window.lexmed.fetchAPI('/clinical/clinical-exams');
            if (mlefRes.ok) {
                const exams = await mlefRes.json();
                document.getElementById('statMlefCount').textContent = exams.length;
            }
            
            const pmrRes = await window.lexmed.fetchAPI('/clinical/postmortems');
            if (pmrRes.ok) {
                const pmrs = await pmrRes.json();
                document.getElementById('statPmrCount').textContent = pmrs.length;
            }
        } else {
            document.getElementById('statMlefCount').textContent = 'N/A';
            document.getElementById('statPmrCount').textContent = 'N/A';
        }

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
});