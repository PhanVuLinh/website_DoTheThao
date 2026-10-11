module.exports.priceNewProduct = (productList) => {
  const newProductPriceNew = productList.map((item) => {
    if (item.discountPercentage > 0) {
      item.priceNew =
        item.price - Math.round((item.price * item.discountPercentage) / 100);
    } else {
      item.priceNew = item.price;
    }
    if (!item.thumbnail && Array.isArray(item.images) && item.images.length > 0) {
      item.thumbnail = item.images[0];
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