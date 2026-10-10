const fs = require('fs');
let content = fs.readFileSync('backend/routes/stock.routes.js', 'utf8');
content = content.replace(/\.route\(\/\/\/\)/g, '.route("/")');
content = content.replace(/router\s*\.\s*route\("\/"\)/, 'router.get("/lookup", verifyToken, lookupStocks);\nrouter\n    .route("/")');
fs.writeFileSync('backend/routes/stock.routes.js', content, 'utf8');
