module.exports.permissionList = [
  {
    group: "Trang tổng quan",
    permissions: [{ label: "Xem", value: "dashboard_view" }],
  },
  {
    group: "Quản lý danh mục",
    permissions: [
      { label: "Xem danh sách", value: "category_view" },
      { label: "Thêm mới", value: "category_create" },
      { label: "chỉnh sửa", value: "category_edit" },
      { label: "Xóa (Tạm thời)", value: "category_delete" },
      { label: "Xem thùng rác", value: "category_trash" },
      { label: "Khôi phục", value: "category_restore" },
      { label: "Xóa vĩnh viễn", value: "category_destroy" },
    ],
  },
  {
    group: "Quản lý sản phẩm",
    permissions: [
      { label: "Xem danh sách", value: "product_view" },
      { label: "Thêm mới", value: "product_create" },
      { label: "Chỉnh sửa", value: "product_edit" },
      { label: "Xóa (Tạm thời)", value: "product_delete" },
      { label: "Xem thùng rác", value: "product_trash" },
      { label: "Khôi phục", value: "product_restore" },
      { label: "Xóa vĩnh viễn", value: "product_destroy" },
    ],
  },
  {
    group: "Quản lý mã giảm giá (Coupon)",
    permissions: [
      { label: "Xem danh sách", value: "coupon_view" },
      { label: "Thêm mới", value: "coupon_create" },
      { label: "Chỉnh sửa", value: "coupon_edit" },
      { label: "Xóa (Tạm thời)", value: "coupon_delete" },
      { label: "Xem thùng rác", value: "coupon_trash" },
      { label: "Khôi phục", value: "coupon_restore" },
      { label: "Xóa vĩnh viễn", value: "coupon_destroy" },
    ],
  },
  {
    group: "Quản lý đơn hàng",
    permissions: [
      { label: "Xem danh sách", value: "order_view" },
      { label: "Cập nhật trạng thái", value: "order_edit" },
      { label: "Xóa đơn hàng", value: "order_delete" },
      { label: "Xem thùng rác", value: "order_trash" },
      { label: "Khôi phục", value: "order_restore" },
      { label: "Xóa vĩnh viễn", value: "order_destroy" },
    ],
  },
  {
    group: "Quản lý khách hàng",
    permissions: [
      { label: "Xem", value: "user_view" },
      { label: "Thêm mới", value: "user_create" },
      { label: "Chỉnh sửa", value: "user_edit" },
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
    group: "Quản lý bài viết",
    permissions: [
      { label: "Xem danh sách", value: "article_view" },
      { label: "Thêm mới", value: "article_create" },
      { label: "Chỉnh sửa", value: "article_edit" },
      { label: "Xóa (Tạm thời)", value: "article_delete" },
      { label: "Xem thùng rác", value: "article_trash" },
      { label: "Khôi phục", value: "article_restore" },
      { label: "Xóa vĩnh viễn", value: "article_destroy" },
    ],
  },
  {
    group: "Tài khoản Admin",
    permissions: [
      { label: "Xem", value: "account_admin_view" },
      { label: "Thêm mới", value: "account_admin_create" },
      { label: "Chỉnh sửa", value: "account_admin_edit" },
      { label: "Xóa (Tạm thời)", value: "account_admin_delete" },
      { label: "Xem thùng rác", value: "account_admin_trash" },
      { label: "Khôi phục", value: "account_admin_restore" },
      { label: "Xóa vĩnh viễn", value: "account_admin_destroy" },
    ],
  },
  {
    group: "Nhóm quyền",
    permissions: [
      { label: "Xem", value: "role_view" },
      { label: "Thêm mới", value: "role_create" },
      { label: "Chỉnh sửa tên/mô tả", value: "role_edit" },
      { label: "Phân quyền (Cấp quyền)", value: "role_permissions" },
      { label: "Xóa (Tạm thời)", value: "role_delete" },
      { label: "Xem thùng rác", value: "role_trash" },
      { label: "Khôi phục", value: "role_restore" },
      { label: "Xóa vĩnh viễn", value: "role_destroy" },
    ],
  },
  {
    group: "Cài đặt hệ thống",
    permissions: [
      { label: "Xem cấu hình", value: "setting_view" },
      { label: "Cập nhật cấu hình", value: "setting_edit" },
    ],
  },
  {
    group: "Thông tin cá nhân",
    permissions: [{ label: "Xem", value: "profile_view" }],
  },
];
