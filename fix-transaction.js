const fs = require('fs');
let content = fs.readFileSync('backend/controllers/tranaction.controller.js', 'utf8');

const regex = /export const getTransactions = async \(req, res\) => \{[\s\S]*?\} catch \(error\) \{[\s\S]*?\}\n\};\n/g;

const replacement = `export const getTransactions = async (req, res) => {
    try {
        const { filter, sort, page, limit, skip } = parseQueryParams(req.query, ["transactionId", "customerName", "customerCode", "type"]);
        
        const total = await Transaction.countDocuments(filter);
        const transactions = await Transaction.aggregate([
            { $match: filter },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
        ]);
        
        const result = formatPaginatedResponse(transactions, total, page, limit);
        return res.status(200).json(new ApiResponse(200, result, "Transactions retrieved successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message || "Something went wrong while retrieving transactions")
        );
    }
};\n`;

content = content.replace(regex, replacement);
fs.writeFileSync('backend/controllers/tranaction.controller.js', content, 'utf8');
