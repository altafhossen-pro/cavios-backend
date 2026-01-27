const { HeroBanner } = require('./heroBanner.model');
const sendResponse = require('../../utils/sendResponse');

// Get all active hero banners
exports.getHeroBanners = async (req, res) => {
  try {
    const banners = await HeroBanner.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Hero banners retrieved successfully',
      data: banners
    });
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Admin: Get all hero banners (including inactive)
exports.getAllHeroBanners = async (req, res) => {
  try {
    const banners = await HeroBanner.find()
      .sort({ order: 1 })
      .select('-__v');

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'All hero banners retrieved successfully',
      data: banners
    });
  } catch (error) {
    console.error('Error fetching all hero banners:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Admin: Create hero banner
exports.createHeroBanner = async (req, res) => {
  try {
    const { 
      imgSrc, alt, subheading, heading, btnText, buttonLink,
      title, description, modelImage, backgroundGradient, 
      button1Text, button1Link, button2Text, button2Link, 
      isActive, order 
    } = req.body;

    const bannerData = {
      imgSrc: imgSrc || modelImage,
      alt: alt || 'hero-slideshow',
      subheading: subheading || '',
      heading: heading || title || '',
      btnText: btnText || button1Text || 'Explore Collection',
      buttonLink: buttonLink || button1Link || '/shop-default-grid',
      // Legacy fields
      title: title || heading || '',
      description: description || '',
      modelImage: modelImage || imgSrc,
      backgroundGradient: backgroundGradient || '',
      button1Text: button1Text || btnText || 'Explore Collection',
      button1Link: button1Link || buttonLink || '/shop-default-grid',
      button2Text: button2Text || '',
      button2Link: button2Link || '',
      isActive: isActive !== false,
      order: order || 0
    };

    const banner = new HeroBanner(bannerData);
    await banner.save();

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: 'Hero banner created successfully',
      data: banner
    });
  } catch (error) {
    console.error('Error creating hero banner:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Admin: Update hero banner
exports.updateHeroBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      imgSrc, alt, subheading, heading, btnText, buttonLink,
      title, description, modelImage, backgroundGradient, 
      button1Text, button1Link, button2Text, button2Link, 
      isActive, order 
    } = req.body;

    const updateData = {};
    
    // Update new fields if provided
    if (imgSrc !== undefined) updateData.imgSrc = imgSrc;
    if (alt !== undefined) updateData.alt = alt;
    if (subheading !== undefined) updateData.subheading = subheading;
    if (heading !== undefined) updateData.heading = heading;
    if (btnText !== undefined) updateData.btnText = btnText;
    if (buttonLink !== undefined) updateData.buttonLink = buttonLink;
    
    // Update legacy fields if provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (modelImage !== undefined) updateData.modelImage = modelImage;
    if (backgroundGradient !== undefined) updateData.backgroundGradient = backgroundGradient;
    if (button1Text !== undefined) updateData.button1Text = button1Text;
    if (button1Link !== undefined) updateData.button1Link = button1Link;
    if (button2Text !== undefined) updateData.button2Text = button2Text;
    if (button2Link !== undefined) updateData.button2Link = button2Link;
    
    // Sync fields for backward compatibility
    if (updateData.heading && !updateData.title) updateData.title = updateData.heading;
    if (updateData.title && !updateData.heading) updateData.heading = updateData.title;
    if (updateData.imgSrc && !updateData.modelImage) updateData.modelImage = updateData.imgSrc;
    if (updateData.modelImage && !updateData.imgSrc) updateData.imgSrc = updateData.modelImage;
    if (updateData.btnText && !updateData.button1Text) updateData.button1Text = updateData.btnText;
    if (updateData.button1Text && !updateData.btnText) updateData.btnText = updateData.button1Text;
    if (updateData.buttonLink && !updateData.button1Link) updateData.button1Link = updateData.buttonLink;
    if (updateData.button1Link && !updateData.buttonLink) updateData.buttonLink = updateData.button1Link;
    
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    const banner = await HeroBanner.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return sendResponse({
        res,
        statusCode: 404,
        success: false,
        message: 'Hero banner not found',
      });
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Hero banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Error updating hero banner:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Admin: Delete hero banner
exports.deleteHeroBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await HeroBanner.findByIdAndDelete(id);

    if (!banner) {
      return sendResponse({
        res,
        statusCode: 404,
        success: false,
        message: 'Hero banner not found',
      });
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Hero banner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Admin: Update banner order
exports.updateBannerOrder = async (req, res) => {
  try {
    const { banners } = req.body; // Array of { id, order }

    const updatePromises = banners.map(banner => 
      HeroBanner.findByIdAndUpdate(banner.id, { order: banner.order }, { new: true })
    );

    await Promise.all(updatePromises);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Banner order updated successfully',
    });
  } catch (error) {
    console.error('Error updating banner order:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};
