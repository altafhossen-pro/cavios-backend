const { StaticPage } = require('./staticPage.model');
const sendResponse = require('../../utils/sendResponse');

// Get all static pages (admin)
const getAllStaticPages = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, pageType, isActive } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        if (pageType) {
            query.pageType = pageType;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const pages = await StaticPage.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await StaticPage.countDocuments(query);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Static pages retrieved successfully',
            data: {
                pages,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching static pages:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all active static pages (public)
const getActiveStaticPages = async (req, res) => {
    try {
        const pages = await StaticPage.find({ isActive: true })
            .select('title slug pageType')
            .sort({ createdAt: -1 });

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Active static pages retrieved successfully',
            data: { pages }
        });
    } catch (error) {
        console.error('Error fetching active static pages:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get single static page by slug (public)
const getStaticPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const page = await StaticPage.findOne({ slug, isActive: true });

        if (!page) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Page not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Static page retrieved successfully',
            data: { page }
        });
    } catch (error) {
        console.error('Error fetching static page:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get single static page by ID (admin)
const getStaticPageById = async (req, res) => {
    try {
        const { id } = req.params;

        const page = await StaticPage.findById(id);

        if (!page) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Page not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Static page retrieved successfully',
            data: { page }
        });
    } catch (error) {
        console.error('Error fetching static page:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create static page
const createStaticPage = async (req, res) => {
    try {
        const { title, slug, content, pageType, isActive = true, metaTitle, metaDescription } = req.body;

        // Validation
        if (!title || !slug || !content) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'Title, slug, and content are required'
            });
        }

        // Check if slug already exists
        const existingPage = await StaticPage.findOne({ slug });
        if (existingPage) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'A page with this slug already exists'
            });
        }

        const page = new StaticPage({
            title,
            slug: slug.toLowerCase().trim(),
            content,
            pageType: pageType || 'other',
            isActive,
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || title
        });

        await page.save();

        return sendResponse({
            res,
            statusCode: 201,
            success: true,
            message: 'Static page created successfully',
            data: { page }
        });
    } catch (error) {
        console.error('Error creating static page:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Update static page
const updateStaticPage = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If slug is being updated, check if it's available
        if (updateData.slug) {
            const existingPage = await StaticPage.findOne({ slug: updateData.slug, _id: { $ne: id } });
            if (existingPage) {
                return sendResponse({
                    res,
                    statusCode: 400,
                    success: false,
                    message: 'A page with this slug already exists'
                });
            }
            updateData.slug = updateData.slug.toLowerCase().trim();
        }

        const page = await StaticPage.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!page) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Page not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Static page updated successfully',
            data: { page }
        });
    } catch (error) {
        console.error('Error updating static page:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Delete static page
const deleteStaticPage = async (req, res) => {
    try {
        const { id } = req.params;

        const page = await StaticPage.findByIdAndDelete(id);

        if (!page) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Page not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Static page deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting static page:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Check slug availability
const checkSlugAvailability = async (req, res) => {
    try {
        const { slug, pageId } = req.query; // pageId is optional: for editing existing page

        if (!slug) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'Slug is required'
            });
        }

        // Normalize slug
        const normalizedSlug = slug
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const query = { slug: normalizedSlug };
        
        // Exclude current page if editing
        if (pageId) {
            query._id = { $ne: pageId };
        }

        const existingPage = await StaticPage.findOne(query);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: existingPage ? 'Slug is already taken' : 'Slug is available',
            data: {
                available: !existingPage,
                slug: normalizedSlug
            }
        });
    } catch (error) {
        console.error('Error checking slug availability:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllStaticPages,
    getActiveStaticPages,
    getStaticPageBySlug,
    getStaticPageById,
    createStaticPage,
    updateStaticPage,
    deleteStaticPage,
    checkSlugAvailability
};

