/**
 * Utility for optimizing image URLs for Farcaster Frames
 * 
 * Note: In a production app, you would have actual image 
 * processing, but this is a simple URL parameter based approach
 */

/**
 * Add optimization parameters to an image URL
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized image URL
 */
function optimizeImageUrl(imageUrl, options = {}) {
    try {
      // Default options
      const defaults = {
        width: 800,
        height: 480,
        quality: 90,
        format: 'webp'
      };
      
      // Merge defaults with provided options
      const settings = { ...defaults, ...options };
      
      // If URL already has query parameters, add optimization params
      if (imageUrl.includes('?')) {
        return `${imageUrl}&width=${settings.width}&height=${settings.height}&quality=${settings.quality}&format=${settings.format}`;
      } else {
        return `${imageUrl}?width=${settings.width}&height=${settings.height}&quality=${settings.quality}&format=${settings.format}`;
      }
    } catch (error) {
      console.error('Error optimizing image URL:', error);
      
      // Return original URL if optimization fails
      return imageUrl;
    }
  }
  
  /**
   * Make sure the image URL has the correct aspect ratio (3:2) for Frames
   * @param {string} imageUrl - Original image URL
   * @returns {string} Optimized image URL with correct aspect ratio
   */
  function ensureFrameAspectRatio(imageUrl) {
    return optimizeImageUrl(imageUrl, {
      width: 800,
      height: 533, // 3:2 aspect ratio (800 × 2/3)
      quality: 90
    });
  }
  
  module.exports = {
    optimizeImageUrl,
    ensureFrameAspectRatio
  };