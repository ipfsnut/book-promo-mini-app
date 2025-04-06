const axios = require('axios');

/**
 * Send a notification to Frame users
 * 
 * @param {Object} options - Notification options
 * @param {string} options.notificationUrl - URL to send notification to
 * @param {string} options.token - Authentication token
 * @param {string} options.notificationId - Unique ID for the notification
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {string} options.targetUrl - URL to open when notification is clicked
 * @returns {Promise<Object>} Response data
 */
async function sendNotification({
  notificationUrl,
  token,
  notificationId,
  title,
  body,
  targetUrl
}) {
  try {
    console.log(`Sending notification: ${title}`);
    
    // Prepare the notification payload
    const payload = {
      notificationId,
      title,
      body,
      targetUrl,
      tokens: [token]
    };
    
    // Send the notification
    const response = await axios.post(notificationUrl, payload);
    
    console.log('Notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error.message);
    throw error;
  }
}

/**
 * Send a book update notification
 * 
 * @param {Object} notificationDetails - Notification details from webhook
 * @param {Object} bookInfo - Book information
 * @returns {Promise<Object>} Response data
 */
async function sendBookUpdateNotification(notificationDetails, bookInfo) {
  return sendNotification({
    notificationUrl: notificationDetails.url,
    token: notificationDetails.token,
    notificationId: `book-update-${Date.now()}`,
    title: 'INEVITABLE Book Update',
    body: `New content available: ${bookInfo.title}`,
    targetUrl: 'https://inevitable-frame.netlify.app/frame?state=book-details'
  });
}

/**
 * Send a token price alert notification
 * 
 * @param {Object} notificationDetails - Notification details from webhook
 * @param {Object} tokenData - Token price data
 * @param {string} alertType - Type of alert ('price-up', 'price-down', etc.)
 * @returns {Promise<Object>} Response data
 */
async function sendTokenPriceNotification(notificationDetails, tokenData, alertType) {
  let title = 'NSI Token Alert';
  let body = `Current price: $${parseFloat(tokenData.price).toFixed(8)}`;
  
  if (alertType === 'price-up') {
    title = '🚀 NSI Price Rising!';
    body = `Price up ${Math.abs(parseFloat(tokenData.priceChange24h)).toFixed(2)}% in 24h`;
  } else if (alertType === 'price-down') {
    title = '📉 NSI Price Falling';
    body = `Price down ${Math.abs(parseFloat(tokenData.priceChange24h)).toFixed(2)}% in 24h`;
  }
  
  return sendNotification({
    notificationUrl: notificationDetails.url,
    token: notificationDetails.token,
    notificationId: `token-price-${alertType}-${Date.now()}`,
    title,
    body,
    targetUrl: 'https://inevitable-frame.netlify.app/frame?state=token-price'
  });
}

module.exports = {
  sendNotification,
  sendBookUpdateNotification,
  sendTokenPriceNotification
};