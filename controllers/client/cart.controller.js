const Product = require("../../models/product.model");
module.exports.cart = (req, res) => {
  res.render("client/pages/cart.pug", {
    title: "Giỏ hàng",
  });
}

module.exports.detail = async (req, res) => {
  const cart = req.body;
  for (const item of cart) {
    const productInfo = await Product.findOne({
      _id: item.productId,
      status: "active",
      deleted: false,
    });
    
    if(productInfo) {
      item.thumbnail = productInfo.thumbnail;
      item.title = productInfo.title;
      item.price = productInfo.price;
      item.discountPercentage = productInfo.discountPercentage;
      item.sizes = productInfo.sizes;
      item.slug = productInfo.slug;
    } else {
      const indexItem = cart.findIndex(product => product.productId === item.productId);
      cart.splice(indexItem, 1);
    }
  }
 
  console.log(cart);
  res.json({
    code: 200,
    cart: cart,
  });
}

