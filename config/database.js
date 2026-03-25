const mongoose = require("mongoose");

module.exports.connect = async () => {
  try {
    mongoose.connect(process.env.DATABASE);
    console.log("Kết nối database thành công");
  } catch (error) {
    console.error("Kết nối database thất bại", error);
  }
};
