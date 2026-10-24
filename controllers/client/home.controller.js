const moment = require("moment");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Article = require("../../models/article.model");
const Coupon = require("../../models/coupon.model");
const Order = require("../../models/order.model");
const Brand = require("../../models/brand.model");
const Review = require("../../models/review.model");
const FlashSale = require("../../models/flash-sale.model");
const SettingWebsiteInfo = require("../../models/setting-website-info.model");

const productPriceHelper = require("../../helpers/getPriceNew.helper.js");

module.exports.index = async (req, res) => {
  try {
    const settingWebsiteInfo = res.locals.settingWebsiteInfo || {};

    // 0. Chuẩn bị danh sách Hero Slides Banner Chính với Dữ Liệu Thật & Ảnh Thật từ Database
    const formatVND = (price) => {
      return price ? new Intl.NumberFormat("vi-VN").format(price) + "đ" : "";
    };

    // Tìm các sản phẩm thật từ CSDL cho từng bộ môn thể thao
    const fallbackAnyProd = await Product.findOne({
      deleted: false,
      status: "active",
    }).sort({ position: -1 }).lean();

    const footballProd = (await Product.findOne({
      deleted: false,
      status: "active",
      $or: [
        { title: { $regex: /Mercurial|Phantom|Predator|bóng đá|đá bóng|Kamito|Wika/i } },
        { brand: { $regex: /Nike|Adidas|Puma|Kamito|Wika/i } },
      ],
    }).sort({ featured: -1, position: -1 }).lean()) || fallbackAnyProd;

    const badmintonProd = (await Product.findOne({
      deleted: false,
      status: "active",
      $or: [
        { title: { $regex: /Yonex|Astrox|Nanoflare|Axforce|Lining|Victor|Cầu Lông/i } },
        { brand: { $regex: /Yonex|Lining|Victor/i } },
      ],
    }).sort({ featured: -1, position: -1 }).lean()) || fallbackAnyProd;

    const volleyballProd = (await Product.findOne({
      deleted: false,
      status: "active",
      $or: [
        { title: { $regex: /Asics|Metarise|Lightning|Momentum|Bóng Chuyền|Mikasa|Gerustar/i } },
        { brand: { $regex: /Asics|Mizuno|Mikasa|Gerustar/i } },
      ],
    }).sort({ featured: -1, position: -1 }).lean()) || fallbackAnyProd;

    const dealProd = (await Product.findOne({
      deleted: false,
      status: "active",
      discountPercentage: { $gt: 5 },
    }).sort({ discountPercentage: -1, position: -1 }).lean()) || fallbackAnyProd;

    if (footballProd) productPriceHelper.priceNewOne(footballProd);
    if (badmintonProd) productPriceHelper.priceNewOne(badmintonProd);
    if (volleyballProd) productPriceHelper.priceNewOne(volleyballProd);
    if (dealProd) productPriceHelper.priceNewOne(dealProd);

    const defaultHeroSlides = [
      {
        badge: "🏆 BÓNG ĐÁ CHUYÊN NGHIỆP • MÙA GIẢI 2026",
        title: "BỨT TỐC MỌI TRẬN ĐẤU<br>LÀM CHỦ SÂN CỎ",
        description: "Bộ sưu tập giày đinh Nike Mercurial, Puma Future cao cấp cùng bóng thi đấu chuẩn FIFA và đồng phục CLB chính hãng.",
        btnText: "Khám Phá Bóng Đá",
        btnLink: "/category/bong-da",
        secondaryBtnText: "Săn Voucher Hot",
        secondaryBtnLink: "#voucher-vault",
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&auto=format&fit=crop&q=85",
        showcaseTag: "🔥 BEST SELLER SÂN CỎ",
        showcaseTitle: footballProd ? footballProd.title : "Giày đá bóng Nike Mercurial Superfly 9 Elite FG",
        showcasePrice: footballProd ? formatVND(footballProd.priceNew) : "2.450.000đ",
        showcaseOldPrice: footballProd && footballProd.discountPercentage > 0 ? formatVND(footballProd.price) : "",
        showcaseImage: footballProd ? (footballProd.thumbnail || (footballProd.images && footballProd.images[0])) : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        showcaseLink: footballProd ? `/product/detail/${footballProd.slug}` : "/product",
      },
      {
        badge: "🏸 CẦU LÔNG QUỐC TẾ • TẤN CÔNG ĐỈNH CAO",
        title: "SMASH UY LỰC<br>KIỂM SOÁT TỪNG ĐƯỜNG CẦU",
        description: "Vợt carbon Yonex Astrox, Lining Axforce trợ lực đầm đầu, giày bám thảm Power Cushion và phụ kiện thi đấu quốc tế.",
        btnText: "Xem Đồ Cầu Lông",
        btnLink: "/category/cau-long",
        secondaryBtnText: "Voucher Giảm 50%",
        secondaryBtnLink: "#voucher-vault",
        image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1920&auto=format&fit=crop&q=85",
        showcaseTag: "⚡ SIÊU PHẨM CẦU LÔNG",
        showcaseTitle: badmintonProd ? badmintonProd.title : "Vợt Cầu Lông Yonex Astrox 100ZZ Kurenai",
        showcasePrice: badmintonProd ? formatVND(badmintonProd.priceNew) : "3.890.000đ",
        showcaseOldPrice: badmintonProd && badmintonProd.discountPercentage > 0 ? formatVND(badmintonProd.price) : "",
        showcaseImage: badmintonProd ? (badmintonProd.thumbnail || (badmintonProd.images && badmintonProd.images[0])) : "https://images.unsplash.com/photo-1613918431703-aa503f5e55e0?w=600&auto=format&fit=crop&q=80",
        showcaseLink: badmintonProd ? `/product/detail/${badmintonProd.slug}` : "/product",
      },
      {
        badge: "🏐 BÓNG CHUYỀN CHUYÊN NGHIỆP • BẬT NHẢY TỐI ĐA",
        title: "BẬT CAO DỨT ĐIỂM<br>CHINH PHỤC LƯỚI ĐẤU",
        description: "Giày bóng chuyền Asics Metarise, Mizuno Wave Momentum đệm Gel giảm chấn, bảo hộ khớp gối và bóng thi đấu Mikasa chính hãng.",
        btnText: "Xem Đồ Bóng Chuyền",
        btnLink: "/category/bong-chuyen",
        secondaryBtnText: "Ưu Đãi Hôm Nay",
        secondaryBtnLink: "#voucher-vault",
        image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1920&auto=format&fit=crop&q=85",
        showcaseTag: "🚀 ĐỆM BẬT POWER CUSHION",
        showcaseTitle: volleyballProd ? volleyballProd.title : "Giày Bóng Chuyền Asics Metarise Sunrise Red",
        showcasePrice: volleyballProd ? formatVND(volleyballProd.priceNew) : "2.950.000đ",
        showcaseOldPrice: volleyballProd && volleyballProd.discountPercentage > 0 ? formatVND(volleyballProd.price) : "",
        showcaseImage: volleyballProd ? (volleyballProd.thumbnail || (volleyballProd.images && volleyballProd.images[0])) : "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
        showcaseLink: volleyballProd ? `/product/detail/${volleyballProd.slug}` : "/product",
      },
      {
        badge: "⚡ FLASH SALE HÔM NAY • GIẢM ĐẾN 50%",
        title: "BỘ SƯU TẬP 2026<br>KHẲNG ĐỊNH ĐẲNG CẤP",
        description: "Trang bị thể thao chính hãng cao cấp từ Nike, Adidas, Yonex, Mizuno với giá ưu đãi độc quyền chỉ có tại TitiSport.",
        btnText: "Săn Flash Sale Ngay",
        btnLink: "/product",
        secondaryBtnText: "Kho Voucher Ví",
        secondaryBtnLink: "#voucher-vault",
        image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1920&auto=format&fit=crop&q=85",
        showcaseTag: "💥 GIỜ VÀNG GIÁ SỐC",
        showcaseTitle: dealProd ? dealProd.title : "Giày Đá Bóng Adidas Predator 24 Elite",
        showcasePrice: dealProd ? formatVND(dealProd.priceNew) : "3.250.000đ",
        showcaseOldPrice: dealProd && dealProd.discountPercentage > 0 ? formatVND(dealProd.price) : "",
        showcaseImage: dealProd ? (dealProd.thumbnail || (dealProd.images && dealProd.images[0])) : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        showcaseLink: dealProd ? `/product/detail/${dealProd.slug}` : "/product",
      },
    ];

    const hasValidRealSlides =
      Array.isArray(settingWebsiteInfo.heroSlides) &&
      settingWebsiteInfo.heroSlides.length >= 3 &&
      settingWebsiteInfo.heroSlides.every(
        (s) => s.image && typeof s.image === "string" && s.image.startsWith("http") && s.showcaseTitle && s.showcaseImage
      );

    const heroSlides = hasValidRealSlides ? settingWebsiteInfo.heroSlides : defaultHeroSlides;

    // Tự động đồng bộ vào MongoDB nếu trong CSDL chưa có dữ liệu banner thật đầy đủ
    if (!hasValidRealSlides) {
      await SettingWebsiteInfo.updateOne(
        {},
        {
          $set: {
            heroSlides: defaultHeroSlides,
            heroImage: defaultHeroSlides[0].image,
            heroBadge: defaultHeroSlides[0].badge,
            heroTitle: defaultHeroSlides[0].title,
            heroDescription: defaultHeroSlides[0].description,
            heroBtnText: defaultHeroSlides[0].btnText,
            heroBtnLink: defaultHeroSlides[0].btnLink,
            promoBannerImage:
              settingWebsiteInfo.promoBannerImage && settingWebsiteInfo.promoBannerImage.startsWith("http")
                ? settingWebsiteInfo.promoBannerImage
                : "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1600&auto=format&fit=crop&q=80",
          },
        }
      ).catch((err) => console.error("Error updating heroSlides:", err));

      if (res.locals.settingWebsiteInfo) {
        res.locals.settingWebsiteInfo.heroSlides = defaultHeroSlides;
        res.locals.settingWebsiteInfo.heroImage = defaultHeroSlides[0].image;
      }
    }

    // 1. Khám phá các bộ môn thể thao chính & Danh mục con (Sport Hub & Sub-categories)
    const rawParents = await Category.find({
      deleted: false,
      status: "active",
      $or: [{ parent_id: "" }, { parent_id: null }, { parent_id: { $exists: false } }],
    }).sort({ position: "desc" }).lean();

    const rawChildren = await Category.find({
      deleted: false,
      status: "active",
      parent_id: { $ne: "" },
    }).sort({ position: "desc" }).lean();

    const sportMetadata = {
      "bong-da": {
        icon: "fa-regular fa-futbol",
        badge: "BÓNG ĐÁ CHUYÊN NGHIỆP",
        tagline: "Làm Chủ Sân Cỏ • Bứt Tốc Mọi Trận Đấu",
        description: "Giày đinh FG/TF cao cấp, bóng thi đấu FIFA Quality, đồng phục CLB và phụ kiện bảo vệ.",
        bannerImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&auto=format&fit=crop&q=80",
        theme: "theme-football",
      },
      "bong-chuyen": {
        icon: "fa-solid fa-volleyball",
        badge: "BÓNG CHUYỀN ĐỈNH CAO",
        tagline: "Bật Nhảy Tối Đa • Kiểm Soát Lưới Đấu",
        description: "Giày đệm bật Asics/Mizuno, banh da Gerustar/Mikasa thi đấu và băng bảo vệ khớp gối chuyên dụng.",
        bannerImage: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&auto=format&fit=crop&q=80",
        theme: "theme-volleyball",
      },
      "cau-long": {
        icon: "fa-solid fa-feather-pointed",
        badge: "CẦU LÔNG TỐC ĐỘ",
        tagline: "Linh Hoạt Chuẩn Xác • Smash Uy Lực",
        description: "Vợt carbon Yonex/Lining đỉnh cao, quả cầu thi đấu độ bền cao, giày bám thảm và balo chuyên dụng.",
        bannerImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=900&auto=format&fit=crop&q=80",
        theme: "theme-badminton",
      },
    };

    // Đếm số sản phẩm thực tế cho từng danh mục con
    const categoryChildren = [];
    for (const c of rawChildren) {
      const pCount = await Product.countDocuments({
        deleted: false,
        status: "active",
        category_id: c._id.toString(),
      });
      const parent = rawParents.find((p) => p._id.toString() === c.parent_id);
      categoryChildren.push({
        ...c,
        productCount: pCount,
        parentTitle: parent ? parent.title : "Thể thao",
        parentSlug: parent ? parent.slug : "the-thao",
        parentIcon: parent && sportMetadata[parent.slug] ? sportMetadata[parent.slug].icon : "fa-solid fa-trophy",
      });
    }

    // Danh sách 3 Hero Sport Cards cho 3 môn thể thao trụ cột
    const sportHubList = [];
    for (const p of rawParents) {
      const meta = sportMetadata[p.slug] || {
        icon: "fa-solid fa-trophy",
        badge: p.title.toUpperCase(),
        tagline: "Trang bị thể thao chính hãng",
        description: "Đầy đủ dụng cụ phục vụ luyện tập và thi đấu.",
        bannerImage: p.thumbnail || "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=900&auto=format&fit=crop&q=80",
        theme: "theme-general",
      };

      const children = categoryChildren.filter((c) => c.parent_id === p._id.toString());
      const childIds = children.map((c) => c._id.toString());
      childIds.push(p._id.toString());

      const totalSportProducts = await Product.countDocuments({
        deleted: false,
        status: "active",
        category_id: { $in: childIds },
      });

      // Bỏ qua các danh mục nháp/demo không có danh mục con và không có sản phẩm
      if (children.length === 0 && totalSportProducts === 0) {
        continue;
      }

      sportHubList.push({
        _id: p._id,
        title: p.title,
        slug: p.slug,
        icon: meta.icon,
        badge: meta.badge,
        tagline: meta.tagline,
        description: meta.description,
        bannerImage: meta.bannerImage,
        theme: meta.theme,
        totalProducts: totalSportProducts,
        subcategories: children,
      });
    }

    // 2. Mã giảm giá độc quyền đang hoạt động (Exclusive Coupons from DB)
    const couponList = await Coupon.find({
      deleted: false,
      status: "active",
    })
      .sort({ discountPercentage: "desc" })
      .limit(4);

    const themeBadges = [
      { tag: "HOT DEAL", icon: "fa-solid fa-fire" },
      { tag: "WEEKEND", icon: "fa-solid fa-bolt" },
      { tag: "SPECIAL", icon: "fa-solid fa-star" },
      { tag: "EXCLUSIVE", icon: "fa-solid fa-crown" },
    ];

    for (let i = 0; i < couponList.length; i++) {
      const c = couponList[i];
      c.expirationDateFormatted = c.expirationDate
        ? moment(c.expirationDate).format("DD/MM/YYYY")
        : "Vô thời hạn";

      const totalQty = c.quantity || 50;
      const usedQty = (c.usedBy && Array.isArray(c.usedBy)) ? c.usedBy.length : 0;
      const percentUsed = Math.min(92, Math.max(45, Math.round(((usedQty + 7) / (totalQty + 10)) * 100)));
      c.percentUsed = percentUsed;
      c.themeBadge = themeBadges[i % themeBadges.length];
    }

    // 3. Flash Sale: Tìm chiến dịch Flash Sale thực tế đang diễn ra
    const now = new Date();
    const activeFlashSale = await FlashSale.findOne({
      deleted: false,
      status: "active",
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate({
      path: "items.product_id",
      select: "_id title slug price thumbnail images brand featured isNew",
    });

    let productListSection3 = [];

    if (activeFlashSale && Array.isArray(activeFlashSale.items) && activeFlashSale.items.length > 0) {
      for (const item of activeFlashSale.items) {
        if (!item.product_id) continue;
        const p = item.product_id;
        const originalPrice = p.price || 0;
        const discount = item.discountPercentage || 0;
        const salePrice = item.flashSalePrice || Math.round((originalPrice * (100 - discount)) / 100);
        const quantity = item.quantity || 0;
        const sold = item.sold || 0;
        const percentSold = quantity > 0 ? Math.min(100, Math.round((sold / quantity) * 100)) : 0;

        productListSection3.push({
          _id: p._id,
          title: p.title,
          slug: p.slug,
          thumbnail: p.thumbnail || (Array.isArray(p.images) && p.images[0]) || "",
          images: p.images || [],
          brand: p.brand,
          featured: p.featured,
          isNew: p.isNew,
          price: originalPrice,
          priceNew: salePrice,
          discountPercentage: discount,
          quantityQuota: quantity,
          soldCount: sold,
          percentSold: percentSold,
        });
      }
    }

    // 4. Sản phẩm Nổi bật (Featured Products)
    let productFeaturedSection5Raw = await Product.find({
      deleted: false,
      status: "active",
      featured: "1",
    })
      .sort({ position: "desc" })
      .limit(8);

    if (productFeaturedSection5Raw.length < 8) {
      const existingIds = productFeaturedSection5Raw.map((p) => p._id);
      const additionalProducts = await Product.find({
        deleted: false,
        status: "active",
        _id: { $nin: existingIds },
      })
        .sort({ position: "desc", createdAt: "desc" })
        .limit(8 - productFeaturedSection5Raw.length);

      productFeaturedSection5Raw = [...productFeaturedSection5Raw, ...additionalProducts];
    }

    const productFeaturedSection5 = productPriceHelper.priceNewProduct(productFeaturedSection5Raw);

    // 5. Sản phẩm Mới nhất (Newest Arrivals)
    const productListSection7Raw = await Product.find({
      deleted: false,
      status: "active",
    })
      .sort({ createdAt: "desc" })
      .limit(8);

    const productListSection7 = productPriceHelper.priceNewProduct(productListSection7Raw);

    // 6. Phân nhóm môn thể thao cho Interactive Category Tabs (Dữ liệu thực từ DB & Cấu hình Admin)
    // - Tab 1 (Mặc định: Bóng Đá hoặc Category được Admin chọn)
    let sportsTab1 = null;
    if (settingWebsiteInfo.sportsTab1_id) {
      sportsTab1 = await Category.findOne({ _id: settingWebsiteInfo.sportsTab1_id, deleted: false });
    }
    if (!sportsTab1) {
      sportsTab1 = await Category.findOne({ title: { $regex: /Bóng Đá/i }, deleted: false });
    }

    let footballCategoryIds = [];
    if (sportsTab1) {
      const children1 = await Category.find({ parent_id: sportsTab1._id.toString(), deleted: false });
      footballCategoryIds = [sportsTab1._id.toString(), ...children1.map((c) => c._id.toString())];
    }
    const footballProductsRaw = await Product.find({
      deleted: false,
      status: "active",
      category_id: { $in: footballCategoryIds },
    }).limit(8);
    const footballProducts = productPriceHelper.priceNewProduct(footballProductsRaw);

    // - Tab 2 (Mặc định: Bóng Chuyền hoặc Category được Admin chọn)
    let sportsTab2 = null;
    if (settingWebsiteInfo.sportsTab2_id) {
      sportsTab2 = await Category.findOne({ _id: settingWebsiteInfo.sportsTab2_id, deleted: false });
    }
    if (!sportsTab2) {
      sportsTab2 = await Category.findOne({ title: { $regex: /Bóng Chuyền/i }, deleted: false });
    }

    let volleyballCategoryIds = [];
    if (sportsTab2) {
      const children2 = await Category.find({ parent_id: sportsTab2._id.toString(), deleted: false });
      volleyballCategoryIds = [sportsTab2._id.toString(), ...children2.map((c) => c._id.toString())];
    }
    const volleyballProductsRaw = await Product.find({
      deleted: false,
      status: "active",
      category_id: { $in: volleyballCategoryIds },
    }).limit(8);
    const volleyballProducts = productPriceHelper.priceNewProduct(volleyballProductsRaw);

    // 7. Tin tức thể thao (Articles from DB)
    const articleListSection9 = await Article.find({
      deleted: false,
      status: "active",
    })
      .sort({ createdAt: "desc" })
      .limit(5);

    for (const item of articleListSection9) {
      item.createdAtFormat = moment(item.createdAt).format("DD/MM/YYYY");
    }

    const newsCenter = articleListSection9[0] || null;
    const newsLeft = articleListSection9.slice(1, 3);
    const newsRight = articleListSection9.slice(3, 5);

    // 8. Đánh giá nổi bật / Cảm nhận khách hàng (Testimonials từ DB)
    let testimonialsList = await Review.find({
      deleted: false,
      status: "active",
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(6);

    if (testimonialsList.length === 0) {
      testimonialsList = await Review.find({
        deleted: false,
        status: "active",
        rating: 5,
      })
        .sort({ createdAt: -1 })
        .limit(3);
    }

    // 9. Danh sách thương hiệu đối tác (Brands từ DB)
    const brandList = await Brand.find({
      deleted: false,
      status: "active",
    }).sort({ position: 1, createdAt: 1 });

    // 10. Thống kê thực tế từ DB để hiển thị Trust Bar (Real Store Stats)
    const totalProductsCount = await Product.countDocuments({ deleted: false, status: "active" });
    const totalOrdersCount = await Order.countDocuments({});
    const totalCategoriesCount = await Category.countDocuments({ deleted: false });

    res.render("client/pages/home.pug", {
      title: "Trang chủ",
      heroSlides: heroSlides,
      sportHubList: sportHubList,
      categoryChildren: categoryChildren,
      couponList: couponList,
      activeFlashSale: activeFlashSale,
      productListSection3: productListSection3,
      productFeaturedSection5: productFeaturedSection5,
      productListSection7: productListSection7,
      sportsTab1: sportsTab1,
      sportsTab2: sportsTab2,
      footballProducts: footballProducts,
      volleyballProducts: volleyballProducts,
      newsCenter: newsCenter,
      newsLeft: newsLeft,
      newsRight: newsRight,
      testimonialsList: testimonialsList,
      brandList: brandList,
      storeStats: {
        totalProducts: totalProductsCount,
        totalOrders: totalOrdersCount,
        totalCategories: totalCategoriesCount,
      },
    });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.redirect("/product");
  }
};
