const fs = require('fs');
let content = fs.readFileSync('backend/controllers/expense.controller.js', 'utf8');

const replacement = `export const getExpense = async (req, res, next) => {
    try {
        const { filter, sort, page, limit, skip } = parseQueryParams(req.query, ["engineerName", "category", "remarks", "month", "period"]);
        
        const total = await Expense.countDocuments(filter);
        const expenses = await Expense.aggregate([
            { $match: filter },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    engineerName: 1,
                    category: 1,
                    month: 1,
                    period: 1,
                    amount: 1,
                    remarks: 1
                }
            }
        ]);

        const result = formatPaginatedResponse(expenses, total, page, limit);
        return res.status(200).json(new ApiResponse(200, result, "success"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message)
        );
    }
};`;

content = content.replace(/export const getExpense = async \(req, res, next\) => \{[\s\S]*?\}\n\};\n/g, replacement + '\n');
fs.writeFileSync('backend/controllers/expense.controller.js', content, 'utf8');
