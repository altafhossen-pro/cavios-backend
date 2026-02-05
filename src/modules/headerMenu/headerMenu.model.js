const mongoose = require('mongoose');

const headerMenuConfigSchema = new mongoose.Schema({
  // Menu type: 'default' or 'custom'
  menuType: {
    type: String,
    enum: ['default', 'custom'],
    default: 'default'
  },
  // Array of category IDs that should appear in header menu (in order) - for custom menu
  menuCategories: [{
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  // Manual menu items for custom menu (name, URL, target, submenus)
  manualMenuItems: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    href: {
      type: String,
      required: true,
      trim: true
    },
    target: {
      type: String,
      enum: ['_self', '_blank'],
      default: '_self'
    },
    order: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    submenus: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      href: {
        type: String,
        required: true,
        trim: true
      },
      target: {
        type: String,
        enum: ['_self', '_blank'],
        default: '_self'
      },
      order: {
        type: Number,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  }],
  // Whether to show the Shop menu with categories dropdown (works for both default and custom)
  showShopMenu: {
    type: Boolean,
    default: true
  },
  // Static menu items (like Home, Blog, Contact Us) - for default menu
  staticMenuItems: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    href: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Ensure only one configuration document exists
headerMenuConfigSchema.index({}, { unique: true });

const HeaderMenuConfig = mongoose.model('HeaderMenuConfig', headerMenuConfigSchema);

module.exports = { HeaderMenuConfig };
