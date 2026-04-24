module.exports.permissionList = [
  {
    group: "Trang tổng quan",
    permissions: [{ label: "Xem", value: "dashboard_view" }],
  },
  {
    group: "Quản lý danh mục",
    permissions: [
      { label: "Xem", value: "category_view" },
      { label: "Thêm", value: "category_create" },
      { label: "Sửa", value: "category_edit" },
      { label: "Xóa", value: "category_delete" },
    ],
  },
  {
    group: "Quản lý sản phẩm",
    permissions: [
      { label: "Xem", value: "product_view" },
      { label: "Thêm", value: "product_create" },
      { label: "Sửa", value: "product_edit" },
      { label: "Xóa", value: "product_delete" },
    ],
  },
  {
    group: "Quản lý đơn hàng",
    permissions: [
      { label: "Xem", value: "order_view" },
      { label: "Sửa", value: "order_edit" },
      { label: "Xóa", value: "order_delete" },
    ],
  },
  {
    group: "Quản lý người dùng",
    permissions: [
      { label: "Xem", value: "user_view" },
      { label: "Sửa", value: "user_edit" },
      { label: "Xóa", value: "user_delete" },
    ],
  },
  {
    group: "Quản lý thông tin liên hệ",
    permissions: [
      { label: "Xem", value: "contact_view" },
      { label: "Xóa", value: "contact_delete" },
    ],
  },
  {
    group: "Cài đặt chung",
    permissions: [
      { label: "Xem", value: "setting_view" },
    ],
  },
  {
    group: "Thông tin cá nhân",
    permissions: [
      { label: "Xem", value: "profile_view" },
    ],
  },

];
