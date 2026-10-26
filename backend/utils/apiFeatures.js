export const parseQueryParams = (query, searchFields = []) => {
    let filter = {};
    let sort = {};
    let page = parseInt(query.page, 10) || 1;
    let limit = 10;
    if (query.limit === 'all' || parseInt(query.limit, 10) === -1) {
        limit = 100000;
    } else if (query.limit) {
        limit = parseInt(query.limit, 10) || 10;
    }
    let skip = (page - 1) * limit;

    if (query.search && searchFields.length > 0) {
        filter.$or = searchFields.map(field => ({
            [field]: { $regex: query.search, $options: "i" }
        }));
    }

    const excludedFields = [
        "page", "sort", "limit", "fields", "search", "sortBy", "sortOrder", 
        "startDate", "endDate", "fromDate", "toDate", "createdAt", "updatedAt"
    ];
    const queryObj = { ...query };
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => '$' + match);
    Object.assign(filter, JSON.parse(queryStr));

    const startStr = query.startDate || query.fromDate;
    const endStr = query.endDate || query.toDate;

    if (startStr || endStr) {
        filter.createdAt = {};
        if (startStr) {
            const start = new Date(startStr);
            start.setUTCHours(0, 0, 0, 0);
            filter.createdAt.$gte = start;
        }
        if (endStr) {
            const end = new Date(endStr);
            end.setUTCHours(23, 59, 59, 999);
            filter.createdAt.$lte = end;
        }
    } else if (query.createdAt) {
        filter.createdAt = {
            $gte: new Date(new Date(query.createdAt).setUTCHours(0, 0, 0, 0)),
            $lte: new Date(new Date(query.createdAt).setUTCHours(23, 59, 59, 999)),
        };
    } else if (query.updatedAt) {
        filter.updatedAt = {
            $gte: new Date(new Date(query.updatedAt).setUTCHours(0, 0, 0, 0)),
            $lte: new Date(new Date(query.updatedAt).setUTCHours(23, 59, 59, 999)),
        };
    }

    if (query.sortBy) {
        const order = query.sortOrder === 'desc' ? -1 : 1;
        sort[query.sortBy] = order;
    } else if (query.sort) {
        let sortBy = query.sort.split(",");
        sortBy.forEach((item) => {
            if (item[0] === "-") {
                sort[item.slice(1)] = -1;
            } else {
                sort[item] = 1;
            }
        });
    } else {
        sort.createdAt = -1;
    }

    return { filter, sort, page, limit, skip };
};

export const formatPaginatedResponse = (data, total, page, limit) => {
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total
        }
    };
};
