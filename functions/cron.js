// Fix imports
const { fetchNSITokenData } = require('./utils/tokenPrice');
const { sendTokenPriceNotification } = require('./utils/notificationSender');

// Fix circular dependency - use separate notification subscribers
let notificationSubscribers = [];

try {
  // Try to import subscribers from frame-webhooks if available
  const webhooks = require('./frame-webhooks');
  notificationSubscribers = webhooks.notificationSubscribers || [];
} catch (error) {
  console.log('Could not import subscribers from frame-webhooks, using empty array');
  notificationSubscribers = [];
}

/**
 * Scheduled function to check token prices and send notifications
 * This would be triggered by a cron job in production
 * 
 * Netlify handles this via: 
 * https://docs.netlify.com/functions/scheduled-functions/
 */
exports.handler = async (event) => {
  // Validate that this is a scheduled event or authorized call
  if (event.httpMethod !== 'POST' && !event.isScheduledEvent) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Running scheduled token price check');
    
    // Fetch current token data
    const tokenData = await fetchNSITokenData();
    console.log('Current token data:', tokenData);
    
    // Check if we should send notifications based on price movement
    const shouldNotify = checkNotificationThresholds(tokenData);
    
    if (shouldNotify && notificationSubscribers.length > 0) {
      console.log('Sending price notifications to subscribers');
      
      // Determine alert type
      const alertType = parseFloat(tokenData.priceChange24h) > 0 ? 'price-up' : 'price-down';
      
      // Send notifications to all subscribers
      const notificationPromises = notificationSubscribers.map(subscriber => 
        sendTokenPriceNotification(subscriber.notificationDetails, tokenData, alertType)
      );
      
      await Promise.all(notificationPromises);
      console.log(`Successfully sent ${notificationSubscribers.length} notifications`);
    } else {
      console.log('No notifications to send');
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Price check completed',
        notificationsSent: shouldNotify ? notificationSubscribers.length : 0
      })
    };
  } catch (error) {
    console.error('Error running scheduled task:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to run scheduled task',
        message: error.message
      })
    };
  }
};

/**
 * Check if token price movements meet notification thresholds
 * @param {Object} tokenData - Current token data
 * @returns {boolean} Whether to send notifications
 */
function checkNotificationThresholds(tokenData) {
  try {
    // Parse price change percentage
    const priceChange = parseFloat(tokenData.priceChange24h);
    
    // Send notifications for significant price movements (>10% in either direction)
    return Math.abs(priceChange) >= 10;
  } catch (error) {
    console.error('Error checking notification thresholds:', error);
    return false;
  }
}

// Function to add a subscriber (would be called from the webhook handler)
function addSubscriber(fid, notificationDetails) {
  // Check if subscriber already exists
  const existingIndex = notificationSubscribers.findIndex(s => s.fid === fid);
  
  if (existingIndex >= 0) {
    // Update existing subscriber
    notificationSubscribers[existingIndex].notificationDetails = notificationDetails;
  } else {
    // Add new subscriber
    notificationSubscribers.push({ fid, notificationDetails });
  }
}

// Function to remove a subscriber (would be called from the webhook handler)
function removeSubscriber(fid) {
  notificationSubscribers = notificationSubscribers.filter(s => s.fid !== fid);
}

// Export functions for use in other modules
module.exports.addSubscriber = addSubscriber;
module.exports.removeSubscriber = removeSubscriber;