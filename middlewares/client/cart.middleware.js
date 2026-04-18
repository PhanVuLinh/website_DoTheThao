const Cart = require("../../models/cart.model");

module.exports.cartId = async (req, res, next) => {
  if (!req.cookies.cartId) {
    cart = new Cart();
    await cart.save();
    
    res.cookie("cartId", cart.id, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 1 tháng
    });
  } else {
    const cart = await Cart.findOne({ _id: req.cookies.cartId });
    cart.totalQuantity = cart.products.length;
    res.locals.miniCart = cart.totalQuantity;
  }

  next();
};
