const bcrypt = require("bcryptjs");
const md5 = require("md5");

module.exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports.comparePassword = async (password, storedHash) => {
  if (!password || !storedHash) return false;
  // If storedHash is in bcrypt format
  if (
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$")
  ) {
    return await bcrypt.compare(password, storedHash);
  }
  // Backward compatibility fallback for legacy MD5 passwords
  return md5(password) === storedHash;
};

module.exports.isBcryptHash = (hash) => {
  return (
    typeof hash === "string" &&
    (hash.startsWith("$2a$") ||
      hash.startsWith("$2b$") ||
      hash.startsWith("$2y$"))
  );
};
