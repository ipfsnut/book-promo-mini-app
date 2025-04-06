// Import required dependencies
const axios = require('axios');

// Configuration for external platforms
// In production, store these in environment variables
const WEBHOOK_CONFIG = {
  discord: {
    enabled: false,
    url: process.env.DISCORD_WEBHOOK_URL || 'YOUR_DISCORD_WEBHOOK_URL'
  },
  telegram: {
    enabled: false,
    botToken: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN',
    chatId: process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID'
  }
};

// Simulated database for storing user notification preferences
// In a real app, you would use a real database
let notificationSubscribers = [];

// Function to add a subscriber
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
  
  // Log subscriber count
  console.log(`Current subscriber count: ${notificationSubscribers.length}`);
  
  // Notify external platforms about new subscriber
  if (WEBHOOK_CONFIG.discord.enabled || WEBHOOK_CONFIG.telegram.enabled) {
    sendExternalPlatformNotification({
      type: 'subscriber_added',
      message: `New subscriber added! FID: ${fid}`,
      data: { fid, timestamp: Date.now() }
    });
  }
}

// Function to remove a subscriber
function removeSubscriber(fid) {
  notificationSubscribers = notificationSubscribers.filter(s => s.fid !== fid);
  
  // Log subscriber count
  console.log(`Current subscriber count: ${notificationSubscribers.length}`);
  
  // Notify external platforms about removed subscriber
  if (WEBHOOK_CONFIG.discord.enabled || WEBHOOK_CONFIG.telegram.enabled) {
    sendExternalPlatformNotification({
      type: 'subscriber_removed',
      message: `Subscriber removed. FID: ${fid}`,
      data: { fid, timestamp: Date.now() }
    });
  }
}

/**
 * Farcaster Frame webhook handler for notifications and other events
 */
exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the webhook payload
    const payload = JSON.parse(event.body);
    console.log('Received webhook event:', payload);

    // Handle different event types
    switch (payload.event) {
      case 'frame_added':
        return handleFrameAdded(payload);
      
      case 'frame_removed':
        return handleFrameRemoved(payload);
      
      case 'notifications_enabled':
        return handleNotificationsEnabled(payload);
      
      case 'notifications_disabled':
        return handleNotificationsDisabled(payload);
      
      // Handle custom webhook events for external platforms
      case 'custom_notification':
        return handleCustomNotification(payload);
      
      default:
        console.log('Unknown event type:', payload.event);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Unknown event type' })
        };
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

/**
 * Handle frame_added event
 */
async function handleFrameAdded(payload) {
  // A user has added your frame/mini-app
  console.log('Frame added by user with FID:', payload.trustedData?.fid);
  
  // Store notification details if available
  if (payload.trustedData?.fid && payload.notificationDetails) {
    console.log('Notification details:', payload.notificationDetails);
    
    // Add subscriber to notifications
    addSubscriber(payload.trustedData.fid, payload.notificationDetails);
    
    console.log('User added to notification subscribers');
    
    // Send notification to external platforms about new frame add
    await sendExternalPlatformNotification({
      type: 'frame_added',
      message: `🎉 New user added the INEVITABLE Frame! FID: ${payload.trustedData.fid}`,
      data: {
        fid: payload.trustedData.fid,
        timestamp: Date.now()
      }
    });
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}

/**
 * Handle frame_removed event
 */
async function handleFrameRemoved(payload) {
  // A user has removed your frame/mini-app
  console.log('Frame removed by user with FID:', payload.trustedData?.fid);
  
  // Remove subscriber from notifications
  if (payload.trustedData?.fid) {
    removeSubscriber(payload.trustedData.fid);
    console.log('User removed from notification subscribers');
    
    // Send notification to external platforms about frame removal
    await sendExternalPlatformNotification({
      type: 'frame_removed',
      message: `User removed the INEVITABLE Frame. FID: ${payload.trustedData.fid}`,
      data: {
        fid: payload.trustedData.fid,
        timestamp: Date.now()
      }
    });
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}

/**
 * Handle notifications_enabled event
 */
async function handleNotificationsEnabled(payload) {
  // A user has enabled notifications
  console.log('Notifications enabled by user with FID:', payload.trustedData?.fid);
  
  // Store notification details
  if (payload.trustedData?.fid && payload.notificationDetails) {
    console.log('Notification details:', payload.notificationDetails);
    
    // Add subscriber to notifications
    addSubscriber(payload.trustedData.fid, payload.notificationDetails);
    console.log('User added to notification subscribers');
    
    // Send notification to external platforms about notifications being enabled
    await sendExternalPlatformNotification({
      type: 'notifications_enabled',
      message: `User enabled notifications. FID: ${payload.trustedData.fid}`,
      data: {
        fid: payload.trustedData.fid,
        timestamp: Date.now()
      }
    });
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}

/**
 * Handle notifications_disabled event
 */
async function handleNotificationsDisabled(payload) {
  // A user has disabled notifications
  console.log('Notifications disabled by user with FID:', payload.trustedData?.fid);
  
  // Remove subscriber from notifications
  if (payload.trustedData?.fid) {
    removeSubscriber(payload.trustedData.fid);
    console.log('User removed from notification subscribers');
    
    // Send notification to external platforms about notifications being disabled
    await sendExternalPlatformNotification({
      type: 'notifications_disabled',
      message: `User disabled notifications. FID: ${payload.trustedData.fid}`,
      data: {
        fid: payload.trustedData.fid,
        timestamp: Date.now()
      }
    });
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}

/**
 * Handle custom notification event
 */
async function handleCustomNotification(payload) {
  // Process custom notification 
  console.log('Received custom notification:', payload);
  
  // Send to external platforms
  await sendExternalPlatformNotification({
    type: 'custom_notification',
    message: payload.message || 'Custom notification received',
    data: payload.data || {}
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}

/**
 * Send notification to external platforms (Discord, Telegram, etc.)
 * @param {Object} notification - Notification object
 * @param {string} notification.type - Notification type
 * @param {string} notification.message - Notification message
 * @param {Object} notification.data - Additional data
 */
async function sendExternalPlatformNotification(notification) {
  const promises = [];
  
  // Send to Discord if enabled
  if (WEBHOOK_CONFIG.discord.enabled) {
    promises.push(sendDiscordNotification(notification));
  }
  
  // Send to Telegram if enabled
  if (WEBHOOK_CONFIG.telegram.enabled) {
    promises.push(sendTelegramNotification(notification));
  }
  
  // Wait for all notifications to send
  try {
    await Promise.all(promises);
    console.log('Notifications sent to external platforms');
  } catch (error) {
    console.error('Error sending notifications to external platforms:', error);
  }
}

/**
 * Send notification to Discord webhook
 * @param {Object} notification - Notification object
 */
async function sendDiscordNotification(notification) {
  try {
    const webhookUrl = WEBHOOK_CONFIG.discord.url;
    
    // Create Discord embed
    const embed = {
      title: `INEVITABLE Frame: ${notification.type}`,
      description: notification.message,
      color: getColorForNotificationType(notification.type),
      timestamp: new Date().toISOString(),
      footer: {
        text: 'INEVITABLE Frame'
      },
      fields: []
    };
    
    // Add data fields if available
    if (notification.data) {
      Object.entries(notification.data).forEach(([key, value]) => {
        if (key !== 'timestamp') {
          embed.fields.push({
            name: key,
            value: String(value),
            inline: true
          });
        }
      });
    }
    
    // Send to Discord webhook
    await axios.post(webhookUrl, {
      embeds: [embed]
    });
    
    console.log('Notification sent to Discord');
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
}

/**
 * Send notification to Telegram
 * @param {Object} notification - Notification object
 */
async function sendTelegramNotification(notification) {
  try {
    const { botToken, chatId } = WEBHOOK_CONFIG.telegram;
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // Format message for Telegram
    let message = `*INEVITABLE Frame: ${notification.type}*\n\n`;
    message += `${notification.message}\n\n`;
    
    // Add data as key-value pairs
    if (notification.data) {
      Object.entries(notification.data).forEach(([key, value]) => {
        if (key !== 'timestamp') {
          message += `*${key}*: ${value}\n`;
        }
      });
    }
    
    // Add timestamp
    message += `\n_${new Date().toISOString()}_`;
    
    // Send to Telegram
    await axios.post(telegramApiUrl, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    console.log('Notification sent to Telegram');
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
}

/**
 * Get color for notification type (for Discord embeds)
 * @param {string} type - Notification type
 * @returns {number} - Discord color code
 */
function getColorForNotificationType(type) {
  // Discord colors (decimal values)
  const colors = {
    frame_added: 3066993,       // Green
    frame_removed: 15158332,    // Red
    notifications_enabled: 3447003,  // Blue
    notifications_disabled: 10181046,  // Purple
    custom_notification: 15844367,  // Yellow
    subscriber_added: 3066993,   // Green
    subscriber_removed: 15158332,  // Red
    default: 9807270          // Gray
  };
  
  return colors[type] || colors.default;
}

// Export subscribers and functions
module.exports = {
  notificationSubscribers,
  addSubscriber,
  removeSubscriber,
  sendExternalPlatformNotification
};