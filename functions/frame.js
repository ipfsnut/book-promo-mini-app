const { Handler } = require('@netlify/functions');
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
  console.log('Handling frame request');
  
  // Parse URL parameters and post data
  const params = event.queryStringParameters || {};
  const frameState = params.state || 'initial';
  const action = params.action || '';

  // Handle special actions
  if (action === 'launch_app') {
    // Redirect to the mini-app with context
    return createRedirectResponse('/app?from=mini-app');
  }

  // Handle different frame states
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
    const imageUrl = collectionInfo.image || 'https://placekitten.com/800/480'; // Fallback image
    
    // Create buttons for the initial frame
    const buttons = [
      {
        title: '📚 Book Details',
        action: {
          type: 'link', 
          action: '/?state=book-details'
        }
      },
      {
        title: '💰 $NSI Price',
        action: {
          type: 'link',
          action: '/?state=token-price'
        }
      },
      {
        title: '🌟 Open Mini-App',
        action: {
          type: 'link',
          action: '/?action=launch_app'
        }
      },
      {
        title: '🗣️ Community',
        action: {
          type: 'link',
          action: '/?state=nounspace-redirect'
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
      imageUrl: 'https://placekitten.com/800/480',
      buttons: [
        {
          title: 'Read INEVITABLE',
          action: {
            type: 'link',
            action: LINKS.PERSONAL_SITE
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
          type: 'link',
          action: '/?state=initial'
        }
      },
      {
        title: '📖 Read Now',
        action: {
          type: 'link',
          action: '/?state=alexandria-redirect'
        }
      },
      {
        title: '🌐 Website',
        action: {
          type: 'link',
          action: '/?state=personal-site-redirect'
        }
      },
      {
        title: '💬 Community',
        action: {
          type: 'link',
          action: '/?state=nounspace-redirect'
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
      imageUrl: 'https://placekitten.com/800/480',
      buttons: [
        {
          title: '← Back',
          action: {
            type: 'link',
            action: '/?state=initial'
          }
        },
        {
          title: 'Read INEVITABLE',
          action: {
            type: 'link',
            action: LINKS.PERSONAL_SITE
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
          type: 'link',
          action: '/?state=initial'
        }
      },
      {
        title: `${formattedPrice} ${priceDirection} ${Math.abs(priceChange)}%`,
        action: {
          type: 'link',
          action: '/?state=token-price' // Refresh price data
        }
      },
      {
        title: '💸 Buy $NSI',
        action: {
          type: 'link',
          action: 'https://app.baseswap.fi/swap'
        }
      },
      {
        title: '💬 Community',
        action: {
          type: 'link',
          action: '/?state=nounspace-redirect'
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
      imageUrl: 'https://placekitten.com/800/480',
      buttons: [
        {
          title: '← Back',
          action: {
            type: 'link',
            action: '/?state=initial'
          }
        },
        {
          title: 'Join Community',
          action: {
            type: 'link',
            action: LINKS.NOUNSPACE
          }
        }
      ]
    });
  }
}

// Export the handler function
exports.handler = Handler(handleFrame);