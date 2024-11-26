const { executeQuery } = require("../config/database");

// 獲取熱門商品銷售數據
const getProductSales = async (req, res) => {
  try {
    const { brand } = req.query;
    const query = `
      SELECT 
        p.name as product_name,
        p.price,
        COALESCE(SUM(oi.quantity), 0) as total_sales,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue,
        b.name as brand_name,
        ps.name as series_name
      FROM products p
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      LEFT JOIN phone_models pm ON p.model_id = pm.model_id
      LEFT JOIN brands b ON pm.brand_id = b.brand_id
      LEFT JOIN product_series ps ON p.series_id = ps.series_id
      ${brand ? "WHERE b.name = ?" : ""}
      GROUP BY p.product_id
      ORDER BY total_sales DESC
      LIMIT 10
    `;

    const params = brand ? [brand] : [];
    const results = await executeQuery(query, params);
    res.json(results);
  } catch (error) {
    console.error("Error getting product sales:", error);
    res.status(500).json({ message: "Error fetching sales data" });
  }
};

// 獲取品牌銷售分佈
const getBrandSales = async (req, res) => {
  try {
    const query = `
                SELECT 
                    b.name as brand_name,
                    COUNT(DISTINCT o.order_id) as total_orders,
                    SUM(oi.quantity) as total_units_sold,
                    SUM(oi.quantity * oi.unit_price) as total_revenue
                FROM brands b
                JOIN phone_models pm ON b.brand_id = pm.brand_id
                JOIN products p ON pm.model_id = p.model_id
                JOIN order_items oi ON p.product_id = oi.product_id
                JOIN orders o ON oi.order_id = o.order_id
                GROUP BY b.brand_id
                ORDER BY total_revenue DESC
            `;

    const results = await executeQuery(query);
    res.json(results);
  } catch (error) {
    console.error("Error getting brand sales:", error);
    res.status(500).json({ message: "Error fetching brand data" });
  }
};

// 獲取系列銷售趨勢
const getSeriesSales = async (req, res) => {
  try {
    const query = `
                SELECT 
                    ps.name as series_name,
                    COUNT(DISTINCT o.order_id) as total_orders,
                    SUM(oi.quantity) as total_units_sold,
                    SUM(oi.quantity * oi.unit_price) as total_revenue
                FROM product_series ps
                JOIN products p ON ps.series_id = p.series_id
                JOIN order_items oi ON p.product_id = oi.product_id
                JOIN orders o ON oi.order_id = o.order_id
                GROUP BY ps.series_id
                ORDER BY total_revenue DESC
            `;

    const results = await executeQuery(query);
    res.json(results);
  } catch (error) {
    console.error("Error getting series sales:", error);
    res.status(500).json({ message: "Error fetching series data" });
  }
};

// 獲取月度銷售趨勢
const getMonthlySales = async (req, res) => {
  try {
    const query = `
                SELECT 
                    DATE_FORMAT(o.created_at, '%Y-%m') as month,
                    COUNT(DISTINCT o.order_id) as total_orders,
                    SUM(oi.quantity) as total_units_sold,
                    SUM(oi.quantity * oi.unit_price) as total_revenue
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                WHERE o.status = 'completed'
                GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
                ORDER BY month DESC
                LIMIT 12
            `;

    const results = await executeQuery(query);
    res.json(results);
  } catch (error) {
    console.error("Error getting monthly sales:", error);
    res.status(500).json({ message: "Error fetching monthly data" });
  }
};

// 獲取庫存分析
const getInventoryStatus = async (req, res) => {
  try {
    const query = `
                SELECT 
                    p.name as product_name,
                    p.stock_quantity,
                    COALESCE(SUM(oi.quantity), 0) as total_sold,
                    p.stock_quantity - COALESCE(SUM(oi.quantity), 0) as remaining_stock
                FROM products p
                LEFT JOIN order_items oi ON p.product_id = oi.product_id
                GROUP BY p.product_id
                HAVING remaining_stock < 20
                ORDER BY remaining_stock ASC
            `;

    const results = await executeQuery(query);
    res.json(results);
  } catch (error) {
    console.error("Error getting inventory status:", error);
    res.status(500).json({ message: "Error fetching inventory data" });
  }
};

module.exports = {
  getProductSales,
  getBrandSales,
  getSeriesSales,
  getMonthlySales,
  getInventoryStatus,
};
