const { HeaderMenuConfig } = require('./headerMenu.model');
const { Category } = require('../category/category.model');
const sendResponse = require('../../utils/sendResponse');

// Get header menu configuration (public endpoint)
exports.getHeaderMenuConfig = async (req, res) => {
  try {
    let config = await HeaderMenuConfig.findOne();

    // If no config exists, return default with shop menu enabled
    if (!config) {
      config = {
        menuType: 'default',
        menuCategories: [],
        showShopMenu: true,
        staticMenuItems: [
          { name: 'Home', href: '/', order: 0, isActive: true },
          { name: 'Shop', href: '/shop', order: 1, isActive: true },
          { name: 'Blog', href: '/blogs', order: 2, isActive: true },
          { name: 'Contact Us', href: '/contact', order: 3, isActive: true }
        ]
      };
    }

    // Populate categories with their children (only for custom menu)
    let validCategories = [];
    if (config.menuType === 'custom' && config.menuCategories.length > 0) {
      const populatedCategories = await Promise.all(
        config.menuCategories.map(async (item) => {
          const category = await Category.findById(item.categoryId)
            .select('name slug image parent isActive');
          
          if (!category || !category.isActive) {
            return null;
          }

          // Get children categories (subcategories - second layer)
          const children = await Category.find({
            parent: category._id,
            isActive: true
          }).select('name slug image isActive').sort({ sortOrder: 1, name: 1 });

          // Get grandchildren (third layer) for each child
          const childrenWithGrandchildren = await Promise.all(
            children.map(async (child) => {
              const grandchildren = await Category.find({
                parent: child._id,
                isActive: true
              }).select('name slug image isActive').sort({ sortOrder: 1, name: 1 });

              return {
                ...child.toObject(),
                children: grandchildren
              };
            })
          );

          // Preserve order value from config.menuCategories
          return {
            order: item.order !== undefined && item.order !== null ? item.order : 9999,
            categoryId: {
              ...category.toObject(),
              children: childrenWithGrandchildren
            }
          };
        })
      );

      // Filter out null values
      validCategories = populatedCategories.filter(item => item !== null);
    }

    // Transform menu categories to include category data
    const menuItems = [];
    
    // If menuType is 'default', show static menu items only
    if (config.menuType === 'default') {
      const sortedStaticItems = config.staticMenuItems
        .filter(item => item.isActive)
        .sort((a, b) => a.order - b.order);
      
      sortedStaticItems.forEach(item => {
        menuItems.push({
          type: 'static',
          name: item.name,
          href: item.href,
          order: item.order
        });
      });
    } else {
      // If menuType is 'custom', show custom category menu items + manual menu items
      // Combine categories and manual items first, then sort together
      
      // Add categories with their order
      validCategories.forEach(item => {
        const category = item.categoryId;
        if (category) {
          const orderValue = typeof item.order === 'number' ? item.order : (parseInt(item.order) || 9999);
          menuItems.push({
            type: 'category',
            name: category.name,
            href: `/shop?category=${category.slug}`,
            slug: category.slug,
            categoryId: category._id,
            order: orderValue,
            children: category.children || []
          });
        }
      });

      // Add manual menu items with their order
      const activeManualItems = (config.manualMenuItems || [])
        .filter(item => item.isActive !== false);
      
      activeManualItems.forEach(item => {
        const orderValue = typeof item.order === 'number' ? item.order : (parseInt(item.order) || 9999);
        menuItems.push({
          type: 'manual',
          name: item.name,
          href: item.href,
          target: item.target || '_self',
          order: orderValue
        });
      });
    }

    // Sort all menu items by order (ascending)
    menuItems.sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : (parseInt(a.order) || 9999);
      const orderB = typeof b.order === 'number' ? b.order : (parseInt(b.order) || 9999);
      return orderA - orderB;
    });

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Header menu configuration retrieved successfully',
      data: {
        menuItems,
        showShopMenu: config.showShopMenu,
        menuType: config.menuType || 'default'
      }
    });
  } catch (error) {
    console.error('Error fetching header menu config:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get header menu configuration for admin (with full details)
exports.getHeaderMenuConfigAdmin = async (req, res) => {
  try {
    let config = await HeaderMenuConfig.findOne().populate({
      path: 'menuCategories.categoryId',
      select: 'name slug image parent isActive sortOrder'
    });

    // If no config exists, create default
    if (!config) {
      config = new HeaderMenuConfig({
        menuType: 'default',
        menuCategories: [],
        manualMenuItems: [],
        showShopMenu: true,
        staticMenuItems: [
          { name: 'Home', href: '/', order: 0, isActive: true },
          { name: 'Shop', href: '/shop', order: 1, isActive: true },
          { name: 'Blog', href: '/blogs', order: 2, isActive: true },
          { name: 'Contact Us', href: '/contact', order: 3, isActive: true }
        ]
      });
      await config.save();
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Header menu configuration retrieved successfully',
      data: config
    });
  } catch (error) {
    console.error('Error fetching header menu config:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update header menu configuration (admin only)
exports.updateHeaderMenuConfig = async (req, res) => {
  try {
    const { menuType, menuCategories, manualMenuItems, showShopMenu, staticMenuItems } = req.body;

    let config = await HeaderMenuConfig.findOne();

    if (!config) {
      // Create new config if doesn't exist
      config = new HeaderMenuConfig({
        menuType: menuType || 'default',
        menuCategories: menuCategories || [],
        manualMenuItems: manualMenuItems || [],
        showShopMenu: showShopMenu !== undefined ? showShopMenu : true,
        staticMenuItems: staticMenuItems || [
          { name: 'Home', href: '/', order: 0, isActive: true },
          { name: 'Shop', href: '/shop', order: 1, isActive: true },
          { name: 'Blog', href: '/blogs', order: 2, isActive: true },
          { name: 'Contact Us', href: '/contact', order: 3, isActive: true }
        ]
      });
    } else {
      // Update existing config
      if (menuType !== undefined) {
        config.menuType = menuType;
      }
      if (menuCategories !== undefined) {
        config.menuCategories = menuCategories;
      }
      if (manualMenuItems !== undefined) {
        config.manualMenuItems = manualMenuItems;
      }
      if (showShopMenu !== undefined) {
        config.showShopMenu = showShopMenu;
      }
      if (staticMenuItems !== undefined) {
        config.staticMenuItems = staticMenuItems;
      }
    }

    await config.save();

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Header menu configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating header menu config:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update menu order (admin only)
exports.updateMenuOrder = async (req, res) => {
  try {
    const { menuCategories } = req.body;

    let config = await HeaderMenuConfig.findOne();

    if (!config) {
      return sendResponse({
        res,
        statusCode: 404,
        success: false,
        message: 'Header menu configuration not found',
      });
    }

    config.menuCategories = menuCategories;
    await config.save();

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Menu order updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating menu order:', error);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Server error',
    });
  }
};
