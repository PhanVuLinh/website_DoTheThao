module.exports.priceNewProduct = (productList) => {
  const newProductPriceNew = productList.map((item) => {
    if (item.discountPercentage > 0) {
      item.priceNew =
        item.price - ((item.price * item.discountPercentage) / 100).toFixed(0);
    }
    return item;
  });
  return newProductPriceNew;
};
