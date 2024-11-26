const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { mySqlPool } = require("./server/config/database");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const crypto = require("crypto");
const { isAuthenticated } = require("./server/middleware/auth.middleware");
const membersController = require("./server/controllers/membersController");
const { createProxyMiddleware } = require("http-proxy-middleware");

dotenv.config();

// port配置
const PUBLIC_PORT = process.env.PUBLIC_PORT || 3000;
const MEMBER_PORT = process.env.MEMBER_PORT || 3001;
const EMPLOYEE_PORT = process.env.EMPLOYEE_PORT || 3002;

// Express 實例化
const publicApp = express();
const memberApp = express();
const employeeApp = express();

// 生成 session secret
const sessionSecret =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

// Session 配置
const sessionConfig = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  },
  name: "sessionId",
};

// 共享 Middlewares
const configureMiddleware = (app) => {
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session(sessionConfig));
};

// CORS 配置
const corsOptions = {
  origin: [
    `http://localhost:${PUBLIC_PORT}`,
    `http://localhost:${MEMBER_PORT}`,
    `http://localhost:${EMPLOYEE_PORT}`,
  ],
  credentials: true,
};

//---------------- 公共應用 (前台) ----------------//
configureMiddleware(publicApp);
publicApp.use(cors(corsOptions));
publicApp.use(express.static(path.join(__dirname, "public")));

// 設置代理到會員應用
publicApp.use(
  "/member",
  createProxyMiddleware({
    target: `http://localhost:${MEMBER_PORT}`,
    changeOrigin: true,
    cookieDomainRewrite: "localhost",
  })
);

publicApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index", "index.html"));
});

//---------------- 會員應用 ----------------//
configureMiddleware(memberApp);
memberApp.use(cors(corsOptions));
memberApp.use(express.static(path.join(__dirname, "member")));

// 會員登入
memberApp.use((req, res, next) => {
  console.log(`[會員應用] 收到請求: ${req.method} ${req.url}`);
  next();
});

memberApp.post(
  "/login",
  (req, res, next) => {
    console.log("[會員應用] 收到登入請求");
    next();
  },
  membersController.login
);
memberApp.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "member", "login", "login.html"));
});

// 會員註冊
memberApp.post("/registration", membersController.createMember);
memberApp.get("/registration", (req, res) => {
  res.sendFile(
    path.join(__dirname, "member", "registration", "registration.html")
  );
});
memberApp.get("/registration/registrationfinish", (req, res) => {
  res.sendFile(
    path.join(__dirname, "member", "registration", "registrationfinish.html")
  );
});

// 會員登出
memberApp.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "登出失敗" });
    }
    res.clearCookie("sessionId");
    res.json({ success: true, message: "登出成功" });
  });
});

// 應用身份驗證中間件
memberApp.use(["/api", "/memberbackend/loginafter"], isAuthenticated);

memberApp.get("/memberbackend/loginafter", (req, res) => {
  res.sendFile(
    path.join(__dirname, "member", "memberbackend", "loginafter.html")
  );
});

memberApp.get("/api/user-info", (req, res) => {
  res.json({ username: req.session.user.username });
});

memberApp.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ success: false, message: "服務器內部錯誤", error: err.message });
});

//---------------- 員工應用 (後台) ----------------//
configureMiddleware(employeeApp);
employeeApp.use(cors(corsOptions));
employeeApp.use(express.static(path.join(__dirname, "employee")));

// 錯誤處理中間件
const errorHandler = (app) => {
  app.use((err, req, res, next) => {
    console.error(`錯誤: ${err.message}`);
    console.error(`請求路徑: ${req.path}`);
    console.error(`堆疊跟蹤: ${err.stack}`);
    res.status(500).json({ success: false, message: "服務器錯誤" });
  });

  app.use((req, res) => {
    console.error(`404 錯誤 - 未找到路徑: ${req.path}`);
    res.status(404).send("頁面未找到");
  });
};

errorHandler(publicApp);
errorHandler(memberApp);
errorHandler(employeeApp);

//---------------- 資料庫連接和伺服器啟動 ----------------//
const startApp = async () => {
  try {
    await mySqlPool.query("SELECT 1");
    console.log("MySQL DB CONNECTED");

    memberApp.listen(MEMBER_PORT, () => {
      console.log(`會員應用運行在端口 ${MEMBER_PORT}`);
    });

    employeeApp.listen(EMPLOYEE_PORT, () => {
      console.log(`員工應用運行在端口 ${EMPLOYEE_PORT}`);
    });

    publicApp.listen(PUBLIC_PORT, () => {
      console.log(`公共應用運行在端口 ${PUBLIC_PORT}`);
    });
  } catch (err) {
    console.error("數據庫連接錯誤:", err);
    process.exit(1);
  }
};

startApp();
