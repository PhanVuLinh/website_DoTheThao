const moment = require("moment");
const Brand = require("../../models/brand.model");
const variableConfig = require("../../config/variable");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/brand/list
module.exports.list = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };

    if (req.query.status) {
      find.status = req.query.status;
    }

    if (req.query.keyword) {
      const keyword = req.query.keyword.trim();
      find.name = new RegExp(keyword, "i");
    }

    const countBrands = await Brand.countDocuments(find);
    const objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 10,
      },
      req.query,
      countBrands,
    );

    const brands = await Brand.find(find)
      .sort({ position: 1, createdAt: -1 })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip)
      .lean();

    brands.forEach((item) => {
      item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    });

    res.render("admin/pages/brand-list.pug", {
      title: "Quản lý thương hiệu đối tác",
      brands: brands,
      filterStatus: req.query.status || "",
      keyword: req.query.keyword || "",
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Admin brand list error:", error);
    req.flash("error", "Lỗi tải danh sách thương hiệu!");
    res.redirect(`/${variableConfig.pathAdmin}/dashboard`);
  }
};

// [GET] /admin/brand/create
module.exports.create = (req, res) => {
  res.render("admin/pages/brand-create.pug", {
    title: "Thêm mới thương hiệu đối tác",
  });
};

// [POST] /admin/brand/create
module.exports.createPost = async (req, res) => {
  try {
    if (req.file) {
      req.body.logo = req.file.path;
    }

    if (req.body.position) {
      req.body.position = parseInt(req.body.position, 10);
    } else {
      const totalBrands = await Brand.countDocuments({ deleted: false });
      req.body.position = totalBrands + 1;
    }

    req.body.createdBy = req.account ? req.account.id : "";

    const newBrand = new Brand(req.body);
    await newBrand.save();

    req.flash("success", "Thêm thương hiệu mới thành công!");
    res.redirect(`/${variableConfig.pathAdmin}/brand/list`);
  } catch (error) {
    console.error("Create brand error:", error);
    req.flash("error", "Có lỗi xảy ra khi tạo thương hiệu!");
    res.redirect(req.get("Referer") || `/${variableConfig.pathAdmin}/brand/list`);
  }
};

// [GET] /admin/brand/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const brand = await Brand.findOne({ _id: id, deleted: false });

    if (!brand) {
      req.flash("error", "Thương hiệu không tồn tại!");
      return res.redirect(`/${variableConfig.pathAdmin}/brand/list`);
    }

    res.render("admin/pages/brand-edit.pug", {
      title: "Chỉnh sửa thương hiệu đối tác",
      brand: brand,
    });
  } catch (error) {
    console.error("Edit brand error:", error);
    req.flash("error", "Lỗi tải thông tin thương hiệu!");
    res.redirect(`/${variableConfig.pathAdmin}/brand/list`);
  }
};

// [PATCH] /admin/brand/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    if (req.file) {
      req.body.logo = req.file.path;
    }

    if (req.body.position) {
      req.body.position = parseInt(req.body.position, 10);
    }

    req.body.updatedBy = req.account ? req.account.id : "";

    await Brand.updateOne({ _id: id }, req.body);

    req.flash("success", "Cập nhật thương hiệu thành công!");
    res.redirect(req.get("Referer") || `/${variableConfig.pathAdmin}/brand/list`);
  } catch (error) {
    console.error("Edit patch brand error:", error);
    req.flash("error", "Lỗi cập nhật thương hiệu!");
    res.redirect(`/${variableConfig.pathAdmin}/brand/list`);
  }
};

// [PATCH] /admin/brand/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const { status, id } = req.params;
    await Brand.updateOne(
      { _id: id },
      {
        status: status,
        updatedBy: req.account ? req.account.id : "",
      },
    );

    req.flash("success", "Cập nhật trạng thái thương hiệu thành công!");
    res.redirect(req.get("Referer") || `/${variableConfig.pathAdmin}/brand/list`);
  } catch (error) {
    console.error("Change status brand error:", error);
    req.flash("error", "Lỗi cập nhật trạng thái!");
    res.redirect(`/${variableConfig.pathAdmin}/brand/list`);
  }
};

// [PATCH] /admin/brand/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account ? req.account.id : "";

    switch (type) {
      case "active":
      case "inactive":
        await Brand.updateMany(
          { _id: { $in: ids } },
          {
            status: type,
            updatedBy: updatedBy,
            updatedAt: new Date(),
          },
        );
        req.flash("success", `Đã cập nhật trạng thái ${ids.length} thương hiệu!`);
        break;

      case "delete-all":
        await Brand.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash("success", `Đã xóa ${ids.length} thương hiệu!`);
        break;

      default:
        break;
    }

    res.redirect(req.get("Referer") || `/${variableConfig.pathAdmin}/brand/list`);
  } catch (error) {
    console.error("Change multi brand error:", error);
    req.flash("error", "Lỗi cập nhật nhiều thương hiệu!");
    res.redirect(`/${variableConfig.pathAdmin}/brand/list`);
  }
};

// [DELETE] /admin/brand/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Brand.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: req.account ? req.account.id : "",
      },
    );

    req.flash("success", "Đã xóa thương hiệu thành công!");
    res.redirect(req.get("Referer") || `/${variableConfig.pathAdmin}/brand/list`);
  } catch (error) {
    console.error("Delete brand error:", error);
    req.flash("error", "Lỗi xóa thương hiệu!");
    res.redirect(`/${variableConfig.pathAdmin}/brand/list`);
  }
};
