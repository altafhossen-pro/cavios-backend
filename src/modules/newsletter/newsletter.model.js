const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const newsletterSettingsSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Subscribe To Our Newsletter!'
  },
  subtitle: {
    type: String,
    default: 'Receive 10% OFF your next order, exclusive offers & more!'
  },
  image: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'SUBSCRIBE'
  },
  successMessage: {
    type: String,
    default: 'You have successfully subscribed.'
  },
  errorMessage: {
    type: String,
    default: 'Something went wrong'
  },
  placeholder: {
    type: String,
    default: 'Enter your e-mail'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  forceShow: {
    type: Boolean,
    default: false
  },
  showInterval: {
    type: String,
    enum: ['once', 'every_session', 'every_reload'],
    default: 'once'
  },
  showSocialIcons: {
    type: Boolean,
    default: true
  },
  socialIcons: [{
    href: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['facebook', 'youtube', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'tiktok', 'pinterest', 'amazon'],
      required: true
    }
  }]
}, {
  timestamps: true
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
const NewsletterSettings = mongoose.model('NewsletterSettings', newsletterSettingsSchema);

module.exports = { Subscriber, NewsletterSettings };