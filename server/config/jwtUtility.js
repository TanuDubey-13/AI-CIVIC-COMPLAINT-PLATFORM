const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for a user.
 * @param {string} userId - The user identifier to include in the token payload.
 * @returns {string} A signed JSON Web Token.
 */
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
}

module.exports = {
  generateToken,
};
