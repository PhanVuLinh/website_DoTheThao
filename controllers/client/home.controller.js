const moment = require("moment");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Article = require("../../models/article.model");
const Coupon = require("../../models/coupon.model");
const Order = require("../../models/order.model");
const Brand = require("../../models/brand.model");
const Review = require("../../models/review.model");
const FlashSale = require("../../models/flash-sale.model");

const productPriceHelper = require("../../helpers/getPriceNew.helper.js");

module.exports.index = async (req, res) => {
  try {
    const settingWebsiteInfo = res.locals.settingWebsiteInfo || {};

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

    for (const c of couponList) {
      c.expirationDateFormatted = c.expirationDate
        ? moment(c.expirationDate).format("DD/MM/YYYY")
        : "Vô thời hạn";
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
