const { BannerCountdown } = require('./bannerCountdown.model');
const sendResponse = require('../../utils/sendResponse');

// Get all banner countdowns
const getAllBannerCountdowns = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive, sort } = req.query;
        
        let query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // Handle sorting
        let sortQuery = { order: 1, createdAt: -1 };
        if (sort === 'order') {
            sortQuery = { order: 1 }; // Ascending order
        }

        const bannerCountdowns = await BannerCountdown.find(query)
            .sort(sortQuery)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BannerCountdown.countDocuments(query);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner countdowns retrieved successfully',
            data: {
                bannerCountdowns,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting banner countdowns:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get single banner countdown
const getBannerCountdownById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const bannerCountdown = await BannerCountdown.findById(id);
        
        if (!bannerCountdown) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Banner countdown not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner countdown retrieved successfully',
            data: { bannerCountdown }
        });
    } catch (error) {
        console.error('Error getting banner countdown:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create banner countdown
const createBannerCountdown = async (req, res) => {
    try {
        const { title, description, buttonText, buttonLink, image, endDate, isActive = true, order = 0 } = req.body;

        // Validation
        if (!title || !image || !endDate) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'Title, image, and end date are required'
            });
        }

        // Validate endDate is a valid date and in the future
        const endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'Invalid end date format'
            });
        }

        if (endDateObj <= new Date()) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'End date must be in the future'
            });
        }

        // Get the highest order number and add 1 if order not provided
        let finalOrder = order;
        if (!order || order <= 0) {
            const highestOrderBanner = await BannerCountdown.findOne({}, {}, { sort: { order: -1 } });
            finalOrder = highestOrderBanner ? highestOrderBanner.order + 1 : 1;
        }

        const bannerCountdown = new BannerCountdown({
            title,
            description,
            buttonText: buttonText || 'Shop Now',
            buttonLink: buttonLink || '/shop-default-grid',
            image,
            endDate: endDateObj,
            isActive,
            order: finalOrder
        });

        await bannerCountdown.save();

        return sendResponse({
            res,
            statusCode: 201,
            success: true,
            message: 'Banner countdown created successfully',
            data: { bannerCountdown }
        });
    } catch (error) {
        console.error('Error creating banner countdown:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update banner countdown
const updateBannerCountdown = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate endDate if provided
        if (updateData.endDate) {
            const endDateObj = new Date(updateData.endDate);
            if (isNaN(endDateObj.getTime())) {
                return sendResponse({
                    res,
                    statusCode: 400,
                    success: false,
                    message: 'Invalid end date format'
                });
            }

            if (endDateObj <= new Date()) {
                return sendResponse({
                    res,
                    statusCode: 400,
                    success: false,
                    message: 'End date must be in the future'
                });
            }

            updateData.endDate = endDateObj;
        }

        const bannerCountdown = await BannerCountdown.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!bannerCountdown) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Banner countdown not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner countdown updated successfully',
            data: { bannerCountdown }
        });
    } catch (error) {
        console.error('Error updating banner countdown:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete banner countdown
const deleteBannerCountdown = async (req, res) => {
    try {
        const { id } = req.params;

        const bannerCountdown = await BannerCountdown.findByIdAndDelete(id);

        if (!bannerCountdown) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Banner countdown not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner countdown deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting banner countdown:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Toggle banner countdown status
const toggleBannerCountdownStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const bannerCountdown = await BannerCountdown.findById(id);
        
        if (!bannerCountdown) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Banner countdown not found'
            });
        }

        bannerCountdown.isActive = !bannerCountdown.isActive;
        await bannerCountdown.save();

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner countdown status updated successfully',
            data: { bannerCountdown }
        });
    } catch (error) {
        console.error('Error toggling banner countdown status:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get active banner countdown for frontend (only one active at a time)
const getActiveBannerCountdown = async (req, res) => {
    try {
        const now = new Date();
        const bannerCountdown = await BannerCountdown.findOne({ 
            isActive: true,
            endDate: { $gt: now } // Only return if countdown hasn't expired
        })
            .sort({ order: 1, createdAt: -1 })
            .select('title description buttonText buttonLink image endDate');

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Active banner countdown retrieved successfully',
            data: { bannerCountdown: bannerCountdown || null }
        });
    } catch (error) {
        console.error('Error getting active banner countdown:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllBannerCountdowns,
    getBannerCountdownById,
    createBannerCountdown,
    updateBannerCountdown,
    deleteBannerCountdown,
    toggleBannerCountdownStatus,
    getActiveBannerCountdown
};

