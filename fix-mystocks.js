const fs = require('fs');
let content = fs.readFileSync('backend/controllers/mystocks.controller.js', 'utf8');

const replacement = `export const getMyStocks = async (req, res, next) => {
    try {
        const { filter, sort, page, limit, skip } = parseQueryParams(req.query, ["itemName", "brand", "serialNumber"]);
        
        const total = await MyStocks.countDocuments(filter);
        const myStocks = await MyStocks.aggregate([
            { $match: filter },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    serialNumber: 1,
                    totalPrice: 1,
                    brand: 1,
                    price: 1,
                    warrantyStart: 1,
                    warrantyEnd: 1,
                    itemName: 1,
                },
            }
        ]);

        const result = formatPaginatedResponse(myStocks, total, page, limit);
        return res.status(200).json(new ApiResponse(200, result, "success"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiResponse(error.statusCode, null, error.message)
        );
    }
};`;

content = content.replace(/export const getMyStocks = async \(req, res, next\) => \{[\s\S]*?\}\n\};\n?/g, replacement + '\n');
fs.writeFileSync('backend/controllers/mystocks.controller.js', content, 'utf8');
