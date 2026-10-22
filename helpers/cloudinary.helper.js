const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "project_sport",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
  },
});

// Kiểm tra loại file tải lên (chỉ cho phép định dạng ảnh hợp lệ)
const imageFilter = (req, file, cb) => {
  if (file && file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép tải lên tệp tin định dạng hình ảnh (jpg, png, webp, gif)!"), false);
  }
};

module.exports = {
  cloudinary,
  storage,
  imageFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // Giới hạn tối đa 8MB mỗi file
  },
};
