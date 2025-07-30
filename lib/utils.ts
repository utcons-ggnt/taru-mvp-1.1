/**
 * Validates if a profile picture URL is valid and should be displayed
 * @param url - The profile picture URL to validate
 * @returns true if the URL is valid, false otherwise
 */
export function isValidProfilePictureUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Check for invalid patterns
  if (url.includes('undefined') || 
      url.includes('null') || 
      url.trim() === '' || 
      url === '/avatar.png') {
    return false;
  }
  
  return true;
}

/**
 * Sanitizes a profile picture URL by filtering out invalid ones
 * @param url - The profile picture URL to sanitize
 * @returns The URL if valid, null otherwise
 */
export function sanitizeProfilePictureUrl(url: string | null | undefined): string | null {
  return isValidProfilePictureUrl(url) ? (url as string) : null;
}

 