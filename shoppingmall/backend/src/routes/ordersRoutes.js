const express = require("express");
const {
  createOrder,
  getOrderById,
  getOrders,
  cancelOrder,
  updateOrderStatus,
  getOrdersByNumberOrName,
  getmemOrders,
} = require("../controllers/ordersController");
const { isAuthenticated } = require("../middleware/auth.middleware");
const router = express.Router();

//routes

// 新增訂單
router.post("/orderscreate", isAuthenticated, createOrder);

// 獲取訂單
router.get("/orders/:orderId", isAuthenticated, getOrderById);

// 獲取所有訂單
router.get("/getallorders", isAuthenticated, getOrders);

// 更新訂單狀態
router.put(
  "/orders/:orderId/updateorderstatus",
  isAuthenticated,
  updateOrderStatus
);

// 取消訂單
router.put("/orders/:orderId/cancel", isAuthenticated, cancelOrder);

// 用訂單編號或會員名稱搜尋訂單
router.get(
  "/getordersbynumberorname",
  isAuthenticated,
  getOrdersByNumberOrName
);

// 前台查詢會員訂單
router.get("/getmemOrders", isAuthenticated, getmemOrders);

module.exports = router;
