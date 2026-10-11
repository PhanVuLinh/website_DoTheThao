module.exports.index = async (req, res) => {
  res.render("client/pages/wishlist.pug", {
    title: "Sản Phẩm Yêu Thích - SportStore",
  });
};
