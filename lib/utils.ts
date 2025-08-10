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

// Registration data management utilities
export const RegistrationDataManager = {
  // Store registration data for auto-filling in onboarding
  storeRegistrationData: (data: {
    role: string;
    fullName: string;
    email: string;
    guardianName?: string;
    classGrade?: string;
    language?: string;
    location?: string;
    timestamp: string;
  }) => {
    try {
      localStorage.setItem('registrationData', JSON.stringify(data));
      console.log('🔍 Registration data stored:', data);
    } catch (error) {
      console.error('Error storing registration data:', error);
    }
  },

  // Get stored registration data
  getRegistrationData: () => {
    try {
      const data = localStorage.getItem('registrationData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving registration data:', error);
      return null;
    }
  },

  // Clear stored registration data (call after successful onboarding)
  clearRegistrationData: () => {
    try {
      localStorage.removeItem('registrationData');
      console.log('🔍 Registration data cleared');
    } catch (error) {
      console.error('Error clearing registration data:', error);
    }
  },

  // Check if registration data exists and is recent (within 1 hour)
  isRegistrationDataValid: () => {
    try {
      const data = localStorage.getItem('registrationData');
      if (!data) return false;
      
      const parsedData = JSON.parse(data);
      const timestamp = new Date(parsedData.timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
      
      return diffInHours < 1; // Data is valid for 1 hour
    } catch (error) {
      console.error('Error checking registration data validity:', error);
      return false;
    }
  }
};

 