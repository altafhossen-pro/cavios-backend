const { Subscriber, NewsletterSettings } = require('./newsletter.model');
const sendResponse = require('../../utils/sendResponse');

// --- Subscriber Handlers ---

// Subscribe to newsletter (Public)
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendResponse({ res, statusCode: 400, success: false, message: 'Email is required' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return sendResponse({ res, statusCode: 200, success: true, message: 'Already subscribed' });
    }

    const subscriber = await Subscriber.create({ email });
    return sendResponse({ res, statusCode: 201, success: true, message: 'Subscribed successfully', data: subscriber });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return sendResponse({ res, statusCode: 500, success: false, message: error.message });
  }
};

// Get subscribers list (Admin)
exports.getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    // Email Search
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    // Date Range Filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to the end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [subscribers, total] = await Promise.all([
      Subscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Subscriber.countDocuments(query)
    ]);

    return sendResponse({
      res,
      success: true,
      message: 'Subscribers retrieved successfully',
      data: subscribers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return sendResponse({ res, statusCode: 500, success: false, message: error.message });
  }
};

// Export subscribers to CSV (Admin)
exports.exportSubscribers = async (req, res) => {
  try {
    const { startDate, endDate, lastDays } = req.query;
    let query = {};

    if (lastDays) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(lastDays));
      query.createdAt = { $gte: date };
    } else if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const subscribers = await Subscriber.find(query).sort({ createdAt: -1 });

    // Generate CSV Header
    let csv = 'Email,Subscribed At,Status\n';
    
    // Generate CSV Rows
    subscribers.forEach(sub => {
      const date = new Date(sub.createdAt).toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toUpperCase();
      
      csv += `${sub.email},"${date}",${sub.isActive ? 'Active' : 'Unsubscribed'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export subscribers error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete subscriber (Admin)
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await Subscriber.findByIdAndDelete(id);
    if (!subscriber) {
      return sendResponse({ res, statusCode: 404, success: false, message: 'Subscriber not found' });
    }
    return sendResponse({ res, success: true, message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    return sendResponse({ res, statusCode: 500, success: false, message: error.message });
  }
};

// --- Settings Handlers ---

// Get newsletter settings (Public/Admin)
exports.getSettings = async (req, res) => {
  try {
    let settings = await NewsletterSettings.findOne();
    if (!settings) {
      settings = await NewsletterSettings.create({
        socialIcons: [
          { platform: 'facebook', href: '#' },
          { platform: 'twitter', href: '#' },
          { platform: 'instagram', href: '#' },
          { platform: 'pinterest', href: '#' }
        ]
      });
    }
    return sendResponse({ res, success: true, message: 'Settings retrieved', data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return sendResponse({ res, statusCode: 500, success: false, message: error.message });
  }
};

// Update newsletter settings (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    let settings = await NewsletterSettings.findOneAndUpdate({}, updateData, { new: true, upsert: true });
    return sendResponse({ res, success: true, message: 'Settings updated', data: settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return sendResponse({ res, statusCode: 500, success: false, message: error.message });
  }
};
