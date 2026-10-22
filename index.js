const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
require("dotenv").config();
const database = require("./config/database");
const adminRoutes = require("./routes/admin/index.route");
const clientRoutes = require("./routes/client/index.route");
const variableCongfig = require("./config/variable");

const alertMiddleware = require("./middlewares/alert.middleware");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

global._io = io;

const jwtHelper = require("./helpers/jwt.helper");

io.on("connection", (socket) => {
  // Socket kết nối thành công: Chỉ cho phép admin đã xác thực JWT tham gia admin_room
  socket.on("JOIN_ADMIN_ROOM", () => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const match = cookieHeader.match(/(?:^|;\s*)(?:tokenAdmin|token)=([^;]*)/);
      const token = match ? decodeURIComponent(match[1]) : null;
      if (token && jwtHelper.verifyToken(token)) {
        socket.join("admin_room");
      }
    } catch (e) {
      console.warn("Socket JOIN_ADMIN_ROOM error:", e.message);
    }
  });

  socket.on("JOIN_ORDER_ROOM", (orderId) => {
    if (orderId && typeof orderId === "string") {
      socket.join(`order_${orderId}`);
    }
  });
});

const port = process.env.PORT || 3000;
app.use(methodOverride("_method"));
app.use(express.json());

//Kết nối database
database.connect();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("PPCCLLAABB001"));

// session + flash + locals -> alert
app.use(
  session({
    secret: process.env.SESSION_SECRET || "PPCCLLAABB001",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  }),
);
app.use(flash());

app.use(alertMiddleware.alert);

//TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

//Thiết lập views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Thiết lập thư mục tĩnh của FE
app.use(express.static(path.join(__dirname, "public")));

//Tạo biến toàn cục trong PUG
app.locals.pathAdmin = variableCongfig.pathAdmin;

//Thiết lập đường dẫn
app.use(`/${variableCongfig.pathAdmin}`, adminRoutes);
app.use("/", clientRoutes);

// Xử lý lỗi 404 Không tìm thấy trang (cho Client & fallback chung)
app.use((req, res) => {
  res.status(404).render("client/pages/404.pug", {
    title: "404 - Không tìm thấy trang",
  });
});

// Xử lý lỗi 500 tập trung (Centralized Global Error Handler)
app.use((err, req, res, next) => {
  console.error("Centralized App Error:", err);
  if (req.xhr || (req.headers && req.headers.accept && req.headers.accept.includes("json"))) {
    return res.status(500).json({ code: 500, message: "Đã xảy ra lỗi máy chủ nội bộ!" });
  }
  res.status(500).render("client/pages/404.pug", {
    title: "500 - Lỗi máy chủ nội bộ",
    errorMessage: "Hệ thống đang gặp sự cố gián đoạn tạm thời. Đội ngũ kỹ thuật đang tiến hành xử lý.",
  });
});

server.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
