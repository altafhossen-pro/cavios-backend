const { BannerCollection } = require('./bannerCollection.model');
const sendResponse = require('../../utils/sendResponse');

// Get all banner collections
const getAllBannerCollections = async (req, res) => {
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

        const bannerCollections = await BannerCollection.find(query)
            .sort(sortQuery)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BannerCollection.countDocuments(query);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner collections retrieved successfully',
            data: {
                bannerCollections,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting banner collections:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get single banner collection
const getBannerCollectionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const bannerCollection = await BannerCollection.findById(id);
        
        if (!bannerCollection) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Banner collection not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner collection retrieved successfully',
            data: { bannerCollection }
        });
    } catch (error) {
        console.error('Error getting banner collection:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create banner collection
const createBannerCollection = async (req, res) => {
    try {
        const { image, title, description, buttonText, buttonLink, style, isActive = true, order = 0 } = req.body;

        // Validation
        if (!image || !title) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'Image and title are required'
            });
        }

        // Get the highest order number and add 1 if order not provided
        let finalOrder = order;
        if (!order || order <= 0) {
            const highestOrderBanner = await BannerCollection.findOne({}, {}, { sort: { order: -1 } });
            finalOrder = highestOrderBanner ? highestOrderBanner.order + 1 : 1;
        }

        const bannerCollection = new BannerCollection({
            image,
            title,
            description,
            buttonText: buttonText || 'Shop Now',
            buttonLink: buttonLink || '/shop-collection',
            style: style || 'default',
            isActive,
            order: finalOrder
        });

        await bannerCollection.save();

        return sendResponse({
            res,
            statusCode: 201,
            success: true,
            message: 'Banner collection created successfully',
            data: { bannerCollection }
        });
    } catch (error) {
        console.error('Error creating banner collection:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update banner collection
const updateBannerCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const bannerCollection = await BannerCollection.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!bannerCollection) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Banner collection not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner collection updated successfully',
            data: { bannerCollection }
        });
    } catch (error) {
        console.error('Error updating banner collection:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete banner collection
const deleteBannerCollection = async (req, res) => {
    try {
        const { id } = req.params;

        const bannerCollection = await BannerCollection.findByIdAndDelete(id);

        if (!bannerCollection) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Banner collection not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner collection deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting banner collection:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Toggle banner collection status
const toggleBannerCollectionStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const bannerCollection = await BannerCollection.findById(id);
        
        if (!bannerCollection) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Banner collection not found'
            });
        }

        bannerCollection.isActive = !bannerCollection.isActive;
        await bannerCollection.save();

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Banner collection status updated successfully',
            data: { bannerCollection }
        });
    } catch (error) {
        console.error('Error toggling banner collection status:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get active banner collections for frontend
const getActiveBannerCollections = async (req, res) => {
    try {
        const bannerCollections = await BannerCollection.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select('image title description buttonText buttonLink style');

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Active banner collections retrieved successfully',
            data: { bannerCollections }
        });
    } catch (error) {
        console.error('Error getting active banner collections:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllBannerCollections,
    getBannerCollectionById,
    createBannerCollection,
    updateBannerCollection,
    deleteBannerCollection,
    toggleBannerCollectionStatus,
    getActiveBannerCollections
};

