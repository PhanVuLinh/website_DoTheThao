const slugify = require("slugify");
const Category = require("../models/category.model");

/**
 * Xóa dấu tiếng Việt, chuyển thành chữ thường không dấu
 * Ví dụ: "Giày Bóng Chuyền" -> "giay bong chuyen"
 */
const removeVietnameseAccents = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

/**
 * Escape regex special characters an toàn
 */
const escapeRegex = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Xây dựng điều kiện tìm kiếm MongoDB thông minh
 * - Hỗ trợ tìm cụm từ chính xác
 * - Hỗ trợ tách từ (Multi-token AND) bất kể thứ tự từ
 * - Hỗ trợ tiếng Việt có dấu và không dấu
 * - Hỗ trợ khớp theo Title, Slug, Brand, Description và Category
 */
const buildSmartSearchFilter = async (rawKeyword) => {
  const cleanKeyword = (rawKeyword || "").trim().replace(/\s+/g, " ");
  if (!cleanKeyword) {
    return {
      filter: null,
      tokens: [],
      cleanKeyword: "",
    };
  }

  const safeKeyword = escapeRegex(cleanKeyword);
  const phraseRegex = new RegExp(safeKeyword, "i");

  // Slug của cụm từ
  const slugKeyword = slugify(cleanKeyword, {
    lower: true,
    locale: "vi",
    strict: true,
  });
  const slugRegex = slugKeyword
    ? new RegExp(escapeRegex(slugKeyword), "i")
    : phraseRegex;

  // Tách từ khóa thành các token đơn
  const rawTokens = cleanKeyword.split(" ").filter((w) => w.trim().length > 0);
  const tokens = [];

  for (const t of rawTokens) {
    const tSafe = escapeRegex(t);
    const tSlug = slugify(t, { lower: true, locale: "vi", strict: true });
    const tNoAccent = removeVietnameseAccents(t);
    const tRegex = new RegExp(tSafe, "i");
    const tSlugRegex = tSlug ? new RegExp(escapeRegex(tSlug), "i") : tRegex;
    const tNoAccentRegex = tNoAccent ? new RegExp(escapeRegex(tNoAccent), "i") : tRegex;

    tokens.push({
      raw: t,
      safe: tSafe,
      regex: tRegex,
      slugRegex: tSlugRegex,
      noAccentRegex: tNoAccentRegex,
    });
  }

  // 1. Tìm các danh mục khớp với từ khóa để mở rộng tìm kiếm theo category_id
  let matchedCategoryIds = [];
  try {
    const matchedCategories = await Category.find({
      deleted: false,
      status: "active",
      $or: [{ title: phraseRegex }, { slug: slugRegex }],
    })
      .select("_id")
      .lean();

    matchedCategoryIds = matchedCategories.map((c) => c._id.toString());
  } catch (err) {
    console.error("Lỗi tìm category trong buildSmartSearchFilter:", err);
  }

  // 2. Tạo điều kiện khớp cho từng từ (Mỗi từ con phải khớp ở Title HOẶC Slug HOẶC Brand)
  const tokenConditions = tokens.map((tokenObj) => ({
    $or: [
      { title: tokenObj.regex },
      { slug: tokenObj.slugRegex },
      { brand: tokenObj.regex },
      { description: tokenObj.regex },
    ],
  }));

  // 3. Kết hợp điều kiện OR cấp cao nhất:
  // - Hoặc khớp nguyên cụm trong title / slug / brand
  // - Hoặc khớp TẤT CẢ các từ con (dù cách nhau từ ngữ khác)
  // - Hoặc thuộc category khớp
  const mainSearchConditions = [
    { title: phraseRegex },
    { slug: slugRegex },
    { brand: phraseRegex },
  ];

  if (tokens.length > 1) {
    mainSearchConditions.push({ $and: tokenConditions });
  }

  if (matchedCategoryIds.length > 0) {
    mainSearchConditions.push({
      category_id: { $in: matchedCategoryIds },
    });
  }

  return {
    filter: { $or: mainSearchConditions },
    tokens,
    cleanKeyword,
    phraseRegex,
    slugRegex,
  };
};

/**
 * Tính điểm độ liên quan (Relevance Scoring) để đưa sản phẩm khớp chuẩn nhất lên đầu
 */
const calculateRelevanceScore = (product, cleanKeyword, tokens = []) => {
  let score = 0;
  const title = (product.title || "").toLowerCase();
  const titleNoAccent = removeVietnameseAccents(product.title || "");
  const slug = (product.slug || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  const keywordLower = cleanKeyword.toLowerCase();
  const keywordNoAccent = removeVietnameseAccents(cleanKeyword);

  // 1. Khớp chính xác nguyên cụm từ khóa trong title
  if (title.includes(keywordLower) || titleNoAccent.includes(keywordNoAccent)) {
    score += 150;
    // Nếu tiêu đề bắt đầu bằng từ khóa -> Cực kỳ liên quan
    if (title.startsWith(keywordLower) || titleNoAccent.startsWith(keywordNoAccent)) {
      score += 80;
    }
  }

  // 2. Khớp trong brand
  if (brand.includes(keywordLower) || brand === keywordLower) {
    score += 100;
  }

  // 3. Khớp trong slug
  const slugKeyword = slugify(cleanKeyword, { lower: true, locale: "vi", strict: true });
  if (slugKeyword && slug.includes(slugKeyword)) {
    score += 60;
  }

  // 4. Khớp từng từ con (Tokens)
  let matchedTokenCount = 0;
  tokens.forEach((tObj) => {
    const tLower = tObj.raw.toLowerCase();
    const tNoAccent = removeVietnameseAccents(tObj.raw);

    let tokenMatched = false;
    if (title.includes(tLower) || titleNoAccent.includes(tNoAccent)) {
      score += 25;
      tokenMatched = true;
    }
    if (brand.includes(tLower)) {
      score += 20;
      tokenMatched = true;
    }
    if (slug.includes(tObj.raw.toLowerCase())) {
      score += 15;
      tokenMatched = true;
    }
    if (tokenMatched) matchedTokenCount++;
  });

  // Nếu tất cả các từ con đều xuất hiện trong sản phẩm -> Thưởng điểm cao
  if (tokens.length > 1 && matchedTokenCount === tokens.length) {
    score += 90;
  }

  // 5. Thêm điểm ưu tiên từ vị trí và sản phẩm nổi bật
  if (product.position) {
    score += Math.min(product.position, 20);
  }
  if (product.featured === "1" || product.featured === "true") {
    score += 15;
  }

  return score;
};

module.exports = {
  removeVietnameseAccents,
  escapeRegex,
  buildSmartSearchFilter,
  calculateRelevanceScore,
};
