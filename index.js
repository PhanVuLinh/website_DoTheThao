const express = require("express");
const path = require("path");
require("dotenv").config();
const database = require("./config/database");
const adminRoutes = require("./routes/admin/index.route");
const clientRoutes = require("./routes/client/index.route");
const variableCongfig = require("./config/variable");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

const app = express();
const port = process.env.PORT;

//Kết nối database
database.connect();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// session + flash
app.use(
  session({
    secret: "admin-secret-key",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.warning = req.flash("warning");
  next();
});

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

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
