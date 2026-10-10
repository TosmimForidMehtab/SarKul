const fs = require('fs');

const controllers = [
    { file: 'backend/controllers/call.controller.js', model: 'Call', searchFields: '["callId", "serialNumber", "customerName", "customerCode", "contactNumber"]', resultName: 'calls' },
    { file: 'backend/controllers/engineer.controller.js', model: 'Engineer', searchFields: '["employeeName", "employeeCode", "employeeContact", "employeeEmail"]', resultName: 'engineers' },
    { file: 'backend/controllers/stock.controller.js', model: 'Stock', searchFields: '["stockId", "itemName", "itemPart", "serialNumber", "customerName", "category"]', resultName: 'stocks' },
    { file: 'backend/controllers/expense.controller.js', model: 'Expense', searchFields: '["expenseId", "employeeName", "description", "category"]', resultName: 'expenses' },
    { file: 'backend/controllers/tranaction.controller.js', model: 'Transaction', searchFields: '["transactionId", "customerName", "customerCode", "type"]', resultName: 'transactions' },
    { file: 'backend/controllers/mystocks.controller.js', model: 'MyStock', searchFields: '["itemName", "itemPart", "serialNumber"]', resultName: 'stocks' },
];

controllers.forEach(c => {
    let content = fs.readFileSync(c.file, 'utf8');
    
    // ADD IMPORT
    if (!content.includes('parseQueryParams')) {
        const importStatement = `import { parseQueryParams, formatPaginatedResponse } from "../utils/apiFeatures.js";\n`;
        content = importStatement + content;
    }

    // REMOVE createFilter
    const createFilterRegex = /const createFilter = \([\s\S]*?return\s*\{\s*filter,\s*sort\s*\};\s*\n\};\s*/;
    content = content.replace(createFilterRegex, '');

    // REPLACE GETALL
    const getAllRegex = new RegExp(`export const getAll[a-zA-Z]+ = async \\(req, res\\) => \\{[\\s\\S]*?\\} catch \\(error\\) \\{[\\s\\S]*?\\}\\s*\\};`, 'g');
    
    content = content.replace(getAllRegex, match => {
        const pipeMatch = match.match(/aggregate\(\[([\s\S]*?)\]\);/);
        let pipelineStr = pipeMatch ? pipeMatch[1] : `\n            { $match: filter },\n            { $sort: sort },\n`;
        
        if (!pipelineStr.includes('$skip')) {
             pipelineStr = pipelineStr.replace(/\{\s*\$sort:\s*sort,?\s*\},?/, '{ $sort: sort },\n            { $skip: skip },\n            { $limit: limit },');
        }
        
        const funcNameMatch = match.match(/export const (getAll[a-zA-Z]+)/);
        const funcName = funcNameMatch ? funcNameMatch[1] : `getAll${c.model}s`;
        
        return `export const ${funcName} = async (req, res) => {
    try {
        const { filter, sort, page, limit, skip } = parseQueryParams(req.query, ${c.searchFields});
        
        const total = await ${c.model}.countDocuments(filter);
        
        const ${c.resultName} = await ${c.model}.aggregate([${pipelineStr}]);
        
        const result = formatPaginatedResponse(${c.resultName}, total, page, limit);
        return res.status(200).json(new ApiResponse(200, result, "${c.model}s retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode, null, error.message || "Something went wrong while retrieving ${c.model}s"));
    }
};`;
    });
    
    fs.writeFileSync(c.file, content, 'utf8');
    console.log(`Updated ${c.file}`);
});
console.log('Refactor completed.');
