// Import dependencies correctly
const { createFrameResponse, createRedirectResponse } = require('./utils/frameResponse');
const { fetchBookMetadata, getBookCollectionInfo } = require('./utils/bookMetadata');
const { fetchNSITokenData } = require('./utils/tokenPrice');
const { generateTokenPriceImage, generateBookDetailsImage } = require('./utils/imageGenerator');

// Define external links
const LINKS = {
  ALEXANDRIA: 'https://www.alexandriabooks.com/collection/inevitable',
  PERSONAL_SITE: 'https://epicdylan.com/getinevitable',
  NOUNSPACE: 'https://www.nounspace.com/t/base/0x1696688A7828E227E64953C371aC0B57d5974B55/Profile'
};

/**
 * Main frame handler function
 */
async function handleFrame(event) {
  console.log('Handling frame request', event.httpMethod);
  
  // Check if we're handling a GET or POST request
  if (event.httpMethod === 'POST') {
    // Parse the POST body for frame data
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
      console.log('Frame payload:', payload);
    } catch (error) {
      console.error('Error parsing payload:', error);
      payload = {};
    }
    
    // Get the button index that was pressed (1-based)
    const buttonIndex = payload.untrustedData?.buttonIndex || 0;
    
    // Determine the state based on the button index
    // This needs to match the order of buttons in your initial frame
    const states = ['book-details', 'token-price', 'launch_app', 'nounspace-redirect'];
    const frameState = buttonIndex > 0 && buttonIndex <= states.length 
      ? states[buttonIndex - 1] 
      : 'initial';
    
    // If we have a launch_app state, handle it as a special action
    if (frameState === 'launch_app') {
      return createRedirectResponse('/app?from=mini-app');
    }
    
    // Handle the state as normal
    return handleFrameState(frameState);
  } else {
    // For GET requests, use query parameters
    const params = event.queryStringParameters || {};
    const frameState = params.state || 'initial';
    const action = params.action || '';
    
    // Handle special actions
    if (action === 'launch_app') {
      return createRedirectResponse('/app?from=mini-app');
    }
    
    // Handle the state
    return handleFrameState(frameState);
  }
}

/**
 * Handle a specific frame state
 * @param {string} frameState - The state to handle
 */
async function handleFrameState(frameState) {
  switch (frameState) {
    case 'book-details':
      return handleBookDetails();
    case 'token-price':
      return handleTokenPrice();
    case 'alexandria-redirect':
      return createRedirectResponse(LINKS.ALEXANDRIA);
    case 'personal-site-redirect':
      return createRedirectResponse(LINKS.PERSONAL_SITE);
    case 'nounspace-redirect':
      return createRedirectResponse(LINKS.NOUNSPACE);
    case 'initial':
    default:
      return handleInitialFrame();
  }
}

/**
 * Handle the initial frame view
 */
async function handleInitialFrame() {
  try {
    // Fetch book collection info
    const collectionInfo = await getBookCollectionInfo();
    
    // Get the book cover image
    const imageUrl = collectionInfo.image || 'https://epicdylan.com/inevitable-cover.jpg'; // Fallback image
    
    // Create buttons for the initial frame
    const buttons = [
      {
        title: '📚 Book Details',
        action: {
          type: 'post',
          // No url needed for POST to this endpoint
        }
      },
      {
        title: '💰 $NSI Price',
        action: {
          type: 'post',
          // No url needed for POST to this endpoint
        }
      },
      {
        title: '🌟 Open Mini-App',
        action: {
          type: 'post',
          // No url needed for POST to this endpoint
        }
      },
      {
        title: '🗣️ Community',
        action: {
          type: 'post',
          // No url needed for POST to this endpoint
        }
      }
    ];
    
    return createFrameResponse({
      imageUrl,
      buttons
    });
  } catch (error) {
    console.error('Error in initial frame:', error);
    
    // Fallback response
    return createFrameResponse({
      imageUrl: 'https://epicdylan.com/inevitable-cover.jpg',
      buttons: [
        {
          title: 'Read INEVITABLE',
          action: {
            type: 'post_redirect',
            url: LINKS.PERSONAL_SITE
          }
        }
      ]
    });
  }
}

/**
 * Handle the book details frame
 */
async function handleBookDetails() {
  try {
    // Fetch book metadata
    const bookMetadata = await fetchBookMetadata();
    
    // Generate a custom image with book details
    const imageUrl = generateBookDetailsImage(bookMetadata);
    
    // Create buttons for book details frame
    const buttons = [
      {
        title: '← Back',
        action: {
          type: 'post',
          // This will trigger a new POST to our endpoint
        }
      },
      {
        title: '📖 Read Now',
        action: {
          type: 'post_redirect',
          url: LINKS.ALEXANDRIA
        }
      },
      {
        title: '🌐 Website',
        action: {
          type: 'post_redirect',
          url: LINKS.PERSONAL_SITE
        }
      },
      {
        title: '💬 Community',
        action: {
          type: 'post_redirect',
          url: LINKS.NOUNSPACE
        }
      }
    ];
    
    return createFrameResponse({
      imageUrl,
      buttons
    });
  } catch (error) {
    console.error('Error in book details frame:', error);
    
    // Fallback response
    return createFrameResponse({
      imageUrl: 'https://epicdylan.com/inevitable-cover.jpg',
      buttons: [
        {
          title: '← Back',
          action: {
            type: 'post',
          }
        },
        {
          title: 'Read INEVITABLE',
          action: {
            type: 'post_redirect',
            url: LINKS.PERSONAL_SITE
          }
        }
      ]
    });
  }
}

/**
 * Handle the token price frame
 */
async function handleTokenPrice() {
  try {
    // Fetch NSI token data
    const tokenData = await fetchNSITokenData();
    
    // Generate a dynamic image with token price data
    const imageUrl = generateTokenPriceImage(tokenData);
    
    // Format price data for display
    const formattedPrice = parseFloat(tokenData.price).toFixed(8);
    const priceChange = parseFloat(tokenData.priceChange24h).toFixed(2);
    const priceDirection = parseFloat(tokenData.priceChange24h) >= 0 ? '▲' : '▼';
    
    // Create buttons for token price frame
    const buttons = [
      {
        title: '← Back',
        action: {
          type: 'post',
        }
      },
      {
        title: `$${formattedPrice} ${priceDirection} ${Math.abs(priceChange)}%`,
        action: {
          type: 'post',
        }
      },
      {
        title: '💸 Buy $NSI',
        action: {
          type: 'post_redirect',
          url: 'https://app.baseswap.fi/swap'
        }
      },
      {
        title: '💬 Community',
        action: {
          type: 'post_redirect',
          url: LINKS.NOUNSPACE
        }
      }
    ];
    
    return createFrameResponse({
      imageUrl,
      buttons
    });
  } catch (error) {
    console.error('Error in token price frame:', error);
    
    // Fallback response
    return createFrameResponse({
      imageUrl: 'https://epicdylan.com/inevitable-cover.jpg',
      buttons: [
        {
          title: '← Back',
          action: {
            type: 'post',
          }
        },
        {
          title: 'Join Community',
          action: {
            type: 'post_redirect',
            url: LINKS.NOUNSPACE
          }
        }
      ]
    });
  }
}

// Export the handler function
exports.handler = async (event) => {
  return await handleFrame(event);
};