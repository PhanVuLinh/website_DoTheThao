module.exports.pathAdmin = "admin";

module.exports.paymentMethod = [
  {
    label: "Thanh toán khi nhận hàng",
    value: "cod",
  },
  {
    label: "Ví MoMo",
    value: "momo",
  },
  {
    label: "Ví ZaloPay",
    value: "zaloPay",
  },
  {
    label: "Chuyển khoản ngân hàng",
    value: "bank",
  },
];

module.exports.paymentStatus = [
  {
    label: "Chưa thanh toán",
    value: "unpaid",
  },
  {
    label: "Đã thanh toán",
    value: "paid",
  },
];

module.exports.orderStatus = [
  {
    label: "Khởi tạo",
    value: "initial",
  },
  {
    label: "Đang giao hàng",
    value: "shipping",
  },
  {
    label: "Hoàn thành",
    value: "done",
  },
  {
    label: "Hủy",
    value: "cancel",
  },
];
