const { Handler } = require('@netlify/functions');
const { addSubscriber, removeSubscriber } = require('./cron');

/**
 * Farcaster Frame webhook handler for notifications and other events
 */
exports.handler = Handler(async (event) => {
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
});

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
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}