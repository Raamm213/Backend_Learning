/**
 * Utility functions for validation
 */

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The string to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validates if a string is a valid MongoDB ObjectId and throws an error if invalid
 * @param {string} id - The string to validate
 * @param {string} fieldName - The name of the field for error message
 * @throws {Error} - Throws error if invalid ObjectId
 */
export const validateObjectId = (id, fieldName = 'ID') => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} format. Must be a valid MongoDB ObjectId`);
  }
}; 