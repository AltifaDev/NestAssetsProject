/**
 * Utility functions for logging with sensitive data masking
 */

/**
 * Mask email addresses in strings
 * Example: user@example.com -> u***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return email;
  }

  const emailRegex = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  return email.replace(emailRegex, (match, username, domain) => {
    if (username.length <= 1) {
      return `*@${domain}`;
    }
    return `${username[0]}***@${domain}`;
  });
}

/**
 * Mask phone numbers in strings
 * Example: 0812345678 -> 081***5678
 * Example: +66812345678 -> +6681***5678
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }

  // Match various phone number formats
  const phoneRegex = /(\+?\d{1,3})?[\s.-]?\(?\d{2,3}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
  return phone.replace(phoneRegex, (match) => {
    // Keep first 3-4 digits and last 4 digits, mask the middle
    const cleaned = match.replace(/[\s.-]/g, '');
    if (cleaned.length <= 6) {
      return '***' + cleaned.slice(-2);
    }
    const prefix = cleaned.slice(0, Math.min(4, cleaned.length - 4));
    const suffix = cleaned.slice(-4);
    return prefix + '***' + suffix;
  });
}

/**
 * Mask sensitive data in objects
 */
export function maskSensitiveData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    let masked = data;
    masked = maskEmail(masked);
    masked = maskPhoneNumber(masked);
    return masked;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (typeof data === 'object') {
    const masked: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // Always mask these fields completely
        if (
          key === 'password' ||
          key === 'password_hash' ||
          key === 'token' ||
          key === 'access_token' ||
          key === 'refresh_token'
        ) {
          masked[key] = '***REDACTED***';
        } else if (key === 'email' && typeof data[key] === 'string') {
          masked[key] = maskEmail(data[key]);
        } else if (
          (key === 'phone' || key === 'customer_phone') &&
          typeof data[key] === 'string'
        ) {
          masked[key] = maskPhoneNumber(data[key]);
        } else {
          masked[key] = maskSensitiveData(data[key]);
        }
      }
    }
    return masked;
  }

  return data;
}

/**
 * Create a logger that automatically masks sensitive data
 */
export function createMaskedLogger(logger: any) {
  return {
    log: (message: string, data?: any) => {
      logger.log(message, data ? maskSensitiveData(data) : undefined);
    },
    error: (message: string, data?: any) => {
      logger.error(message, data ? maskSensitiveData(data) : undefined);
    },
    warn: (message: string, data?: any) => {
      logger.warn(message, data ? maskSensitiveData(data) : undefined);
    },
    debug: (message: string, data?: any) => {
      logger.debug(message, data ? maskSensitiveData(data) : undefined);
    },
    verbose: (message: string, data?: any) => {
      logger.verbose(message, data ? maskSensitiveData(data) : undefined);
    },
  };
}
