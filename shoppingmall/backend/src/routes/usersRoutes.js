const express = require("express");
const {
  getUsers,
  getUserByName,
  createUser,
  updateUser,
  login,
  getUserOrders,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
} = require("../controllers/usersController");
const { isAuthenticated } = require("../middleware/auth.middleware");
const router = express.Router();

//routes
// 查詢全部會員
router.get("/getallusers", getUsers);

// 用使用者名字查詢會員ID
router.get("/getusername", getUserByName);

// 新增會員（註冊）
router.post("/register", createUser);

// 更新會員資料
router.put("/update/:userid", updateUser);

// 登入會員
router.post("/login", login);

// 查詢會員訂單
router.get("/orders", isAuthenticated, getUserOrders);

// 會員重設密碼
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);



// 取得會員資料
router.get("/profile", isAuthenticated, getUserProfile);

module.exports = router;
