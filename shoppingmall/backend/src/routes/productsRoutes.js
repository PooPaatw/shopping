const express = require("express");
const {
  getAllProducts,
  getProductByName,
  addProducts,
  updateProducts,
  getAllSeries,
  getallModels,
  getBrands,
  addModels,
  getModelByName,
  updateModels,
  getSeriesByName,
  addSeries,
  updateSeries,
  getActiveSeries,
  getAllSeriesWithCounts,
  getProductsBySeries,
  getProductById,
} = require("../controllers/productsController");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 設定 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../../public/uploads/temp");
    // 確保目錄存在
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("只允許上傳圖片檔案"));
    }
  },
});

//-------------- 商品相關路由 --------------//

// 查詢全部商品
router.get("/getallproducts", getAllProducts);

// 用商品名稱查詢商品
router.get("/getproductname", getProductByName);

// 用商品ID查詢商品
router.get("/getproductbyid", getProductById);

// 新增商品（包含圖片上傳）
router.post("/addproducts", upload.single("image"), addProducts);

// 更新商品資料（包含圖片上傳）
router.put("/updateproducts", upload.single("image"), updateProducts);

//-------------- 機型相關路由 --------------//

// 查詢全部型號
router.get("/getallmodels", getallModels);

// 用型號編號或名稱查詢機型
router.get("/getmodelname", getModelByName);

// 查詢品牌
router.get("/getbrands", getBrands);

// 新增型號
router.post("/addmodels", addModels);

// 修改機型
router.put("/updatemodels", updateModels);

// 根據款式名稱查詢款式
router.get("/getproductsbyseries", getProductsBySeries);

//-------------- 款式相關路由 --------------//

// 查詢款式
router.get("/getallseries", getAllSeries);

// 用款式名稱查詢款式
router.get("/getseriesname", getSeriesByName);

// 新增款式
router.post("/addseries", addSeries);

// 更新款式
router.put("/updateseries", updateSeries);

// 查詢所有上架的系列
router.get("/getactiveseries", getActiveSeries);

// 查詢單獨系列的商品數量
router.get("/getallserieswithcounts", getAllSeriesWithCounts);

module.exports = router;
