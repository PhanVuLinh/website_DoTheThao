// Helper to escape special regex characters to prevent ReDoS & Regex Injection
module.exports.escapeRegex = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
