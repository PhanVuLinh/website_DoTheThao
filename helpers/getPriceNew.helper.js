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

module.exports.priceNewOne = (product) => {
  if (product.discountPercentage > 0) {
    product.priceNew =
      product.price -
      Math.round((product.price * product.discountPercentage) / 100);
  } else {
    product.priceNew = product.price;
  }

  return product;
};