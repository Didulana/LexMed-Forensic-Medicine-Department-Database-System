const xss = require('xss');

/**
 * Sanitizes a given string to prevent XSS.
 * Returns null/undefined if the input is null/undefined.
 */
const sanitize = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};

/**
 * Sanitizes specific keys in an object.
 */
const sanitizeObject = (obj, keys = []) => {
  if (!obj) return obj;
  const sanitized = { ...obj };
  for (const key of keys) {
    if (sanitized[key]) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  return sanitized;
};

module.exports = {
  sanitize,
  sanitizeObject
};
