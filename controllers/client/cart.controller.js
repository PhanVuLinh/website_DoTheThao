const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/getPriceNew.helper");

module.exports.cart = async (req, res) => {
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({ _id: cartId });
  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productId = item.product_id;
      const productInfo = await Product.findOne({
        _id: productId,
        deleted: false,
      }).select("title thumbnail price slug discountPercentage");

      productsHelper.priceNewOne(productInfo);
      item.productInfo = productInfo;
      item.totalPrice = productInfo.priceNew * item.quantity;
    }
  }
  cart.totalPrice = cart.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );
  res.render("client/pages/cart.pug", {
    title: "Giỏ hàng",
    cartDetail: cart,
  });
};

module.exports.addToCart = async (req, res) => {
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);
  const size = req.body.size;
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({ _id: cartId });

  const existProductInCart = cart.products.find(
    (item) => item.product_id === productId && item.size === size,
  );

  if (existProductInCart) {
    const quantityNew = quantity + existProductInCart.quantity;
    await Cart.updateOne(
      {
        _id: cartId,
        "products.product_id": productId,
        "products.size": size,
      },
      { $set: { "products.$.quantity": quantityNew } },
    );
  } else {
    const objectCart = {
      product_id: productId,
      quantity: quantity,
      size: size,
    };
    await Cart.updateOne({ _id: cartId }, { $push: { products: objectCart } });
  }

  req.flash("success", "Thêm vào giỏ hàng thành công");
  res.redirect(req.get("Referer"));
};

module.exports.deleteProduct = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;

  await Cart.updateOne(
    { _id: cartId },
    {
      $pull: { products: { product_id: productId } },
    },
  );

  req.flash("success", "xóa sản phẩm thành công");
  res.redirect(req.get("Referer"));
};

module.exports.updateQuantity = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  const quantity = req.params.quantity;
  await Cart.updateOne(
    {
      _id: cartId,
      "products.product_id": productId,
    },
    {
      $set: { "products.$.quantity": quantity },
    },
  );

  res.json({ success: true });
};
