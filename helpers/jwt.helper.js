const jwt = require("jsonwebtoken");

module.exports.generateToken = (payload, expiresIn) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables!");
  }
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports.verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || !token) return null;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
