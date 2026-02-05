const mongoose = require('mongoose');

const footerConfigSchema = new mongoose.Schema({
  // Dynamic columns (first 3 columns - user can create)
  dynamicColumns: [{
    heading: {
      type: String,
      required: true,
      trim: true
    },
    items: [{
      label: {
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
    }],
    order: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Fixed columns (Support, Company Info, Follow Us)
  supportColumn: {
    heading: {
      type: String,
      default: 'SUPPORT'
    },
    items: [{
      label: {
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
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  companyInfoColumn: {
    heading: {
      type: String,
      default: 'COMPANY INFO'
    },
    items: [{
      label: {
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
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  followUsColumn: {
    heading: {
      type: String,
      default: 'FOLLOW US'
    },
    socialLinks: [{
      platform: {
        type: String,
        required: true,
        trim: true
      },
      href: {
        type: String,
        required: true,
        trim: true
      },
      iconClass: {
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
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Ensure only one configuration document exists
footerConfigSchema.index({}, { unique: true });

const FooterConfig = mongoose.model('FooterConfig', footerConfigSchema);

module.exports = { FooterConfig };
