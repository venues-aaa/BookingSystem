/**
 * Image Utilities
 *
 * Handles image extraction from dynamic item data and provides
 * category-specific default images when no image is uploaded.
 */

/**
 * Default images for each category type
 * High-quality placeholder images from Unsplash
 */
const DEFAULT_IMAGES = {
  hall: 'https://images.unsplash.com/photo-1519167758481-83f29da8f969?w=1200&q=80', // Event hall
  catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80', // Food catering
  decoration: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80', // Decoration/flowers
  floral: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80', // Flowers
  photography: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80', // Photography
  music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80', // Music/DJ
  venue: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80', // Venue
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', // Hotel
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80', // Restaurant
  default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80' // Generic event
};

/**
 * Common field patterns for image URLs in dynamicData
 * Ordered by priority - checks these patterns in order
 */
const IMAGE_FIELD_PATTERNS = [
  'image',
  'imageUrl',
  'image_url',
  'mainImage',
  'main_image',
  'photo',
  'photoUrl',
  'photo_url',
  'picture',
  'pictureUrl',
  'picture_url',
  'thumbnail',
  'thumbnailUrl',
  'thumbnail_url',
  // Category-specific patterns
  'field_hall_image',
  'hall_image',
  'restaurant_image',
  'venue_image',
  'decoration_image',
  'floral_image'
];

/**
 * Extract image URL from item's dynamicData
 *
 * Searches through common image field patterns to find an uploaded image.
 * Returns null if no image found.
 *
 * @param {Object} dynamicData - Item's dynamic data map
 * @returns {string|null} Image URL or null
 */
export const extractImageFromDynamicData = (dynamicData) => {
  if (!dynamicData || typeof dynamicData !== 'object') {
    return null;
  }

  // Try exact matches first (case-sensitive)
  for (const pattern of IMAGE_FIELD_PATTERNS) {
    if (dynamicData[pattern] && typeof dynamicData[pattern] === 'string' && dynamicData[pattern].trim()) {
      return dynamicData[pattern].trim();
    }
  }

  // Try case-insensitive match
  const lowerKeys = Object.keys(dynamicData).map(k => k.toLowerCase());
  for (const pattern of IMAGE_FIELD_PATTERNS) {
    const lowerPattern = pattern.toLowerCase();
    const matchIndex = lowerKeys.findIndex(k => k.includes(lowerPattern));

    if (matchIndex !== -1) {
      const actualKey = Object.keys(dynamicData)[matchIndex];
      const value = dynamicData[actualKey];

      if (value && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }

  return null;
};

/**
 * Get default image for a category type
 *
 * Maps category names (case-insensitive) to appropriate default images.
 *
 * @param {string} categoryType - Category name or type (e.g., "Hall", "Catering")
 * @returns {string} Default image URL
 */
export const getDefaultImageForCategory = (categoryType) => {
  if (!categoryType) {
    return DEFAULT_IMAGES.default;
  }

  const lowerType = categoryType.toLowerCase();

  // Direct matches
  if (DEFAULT_IMAGES[lowerType]) {
    return DEFAULT_IMAGES[lowerType];
  }

  // Partial matches
  if (lowerType.includes('hall') || lowerType.includes('event')) {
    return DEFAULT_IMAGES.hall;
  }
  if (lowerType.includes('cater') || lowerType.includes('food')) {
    return DEFAULT_IMAGES.catering;
  }
  if (lowerType.includes('decor') || lowerType.includes('decoration')) {
    return DEFAULT_IMAGES.decoration;
  }
  if (lowerType.includes('floral') || lowerType.includes('flower')) {
    return DEFAULT_IMAGES.floral;
  }
  if (lowerType.includes('photo') || lowerType.includes('picture')) {
    return DEFAULT_IMAGES.photography;
  }
  if (lowerType.includes('music') || lowerType.includes('dj') || lowerType.includes('band')) {
    return DEFAULT_IMAGES.music;
  }
  if (lowerType.includes('venue') || lowerType.includes('space')) {
    return DEFAULT_IMAGES.venue;
  }
  if (lowerType.includes('hotel') || lowerType.includes('resort')) {
    return DEFAULT_IMAGES.hotel;
  }
  if (lowerType.includes('restaurant') || lowerType.includes('dining')) {
    return DEFAULT_IMAGES.restaurant;
  }

  return DEFAULT_IMAGES.default;
};

/**
 * Get item image with automatic fallback to category default
 *
 * This is the main function to use for displaying item images.
 *
 * Priority:
 * 1. Uploaded image from dynamicData
 * 2. Legacy imageUrl field
 * 3. Legacy images array (first image)
 * 4. Category-specific default image
 *
 * @param {Object} item - Item object with dynamicData, imageUrl, images, type
 * @returns {string} Image URL (uploaded or default)
 */
export const getItemImage = (item) => {
  if (!item) {
    return DEFAULT_IMAGES.default;
  }

  // 1. Check dynamicData for uploaded image
  if (item.dynamicData) {
    const uploadedImage = extractImageFromDynamicData(item.dynamicData);
    if (uploadedImage) {
      return uploadedImage;
    }
  }

  // 2. Check legacy imageUrl field
  if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim()) {
    return item.imageUrl.trim();
  }

  // 3. Check legacy images array
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    const firstImage = item.images[0];

    // Handle different image object structures
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    if (firstImage && firstImage.url) {
      return firstImage.url;
    }
    if (firstImage && firstImage.imageUrl) {
      return firstImage.imageUrl;
    }
  }

  // 4. Fallback to category-specific default image
  return getDefaultImageForCategory(item.type);
};

/**
 * Get multiple images for an item (for galleries)
 *
 * @param {Object} item - Item object
 * @param {number} maxImages - Maximum number of images to return
 * @returns {Array<string>} Array of image URLs
 */
export const getItemImages = (item, maxImages = 5) => {
  const imageUrls = [];

  // Extract all possible images
  if (item.dynamicData) {
    const uploadedImage = extractImageFromDynamicData(item.dynamicData);
    if (uploadedImage) {
      imageUrls.push(uploadedImage);
    }
  }

  if (item.images && Array.isArray(item.images)) {
    item.images.forEach(img => {
      let url = null;
      if (typeof img === 'string') {
        url = img;
      } else if (img && img.url) {
        url = img.url;
      } else if (img && img.imageUrl) {
        url = img.imageUrl;
      }

      if (url && !imageUrls.includes(url)) {
        imageUrls.push(url);
      }
    });
  }

  // If no images found, use default
  if (imageUrls.length === 0) {
    imageUrls.push(getDefaultImageForCategory(item.type));
  }

  return imageUrls.slice(0, maxImages);
};

/**
 * Validate if a string is a valid image URL
 *
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check if it's a valid URL
  try {
    new URL(url);
  } catch {
    return false;
  }

  // Check for common image extensions or CDN patterns
  const imagePattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
  const cdnPattern = /(unsplash|cloudinary|imgix|amazonaws|googleusercontent)/i;

  return imagePattern.test(url) || cdnPattern.test(url);
};

export default {
  getItemImage,
  getItemImages,
  extractImageFromDynamicData,
  getDefaultImageForCategory,
  isValidImageUrl
};
