const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const morgan = require("morgan");
const { mySqlPool } = require("./src/config/database");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const userRoutes = require("./src/routes/usersRoutes");
const employeesRoutes = require("./src/routes/employeesRoutes");
const productRoutes = require("./src/routes/productsRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const ordersRoutes = require("./src/routes/ordersRoutes");
const chartRotues = require("./src/routes/chartRoutes");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const PORT = process.env.PORT || 3000;
const app = express();

// 中間件
app.use(morgan("dev")); // 添加日誌中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 設置
app.use(
  cors({
    origin: ["http://localhost:8000", "http://localhost:8001"],
    credentials: true,
  })
);

// Session 設置
const sessionStore = new MySQLStore({}, mySqlPool);

app.use(
  session({
    key: "session_cookie_name",
    secret: "session_cookie_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 小時
      httpOnly: true,
      secure: false, // 在開發環境中設為 false
    },
  })
);

// 取得 session
app.get("/api/session", (req, res) => {
  if (req.session.staff) {
    res.json(req.session.staff);
  } else {
    res.status(401).json({ message: "No session data found" });
  }
});

// 添加一個中間件來檢查 session
app.use((req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  next();
});

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// 路由
app.use("/api/users", userRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api", cartRoutes);
app.use("/api", ordersRoutes);
app.use("/api/charts", chartRotues);
// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "服務器錯誤",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 啟動服務器
app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  try {
    await mySqlPool.query("SELECT 1");
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
