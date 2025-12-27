/**
 * Validate slug format and length
 * @param slug Slug to validate
 * @returns Error message or null if valid
 */
export function validateSlug(slug: string): string | null {
  if (!slug) return 'Slug is required';
  if (slug.length < 2) return 'Slug must be at least 2 characters';
  if (slug.length > 50) return 'Slug must not exceed 50 characters';
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return 'Slug must contain only lowercase letters, numbers, and hyphens';
  }
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return 'Slug cannot start or end with a hyphen';
  }
  return null;
}

/**
 * Convert title to URL-safe slug
 * @param title Title to convert
 * @returns Generated slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate meta description length
 * @param description Meta description
 * @returns Error message or null if valid
 */
export function validateMetaDescription(description: string): string | null {
  if (!description) return 'Meta description is required';
  if (description.length < 20) return 'Meta description must be at least 20 characters';
  if (description.length > 160) return 'Meta description must not exceed 160 characters';
  return null;
}

/**
 * Validate URL format
 * @param url URL to validate
 * @returns Error message or null if valid
 */
export function validateUrl(url: string): string | null {
  if (!url) return null; // Optional field
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL format';
  }
}

/**
 * Validate OG image URL
 * @param imageUrl Image URL to validate
 * @returns Error message or null if valid
 */
export function validateOgImage(imageUrl: string): string | null {
  if (!imageUrl) return 'Featured image URL is required';
  const error = validateUrl(imageUrl);
  if (error) return 'Featured image URL must be valid';
  
  // Check if URL ends with common image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExt = validExtensions.some(ext => imageUrl.toLowerCase().endsWith(ext));
  
  if (!hasValidExt && !imageUrl.includes('firebaseapp.com') && !imageUrl.includes('firebase.google.com')) {
    return 'Image URL should be a direct image file (jpg, png, gif, webp) or Firebase URL';
  }
  
  return null;
}

/**
 * Validate HTML content
 * @param html HTML content to validate
 * @returns Error message or null if valid
 */
export function validateHtmlContent(html: string): string | null {
  if (!html) return 'HTML content is required';
  const trimmed = html.trim();
  if (trimmed.length < 10) return 'HTML content must be at least 10 characters';
  if (trimmed.length > 1000000) return 'HTML content exceeds maximum size';
  return null;
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns Error message or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email) return null; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
}

/**
 * Validate phone number format (basic)
 * @param phone Phone number to validate
 * @returns Error message or null if valid
 */
export function validatePhone(phone: string): string | null {
  if (!phone) return null; // Optional field
  if (phone.length < 7) return 'Phone number must be at least 7 digits';
  if (phone.length > 20) return 'Phone number must not exceed 20 characters';
  return null;
}

/**
 * Validate required text field
 * @param value Value to validate
 * @param fieldName Name of field for error message
 * @returns Error message or null if valid
 */
export function validateRequired(value: string, fieldName: string = 'Field'): string | null {
  if (!value || !value.trim()) return `${fieldName} is required`;
  if (value.length > 500) return `${fieldName} must not exceed 500 characters`;
  return null;
}

/**
 * Validate all landing page form data
 * @param data Form data
 * @returns Object with field errors or empty object if valid
 */
export function validateLandingPageForm(data: {
  businessName: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  businessCategory: string;
  businessLocation: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  htmlContent: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Required fields
  if (error := validateRequired(data.businessName, 'Business name')) {
    errors.businessName = error;
  }
  if (error := validateSlug(data.slug)) {
    errors.slug = error;
  }
  if (error := validateRequired(data.metaTitle, 'Meta title')) {
    errors.metaTitle = error;
  }
  if (error := validateMetaDescription(data.metaDescription)) {
    errors.metaDescription = error;
  }
  if (error := validateRequired(data.ogTitle, 'OG title')) {
    errors.ogTitle = error;
  }
  if (error := validateRequired(data.ogDescription, 'OG description')) {
    errors.ogDescription = error;
  }
  if (error := validateOgImage(data.ogImage)) {
    errors.ogImage = error;
  }
  if (error := validateRequired(data.businessCategory, 'Business category')) {
    errors.businessCategory = error;
  }
  if (error := validateRequired(data.businessLocation, 'Business location')) {
    errors.businessLocation = error;
  }
  if (error := validateHtmlContent(data.htmlContent)) {
    errors.htmlContent = error;
  }

  // Optional fields
  if (data.businessPhone && (error := validatePhone(data.businessPhone))) {
    errors.businessPhone = error;
  }
  if (data.businessEmail && (error := validateEmail(data.businessEmail))) {
    errors.businessEmail = error;
  }
  if (data.businessWebsite && (error := validateUrl(data.businessWebsite))) {
    errors.businessWebsite = error;
  }

  return errors;
}
