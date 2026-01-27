const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema({
  // Frontend fields
  imgSrc: {
    type: String,
    required: true,
    trim: true
  },
  alt: {
    type: String,
    default: 'hero-slideshow',
    trim: true
  },
  subheading: {
    type: String,
    trim: true
  },
  heading: {
    type: String,
    required: true,
    trim: true
  },
  btnText: {
    type: String,
    required: true,
    trim: true
  },
  buttonLink: {
    type: String,
    default: '/shop-default-grid',
    trim: true
  },
  // Legacy fields (for backward compatibility)
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  modelImage: {
    type: String,
    trim: true
  },
  backgroundGradient: {
    type: String,
    trim: true
  },
  button1Text: {
    type: String,
    trim: true
  },
  button1Link: {
    type: String,
    trim: true
  },
  button2Text: {
    type: String,
    trim: true
  },
  button2Link: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for ordering and active status
heroBannerSchema.index({ order: 1, isActive: 1 });

const HeroBanner = mongoose.model('HeroBanner', heroBannerSchema);
module.exports = { HeroBanner };
