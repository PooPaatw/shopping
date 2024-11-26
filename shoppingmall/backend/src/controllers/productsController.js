const { mySqlPool: db } = require("../config/database");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

//-------------- 查詢商品 --------------//

// 查詢全部商品（包含品牌和型號資訊）
const getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_id,
        p.name AS modelname,
        p.price,
        p.stock_quantity,
        p.series_id,
        p.is_active,
        p.description,
        p.release_date AS releasedate,
        p.image_url
      FROM products p
      LEFT JOIN phone_models pm ON p.model_id = pm.model_id
      LEFT JOIN brands b ON pm.brand_id = b.brand_id
      ORDER BY p.product_id
    `);

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "沒有找到任何款式資料",
        data: [],
      });
    }

    // 格式化數據以匹配前端期望的格式
    const formattedData = rows.map((row) => ({
      product_id: row.product_id,
      modelname: row.modelname || "",
      price: row.price || 0,
      stock_quantity: row.stock_quantity || 0,
      series_id: row.series_id,
      releasedate: row.releasedate,
      is_active: row.is_active,
      description: row.description || "",
      image_url: row.image_url || null,
    }));

    res.status(200).json({
      success: true,
      message: "成功獲取所有款式",
      data: formattedData,
    });
  } catch (error) {
    console.error("獲取款式資料錯誤:", error);
    res.status(500).json({
      success: false,
      message: "獲取款式資料時發生錯誤",
      error: error.message,
    });
  }
};

// 用商品名稱查詢商品
const getProductByName = async (req, res) => {
  try {
    const { product_id, name } = req.query;

    // 記錄接收到的查詢參數
    console.log("Received query parameters:", { product_id, name });

    if (!product_id?.trim() && !name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "請提供款式編號或名稱",
      });
    }

    let sql = `
    SELECT 
        p.product_id,
        p.name AS modelname,
        p.price,
        p.stock_quantity,
        p.is_active,
        p.description,
        p.release_date AS releasedate,
        p.image_url
      FROM products p
      LEFT JOIN phone_models pm ON p.model_id = pm.model_id
      LEFT JOIN brands b ON pm.brand_id = b.brand_id
      WHERE 1=1
    `;
    const params = [];

    if (product_id?.trim()) {
      sql += " AND p.product_id LIKE ?";
      params.push(`%${product_id.trim()}%`);
    }

    if (name?.trim()) {
      sql += " AND p.name LIKE ?";
      params.push(`%${name.trim()}%`);
    }

    sql += " ORDER BY p.product_id ";

    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "未找到符合的款式記錄",
      });
    }

    // 格式化數據
    const formattedData = rows.map((row) => ({
      product_id: row.product_id,
      modelname: row.modelname,
      price: row.price || 0,
      stock_quantity: row.stock_quantity || 0,
      releasedate: row.releasedate,
      is_active: row.is_active,
      description: row.description || "",
      image_url: row.image_url || null,
    }));

    res.status(200).json({
      success: true,
      message: "查詢成功",
      totalFound: rows.length,
      modelDetails: formattedData,
    });
  } catch (err) {
    console.error("查詢款式錯誤:", err);
    res.status(500).json({
      success: false,
      message: "查詢款式時發生錯誤",
      error: err.message,
    });
  }
};

// 根據商品編號查詢商品
const getProductById = async (req, res) => {
  try {
    // 改用 req.query 來獲取 product_id
    const { product_id } = req.query;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "請提供商品編號",
      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        p.product_id,
        p.name AS modelname,
        p.price,
        p.stock_quantity,
        p.is_active,
        p.description,
        p.release_date AS releasedate,
        p.image_url
      FROM products p
      LEFT JOIN phone_models pm ON p.model_id = pm.model_id
      WHERE p.product_id = ?
    `,
      [product_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "找不到該商品",
      });
    }

    const product = rows[0];

    res.status(200).json({
      success: true,
      message: "查詢成功",
      data: product, // 直接返回 product 對象
    });
  } catch (error) {
    console.error("查詢商品錯誤:", error);
    res.status(500).json({
      success: false,
      message: "查詢商品時發生錯誤",
      error: error.message,
    });
  }
};

// 新增商品
const addProducts = async (req, res) => {
  try {
    const {
      model: model_id,
      category: series_id,
      price,
      quantity: stock_quantity,
      description,
      releasedate,
    } = req.body;

    let imageUrl = null;

    // 處理圖片上傳
    if (req.file) {
      try {
        imageUrl = await processProductImage(req.file);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "圖片處理失敗",
          error: error.message,
        });
      }
    }

    // 驗證必要欄位
    if (
      !model_id ||
      !series_id ||
      !price ||
      !stock_quantity ||
      !description ||
      !releasedate
    ) {
      return res.status(400).json({
        success: false,
        message: "請提供完整的商品資訊",
      });
    }

    // 驗證數值欄位
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "價格必須大於0",
      });
    }

    if (stock_quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "庫存數量不能小於0",
      });
    }

    // 檢查型號是否存在且啟用
    const [modelExists] = await db.query(
      "SELECT model_id, name FROM phone_models WHERE model_id = ? AND is_active = TRUE",
      [model_id]
    );

    if (modelExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: "指定的手機型號不存在或已停用",
      });
    }

    // 檢查系列是否存在且啟用
    const [seriesExists] = await db.query(
      "SELECT series_id, name FROM product_series WHERE series_id = ? AND is_active = TRUE",
      [series_id]
    );

    if (seriesExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: "指定的商品系列不存在或已停用",
      });
    }

    // 檢查是否已存在相同型號和款式的商品（包括已下架的商品）
    const [existingProduct] = await db.query(
      `SELECT product_id, is_active, image_url 
       FROM products 
       WHERE model_id = ? AND series_id = ?`,
      [model_id, series_id]
    );

    if (existingProduct.length > 0) {
      // 如果找到相同商品，檢查是否已下架
      const product = existingProduct[0];

      // 如果商品還在架上
      if (product.is_active === 1) {
        // 如果舊圖片存在，刪除它
        if (imageUrl && product.image_url) {
          try {
            const oldImagePath = path.join(
              __dirname,
              "../..",
              product.image_url
            );
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.error("刪除舊圖片失敗:", err);
          }
        }

        return res.status(400).json({
          success: false,
          message: "此型號和款式的商品已存在且正在銷售中",
        });
      }

      // 如果商品已下架，更新現有記錄而不是創建新記錄
      const [updateResult] = await db.query(
        `UPDATE products 
         SET price = ?, 
             stock_quantity = ?, 
             description = ?, 
             release_date = ?, 
             image_url = ?,
             is_active = TRUE,
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = ?`,
        [
          price,
          stock_quantity,
          description,
          releasedate,
          imageUrl,
          product.product_id,
        ]
      );

      // 查詢更新後的商品資訊
      const [updatedProduct] = await db.query(
        `SELECT 
          p.product_id,
          p.name AS modelname,
          p.price,
          p.stock_quantity,
          p.description,
          p.is_active,
          p.release_date AS releasedate,
          p.image_url
        FROM products p
        LEFT JOIN phone_models pm ON p.model_id = pm.model_id
        WHERE p.product_id = ?`,
        [product.product_id]
      );

      return res.status(200).json({
        success: true,
        message: "商品已重新上架",
        data: updatedProduct[0],
      });
    }

    // 如果不存在相同商品，則新增
    const productName = `${modelExists[0].name} ${seriesExists[0].name}`;

    const [result] = await db.query(
      `INSERT INTO products 
        (name, model_id, series_id, description, price, stock_quantity, is_active, release_date, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
      [
        productName,
        model_id,
        series_id,
        description,
        price,
        stock_quantity,
        releasedate,
        imageUrl,
      ]
    );

    // 查詢插入後的完整商品資訊
    const [newProduct] = await db.query(
      `SELECT 
        p.product_id,
        p.name AS modelname,
        p.price,
        p.stock_quantity,
        p.description,
        p.is_active,
        p.release_date AS releasedate,
        p.image_url
      FROM products p
      LEFT JOIN phone_models pm ON p.model_id = pm.model_id
      WHERE p.product_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "商品新增成功",
      data: newProduct[0],
    });
  } catch (error) {
    console.error("新增商品錯誤:", error);
    res.status(500).json({
      success: false,
      message: "新增商品時發生錯誤",
      error: error.message,
    });
  }
};
// 更新商品
const updateProducts = async (req, res) => {
  try {
    const {
      product_id,
      price,
      stock_quantity,
      is_active,
      description,
      releasedate,
    } = req.body;

    // 驗證必要欄位
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "請提供商品編號",
      });
    }

    // 檢查商品是否存在，並獲取當前圖片資訊
    const [existingProduct] = await db.query(
      "SELECT product_id, image_url FROM products WHERE product_id = ?",
      [product_id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: "找不到該商品",
      });
    }

    // 處理圖片上傳和舊圖片刪除
    let imageUrl = null;
    const oldImageUrl = existingProduct[0].image_url;

    if (req.file) {
      try {
        // 確保有舊圖片路徑
        if (oldImageUrl) {
          const oldImagePath = path.join(
            __dirname,
            "../../public",
            oldImageUrl
          );

          try {
            // 檢查檔案是否存在
            await fs.access(oldImagePath);
            // 刪除舊圖片
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.error("刪除舊圖片時發生錯誤:", err);
          }
        }

        // 處理新圖片
        imageUrl = await processProductImage(req.file);

        if (!imageUrl) {
          throw new Error("新圖片處理失敗");
        }
      } catch (error) {
        console.error("圖片處理過程發生錯誤:", error);
        return res.status(400).json({
          success: false,
          message: "圖片處理失敗",
          error: error.message,
        });
      }
    }
    // 構建更新查詢
    let updateFields = [];
    let queryParams = [];

    // 檢查並添加要更新的欄位
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({
          success: false,
          message: "價格必須大於0",
        });
      }
      updateFields.push("price = ?");
      queryParams.push(price);
    }

    if (stock_quantity !== undefined) {
      if (stock_quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "庫存數量不能小於0",
        });
      }
      updateFields.push("stock_quantity = ?");
      queryParams.push(stock_quantity);
    }

    if (is_active !== undefined) {
      if (![0, 1].includes(Number(is_active))) {
        return res.status(400).json({
          success: false,
          message: "商品狀態值無效",
        });
      }
      updateFields.push("is_active = ?");
      queryParams.push(Number(is_active));
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      queryParams.push(description);
    }

    if (releasedate !== undefined) {
      updateFields.push("release_date = ?");
      queryParams.push(releasedate);
    }

    // 如果有新圖片，加入更新欄位
    if (imageUrl) {
      updateFields.push("image_url = ?");
      queryParams.push(imageUrl);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "請提供要更新的資料",
      });
    }

    // 添加更新時間
    updateFields.push("updated_at = CURRENT_TIMESTAMP");

    // 添加 product_id 到參數陣列
    queryParams.push(product_id);

    // 執行更新操作
    const [result] = await db.query(
      `UPDATE products SET ${updateFields.join(", ")} WHERE product_id = ?`,
      queryParams
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "更新失敗，請確認商品資料",
      });
    }

    // 查詢更新後的商品資料
    const [updatedProduct] = await db.query(
      `SELECT 
        product_id, 
        name, 
        price, 
        stock_quantity, 
        is_active, 
        description,
        release_date as releasedate,
        image_url,
        created_at,
        updated_at
       FROM products 
       WHERE product_id = ?`,
      [product_id]
    );

    res.status(200).json({
      success: true,
      message: "商品更新成功",
      data: updatedProduct[0],
    });
  } catch (error) {
    console.error("更新商品錯誤:", error);
    console.error("請求數據:", req.body);
    res.status(500).json({
      success: false,
      message: "更新商品時發生錯誤",
      error: error.message,
    });
  }
};
// 根據品牌查詢商品
const getProductsByBrand = async (req, res) => {
  try {
    const { brand_id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        p.*,
        b.name as brand_name,
        pm.name as model_name,
        ps.name as series_name
      FROM products p
      JOIN phone_models pm ON p.model_id = pm.model_id
      JOIN brands b ON pm.brand_id = b.brand_id
      LEFT JOIN product_series ps ON p.series_id = ps.series_id
      WHERE b.brand_id = ? AND p.is_active = TRUE
    `,
      [brand_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "該品牌沒有商品",
      });
    }

    res.status(200).json({
      success: true,
      message: "查詢成功",
      totalProducts: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("查詢品牌商品錯誤:", err);
    res.status(500).json({
      success: false,
      message: "查詢品牌商品時發生錯誤",
      error: err.message,
    });
  }
};

// 根據系列查詢商品
const getProductsBySeries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const seriesId = req.query.series_id;
    const sort = req.query.sort || "date-desc";

    // 計算 offset
    const offset = (page - 1) * limit;

    // 構建基礎查詢
    let queryStr = `
      SELECT 
        p.product_id,
        p.name AS modelname,
        p.price,
        p.stock_quantity,
        p.is_active,
        p.description,
        p.release_date AS releasedate,
        p.image_url,
        s.series_id,
        s.name AS series_name
      FROM products p
      LEFT JOIN phone_models pm ON p.model_id = pm.model_id
      LEFT JOIN brands b ON pm.brand_id = b.brand_id
      LEFT JOIN series s ON p.series_id = s.series_id
      WHERE p.is_active = 1
    `;

    const queryParams = [];

    // 如果有指定分類，加入條件
    if (seriesId) {
      queryStr += " AND p.series_id = ?";
      queryParams.push(seriesId);
    }

    // 加入排序條件
    switch (sort) {
      case "price-asc":
        queryStr += " ORDER BY p.price ASC";
        break;
      case "price-desc":
        queryStr += " ORDER BY p.price DESC";
        break;
      case "name-asc":
        queryStr += " ORDER BY p.name ASC";
        break;
      case "name-desc":
        queryStr += " ORDER BY p.name DESC";
        break;
      default:
        queryStr += " ORDER BY p.release_date DESC";
    }

    // 加入分頁
    queryStr += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // 執行主查詢
    const [rows] = await db.query(queryStr, queryParams);

    // 計算總數的查詢
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      WHERE p.is_active = 1
    `;

    if (seriesId) {
      countQuery += " AND p.series_id = ?";
    }

    const [countResult] = await db.query(
      countQuery,
      seriesId ? [seriesId] : []
    );
    const total = countResult[0].total;

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "沒有找到任何商品資料",
        data: [],
        pagination: {
          currentPage: page,
          pageSize: limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // 格式化數據
    const formattedData = rows.map((row) => ({
      product_id: row.product_id,
      modelname: row.modelname || "",
      price: row.price || 0,
      stock_quantity: row.stock_quantity || 0,
      releasedate: row.releasedate,
      is_active: row.is_active,
      description: row.description || "",
      image_url: row.image_url || null,
      series_id: row.series_id,
      series_name: row.series_name,
    }));

    res.status(200).json({
      success: true,
      message: "成功獲取商品資料",
      data: formattedData,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("獲取商品資料錯誤:", error);
    res.status(500).json({
      success: false,
      message: "獲取商品資料時發生錯誤",
      error: error.message,
    });
  }
};

//-------------- 查詢機型 --------------//

// 查詢全部型號
const getallModels = async (req, res) => {
  try {
    const { model_id, name } = req.query;

    // 簡化 SQL 查詢，只選擇指定的欄位
    let sql = `
      SELECT 
        pm.model_id,
        pm.name,
        pm.is_active
      FROM phone_models pm
    `;
    const params = [];

    if (model_id?.trim()) {
      sql += " AND pm.model_id LIKE ?";
      params.push(`%${model_id.trim()}%`);
    }

    if (name?.trim()) {
      sql += " AND pm.name LIKE ?";
      params.push(`%${name.trim()}%`);
    }

    sql += " ORDER BY pm.model_id ASC";

    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "查無型號資料",
      });
    }

    // 格式化返回的數據以匹配前端期望的格式
    const formattedRows = rows.map((row) => ({
      model_id: row.model_id,
      modelname: row.name,
      is_active: row.is_active,
    }));

    res.status(200).json({
      success: true,
      message: "查詢成功",
      totalModels: rows.length,
      data: formattedRows,
    });
  } catch (err) {
    console.error("查詢型號錯誤:", err);
    res.status(500).json({
      success: false,
      message: "查詢型號時發生錯誤",
      error: err.message,
    });
  }
};

// 用型號編號或名稱查詢機型
const getModelByName = async (req, res) => {
  try {
    const { model_id, name } = req.query;

    // 記錄接收到的查詢參數
    console.log("Received query parameters:", { model_id, name });

    if (!model_id?.trim() && !name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "請提供型號或名稱",
      });
    }

    // 簡化 SQL 查詢，只選擇指定的欄位
    let sql = `
      SELECT 
        pm.model_id,
        pm.name,
        pm.is_active
      FROM phone_models pm
      WHERE 1=1
    `;
    const params = [];

    if (model_id?.trim()) {
      sql += " AND pm.model_id LIKE ?";
      params.push(`%${model_id.trim()}%`);
    }

    if (name?.trim()) {
      sql += " AND pm.name LIKE ?";
      params.push(`%${name.trim()}%`);
    }

    sql += " ORDER BY pm.model_id ASC";

    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "未找到符合的型號記錄",
      });
    }

    // 簡化數據格式化，只包含需要的欄位
    const formattedRows = rows.map((row) => ({
      model_id: row.model_id,
      modelname: row.name,
      is_active: row.is_active,
    }));

    res.status(200).json({
      success: true,
      message: "查詢成功",
      totalFound: rows.length,
      modelDetails: formattedRows,
    });
  } catch (err) {
    console.error("查詢型號錯誤:", err);
    res.status(500).json({
      success: false,
      message: "查詢型號時發生錯誤",
      error: err.message,
    });
  }
};

// 新增型號
const addModels = async (req, res) => {
  try {
    const { name, brand_id, description } = req.body;

    // 基本欄位驗證
    if (!name || !brand_id || !description) {
      return res.status(400).json({
        success: false,
        message: "請提供完整的型號資訊",
      });
    }

    // 檢查品牌型號名稱是否已存在
    const [existingModel] = await db.query(
      "SELECT model_id FROM phone_models WHERE name = ? AND is_active = TRUE",
      [name]
    );

    if (existingModel.length > 0) {
      return res.status(400).json({
        success: false,
        message: "此型號名稱已存在",
      });
    }

    // 檢查品牌是否存在
    const [brandExists] = await db.query(
      "SELECT brand_id FROM brands WHERE brand_id = ? AND is_active = TRUE",
      [brand_id]
    );

    if (brandExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: "指定的品牌不存在或已停用",
      });
    }

    // 插入新型號
    const [result] = await db.query(
      "INSERT INTO phone_models (brand_id, name, description) VALUES (?, ?, ?)",
      [brand_id, name, description]
    );

    res.status(201).json({
      success: true,
      message: "型號新增成功",
      data: {
        model_id: result.insertId,
        brand_id,
        name,
        description,
      },
    });
  } catch (err) {
    console.error("新增型號錯誤:", err);
    res.status(500).json({
      success: false,
      message: "新增型號時發生錯誤",
      error: err.message,
    });
  }
};

// 查詢品牌
const getBrands = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT brand_id, name FROM brands WHERE is_active = 1"
    );

    if (rows.length === 0) {
      const response = {
        success: false,
        message: "查無品牌資料",
      };
      console.log("Response:", response);
      return res.status(404).json(response);
    }

    const response = {
      success: true,
      message: "查詢成功",
      totalBrands: rows.length,
      data: rows,
    };
    console.log("Response:", response);
    res.status(200).json(response);
  } catch (err) {
    console.error("查詢品牌錯誤:", err);
    const response = {
      success: false,
      message: "查詢品牌時發生錯誤",
      error: err.message,
    };
    console.log("Response:", response);
    res.status(500).json(response);
  }
};

// 修改機型
const updateModels = async (req, res) => {
  try {
    const { model_id, is_active } = req.body; // 從請求體中獲取所有參數

    // 驗證必要欄位
    if (!model_id) {
      return res.status(400).json({
        success: false,
        message: "請提供機型編號",
      });
    }

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: "請提供機型狀態",
      });
    }

    // 將 is_active 轉換為數字
    const activeStatus = Number(is_active);

    // 驗證 is_active 的值是否有效
    if (![0, 1].includes(activeStatus)) {
      return res.status(400).json({
        success: false,
        message: "機型狀態值無效，只能是 0 或 1",
      });
    }

    // 檢查機型是否存在
    const [existingModel] = await db.query(
      "SELECT model_id FROM phone_models WHERE model_id = ?",
      [model_id]
    );

    if (existingModel.length === 0) {
      return res.status(404).json({
        success: false,
        message: "找不到該機型",
      });
    }

    // 執行更新操作
    const [result] = await db.query(
      "UPDATE phone_models SET is_active = ? WHERE model_id = ?",
      [activeStatus, model_id]
    );

    // 檢查更新是否成功
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "更新失敗",
      });
    }

    // 成功回應
    res.status(200).json({
      success: true,
      message: "機型狀態更新成功",
      data: {
        model_id,
        is_active: activeStatus,
      },
    });
  } catch (error) {
    console.error("更新機型狀態錯誤:", error);
    console.error("請求數據:", req.body);
    res.status(500).json({
      success: false,
      message: "更新機型狀態時發生錯誤",
      error: error.message,
    });
  }
};
//-------------- 查詢款式 --------------//

// 查詢全部款式
const getAllSeries = async (req, res) => {
  try {
    const { series_id, name } = req.query;

    // 基本 SQL 查詢
    let sql = `
      SELECT 
        series_id,
        name,
        description,
        is_active
      FROM product_series
    `;
    const params = [];

    // 根據查詢參數動態添加 WHERE 條件
    const conditions = [];

    if (series_id?.trim()) {
      conditions.push("series_id LIKE ?");
      params.push(`%${series_id.trim()}%`);
    }

    if (name?.trim()) {
      conditions.push("name LIKE ?");
      params.push(`%${name.trim()}%`);
    }

    // 如果有條件，添加 WHERE 子句
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += " ORDER BY series_id ASC";

    // 執行查詢
    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "查無款式資料",
      });
    }

    // 格式化返回的數據
    const formattedData = rows.map((row) => ({
      series_id: row.series_id,
      seriesname: row.name || "",
      description: row.description || "",
      is_active: row.is_active,
    }));

    res.status(200).json({
      success: true,
      message: "查詢成功",
      totalSeries: rows.length,
      data: formattedData,
    });
  } catch (err) {
    console.error("查詢款式錯誤:", err);
    res.status(500).json({
      success: false,
      message: "查詢款式時發生錯誤",
      error: err.message,
    });
  }
};

// 用型號編號或名稱查詢機型
const getSeriesByName = async (req, res) => {
  try {
    const { series_id, name } = req.query;

    // 記錄接收到的查詢參數
    console.log("Received query parameters:", { series_id, name });

    if (!series_id?.trim() && !name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "請提供款式編號或名稱",
      });
    }

    let sql = `
      SELECT series_id, name, description, is_active
      FROM product_series
      WHERE 1=1      
    `;
    const params = [];

    if (series_id?.trim()) {
      sql += " AND series_id LIKE ?";
      params.push(`%${series_id.trim()}%`);
    }

    if (name?.trim()) {
      sql += " AND name LIKE ?";
      params.push(`%${name.trim()}%`);
    }

    sql += " ORDER BY series_id ";

    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "未找到符合的款式記錄",
      });
    }

    // 格式化數據
    const formattedData = rows.map((row) => ({
      series_id: row.series_id,
      seriesname: row.name,
      is_active: row.is_active,
      description: row.description || "",
    }));

    res.status(200).json({
      success: true,
      message: "查詢成功",
      totalFound: rows.length,
      modelDetails: formattedData,
    });
  } catch (err) {
    console.error("查詢款式錯誤:", err);
    res.status(500).json({
      success: false,
      message: "查詢款式時發生錯誤",
      error: err.message,
    });
  }
};

// 新增款式
const addSeries = async (req, res) => {
  try {
    const { name, description } = req.body;

    // 驗證必要欄位
    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "請提供完整的款式資訊",
      });
    }

    // 檢查款式名稱是否已存在
    const [existingSeries] = await db.query(
      "SELECT series_id FROM product_series WHERE name = ?",
      [name.trim()]
    );

    if (existingSeries.length > 0) {
      return res.status(400).json({
        success: false,
        message: "此款式名稱已存在",
      });
    }

    // 插入新款式
    const [result] = await db.query(
      "INSERT INTO product_series (name, description, is_active) VALUES (?, ?, TRUE)",
      [name.trim(), description.trim()]
    );

    if (result.affectedRows === 1) {
      res.status(201).json({
        success: true,
        message: "款式新增成功",
        data: {
          series_id: result.insertId,
          name: name.trim(),
          description: description.trim(),
          is_active: true,
        },
      });
    } else {
      throw new Error("新增款式失敗");
    }
  } catch (err) {
    console.error("新增款式錯誤:", err);
    res.status(500).json({
      success: false,
      message: "新增款式時發生錯誤",
      error: err.message,
    });
  }
};

// 更新款式
const updateSeries = async (req, res) => {
  // 開始資料庫交易
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { series_id, name, description, is_active } = req.body;

    // 驗證必要欄位
    if (!series_id || !name?.trim()) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "款式ID和名稱為必填欄位",
      });
    }

    // 檢查款式是否存在
    const [existingSeries] = await connection.query(
      "SELECT name FROM product_series WHERE series_id = ?",
      [series_id]
    );

    if (existingSeries.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "找不到指定的款式",
      });
    }

    const oldSeriesName = existingSeries[0].name;

    // 檢查新名稱是否與其他款式重複
    const [duplicateName] = await connection.query(
      "SELECT series_id FROM product_series WHERE name = ? AND series_id != ?",
      [name.trim(), series_id]
    );

    if (duplicateName.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "此款式名稱已被使用",
      });
    }

    // 更新款式資料
    const [updateSeriesResult] = await connection.query(
      `UPDATE product_series 
       SET name = ?, 
           description = ?, 
           is_active = ?
       WHERE series_id = ?`,
      [name.trim(), description.trim(), is_active, series_id]
    );

    // 更新關聯的產品名稱
    // 先獲取所有相關產品
    const [products] = await connection.query(
      `SELECT p.product_id, p.name, pm.name as model_name
       FROM products p
       JOIN phone_models pm ON p.model_id = pm.model_id
       WHERE p.series_id = ?`,
      [series_id]
    );

    // 更新每個產品的名稱
    for (const product of products) {
      const newProductName = `${product.model_name} ${name.trim()}`;
      await connection.query(
        "UPDATE products SET name = ? WHERE product_id = ?",
        [newProductName, product.product_id]
      );
    }

    // 提交交易
    await connection.commit();
    connection.release();

    res.status(200).json({
      success: true,
      message: "款式更新成功，相關產品名稱已同步更新",
      data: {
        series_id,
        name: name.trim(),
        description: description.trim(),
        is_active,
        updated_products_count: products.length,
      },
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("更新款式錯誤:", err);
    res.status(500).json({
      success: false,
      message: "更新款式時發生錯誤",
      error: err.message,
    });
  }
};

// 查詢所有啟用的系列
const getActiveSeries = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.series_id,
        s.name as seriesname,
        s.description,
        s.is_active,
        COUNT(DISTINCT CASE WHEN p.is_active = 1 THEN p.product_id END) as product_count
      FROM product_series s
      LEFT JOIN products p ON s.series_id = p.series_id
      WHERE s.is_active = 1
      GROUP BY s.series_id, s.name, s.description, s.is_active
      ORDER BY s.series_id
    `;

    const [rows] = await db.query(query);
    console.log("Database query result:", rows);

    const processedData = rows.map((row) => ({
      series_id: Number(row.series_id),
      seriesname: row.seriesname,
      description: row.description,
      is_active: Number(row.is_active),
      product_count: Number(row.product_count),
    }));

    console.log("Processed data:", processedData);

    res.json({
      success: true,
      message: "查詢成功",
      totalSeries: rows.length,
      data: processedData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "查詢失敗",
      error: error.message,
    });
  }
};

// 查詢單獨系列的數量
const getAllSeriesWithCounts = async (req, res) => {
  try {
    const [seriesRows] = await db.query(`
      SELECT series_id, name as seriesname, description, is_active
      FROM product_series 
      WHERE is_active = 1
      ORDER BY series_id
    `);

    const [countRows] = await db.query(`
      SELECT 
        series_id,
        COUNT(DISTINCT product_id) as product_count
      FROM products
      WHERE is_active = 1
      GROUP BY series_id
    `);

    const counts = countRows.reduce((acc, curr) => {
      acc[curr.series_id] = curr.product_count;
      return acc;
    }, {});

    const result = seriesRows.map((series) => ({
      series_id: Number(series.series_id),
      seriesname: series.seriesname,
      description: series.description,
      is_active: Number(series.is_active),
      product_count: Number(counts[series.series_id] || 0),
    }));

    res.json({
      success: true,
      message: "查詢成功",
      totalSeries: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "查詢失敗",
      error: error.message,
    });
  }
};

//-------------- 圖片處理 --------------//

// 圖片處理函數
const processProductImage = async (file) => {
  if (!file) return null;

  const filename = `${Date.now()}-${Math.round(
    Math.random() * 1e9
  )}${path.extname(file.originalname)}`;
  const uploadDir = path.join(
    __dirname,
    "../../public/uploads/products/original"
  );

  try {
    // 確保目錄存在
    await fs.mkdir(uploadDir, { recursive: true });

    const imagePath = path.join(uploadDir, filename);

    // 處理並保存圖片
    await sharp(file.path)
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(imagePath);

    // 清理暫存檔
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error("清理暫存檔失敗:", err);
    }

    return `/uploads/products/original/${filename}`;
  } catch (error) {
    console.error("處理圖片時發生錯誤:", error);
    throw new Error("圖片處理失敗");
  }
};

module.exports = {
  getAllProducts,
  getProductByName,
  addProducts,
  updateProducts,
  getProductsByBrand,
  getallModels,
  getModelByName,
  getAllSeries,
  getBrands,
  addModels,
  getSeriesByName,
  updateModels,
  addSeries,
  updateSeries,
  processProductImage,
  getActiveSeries,
  getAllSeriesWithCounts,
  getProductsBySeries,
  getProductById,
};
