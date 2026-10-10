const fs = require('fs');

let content = fs.readFileSync('backend/controllers/call.controller.js', 'utf8');

const regex = /export const getAllCalls = async \(req, res\) => \{[\s\S]*?\} catch \(error\) \{[\s\S]*?\}\n\};\n/g;

const replacement = `export const getAllCalls = async (req, res) => {
    try {
        const { filter, sort, page, limit, skip } = parseQueryParams(req.query, ["callId", "serialNumber", "customerName", "customerCode", "contactNumber"]);
        
        const total = await Call.countDocuments(filter);
        
        const calls = await Call.aggregate([
            {
                $match: filter,
            },
            {
                $sort: sort,
            },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "engineers",
                    localField: "engineersAssigned",
                    foreignField: "_id",
                    as: "engineersAssignedData",
                },
            },
            {
                $addFields: {
                    engineersAssigned: {
                        $map: {
                            input: "$engineersAssignedData",
                            as: "engineer",
                            in: {
                                engineerName: "$$engineer.employeeName",
                                engineerCode: "$$engineer.employeeCode",
                                engineerContact: "$$engineer.employeeContact",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    engineersAssignedData: 0,
                },
            },
        ]);
        
        const result = formatPaginatedResponse(calls, total, page, limit);
        return res
            .status(200)
            .json(new ApiResponse(200, result, "Calls retrieved successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode,
                    null,
                    error.message || "Something went wrong while retrieving calls"
                )
            );
    }
};\n`;

content = content.replace(regex, replacement);
fs.writeFileSync('backend/controllers/call.controller.js', content, 'utf8');
