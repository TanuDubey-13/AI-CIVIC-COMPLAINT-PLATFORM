const crypto = require("crypto");

/**
 * Generate a secure reset token and a hashed version for storage.
 *
 * The raw token is returned so it can be sent to the user via email.
 * The hashed token is stored in the database so the original value is never persisted.
 * This protects the application if the database is ever compromised.
 *
 * @returns {{ resetToken: string, hashedToken: string }}
 */
function generateResetToken() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  return {
    resetToken,
    hashedToken,
  };
}

module.exports = {
  generateResetToken,
};
