const express = require("express");
const {
  getUsers,
  getUserByName,
  createUser,
  updateUser,
  deleteUser,
  login,
  getUserOrders,
} = require("../controllers/usersController");
const { isAuthenticated } = require("../middlewares/auth");
//router object
const router = express.Router();

//routes

// 查詢全部會員
router.get("/getall", getUsers);

// 用使用者名字查詢會員ID
router.get("/get/:username", getUserByName);

// 新增會員
router.post("/create", createUser);

// 更新會員資料
router.put("/update/:username", updateUser);

// 刪除會員資料
router.delete("/delete/:username", deleteUser);

// 登入會員
router.post("/login", login);

// 查詢會員訂單
router.get("/orders", isAuthenticated, getUserOrders);

module.exports = router;
