const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");

module.exports.createPost = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const cart = await Cart.findOne({
      _id: cartId,
    });
    req.body.cartId = cartId;

    const products = [];
    let subtotalValue = 0;

    for (const product of cart.products) {
      const productInfo = await Product.findOne({
        _id: product.product_id,
        deleted: false,
      }).select("price discountPercentage");

      if (productInfo) {
        const priceNew =
          productInfo.price * (1 - productInfo.discountPercentage / 100);
        subtotalValue += priceNew * product.quantity;
        const objectProduct = {
          product_id: product.product_id,
          quantity: product.quantity,
          size: product.size,
          price: productInfo.price,
          discountPercentage: productInfo.discountPercentage,
          priceNew: priceNew,
        };
        products.push(objectProduct);

        //cập nhật tồn kho
        await Product.updateOne(
          {
            _id: product.product_id,
            "sizes.size": product.size,
          },
          { $inc: { "sizes.$.stock": -product.quantity } },
        );
      }
    }
    req.body.products = products;
    //tạm tính
    req.body.subtotal = subtotalValue;
    //giảm giá
    req.body.discount = 0;
    ///thanh toán
    req.body.total = req.body.subtotal - req.body.discount;
    //trạng thái thanh toán
    req.body.paymentStatus = "unpaid";
    //trạng thái đơn hàng
    req.body.status = "initial";

    const newRecord = new Order(req.body);
    await newRecord.save();

    await Cart.updateOne({ _id: cartId }, { products: [] });

    req.flash("success", "Đặt hàng thành công");
    res.redirect("/");
  } catch (error) {
    req.flash("error", "Đặt hàng không thành công");
    res.redirect("/");
  }
};
