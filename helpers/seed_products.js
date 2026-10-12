const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Brand = require("../models/brand.model");

async function seedData() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("Connected to MongoDB successfully!");

    // 1. LẤY HOẶC TẠO BRANDS
    const brandDefs = [
      {
        name: "YONEX",
        tagline: "Far Beyond Ordinary",
        specPill: "Vợt & Giày Cầu Lông Số 1 Thế Giới",
        description: "Thương hiệu cầu lông số 1 thế giới với dòng vợt Astrox, Nanoflare và công nghệ đệm Power Cushion.",
        link: "/?keyword=Yonex",
        status: "active",
        position: 8,
      },
      {
        name: "LINING",
        tagline: "Anything Is Possible",
        specPill: "Dòng Vợt Công Phá Đỉnh Cao",
        description: "Thương hiệu thể thao hàng đầu châu Á với các dòng vợt Axforce, Halbertec và giày thi đấu cao cấp.",
        link: "/?keyword=Lining",
        status: "active",
        position: 9,
      },
      {
        name: "VICTOR",
        tagline: "Ready To Win",
        specPill: "Tốc Độ & Độ Bền Huyền Thoại",
        description: "Thương hiệu danh tiếng Đài Loan với dòng vợt Thruster K, Auraspeed được tuyển thủ quốc tế tin dùng.",
        link: "/?keyword=Victor",
        status: "active",
        position: 10,
      },
    ];

    for (const b of brandDefs) {
      const exist = await Brand.findOne({ name: b.name, deleted: false });
      if (!exist) {
        await Brand.create(b);
        console.log(`+ Created Brand: ${b.name}`);
      }
    }

    // 2. LẤY CÁC PARENT CATEGORIES
    const catFootball = await Category.findOne({ slug: "bong-da", deleted: false });
    const catVolleyball = await Category.findOne({ slug: "bong-chuyen", deleted: false });
    const catBadminton = await Category.findOne({ slug: "cau-long", deleted: false });

    if (!catFootball || !catVolleyball || !catBadminton) {
      console.error("Missing root categories!");
      process.exit(1);
    }

    console.log("Found Root Categories:", {
      Football: catFootball._id.toString(),
      Volleyball: catVolleyball._id.toString(),
      Badminton: catBadminton._id.toString(),
    });

    // 3. TẠO HOẶC LẤY SUB-CATEGORIES
    // - Bóng Đá Subcategories
    let subFootballShoes = await Category.findOne({ slug: "giay-bong-da", deleted: false });
    let subFootballBalls = await Category.findOne({ slug: "bong-thi-dau", deleted: false });
    let subFootballKits = await Category.findOne({ slug: "dong-phuc-thi-dau-Yrhij_1vo", deleted: false });
    if (!subFootballKits) {
      subFootballKits = await Category.findOne({ title: /Đồng Phục Thi Đấu/i, parent_id: catFootball._id.toString(), deleted: false });
    }
    let subFootballAccessories = await Category.findOne({ slug: "phu-kien-bong-da", deleted: false });
    if (!subFootballAccessories) {
      subFootballAccessories = await Category.create({
        title: "Phụ Kiện Bóng Đá",
        parent_id: catFootball._id.toString(),
        description: "Găng tay thủ môn, bọc ống đồng, tất dệt kim chống trơn chất lượng cao.",
        thumbnail: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&auto=format&fit=crop&q=80",
        status: "active",
        position: 4,
      });
      console.log("+ Created Category: Phụ Kiện Bóng Đá");
    }

    // - Bóng Chuyền Subcategories
    let subVolleyShoes = await Category.findOne({ slug: "giay-bong-chuyen", deleted: false });
    let subVolleyBalls = await Category.findOne({ slug: "banh-bong-chuyen", deleted: false });
    let subVolleyKits = await Category.findOne({ slug: "dong-phuc-thi-dau-bong-chuyen", deleted: false });
    let subVolleyAccessories = await Category.findOne({ slug: "phu-kien-bong-chuyen", deleted: false });

    // - Cầu Lông Subcategories
    let subBadmintonRackets = await Category.findOne({ slug: "vot-cau-long", deleted: false });
    if (!subBadmintonRackets) {
      subBadmintonRackets = await Category.create({
        title: "Vợt Cầu Lông",
        parent_id: catBadminton._id.toString(),
        description: "Các dòng vợt công thủ toàn diện từ Yonex, Lining, Victor chính hãng.",
        thumbnail: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80",
        status: "active",
        position: 1,
      });
      console.log("+ Created Category: Vợt Cầu Lông");
    }

    let subBadmintonShoes = await Category.findOne({ slug: "giay-cau-long", deleted: false });
    if (!subBadmintonShoes) {
      subBadmintonShoes = await Category.create({
        title: "Giày Cầu Lông",
        parent_id: catBadminton._id.toString(),
        description: "Giày cầu lông chuyên dụng đệm khí êm ái, bám sân và chống lật cổ chân.",
        thumbnail: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&auto=format&fit=crop&q=80",
        status: "active",
        position: 2,
      });
      console.log("+ Created Category: Giày Cầu Lông");
    }

    let subBadmintonKits = await Category.findOne({ slug: "dong-phuc-cau-long", deleted: false });
    if (!subBadmintonKits) {
      subBadmintonKits = await Category.create({
        title: "Đồng Phục Cầu Lông",
        parent_id: catBadminton._id.toString(),
        description: "Áo quần cầu lông vải thun lạnh, thoáng khí Very Cool công nghệ Nhật Bản.",
        thumbnail: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
        status: "active",
        position: 3,
      });
      console.log("+ Created Category: Đồng Phục Cầu Lông");
    }

    let subBadmintonAccessories = await Category.findOne({ slug: "qua-cau-long-phu-kien", deleted: false });
    if (!subBadmintonAccessories) {
      subBadmintonAccessories = await Category.create({
        title: "Quả Cầu Lông & Phụ Kiện",
        parent_id: catBadminton._id.toString(),
        description: "Ống cầu lông tiêu chuẩn, cước đan BG66 Ultimax, quấn cán, bao vợt đa ngăn.",
        thumbnail: "https://images.unsplash.com/photo-1617083934555-563d7637841c?w=600&auto=format&fit=crop&q=80",
        status: "active",
        position: 4,
      });
      console.log("+ Created Category: Quả Cầu Lông & Phụ Kiện");
    }

    // 4. CHUẨN HÓA BRAND CHO 19 SẢN PHẨM HIỆN CÓ
    const existingProducts = await Product.find({ deleted: false });
    for (const p of existingProducts) {
      let detectedBrand = p.brand;
      const lowerTitle = p.title.toLowerCase();
      if (!detectedBrand) {
        if (lowerTitle.includes("nike")) detectedBrand = "NIKE";
        else if (lowerTitle.includes("adidas")) detectedBrand = "ADIDAS";
        else if (lowerTitle.includes("puma")) detectedBrand = "PUMA";
        else if (lowerTitle.includes("mikasa")) detectedBrand = "MIKASA";
        else if (lowerTitle.includes("asics")) detectedBrand = "ASICS";
        else if (lowerTitle.includes("mizuno")) detectedBrand = "MIZUNO";
        else if (lowerTitle.includes("molten")) detectedBrand = "MOLTEN";
        else if (lowerTitle.includes("yonex")) detectedBrand = "YONEX";
        else if (lowerTitle.includes("lining")) detectedBrand = "LINING";
        else detectedBrand = "CHÍNH HÃNG";
      }

      // Sửa sản phẩm Cầu lông bị gán nhầm sang danh mục khác
      let updateCatId = p.category_id;
      if (lowerTitle.includes("cau long") || lowerTitle.includes("cầu lông")) {
        if (lowerTitle.includes("ao") || lowerTitle.includes("áo")) {
          updateCatId = subBadmintonKits._id.toString();
        } else {
          updateCatId = subBadmintonRackets._id.toString();
        }
      }

      await Product.updateOne(
        { _id: p._id },
        {
          $set: {
            brand: detectedBrand,
            category_id: updateCatId,
          },
        }
      );
    }
    console.log("Updated brands and categories for existing products!");

    // Helper tạo mô tả HTML giàu chi tiết
    function makeDescription(name, brand, specs, highlights) {
      return `
        <div class="product-description-rich">
          <div class="pdp-mod-specification mb-4">
            <h3 class="spec-title" style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 14px; border-left: 4px solid #ff4722; padding-left: 10px;">THÔNG SỐ KỸ THUẬT SẢN PHẨM</h3>
            <table class="table-spec" style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-weight: 700; width: 35%; color: #475569;">Thương hiệu</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-weight: 600;">${brand} Chính Hãng</td>
                </tr>
                ${specs
                  .map(
                    (s, i) => `
                <tr style="background: ${i % 2 === 0 ? "#ffffff" : "#f8fafc"}; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #475569;">${s.label}</td>
                  <td style="padding: 10px 14px; color: #0f172a;">${s.value}</td>
                </tr>`
                  )
                  .join("")}
                <tr style="background: #ffffff; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-weight: 700; color: #475569;">Bảo hành</td>
                  <td style="padding: 10px 14px; color: #16a34a; font-weight: 700;">Đổi mới 30 ngày nếu lỗi từ nhà sản xuất</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pdp-highlights mb-4">
            <h3 class="highlight-title" style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 14px; border-left: 4px solid #ff4722; padding-left: 10px;">ĐẶC ĐIỂM NỔI BẬT</h3>
            <ul style="padding-left: 20px; line-height: 1.8; color: #334155; font-size: 14.5px;">
              ${highlights.map((h) => `<li>${h}</li>`).join("")}
            </ul>
          </div>

          <div class="pdp-guarantee" style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 16px 20px;">
            <h4 style="color: #16a34a; font-weight: 800; margin-bottom: 8px;">CAM KẾT CHÍNH HÃNG TỪ TITISPORT</h4>
            <p style="margin: 0; font-size: 13.5px; color: #15803d; line-height: 1.6;">
              TitiSport cam kết 100% sản phẩm phân phối là hàng chính hãng. Phát hiện hàng giả, hàng nhái bồi hoàn 200% giá trị đơn hàng. Hỗ trợ đổi size linh hoạt tận nhà trong 7 ngày.
            </p>
          </div>
        </div>
      `;
    }

    // 5. DANH SÁCH 36 SẢN PHẨM MỚI SIÊU CHẤT LƯỢNG
    const newProducts = [
      // ==========================================
      // PHẦN 1: BÓNG ĐÁ - GIÀY BÓNG ĐÁ
      // ==========================================
      {
        title: "Giày Đá Bóng Nike Phantom GX 2 Elite FG Hyper Turquoise",
        category_id: subFootballShoes._id.toString(),
        brand: "NIKE",
        price: 5450000,
        discountPercentage: 10,
        featured: "1",
        position: 101,
        thumbnail: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 39", stock: 15 },
          { size: "Size 40", stock: 22 },
          { size: "Size 41", stock: 28 },
          { size: "Size 42", stock: 18 },
          { size: "Size 43", stock: 10 },
        ],
        specs: [
          { label: "Mặt sân phù hợp", value: "Sân cỏ tự nhiên (FG - Firm Ground)" },
          { label: "Chất liệu Upper", value: "Nike Gripknit chống nước, siêu dính bóng" },
          { label: "Bộ đế", value: "Nike Cyclone 360 đinh xoay linh hoạt" },
          { label: "Trọng lượng", value: "198g / chiếc (Size 41)" },
        ],
        highlights: [
          "Chất liệu Gripknit mang tính cách mạng mang lại cảm giác bóng vượt trội trong mọi điều kiện thời tiết.",
          "Họa tiết đinh Cyclone 360 giúp xoay sở thoát pressing cực nhanh và giảm thiểu chấn thương gối.",
          "Thiết kế bất đối xứng ở cổ giày tạo mặt phẳng tiếp xúc bóng tối ưu khi sút và chuyền.",
        ],
      },
      {
        title: "Giày Đá Bóng Adidas Predator 24 Elite FT FG Solar Energy",
        category_id: subFootballShoes._id.toString(),
        brand: "ADIDAS",
        price: 5200000,
        discountPercentage: 12,
        featured: "1",
        position: 102,
        thumbnail: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 39", stock: 12 },
          { size: "Size 40", stock: 20 },
          { size: "Size 41", stock: 25 },
          { size: "Size 42", stock: 14 },
          { size: "Size 43", stock: 8 },
        ],
        specs: [
          { label: "Mặt sân", value: "Sân cỏ tự nhiên FG" },
          { label: "Lưỡi gà", value: "Lưỡi gà gấp cổ điển có quai thun (Fold-over Tongue)" },
          { label: "Vảy gai", value: "Công nghệ Strikeskin cao su bám dính bóng xoáy" },
          { label: "Khung đế", value: "Controlframe 2.0 gia cố lực sút" },
        ],
        highlights: [
          "Biểu tượng Predator trở lại với lưỡi gà gập cổ điển cùng vảy Strikeskin tạo độ xoáy bóng sát thủ.",
          "Chất liệu HybridTouch 2.0 mềm như da thật nhưng nhẹ hơn và chống thấm nước tuyệt hảo.",
          "Khung đế Controlframe 2.0 hỗ trợ tăng tốc và kiểm soát chuyển động vững vàng.",
        ],
      },
      {
        title: "Giày Đá Bóng Mizuno Morelia Neo IV Beta Japan FG White Red",
        category_id: subFootballShoes._id.toString(),
        brand: "MIZUNO",
        price: 6800000,
        discountPercentage: 5,
        featured: "1",
        position: 103,
        thumbnail: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 39", stock: 8 },
          { size: "Size 40", stock: 14 },
          { size: "Size 41", stock: 18 },
          { size: "Size 42", stock: 10 },
        ],
        specs: [
          { label: "Xuất xứ", value: "Made in Japan (Gia công thủ công tại Nhật Bản)" },
          { label: "Chất liệu Upper", value: "Da Kangaroo tự nhiên (K-Leather) thượng hạng" },
          { label: "Cổ giày", value: "Sợi dệt BareFoot Knit co giãn 4 chiều" },
          { label: "Bộ đinh", value: "Đinh tròn đúc liền bám sân và xoay xở cực êm" },
        ],
        highlights: [
          "Tuyệt tác thủ công Made in Japan với da Kangaroo siêu mềm mại, ôm khít hoàn hảo bàn chân người châu Á.",
          "Trọng lượng siêu nhẹ chỉ ~195g cho cảm giác đi như chân trần (Barefoot feel).",
          "Độ bền vượt trội chịu lực va đập cao, đinh tròn hỗ trợ bảo vệ tối đa dây chằng khớp gối.",
        ],
      },
      {
        title: "Giày Đá Bóng Puma Future 7 Ultimate FG/AG Phenomenal Pack",
        category_id: subFootballShoes._id.toString(),
        brand: "PUMA",
        price: 4950000,
        discountPercentage: 15,
        featured: "0",
        position: 104,
        thumbnail: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 40", stock: 16 },
          { size: "Size 41", stock: 24 },
          { size: "Size 42", stock: 15 },
          { size: "Size 43", stock: 9 },
        ],
        specs: [
          { label: "Công nghệ Upper", value: "FUZIONFIT360 kết hợp dải PWRTAPE định hình" },
          { label: "Đế giày", value: "Dynamic Motion System thế hệ thứ 2" },
          { label: "Mặt sân", value: "Cỏ tự nhiên & Cỏ nhân tạo tiêu chuẩn (FG/AG)" },
        ],
        highlights: [
          "Công nghệ dệt FUZIONFIT360 ôm trọn mu bàn chân, có thể mang không dây buộc (laceless) hoặc có dây.",
          "Đế Dynamic Motion System siêu nảy cung cấp độ bám và tăng tốc bùng nổ khi bứt tốc.",
          "Chất liệu hạt nổi 3D texturing ở các vùng tiếp xúc bóng gia tăng cảm giác điều khiển bóng điệu nghệ.",
        ],
      },
      {
        title: "Giày Đá Bóng Nike Tiempo Legend 10 Elite FG Golden Touch",
        category_id: subFootballShoes._id.toString(),
        brand: "NIKE",
        price: 5300000,
        discountPercentage: 8,
        featured: "0",
        position: 105,
        thumbnail: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 39", stock: 10 },
          { size: "Size 40", stock: 18 },
          { size: "Size 41", stock: 22 },
          { size: "Size 42", stock: 15 },
        ],
        specs: [
          { label: "Chất liệu Upper", value: "FlyTouch Plus da nhân tạo cao cấp chống ngấm nước" },
          { label: "Đế giày", value: "Đinh nón kết hợp đinh lam kiểm soát tối ưu" },
          { label: "Vị trí khuyên dùng", value: "Tiền vệ trung tâm & Trung vệ điều phối bóng" },
        ],
        highlights: [
          "Dòng giày êm chân huyền thoại Tiempo nay nâng cấp với chất liệu FlyTouch Plus nhẹ hơn 55% so với da tự nhiên.",
          "Các gai siêu nhỏ Microdots khuếch đại cảm giác chạm bóng khi chuyền dài chuẩn xác.",
        ],
      },
      {
        title: "Giày Đá Bóng Sân Cỏ Nhân Tạo Adidas X Crazyfast.1 TF Lucid Lemon",
        category_id: subFootballShoes._id.toString(),
        brand: "ADIDAS",
        price: 3200000,
        discountPercentage: 15,
        featured: "1",
        position: 106,
        thumbnail: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 39", stock: 20 },
          { size: "Size 40", stock: 35 },
          { size: "Size 41", stock: 40 },
          { size: "Size 42", stock: 25 },
          { size: "Size 43", stock: 15 },
        ],
        specs: [
          { label: "Mặt sân", value: "Sân cỏ nhân tạo 5-7 người (TF)" },
          { label: "Upper", value: "Aeropacity Speedskin siêu mỏng mờ trong suốt" },
          { label: "Bộ đệm", value: "Đệm Lightstrike hoàn trả lực cực nhạy" },
        ],
        highlights: [
          "Vua tốc độ trên mặt sân cỏ nhân tạo Việt Nam với trọng lượng nhẹ hàng đầu phân khúc.",
          "Đinh cao su dăm nhuyễn TF bám cỏ nhân tạo cực chắc, xoay chuyển không lo trơn trượt ngày mưa.",
        ],
      },

      // ==========================================
      // PHẦN 1: BÓNG ĐÁ - BÓNG THI ĐẤU
      // ==========================================
      {
        title: "Quả Bóng Đá FIFA Quality Pro Adidas UCL London Match Ball 2024",
        category_id: subFootballBalls._id.toString(),
        brand: "ADIDAS",
        price: 3600000,
        discountPercentage: 8,
        featured: "1",
        position: 107,
        thumbnail: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [{ size: "Size 5 Tiêu Chuẩn", stock: 35 }],
        specs: [
          { label: "Tiêu chuẩn", value: "FIFA Quality Pro (Chuẩn thi đấu cúp C1 châu Âu)" },
          { label: "Cấu trúc vỏ", value: "Nhiệt dán không đường may (Thermal Bonded)" },
          { label: "Ruột bóng", value: "Cao su Butyl giữ áp suất và độ nảy ổn định" },
          { label: "Trọng lượng", value: "420g - 445g chuẩn quốc tế" },
        ],
        highlights: [
          "Bóng thi đấu chính thức chung kết Champions League 2024 tại sân vận động Wembley London.",
          "Bề mặt ngôi sao đặc trưng với vân khí động học giảm thiểu độ lắc khi sút mu bàn chân căng.",
          "Công nghệ nhiệt hàn không đường chỉ may chống thấm nước 100%, duy trì trọng lượng lý tưởng trong trời mưa.",
        ],
      },
      {
        title: "Bóng Đá Ngoại Hạng Anh Nike Flight Premier League 2024/25",
        category_id: subFootballBalls._id.toString(),
        brand: "NIKE",
        price: 3850000,
        discountPercentage: 5,
        featured: "0",
        position: 108,
        thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [{ size: "Size 5 Tiêu Chuẩn", stock: 28 }],
        specs: [
          { label: "Giải đấu", value: "Premier League Ngoại Hạng Anh mùa 2024/2025" },
          { label: "Công nghệ rãnh", value: "Nike Aerowsculpt ổn định quỹ đạo bay thêm 30%" },
        ],
        highlights: [
          "Được nghiên cứu suốt 8 năm và hơn 1.700 giờ thử nghiệm tại phòng lab Nike Innovation.",
          "Các rãnh khí động học Aerowsculpt giảm nhiễu động không khí cho đường bay chuẩn xác từng milimet.",
        ],
      },
      {
        title: "Quả Bóng Đá Thi Đấu Puma Orbita Serie A Pro Match Ball",
        category_id: subFootballBalls._id.toString(),
        brand: "PUMA",
        price: 2950000,
        discountPercentage: 10,
        featured: "0",
        position: 109,
        thumbnail: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [{ size: "Size 5 Tiêu Chuẩn", stock: 30 }],
        specs: [
          { label: "Giải đấu", value: "Giải Vô Địch Quốc Gia Ý Serie A" },
          { label: "Số mảnh ghép", value: "12 mảnh đồng đều độc đáo cho độ tròn tuyệt đối" },
        ],
        highlights: [
          "Cấu trúc 12 mảnh hình học kích thước lớn giảm thiểu đường viền tiếp xúc mang lại cảm giác chân thật.",
          "Lớp đệm xốp POE dẻo dai bên dưới vỏ bóng hỗ trợ trả lực nảy mãnh liệt.",
        ],
      },

      // ==========================================
      // PHẦN 1: BÓNG ĐÁ - ĐỒNG PHỤC & PHỤ KIỆN
      // ==========================================
      {
        title: "Áo Đấu Real Madrid Sân Nhà 2024/2025 Authentic Player Issue",
        category_id: subFootballKits._id.toString(),
        brand: "ADIDAS",
        price: 2450000,
        discountPercentage: 10,
        featured: "1",
        position: 110,
        thumbnail: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1508802513468-7c8585e8a605?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size S (50-60kg)", stock: 20 },
          { size: "Size M (60-70kg)", stock: 35 },
          { size: "Size L (70-80kg)", stock: 40 },
          { size: "Size XL (80-90kg)", stock: 25 },
        ],
        specs: [
          { label: "Phiên bản", value: "Authentic / Player Issue (Cầu thủ mặc thi đấu)" },
          { label: "Công nghệ vải", value: "HEAT.RDY làm mát chủ động, siêu nhẹ" },
          { label: "Logo & Huy hiệu", value: "In nhiệt 3D dẻo chống bong tróc" },
        ],
        highlights: [
          "Màu trắng Hoàng gia Tây Ban Nha kết hợp họa tiết chìm Houndstooth quý phái.",
          "Chất liệu tái chế Primegreen bảo vệ môi trường, siêu nhẹ và thấm hút mồ hôi cấp tốc.",
        ],
      },
      {
        title: "Áo Đấu Manchester United Sân Nhà 2024/2025 Authentic Player",
        category_id: subFootballKits._id.toString(),
        brand: "ADIDAS",
        price: 2450000,
        discountPercentage: 10,
        featured: "0",
        position: 111,
        thumbnail: "https://images.unsplash.com/photo-1508802513468-7c8585e8a605?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size S", stock: 18 },
          { size: "Size M", stock: 30 },
          { size: "Size L", stock: 35 },
          { size: "Size XL", stock: 20 },
        ],
        specs: [
          { label: "Màu sắc", value: "Đỏ truyền thống Quỷ Đỏ kết hợp viền trắng cam" },
          { label: "Chất liệu", value: "100% Polyester tái chế công nghệ HEAT.RDY" },
        ],
        highlights: [
          "Thiết kế chuyển màu gradient rực lửa lấy cảm hứng từ biểu tượng ánh sáng lịch sử năm 1952.",
          "Vạt áo sau dài hơn hỗ trợ chống xốc áo khi bứt tốc và nhảy tranh chấp bóng bổng.",
        ],
      },
      {
        title: "Bộ Quần Áo Đội Tuyển Việt Nam 2024/2025 Màu Đỏ Tự Hào",
        category_id: subFootballKits._id.toString(),
        brand: "CHÍNH HÃNG",
        price: 650000,
        discountPercentage: 5,
        featured: "1",
        position: 112,
        thumbnail: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size S", stock: 25 },
          { size: "Size M", stock: 45 },
          { size: "Size L", stock: 50 },
          { size: "Size XL", stock: 30 },
        ],
        specs: [
          { label: "Biểu tượng", value: "Quốc kỳ Việt Nam và họa tiết ngôi sao 5 cánh chìm" },
          { label: "Vải dệt", value: "Thun mè co giãn cao cấp siêu nhẹ, thoát nhiệt tốt" },
        ],
        highlights: [
          "Trang phục thi đấu chính thức của các Chiến Binh Sao Vàng tại các giải đấu khu vực và châu lục.",
          "Độ bền cao, không xù lông và giặt không phai màu theo thời gian.",
        ],
      },
      {
        title: "Găng Tay Thủ Môn Adidas Predator Pro Fingersave Khung Xương",
        category_id: subFootballAccessories._id.toString(),
        brand: "ADIDAS",
        price: 2850000,
        discountPercentage: 15,
        featured: "0",
        position: 113,
        thumbnail: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size 8", stock: 15 },
          { size: "Size 9", stock: 25 },
          { size: "Size 10", stock: 18 },
        ],
        specs: [
          { label: "Mặt mút", value: "Mút cao cấp URG 2.0 dày 4mm dính bóng cực đỉnh" },
          { label: "Khung xương", value: "Công nghệ Fingersave trợ lực chống lật ngón tay" },
        ],
        highlights: [
          "Mút URG 2.0 có độ dính bóng thượng hạng, giảm chấn tối đa khi bắt những cú sút búa bổ.",
          "Gai High Definition Grip ở mu bàn tay hỗ trợ đấm bóng chính xác và uy lực.",
        ],
      },
      {
        title: "Bọc Ống Đồng Bóng Đá Nike Mercurial Lite Carbon Shield",
        category_id: subFootballAccessories._id.toString(),
        brand: "NIKE",
        price: 450000,
        discountPercentage: 0,
        featured: "0",
        position: 114,
        thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size S", stock: 30 },
          { size: "Size M", stock: 45 },
          { size: "Size L", stock: 35 },
        ],
        specs: [
          { label: "Vỏ bảo vệ", value: "Nhựa K-Resin dẻo siêu bền chịu va đập cực mạnh" },
          { label: "Đệm lưng", value: "Mút xốp EVA đục lỗ thoáng khí" },
        ],
        highlights: [
          "Trọng lượng siêu nhẹ không gây cảm giác vướng víu hay nặng nề trong lúc di chuyển.",
          "Thiết kế cong ôm sát theo xương cẳng chân cho độ vừa vặn hoàn hảo.",
        ],
      },

      // ==========================================
      // PHẦN 2: BÓNG CHUYỀN - GIÀY BÓNG CHUYỀN
      // ==========================================
      {
        title: "Giày Bóng Chuyền Asics Sky Elite FF 2 MT High Top Đệm Gel",
        category_id: subVolleyShoes._id.toString(),
        brand: "ASICS",
        price: 3650000,
        discountPercentage: 10,
        featured: "1",
        position: 115,
        thumbnail: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 39", stock: 10 },
          { size: "Size 40", stock: 18 },
          { size: "Size 41", stock: 26 },
          { size: "Size 42", stock: 20 },
          { size: "Size 43", stock: 12 },
        ],
        specs: [
          { label: "Công nghệ đệm", value: "FLYTEFOAM Propel kết hợp hạt Gel độc quyền Asics" },
          { label: "Đế ngoài", value: "Hệ thống rãnh TWISTRUSS tăng cường bật nhảy cao" },
          { label: "Thiết kế cổ", value: "Cổ trung Mid-Top (MT) bảo vệ chắc chắn khớp cổ chân" },
        ],
        highlights: [
          "Dòng giày chuyên dụng dành cho vị trí Chủ công và Đối chuyền cần sức bật đập bóng tối đa.",
          "Đế cong trợ lực chuyển hóa lực quán tính thành lực bật nhảy thẳng đứng cao hơn 15%.",
        ],
      },
      {
        title: "Giày Bóng Chuyền Mizuno Wave Lightning Z7 Siêu Nhẹ Pro",
        category_id: subVolleyShoes._id.toString(),
        brand: "MIZUNO",
        price: 2950000,
        discountPercentage: 15,
        featured: "1",
        position: 116,
        thumbnail: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 39", stock: 15 },
          { size: "Size 40", stock: 22 },
          { size: "Size 41", stock: 30 },
          { size: "Size 42", stock: 18 },
          { size: "Size 43", stock: 12 },
        ],
        specs: [
          { label: "Trọng lượng", value: "Khoảng 280g / chiếc (Siêu nhẹ chuyên phản xạ)" },
          { label: "Công nghệ", value: "Mizuno Wave Plate phân tán lực chấn động" },
        ],
        highlights: [
          "Trọng lượng nhẹ thần tốc phù hợp cho vị trí Libero và Chuyền hai di chuyển linh hoạt trên sân.",
          "Hệ thống thông khí Mizuno Intercool dưới đáy đế giày giúp bàn chân luôn khô thoáng.",
        ],
      },
      {
        title: "Giày Bóng Chuyền Asics Metarise Sunrise Red Tokyo Edition",
        category_id: subVolleyShoes._id.toString(),
        brand: "ASICS",
        price: 5200000,
        discountPercentage: 8,
        featured: "1",
        position: 117,
        thumbnail: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size 40", stock: 10 },
          { size: "Size 41", stock: 15 },
          { size: "Size 42", stock: 12 },
          { size: "Size 43", stock: 8 },
        ],
        specs: [
          { label: "Phiên bản", value: "Special Olympic Tokyo Edition màu đỏ mặt trời mọc" },
          { label: "Công nghệ độc quyền", value: "RISETRUSS tấm đệm Carbon bật nảy cực đại" },
        ],
        highlights: [
          "Dòng giày bóng chuyền đắt giá và cao cấp nhất của Asics, được Yuji Nishida tin dùng.",
          "Độ cong gót chân thiết kế thông minh hỗ trợ chuyển đổi gia tốc chạy đà thành chiều cao cú nhảy.",
        ],
      },

      // ==========================================
      // PHẦN 2: BÓNG CHUYỀN - BANH & PHỤ KIỆN
      // ==========================================
      {
        title: "Quả Bóng Chuyền Bãi Biển Mikasa VLS300 Olympic FIVB",
        category_id: subVolleyBalls._id.toString(),
        brand: "MIKASA",
        price: 1550000,
        discountPercentage: 5,
        featured: "0",
        position: 118,
        thumbnail: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [{ size: "Size 5 Tiêu Chuẩn FIVB", stock: 40 }],
        specs: [
          { label: "Chứng nhận", value: "FIVB Official Game Ball (Bóng thi đấu Olympic bãi biển)" },
          { label: "Chất liệu", value: "Da Super Composite tổng hợp kháng nước tuyệt đối" },
        ],
        highlights: [
          "Bóng thi đấu chính thức tại các kỳ Thế vận hội Olympic và giải vô địch bãi biển thế giới.",
          "Chất liệu bề mặt mềm êm, giảm đau rát cẳng tay khi đỡ những pha phát bóng uy lực ngoài trời gió.",
        ],
      },
      {
        title: "Bóng Chuyền Thi Đấu Molten V5M5000 Đạt Chuẩn Quốc Tế",
        category_id: subVolleyBalls._id.toString(),
        brand: "MOLTEN",
        price: 1350000,
        discountPercentage: 5,
        featured: "0",
        position: 119,
        thumbnail: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [{ size: "Size 5 Tiêu Chuẩn", stock: 35 }],
        specs: [
          { label: "Công nghệ", value: "FLISTATEC (Flight Stability Technology) ổn định đường bay" },
          { label: "Chất liệu", value: "Da PU cao cấp dập hoa văn tổ ong" },
        ],
        highlights: [
          "Công nghệ FLISTATEC kiểm soát luồng không khí xung quanh quả bóng, giúp bóng bay xoáy chuẩn xác.",
          "Cảm ứng mềm mại khi chuyền set bóng hai và đập bóng uy lực.",
        ],
      },
      {
        title: "Băng Bảo Vệ Khớp Gối Bóng Chuyền Asics Gel Knee Pad Pro",
        category_id: subVolleyAccessories._id.toString(),
        brand: "ASICS",
        price: 490000,
        discountPercentage: 0,
        featured: "0",
        position: 120,
        thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size M (Dưới 65kg)", stock: 35 },
          { size: "Size L (Trên 65kg)", stock: 45 },
        ],
        specs: [
          { label: "Đệm bảo vệ", value: "Hạt đệm Gel hấp thụ xung chấn va đập sàn đấu" },
          { label: "Vải dệt", value: "Sợi co giãn Spandex thoáng khí khử mùi hôi" },
        ],
        highlights: [
          "Phụ kiện bắt buộc cho các pha bay người cứu bóng lăn xả của Libero và Vận động viên.",
          "Không bị tuột hoặc xoay lệch khi vận động mạnh.",
        ],
      },
      {
        title: "Đồng Phục Bóng Chuyền Nữ Asics Volley Core Set 2024",
        category_id: subVolleyKits._id.toString(),
        brand: "ASICS",
        price: 550000,
        discountPercentage: 10,
        featured: "0",
        position: 121,
        thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size S (42-48kg)", stock: 20 },
          { size: "Size M (48-55kg)", stock: 30 },
          { size: "Size L (55-63kg)", stock: 25 },
        ],
        specs: [
          { label: "Bộ sản phẩm", value: "Gồm 1 áo sát nách thể thao + 1 quần đùi thun ôm" },
          { label: "Chất liệu", value: "Vải Polyester pha Spandex co giãn 4 chiều đa hướng" },
        ],
        highlights: [
          "Form dáng ôm thon gọn, đường may dẹp Flatlock chống cọ xát gây xước da khi vận động.",
          "Hút ẩm và thoát nhiệt siêu tốc giữ cho cơ thể luôn mát mẻ suốt set đấu căng thẳng.",
        ],
      },

      // ==========================================
      // PHẦN 3: CẦU LÔNG - VỢT CẦU LÔNG
      // ==========================================
      {
        title: "Vợt Cầu Lông Yonex Astrox 100ZZ Kurenai Đỏ Nhám Tấn Công",
        category_id: subBadmintonRackets._id.toString(),
        brand: "YONEX",
        price: 4350000,
        discountPercentage: 12,
        featured: "1",
        position: 122,
        thumbnail: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1613918431703-aa6321c255ef?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "3U - G5 (Nặng tay - VĐV chuyên nghiệp)", stock: 15 },
          { size: "4U - G5 (Công thủ linh hoạt - Phổ thông)", stock: 35 },
        ],
        specs: [
          { label: "Điểm cân bằng", value: "Nặng đầu (~305mm) chuyên đập cầu uy lực" },
          { label: "Độ cứng đũa vợt", value: "Siêu cứng (Extra Stiff) trợ lực smash cắm sân" },
          { label: "Mức căng dây tối đa", value: "4U: 28 lbs (~12.5kg) | 3U: 29 lbs (~13kg)" },
        ],
        highlights: [
          "Cây vợt huyền thoại được Viktor Axelsen tin dùng giành hàng loạt chức vô địch thế giới và Olympic.",
          "Đũa vợt Hyper Slim mỏng nhất lịch sử Yonex xé gió cực nhanh, tạo đường cầu cắm sát vạch.",
        ],
      },
      {
        title: "Vợt Cầu Lông Yonex Nanoflare 1000Z Vàng Sấm Sét Tốc Độ",
        category_id: subBadmintonRackets._id.toString(),
        brand: "YONEX",
        price: 4500000,
        discountPercentage: 10,
        featured: "1",
        position: 123,
        thumbnail: "https://images.unsplash.com/photo-1613918431703-aa6321c255ef?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "3U - G5 (Trợ lực mạnh)", stock: 12 },
          { size: "4U - G5 (Tốc độ phản tạt thần sầu)", stock: 30 },
        ],
        specs: [
          { label: "Kỷ lục thế giới", value: "Vận tốc đập cầu 565 km/h xác lập kỷ lục Guinness" },
          { label: "Khung vợt", value: "AERO Frame vát mỏng xé gió tối đa" },
        ],
        highlights: [
          "Dòng vợt giữ kỷ lục Guinness thế giới về tốc độ đập cầu nhanh nhất lịch sử nhân loại (565 km/h).",
          "Mặt vợt thu gọn Compact Frame mở rộng diện tích điểm ngọt và tăng tốc độ vung vợt.",
        ],
      },
      {
        title: "Vợt Cầu Lông Lining Axforce 100 Kì Lân Qilin Đầm Đầu",
        category_id: subBadmintonRackets._id.toString(),
        brand: "LINING",
        price: 4850000,
        discountPercentage: 8,
        featured: "1",
        position: 124,
        thumbnail: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "3U - G5 (Chuyên smash cầu nặng)", stock: 10 },
          { size: "4U - G5 (Đầm đầu trợ lực tốt)", stock: 25 },
        ],
        specs: [
          { label: "Chất liệu Carbon", value: "M50 + Superb Carbon công nghệ hàng không" },
          { label: "Đường kính đũa", value: "6.0mm Hard Flexible Shaft siêu đàn hồi" },
        ],
        highlights: [
          "Vợt cao cấp nhất phân khúc Axforce của Lining với họa tiết vảy Kì Lân thần thoại uy quyền.",
          "Đũa vợt 6.0mm đàn hồi phục hồi cực nhanh sau mỗi cú vụt, hạn chế rung lắc cổ tay.",
        ],
      },
      {
        title: "Vợt Cầu Lông Victor Thruster Ryuga II Rồng Lửa Lee Zii Jia",
        category_id: subBadmintonRackets._id.toString(),
        brand: "VICTOR",
        price: 3950000,
        discountPercentage: 15,
        featured: "0",
        position: 125,
        thumbnail: "https://images.unsplash.com/photo-1511067007798-4029d3aca9cd?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "3U - G5", stock: 12 },
          { size: "4U - G5", stock: 28 },
        ],
        specs: [
          { label: "Vận động viên đại diện", value: "Ngôi sao Lee Zii Jia (Malaysia)" },
          { label: "Công nghệ tay cầm", value: "FREE CORE cán tổng hợp giảm rung êm tay" },
        ],
        highlights: [
          "Thiết kế họa tiết vảy rồng và mắt rồng rực lửa đầy cá tính và phong cách chiến binh.",
          "Công nghệ cán cầm FREE CORE tạo góc uốn linh hoạt giúp cú đập cầu mượt mà và sâu hơn.",
        ],
      },

      // ==========================================
      // PHẦN 3: CẦU LÔNG - GIÀY CẦU LÔNG
      // ==========================================
      {
        title: "Giày Cầu Lông Yonex Power Cushion 65Z3 White Red Pro",
        category_id: subBadmintonShoes._id.toString(),
        brand: "YONEX",
        price: 2750000,
        discountPercentage: 10,
        featured: "1",
        position: 126,
        thumbnail: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&auto=format&fit=crop&q=80",
        ],
        sizes: [
          { size: "Size 39", stock: 15 },
          { size: "Size 40", stock: 25 },
          { size: "Size 41", stock: 35 },
          { size: "Size 42", stock: 22 },
          { size: "Size 43", stock: 14 },
        ],
        specs: [
          { label: "Đệm công nghệ", value: "Power Cushion+ đàn hồi chống thốn gót chân" },
          { label: "Đế giữa", value: "Tấm Carbon Power Graphite Sheet chống xoắn chân" },
        ],
        highlights: [
          "Mẫu giày cầu lông bán chạy và toàn diện nhất lịch sử Yonex, được đông đảo VĐV top 1 thế giới lựa chọn.",
          "Chống lật sơ mi cổ chân tuyệt đối khi phanh gấp đổi hướng liên tục trên thảm đấu.",
        ],
      },
      {
        title: "Giày Cầu Lông Lining Blade Pro Đế Kép Giảm Chấn Carbon",
        category_id: subBadmintonShoes._id.toString(),
        brand: "LINING",
        price: 2950000,
        discountPercentage: 12,
        featured: "0",
        position: 127,
        thumbnail: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size 39", stock: 10 },
          { size: "Size 40", stock: 18 },
          { size: "Size 41", stock: 24 },
          { size: "Size 42", stock: 16 },
        ],
        specs: [
          { label: "Đệm đế giữa", value: "Công nghệ BOOM PEBAX đàn hồi siêu êm ái" },
          { label: "Tấm chống lật", value: "Tấm Carbon sợi 3D chạy dọc sống bàn chân" },
        ],
        highlights: [
          "Đệm BOOM siêu êm ái đàn hồi 80% lực tác động, hạn chế tối đa ê buốt gót chân.",
          "Upper dệt sợi đan thoáng khí không gây bí mùi khi thi đấu.",
        ],
      },

      // ==========================================
      // PHẦN 3: CẦU LÔNG - PHỤ KIỆN & QUẢ CẦU
      // ==========================================
      {
        title: "Hộp 12 Quả Cầu Lông Yonex Aerosensa 50 (AS-50) Chuẩn Thi Đấu",
        category_id: subBadmintonAccessories._id.toString(),
        brand: "YONEX",
        price: 980000,
        discountPercentage: 0,
        featured: "1",
        position: 128,
        thumbnail: "https://images.unsplash.com/photo-1617083934555-563d7637841c?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [{ size: "Tốc Độ 77 (Tiêu chuẩn Việt Nam)", stock: 60 }],
        specs: [
          { label: "Quy cách", value: "Ống 12 quả cầu lông cao cấp" },
          { label: "Chất liệu lông", value: "Lông ngỗng tự nhiên tuyển chọn loại 1 độ bền tối đa" },
        ],
        highlights: [
          "Quả cầu lông tiêu chuẩn cao nhất thế giới được dùng trong các giải Super 1000 và Olympic.",
          "Quỹ đạo bay xoay tròn hoàn hảo, không bị rung lắc và độ bền cực cao.",
        ],
      },
      {
        title: "Ống Cầu Lông Thành Công 77 Tốc Độ Chuẩn Phong Trào",
        category_id: subBadmintonAccessories._id.toString(),
        brand: "CHÍNH HÃNG",
        price: 245000,
        discountPercentage: 0,
        featured: "0",
        position: 129,
        thumbnail: "https://images.unsplash.com/photo-1617083934555-563d7637841c?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [{ size: "Ống 12 Quả (Tốc độ 77)", stock: 120 }],
        specs: [
          { label: "Thương hiệu", value: "Thành Công Sport Việt Nam" },
          { label: "Chất liệu", value: "Lông vịt tự nhiên phủ keo gia cường" },
        ],
        highlights: [
          "Dòng cầu lông phong trào quốc dân tại Việt Nam với đường bay ổn định và giá thành hợp lý.",
          "Cánh lông đều tăm tắp, độ bền cao ít gãy rụng.",
        ],
      },
      {
        title: "Cước Cầu Lông Yonex BG66 Ultimax 0.65mm Tiếng Nổ Đanh",
        category_id: subBadmintonAccessories._id.toString(),
        brand: "YONEX",
        price: 180000,
        discountPercentage: 0,
        featured: "0",
        position: 130,
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Cuộn 10m (Màu Trắng)", stock: 80 },
          { size: "Cuộn 10m (Màu Vàng Neon)", stock: 65 },
          { size: "Cuộn 10m (Màu Xanh Ngọc)", stock: 50 },
        ],
        specs: [
          { label: "Đường kính dây", value: "0.65mm siêu mỏng trợ lực tối đa" },
          { label: "Lõi dây", value: "Sợi đa sợi High-Intensity Nylon Multifilament" },
        ],
        highlights: [
          "Mẫu cước đan vợt được ưa chuộng số 1 thế giới với âm thanh nổ smash đanh vang chói tai.",
          "Khả năng trợ lực và giữ sức căng ổn định mang lại cảm giác cầu cực nhạy.",
        ],
      },
      {
        title: "Balo Vợt Cầu Lông Yonex Pro Tournament 9 Ngăn Chuyên Nghiệp",
        category_id: subBadmintonAccessories._id.toString(),
        brand: "YONEX",
        price: 1850000,
        discountPercentage: 10,
        featured: "0",
        position: 131,
        thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [{ size: "Bao Đựng 9 Vợt Tiêu Chuẩn", stock: 25 }],
        specs: [
          { label: "Ngăn cách nhiệt", value: "Lớp tráng bạc Thermo Guard bảo vệ cước và khung vợt" },
          { label: "Ngăn đựng giày", value: "Ngăn riêng biệt phía dưới có lỗ thông khí" },
        ],
        highlights: [
          "Balo thi đấu của các tay vợt hàng đầu, chất liệu da PU chống nước và trầy xước bền bỉ.",
          "Quai đeo đệm mút tổ ong êm ái có thể đeo vai hoặc xách tay tiện lợi.",
        ],
      },
      {
        title: "Áo Thi Đấu Cầu Lông Yonex Tournament Match Shirt Very Cool",
        category_id: subBadmintonKits._id.toString(),
        brand: "YONEX",
        price: 650000,
        discountPercentage: 10,
        featured: "0",
        position: 132,
        thumbnail: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
        images: [],
        sizes: [
          { size: "Size M (55-65kg)", stock: 30 },
          { size: "Size L (65-75kg)", stock: 40 },
          { size: "Size XL (75-85kg)", stock: 25 },
        ],
        specs: [
          { label: "Công nghệ vải", value: "VERYCOOL độc quyền hạ nhiệt độ cơ thể xuống 3°C" },
          { label: "Kháng tĩnh điện", value: "Carbon Conductive Fibers chống dính bết vào da" },
        ],
        highlights: [
          "Ứng dụng chất liệu Xylitol tự nhiên giúp giảm nhiệt độ bề mặt da đến 3 độ C khi đổ mồ hôi.",
          "Cắt may 3D Ergonomic tạo khoảng trống nách áo giúp vung tay đập cầu linh hoạt.",
        ],
      },
    ];

    console.log(`Starting insertion of ${newProducts.length} new rich products...`);

    let createdCount = 0;
    for (const item of newProducts) {
      const exist = await Product.findOne({ title: item.title, deleted: false });
      if (exist) {
        console.log(`- Skipping existing product: ${item.title}`);
        continue;
      }

      const description = makeDescription(item.title, item.brand, item.specs, item.highlights);

      const productDoc = new Product({
        title: item.title,
        category_id: item.category_id,
        brand: item.brand,
        price: item.price,
        discountPercentage: item.discountPercentage || 0,
        featured: item.featured || "0",
        position: item.position,
        status: "active",
        thumbnail: item.thumbnail,
        images: item.images || [],
        sizes: item.sizes || [],
        description: description,
        deleted: false,
        createdBy: "69d1451f0ae978500e7e3413",
        updatedBy: "69d1451f0ae978500e7e3413",
      });

      await productDoc.save();
      createdCount++;
      console.log(`✓ [${createdCount}] Created: ${item.title} (Brand: ${item.brand})`);
    }

    const totalNow = await Product.countDocuments({ deleted: false });
    console.log(`===============================================`);
    console.log(`SUCCESSFULLY ADDED ${createdCount} NEW PRODUCTS!`);
    console.log(`TOTAL ACTIVE PRODUCTS IN DATABASE NOW: ${totalNow}`);
    console.log(`===============================================`);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding products:", err);
    process.exit(1);
  }
}

seedData();
