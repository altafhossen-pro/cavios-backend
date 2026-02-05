const { FooterConfig } = require('./footer.model');
const sendResponse = require('../../utils/sendResponse');

// Get footer configuration (public endpoint)
exports.getFooterConfig = async (req, res) => {
  try {
    let config = await FooterConfig.findOne();

    if (!config) {
      // Create default config if none exists
      config = new FooterConfig({
        dynamicColumns: [],
        supportColumn: {
          heading: 'SUPPORT',
          items: [],
          isActive: true
        },
        companyInfoColumn: {
          heading: 'COMPANY INFO',
          items: [],
          isActive: true
        },
        followUsColumn: {
          heading: 'FOLLOW US',
          socialLinks: [],
          isActive: true
        }
      });
      await config.save();
    }

    // Sort dynamic columns by order
    const sortedDynamicColumns = config.dynamicColumns
      .filter(col => col.isActive)
      .map(col => ({
        heading: col.heading,
        items: col.items
          .filter(item => item.isActive)
          .sort((a, b) => a.order - b.order),
        order: col.order
      }))
      .sort((a, b) => a.order - b.order);

    // Sort support column items
    const sortedSupportItems = config.supportColumn.items
      .filter(item => item.isActive)
      .sort((a, b) => a.order - b.order);

    // Sort company info column items
    const sortedCompanyInfoItems = config.companyInfoColumn.items
      .filter(item => item.isActive)
      .sort((a, b) => a.order - b.order);

    // Sort follow us social links
    const sortedSocialLinks = config.followUsColumn.socialLinks
      .filter(link => link.isActive)
      .sort((a, b) => a.order - b.order);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Footer configuration retrieved successfully',
      data: {
        dynamicColumns: sortedDynamicColumns,
        supportColumn: {
          heading: config.supportColumn.heading,
          items: sortedSupportItems,
          isActive: config.supportColumn.isActive
        },
        companyInfoColumn: {
          heading: config.companyInfoColumn.heading,
          items: sortedCompanyInfoItems,
          isActive: config.companyInfoColumn.isActive
        },
        followUsColumn: {
          heading: config.followUsColumn.heading,
          socialLinks: sortedSocialLinks,
          isActive: config.followUsColumn.isActive
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
      config = new FooterConfig({
        dynamicColumns: [],
        supportColumn: {
          heading: 'SUPPORT',
          items: [],
          isActive: true
        },
        companyInfoColumn: {
          heading: 'COMPANY INFO',
          items: [],
          isActive: true
        },
        followUsColumn: {
          heading: 'FOLLOW US',
          socialLinks: [],
          isActive: true
        }
      });
      await config.save();
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Footer configuration retrieved successfully',
      data: config
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
    const { dynamicColumns, supportColumn, companyInfoColumn, followUsColumn } = req.body;

    let config = await FooterConfig.findOne();

    if (!config) {
      config = new FooterConfig({
        dynamicColumns: dynamicColumns || [],
        supportColumn: supportColumn || {
          heading: 'SUPPORT',
          items: [],
          isActive: true
        },
        companyInfoColumn: companyInfoColumn || {
          heading: 'COMPANY INFO',
          items: [],
          isActive: true
        },
        followUsColumn: followUsColumn || {
          heading: 'FOLLOW US',
          socialLinks: [],
          isActive: true
        }
      });
    } else {
      if (dynamicColumns !== undefined) {
        config.dynamicColumns = dynamicColumns;
      }
      if (supportColumn !== undefined) {
        config.supportColumn = supportColumn;
      }
      if (companyInfoColumn !== undefined) {
        config.companyInfoColumn = companyInfoColumn;
      }
      if (followUsColumn !== undefined) {
        config.followUsColumn = followUsColumn;
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
