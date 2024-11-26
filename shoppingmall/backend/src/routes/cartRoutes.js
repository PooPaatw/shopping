const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { isAuthenticated } = require("../middleware/auth.middleware");
const router = express.Router();

//routes

// 取得購物車
router.get("/cart/items", isAuthenticated, getCart);

// 新增商品到購物車
router.post("/cart/add", isAuthenticated, addToCart);

// 更新購物車商品數量
router.put("/cart/update", isAuthenticated, updateCartItem);

// 移除購物車商品
router.delete("/cart/remove/:productId", isAuthenticated, removeCartItem);

// 清空購物車
router.delete("/cart/clear", isAuthenticated, clearCart);

module.exports = router;
