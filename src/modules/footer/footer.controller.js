const { FooterConfig } = require('./footer.model');
const { StaticPage } = require('../staticPage/staticPage.model');
const sendResponse = require('../../utils/sendResponse');

// Get footer configuration (public endpoint)
exports.getFooterConfig = async (req, res) => {
  try {
    let config = await FooterConfig.findOne();

    if (!config) {
      // Create default config if none exists
      const currentYear = new Date().getFullYear();
      config = new FooterConfig({
        dynamicColumns: [],
        bottomSection: {
          privacyPolicy: {
            label: 'Privacy Policy',
            href: '',
            autoDetect: true
          },
          termsAndConditions: {
            label: 'Terms & Conditions',
            href: '',
            autoDetect: true
          },
          copyright: `© Cavios® ${currentYear}. Designed for performance. Built to last.`
        }
      });
      await config.save();
    }

    // Auto-detect Privacy Policy and Terms & Conditions if autoDetect is enabled
    let privacyPolicyUrl = config.bottomSection?.privacyPolicy?.href || '';
    let termsAndConditionsUrl = config.bottomSection?.termsAndConditions?.href || '';

    if (config.bottomSection?.privacyPolicy?.autoDetect) {
      const privacyPage = await StaticPage.findOne({ 
        pageType: 'privacy-policy',
        isActive: true 
      });
      if (privacyPage) {
        privacyPolicyUrl = `/page/${privacyPage.slug}`;
      }
    }

    if (config.bottomSection?.termsAndConditions?.autoDetect) {
      const termsPage = await StaticPage.findOne({ 
        pageType: 'terms-conditions',
        isActive: true 
      });
      if (termsPage) {
        termsAndConditionsUrl = `/page/${termsPage.slug}`;
      }
    }

    // Sort dynamic columns by order (up to 6 columns)
    const sortedDynamicColumns = (config.dynamicColumns || [])
      .filter(col => col.isActive)
      .map(col => ({
        heading: col.heading,
        items: col.items
          .filter(item => item.isActive)
          .sort((a, b) => a.order - b.order),
        order: col.order
      }))
      .sort((a, b) => a.order - b.order)
      .slice(0, 6); // Limit to 6 columns

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Footer configuration retrieved successfully',
      data: {
        dynamicColumns: sortedDynamicColumns,
        bottomSection: {
          privacyPolicy: {
            label: config.bottomSection?.privacyPolicy?.label || 'Privacy Policy',
            href: privacyPolicyUrl || config.bottomSection?.privacyPolicy?.href || ''
          },
          termsAndConditions: {
            label: config.bottomSection?.termsAndConditions?.label || 'Terms & Conditions',
            href: termsAndConditionsUrl || config.bottomSection?.termsAndConditions?.href || ''
          },
          copyright: (config.bottomSection?.copyright || `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`).replace('{year}', new Date().getFullYear().toString())
        }
      }
    });
  } catch (error) {
    console.error('Error fetching footer config:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get footer configuration for admin (with full details)
exports.getFooterConfigAdmin = async (req, res) => {
  try {
    let config = await FooterConfig.findOne();

    if (!config) {
      const currentYear = new Date().getFullYear();
      config = new FooterConfig({
        dynamicColumns: [],
        bottomSection: {
          privacyPolicy: {
            label: 'Privacy Policy',
            href: '',
            autoDetect: true
          },
          termsAndConditions: {
            label: 'Terms & Conditions',
            href: '',
            autoDetect: true
          },
          copyright: `© Cavios® ${currentYear}. Designed for performance. Built to last.`
        }
      });
      await config.save();
    }

    // Check for existing static pages by pageType and suggest URLs
    const privacyPage = await StaticPage.findOne({ 
      pageType: 'privacy-policy',
      isActive: true 
    });
    const termsPage = await StaticPage.findOne({ 
      pageType: 'terms-conditions',
      isActive: true 
    });

    const configData = config.toObject();
    
    // Add suggested URLs if auto-detect is enabled and pages exist
    if (configData.bottomSection?.privacyPolicy?.autoDetect && privacyPage) {
      configData.bottomSection.privacyPolicy.suggestedUrl = `/page/${privacyPage.slug}`;
    }
    if (configData.bottomSection?.termsAndConditions?.autoDetect && termsPage) {
      configData.bottomSection.termsAndConditions.suggestedUrl = `/page/${termsPage.slug}`;
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Footer configuration retrieved successfully',
      data: configData
    });
  } catch (error) {
    console.error('Error fetching footer config:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update footer configuration (admin only)
exports.updateFooterConfig = async (req, res) => {
  try {
    const { dynamicColumns, bottomSection } = req.body;

    let config = await FooterConfig.findOne();

    if (!config) {
      const currentYear = new Date().getFullYear();
      config = new FooterConfig({
        dynamicColumns: dynamicColumns || [],
        bottomSection: bottomSection || {
          privacyPolicy: {
            label: 'Privacy Policy',
            href: '',
            autoDetect: true
          },
          termsAndConditions: {
            label: 'Terms & Conditions',
            href: '',
            autoDetect: true
          },
          copyright: `© Cavios® ${currentYear}. Designed for performance. Built to last.`
        }
      });
    } else {
      if (dynamicColumns !== undefined) {
        // Limit to 6 columns
        config.dynamicColumns = (dynamicColumns || []).slice(0, 6);
      }
      if (bottomSection !== undefined) {
        config.bottomSection = bottomSection;
      }
    }

    await config.save();

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Footer configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating footer config:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};
