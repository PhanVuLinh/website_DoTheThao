const express = require("express");
const path = require("path");
require("dotenv").config();
const database = require("./config/database");
const adminRoutes = require("./routes/admin/index.route");
const clientRoutes = require("./routes/client/index.route");
const variableCongfig = require("./config/variable");

const alertMiddleware = require("./middlewares/admin/alert.middleware");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");

const app = express();
const port = process.env.PORT;

//Kết nối database
database.connect();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("PPCCLLAABB001"));

// session + flash + locals -> alert
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
app.use(alertMiddleware.alert);

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
