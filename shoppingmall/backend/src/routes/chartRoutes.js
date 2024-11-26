const express = require("express");
const {
  getProductSales,
  getBrandSales,
  getSeriesSales,
  getMonthlySales,
  getInventoryStatus,
} = require("../controllers/chartController");
const { isAuthenticated } = require("../middleware/auth.middleware");
const router = express.Router();

// 獲取所有圖表數據
router.get("/product-sales", isAuthenticated, getProductSales);
router.get("/brand-sales", isAuthenticated, getBrandSales);
router.get("/series-sales", isAuthenticated, getSeriesSales);
router.get("/monthly-sales", isAuthenticated, getMonthlySales);
router.get("/inventory-status", isAuthenticated, getInventoryStatus);

module.exports = router;
