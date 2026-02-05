const mongoose = require('mongoose');

const footerConfigSchema = new mongoose.Schema({
  // Dynamic columns (6 columns - all user can create)
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
  // Bottom section
  bottomSection: {
    privacyPolicy: {
      label: {
        type: String,
        default: 'Privacy Policy'
      },
      href: {
        type: String,
        default: ''
      },
      autoDetect: {
        type: Boolean,
        default: true
      }
    },
    termsAndConditions: {
      label: {
        type: String,
        default: 'Terms & Conditions'
      },
      href: {
        type: String,
        default: ''
      },
      autoDetect: {
        type: Boolean,
        default: true
      }
    },
    copyright: {
      type: String,
      default: `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`
    }
  }
}, {
  timestamps: true
});

// Ensure only one configuration document exists
footerConfigSchema.index({}, { unique: true });

const FooterConfig = mongoose.model('FooterConfig', footerConfigSchema);

module.exports = { FooterConfig };
