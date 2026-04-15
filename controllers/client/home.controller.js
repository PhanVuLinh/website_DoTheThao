const Product = require("../../models/product.model");

const productPriceHelper = require("../../helpers/getPriceNew.helper.js");
module.exports.index = async (req, res) => {
  //section 3
  const productListSection3 = await Product.find({
    deleted: false,
    status: "active",
  })
    .sort({
      position: "desc",
    })
    .limit(6)
    .lean();
  const newProductListSection3 =
    productPriceHelper.priceNewProduct(productListSection3);
  //End section 3

  //section 5
  const productFeaturedSection5 = await Product.find({
    deleted: false,
    status: "active",
    featured: "1",
  })
    .sort({
      position: "desc",
    })
    .limit(8)
    .lean();

  const newProductFeaturedSection5 = productPriceHelper.priceNewProduct(
    productFeaturedSection5,
  );
  //End section 5

  //section 7
  const productListSection7 = await Product.find({
    deleted: false,
    status: "active",
  })
    .sort({
      position: "desc",
    })
    .limit(8)
    .lean();

  const newProductListSection7 =
    productPriceHelper.priceNewProduct(productListSection7);
  //End section 7
  res.render("client/pages/home.pug", {
    title: "Trang chủ",
    productListSection3: newProductListSection3,
    productFeaturedSection5: newProductFeaturedSection5,
    productListSection7: newProductListSection7,
  });
};
