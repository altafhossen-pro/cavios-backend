const { Blog } = require('./blog.model');
const sendResponse = require('../../utils/sendResponse');

// Get all blogs
const getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive, sort, search } = req.query;
        
        let query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // Search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Handle sorting
        let sortQuery = { publishedAt: -1, createdAt: -1 };
        if (sort === 'title') {
            sortQuery = { title: 1 };
        } else if (sort === 'date') {
            sortQuery = { publishedAt: -1 };
        }

        const blogs = await Blog.find(query)
            .sort(sortQuery)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Blog.countDocuments(query);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Blogs retrieved successfully',
            data: {
                blogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting blogs:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get single blog
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Blog not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Blog retrieved successfully',
            data: { blog }
        });
    } catch (error) {
        console.error('Error getting blog:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get blog by slug
const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const blog = await Blog.findOne({ slug, isActive: true });
        
        if (!blog) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Blog not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Blog retrieved successfully',
            data: { blog }
        });
    } catch (error) {
        console.error('Error getting blog by slug:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create blog
const createBlog = async (req, res) => {
    try {
        const { title, description, content, image, author, isActive = true, publishedAt, metaTitle, metaDescription } = req.body;

        // Validation
        if (!title || !description || !content || !image) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'Title, description, content, and image are required'
            });
        }

        // Generate slug from title if not provided
        let slug = req.body.slug;
        if (!slug && title) {
            slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        // Check if slug already exists
        if (slug) {
            const existingBlog = await Blog.findOne({ slug });
            if (existingBlog) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        const blog = new Blog({
            title,
            description,
            content,
            image,
            author: author || 'Admin',
            slug,
            isActive,
            publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || description
        });

        await blog.save();

        return sendResponse({
            res,
            statusCode: 201,
            success: true,
            message: 'Blog created successfully',
            data: { blog }
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Update blog
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If slug is provided, use it; otherwise regenerate from title if title is updated
        if (updateData.slug) {
            // Use provided slug, but check if it's available
            const existingBlog = await Blog.findOne({ slug: updateData.slug, _id: { $ne: id } });
            if (existingBlog) {
                updateData.slug = `${updateData.slug}-${Date.now()}`;
            }
        } else if (updateData.title) {
            // Regenerate slug from title if not provided
            let slug = updateData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Check if slug already exists (excluding current blog)
            const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
            if (existingBlog) {
                slug = `${slug}-${Date.now()}`;
            }
            updateData.slug = slug;
        }

        // Convert publishedAt to Date if provided
        if (updateData.publishedAt) {
            updateData.publishedAt = new Date(updateData.publishedAt);
        }

        const blog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!blog) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Blog not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Blog updated successfully',
            data: { blog }
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Delete blog
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Blog not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Toggle blog status
const toggleBlogStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);
        
        if (!blog) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Blog not found'
            });
        }

        blog.isActive = !blog.isActive;
        await blog.save();

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Blog status updated successfully',
            data: { blog }
        });
    } catch (error) {
        console.error('Error toggling blog status:', error);
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
        const { slug, blogId } = req.query;

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
        
        // Exclude current blog if editing
        if (blogId) {
            query._id = { $ne: blogId };
        }

        const existingBlog = await Blog.findOne(query);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: existingBlog ? 'Slug is already taken' : 'Slug is available',
            data: {
                available: !existingBlog,
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

// Get latest blogs for homepage (public endpoint)
const getLatestBlogs = async (req, res) => {
    try {
        const { limit = 3, random = false } = req.query;
        const limitNum = parseInt(limit);

        let query = { isActive: true };
        let sortQuery = { publishedAt: -1, createdAt: -1 };

        let blogs;
        if (random === 'true') {
            // Get random blogs
            const total = await Blog.countDocuments(query);
            const randomSkip = Math.floor(Math.random() * Math.max(0, total - limitNum));
            blogs = await Blog.find(query)
                .sort(sortQuery)
                .skip(randomSkip)
                .limit(limitNum);
        } else {
            // Get latest blogs
            blogs = await Blog.find(query)
                .sort(sortQuery)
                .limit(limitNum);
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Latest blogs retrieved successfully',
            data: { blogs }
        });
    } catch (error) {
        console.error('Error getting latest blogs:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogStatus,
    getLatestBlogs,
    checkSlugAvailability
};

