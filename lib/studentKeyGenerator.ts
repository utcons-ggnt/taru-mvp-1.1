import crypto from 'crypto';

/**
 * Centralized student key generator to ensure consistency across the system
 * All student uniqueId values should be generated using this utility
 */

export interface StudentKeyOptions {
  prefix?: string;
  length?: number;
  useTimestamp?: boolean;
}

export class StudentKeyGenerator {
  private static readonly DEFAULT_PREFIX = 'STU';
  private static readonly DEFAULT_LENGTH = 12;
  private static readonly TIMESTAMP_LENGTH = 8;
  
  /**
   * Generate a unique student ID that is consistent across the system
   * @param options Configuration options for key generation
   * @returns A unique student identifier
   */
  static generate(options: StudentKeyOptions = {}): string {
    const {
      prefix = this.DEFAULT_PREFIX,
      length = this.DEFAULT_LENGTH,
      useTimestamp = true
    } = options;

    let key = prefix;
    
    if (useTimestamp) {
      // Add timestamp component for uniqueness
      const timestamp = Date.now().toString(36).toUpperCase();
      key += timestamp.slice(-this.TIMESTAMP_LENGTH);
    }
    
    // Add random component to ensure uniqueness
    const randomLength = length - key.length;
    if (randomLength > 0) {
      const randomBytes = crypto.randomBytes(Math.ceil(randomLength / 2));
      const randomHex = randomBytes.toString('hex').toUpperCase();
      key += randomHex.slice(0, randomLength);
    }
    
    return key;
  }

  /**
   * Generate a deterministic student ID based on user data
   * Useful for testing and consistent demo data
   * @param userId MongoDB ObjectId or string identifier
   * @param fullName Student's full name
   * @returns A deterministic student identifier
   */
  static generateDeterministic(userId: string, fullName: string): string {
    const prefix = this.DEFAULT_PREFIX;
    
    // Create a hash from userId and name for consistency
    const hash = crypto.createHash('md5')
      .update(userId + fullName.toLowerCase())
      .digest('hex')
      .toUpperCase();
    
    // Take first 8 characters of hash + first 4 characters of name
    const hashPart = hash.slice(0, 8);
    const namePart = fullName.replace(/[^A-Z]/gi, '').slice(0, 4).toUpperCase();
    
    return `${prefix}${hashPart}${namePart}`;
  }

  /**
   * Validate if a student key follows the correct format
   * @param key The student key to validate
   * @returns True if valid, false otherwise
   */
  static validate(key: string): boolean {
    if (!key || typeof key !== 'string') return false;
    
    // Must start with STU prefix
    if (!key.startsWith('STU')) return false;
    
    // Must be at least 8 characters long
    if (key.length < 8) return false;
    
    // Must contain only alphanumeric characters
    if (!/^STU[A-Z0-9]+$/.test(key)) return false;
    
    return true;
  }

  /**
   * Extract information from a student key
   * @param key The student key to analyze
   * @returns Object with key information
   */
  static parse(key: string): {
    prefix: string;
    timestamp?: number;
    randomPart: string;
    isValid: boolean;
  } {
    const result = {
      prefix: '',
      timestamp: undefined as number | undefined,
      randomPart: '',
      isValid: false
    };

    if (!this.validate(key)) {
      return result;
    }

    result.prefix = key.slice(0, 3); // STU
    result.isValid = true;

    // Try to extract timestamp if present
    if (key.length >= 11) {
      const timestampPart = key.slice(3, 11);
      try {
        const timestamp = parseInt(timestampPart, 36);
        if (!isNaN(timestamp) && timestamp > 0) {
          result.timestamp = timestamp;
          result.randomPart = key.slice(11);
        } else {
          result.randomPart = key.slice(3);
        }
      } catch {
        result.randomPart = key.slice(3);
      }
    } else {
      result.randomPart = key.slice(3);
    }

    return result;
  }
}

// Export default instance for convenience
export default StudentKeyGenerator;
