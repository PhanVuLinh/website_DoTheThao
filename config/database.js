const mongoose = require("mongoose");

module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Kết nối database MongoDB thành công");
  } catch (error) {
    console.error("Kết nối database thất bại:", error.message);
  }

  mongoose.connection.on("error", (err) => {
    console.error("Lỗi kết nối cơ sở dữ liệu Mongoose:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("Cảnh báo: Cơ sở dữ liệu MongoDB đã ngắt kết nối!");
  });
};
