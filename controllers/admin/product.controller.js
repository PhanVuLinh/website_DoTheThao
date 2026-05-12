const moment = require("moment");
const slugify = require("slugify");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Account = require("../../models/account.model");
const variableCongfig = require("../../config/variable");

const categoryHelper = require("../../helpers/category.helper");
const paginationHelper = require("../../helpers/pagination.helper");

module.exports.list = async (req, res) => {
  let find = {
    deleted: false,
  };
  //lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  //lọc theo người tạo
  if (req.query.createdBy) {
    find.createdBy = req.query.createdBy;
  }

  //lọc theo ngày tạo
  const dateFilter = {};
  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    dateFilter.$gte = startDate;
  }
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    dateFilter.$lte = endDate;
  }
  if (Object.keys(dateFilter).length > 0) {
    find.createdAt = dateFilter;
  }
  // Xử lý lọc giá
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    const minPrice = parseInt(priceRange[0]);
    const maxPrice = priceRange[1] ? parseInt(priceRange[1]) : null;

    if (maxPrice) {
      find.price = { $gte: minPrice, $lte: maxPrice };
    } else find.price = { $gte: minPrice };
  }

  // Xử lý lọc danh mục
  if (req.query.category) {
    find.category_id = req.query.category;
  }
  const categoryList = await Category.find({
    parent_id: { $ne: "" },
    deleted: false,
  });

  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true,
      locale: "vi",
      strict: true,
    });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }

  //Phân trang
  const countProduct = await Product.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countProduct,
  );
  //hết Phân trang
  const productList = await Product.find(find)
    .sort({ position: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of productList) {
    if (item.createdBy) {
      const infoAccountCreated = await Account.findOne({
        _id: item.createdBy,
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }
    if (item.updatedBy) {
      const infoAccountUpdated = await Account.findOne({
        _id: item.updatedBy,
      });
      item.updatedByFullName = infoAccountUpdated.fullName;
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }
  //List ADMIN
  const accountAdminList = await Account.find({
    deleted: false,
  }).select("id fullName");

  res.render("admin/pages/product-list.pug", {
    title: "Danh sách sản phẩm",
    productList: productList,
    accountAdminList: accountAdminList,
    pagination: objectPagination,
    categoryList: categoryList,
    categoryId: req.query.category,
    price: req.query.price,
  });
};

module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "active":
      case "inactive":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            status: type,
            updatedBy: updatedBy,
            updatedAt: new Date(),
          },
        );
        req.flash("success", `Đã cập nhật trạng thái ${ids.length} sản phẩm!`);
        break;

      case "delete-all":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash("success", `Đã chuyển ${ids.length} sản phẩm vào thùng rác!`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/product/list`);
    res.redirect(req.get("Referer"));
  }
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });
  const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  res.render("admin/pages/product-create.pug", {
    title: "Tạo sản phẩm mới",
    categoryList: categoryTree,
  });
};

module.exports.createPost = async (req, res) => {
  if (req.body.position) {
    req.body.position = parseInt(req.body.position);
  } else {
    const totalRecord = await Product.countDocuments({});
    req.body.position = totalRecord + 1;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.thumbnail =
    req.files && req.files.thumbnail
      ? req.files.thumbnail[0].path
      : delete req.body.thumbnail;
  req.body.price = req.body.price ? parseInt(req.body.price) : 0;
  req.body.discountPercentage = req.body.discountPercentage
    ? parseInt(req.body.discountPercentage)
    : 0;
  if (req.body.sizes) {
    req.body.sizes = req.body.sizes.map((item) => ({
      ...item,
      stock: item.stock ? parseInt(item.stock) : 0,
    }));
  }

  if (req.files && req.files.images && req.files.images.length > 0) {
    req.body.images = req.files.images.map((file) => file.path);
  } else {
    delete req.body.images;
  }

  const newRecord = new Product(req.body);
  await newRecord.save();

  req.flash("success", "Tạo sản phẩm thành công");
  res.redirect(`/${variableCongfig.pathAdmin}/product/list`);
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const productDetail = await Product.findOne({
      _id: id,
      deleted: false,
    });

    const categoryList = await Category.find({
      deleted: false,
    });
    const categoryTree = categoryHelper.buildCategoryTree(categoryList);
    res.render("admin/pages/product-edit.pug", {
      title: "Chỉnh sửa sản phẩm",
      categoryList: categoryTree,
      productDetail: productDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/product/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Product.countDocuments({});
      req.body.position = totalRecord + 1;
    }
    req.body.updatedBy = req.account.id;
    if (req.files && req.files.thumbnail) {
      req.body.thumbnail = req.files.thumbnail[0].path;
    } else {
      delete req.body.thumbnail;
    }

    req.body.price = req.body.price ? parseInt(req.body.price) : 0;
    req.body.discountPercentage = req.body.discountPercentage
      ? parseInt(req.body.discountPercentage)
      : 0;
    if (req.body.sizes) {
      req.body.sizes = req.body.sizes.map((item) => ({
        ...item,
        stock: item.stock ? parseInt(item.stock) : 0,
      }));
    }

    let oldImages = req.body.old_images || [];
    if (req.files && req.files.images && req.files.images.length > 0) {
      const newImages = req.files.images.map((file) => file.path);
      req.body.images = [...oldImages, ...newImages];
    } else {
      req.body.images = oldImages;
    }
    delete req.body.old_images;

    await Product.updateOne({ _id: id }, req.body);

    req.flash("success", "Cập nhật sản phẩm thành công");
    res.redirect(`/${variableCongfig.pathAdmin}/product/edit/${id}`);
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/product/list`);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );
    req.flash("success", "Xóa sản phẩm thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/category/list`);
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true,
      locale: "vi",
      strict: true,
    });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }

  //Phân trang
  const countProduct = await Product.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countProduct,
  );
  //hết Phân trang
  const productList = await Product.find(find)
    .sort({ deletedAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of productList) {
    if (item.createdBy) {
      const infoAccountCreated = await Account.findOne({
        _id: item.createdBy,
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }
    if (item.deletedBy) {
      const infoAccountDeleted = await Account.findOne({
        _id: item.deletedBy,
      });
      item.deletedByFullName = infoAccountDeleted.fullName;
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/product-trash.pug", {
    title: "Thùng rác sản phẩm",
    productList: productList,
    pagination: objectPagination,
  });
};

module.exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục sản phẩm thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.deleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn sản phẩm thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.changeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "restore-all":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash("success", `Đã khôi phục ${ids.length} sản phẩm!`);
        break;

      case "delete-all":
        await Product.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", `Đã xóa ${ids.length} vĩnh viễn sản phẩm`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
    res.redirect(req.get("Referer"));
  }
};
