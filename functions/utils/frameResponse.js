/**
 * Helper utility to create Farcaster Frame responses
 */

/**
 * Create a Farcaster Frame response
 * @param {Object} options - Frame options
 * @param {string} options.imageUrl - Image URL to display
 * @param {Array<Object>} options.buttons - Array of button objects
 * @param {string} options.text - Text input placeholder (optional)
 * @returns {Object} Frame response object
 */
function createFrameResponse({ imageUrl, buttons = [], text = null }) {
  // Basic frame metadata
  const frameMetadata = {
    version: "vNext",
    imageUrl,
    button: {
      title: buttons[0]?.title || 'View',
      action: {
        type: 'post_redirect',
        url: 'https://epicdylan.com/getinevitable'
      }
    }
  };

  // Add multiple buttons if provided
  if (buttons.length > 1) {
    frameMetadata.buttons = buttons.map(button => ({
      title: button.title,
      action: button.action
    }));
    delete frameMetadata.button;
  }

  // Add text input if provided
  if (text) {
    frameMetadata.textInput = {
      placeholder: text
    };
  }

  // Convert to string for the meta tag
  const frameMetadataString = JSON.stringify(frameMetadata);

  // HTML response with frame metadata
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>INEVITABLE: Distributed Cognition & Network Superintelligence</title>
  <meta property="og:title" content="INEVITABLE: Distributed Cognition & Network Superintelligence">
  <meta property="og:image" content="${imageUrl}">
  <meta property="fc:frame" content="${frameMetadataString}">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:button:1" content="${buttons[0]?.title || 'View'}">
  ${buttons[1] ? `<meta property="fc:frame:button:2" content="${buttons[1].title}">` : ''}
  ${buttons[2] ? `<meta property="fc:frame:button:3" content="${buttons[2].title}">` : ''}
  ${buttons[3] ? `<meta property="fc:frame:button:4" content="${buttons[3].title}">` : ''}
  ${text ? `<meta property="fc:frame:input:text" content="${text}">` : ''}
</head>
<body>
  <h1>INEVITABLE: Distributed Cognition & Network Superintelligence</h1>
  <p>A Farcaster Frame for the NFT Book</p>
</body>
</html>
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html,
  };
}

/**
 * Create a redirect response for frame
 * @param {string} url - URL to redirect to
 * @returns {Object} Redirect response
 */
function createRedirectResponse(url) {
  return {
    statusCode: 302,
    headers: {
      'Location': url,
    },
    body: '',
  };
}

module.exports = {
  createFrameResponse,
  createRedirectResponse
};