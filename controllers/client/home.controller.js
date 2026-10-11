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

    // 1. Danh mục sản phẩm con (Sub-categories for visual exploration)
    const categoryChildren = await Category.find({
      deleted: false,
      parent_id: { $ne: "" },
    }).sort({ position: "desc" });

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
      select: "_id title slug price thumbnail brand featured isNew",
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
          thumbnail: p.thumbnail,
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
    const productFeaturedSection5Raw = await Product.find({
      deleted: false,
      status: "active",
      featured: "1",
    })
      .sort({ position: "desc" })
      .limit(8);

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
