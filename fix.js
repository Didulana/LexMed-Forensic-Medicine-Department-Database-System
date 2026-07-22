const fs = require('fs');
const files = [
    'client/public/js/legal-evidence.js',
    'client/public/js/investigations.js',
    'client/public/js/dashboard.js',
    'client/public/js/search.js',
    'client/public/js/reports.js',
    'server/src/controllers/reportController.js',
    'server/src/controllers/searchController.js'
];
files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        content = content.replace(/\\`/g, '`');
        fs.writeFileSync(f, content);
        console.log('Fixed', f);
    }
});
