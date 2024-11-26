const { knex, knexQuery, knexTransaction } = require("../config/database");

const createOrder = async (req, res) => {
  try {
    const result = await knexTransaction(async (trx) => {
      // 1. 檢查購物車是否存在
      const cart = await trx('shopping_carts')
        .select('cart_id')
        .where('user_id', req.user.user_id)
        .first();

      if (!cart) {
        return {
          success: false,
          status: 404,
          message: "找不到購物車"
        };
      }

      // 2. 檢查購物車內容
      const cartItems = await trx('cart_items')
        .join('products', 'cart_items.product_id', 'products.product_id')
        .select(
          'cart_items.cart_item_id',
          'cart_items.product_id',
          'cart_items.quantity',
          'products.price',
          'products.stock_quantity',
          'products.name'
        )
        .where('cart_items.cart_id', cart.cart_id)
        .forUpdate();

      if (!cartItems.length) {
        return {
          success: false,
          status: 400,
          message: "購物車是空的，請先添加商品"
        };
      }

      // 3. 檢查庫存
      const stockCheck = cartItems.find(item => item.quantity > item.stock_quantity);
      if (stockCheck) {
        return {
          success: false,
          status: 400,
          message: `商品 "${stockCheck.name}" 庫存不足，目前庫存: ${stockCheck.stock_quantity}`
        };
      }

      // 4. 計算訂單總金額
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 5. 獲取當前時間並格式化為台北時間
      const now = new Date();
      const taipeiTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // 6. 創建訂單
      const [orderId] = await trx('orders')
        .insert({
          user_id: req.user.user_id,
          total_amount: totalAmount,
          status: 'pending',
          created_at: taipeiTime,
          updated_at: taipeiTime
        });

      // 7. 創建訂單項目並更新庫存
      for (const item of cartItems) {
        // 插入訂單項目
        await trx('order_items').insert({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price
        });

        // 更新庫存
        const updatedRows = await trx('products')
          .where('product_id', item.product_id)
          .decrement('stock_quantity', item.quantity);

        if (!updatedRows) {
          throw new Error(`無法更新商品 "${item.name}" 的庫存`);
        }
      }

      // 8. 清空購物車
      await trx('cart_items')
        .where('cart_id', cart.cart_id)
        .delete();

      return {
        success: true,
        data: {
          order_id: orderId,
          total_amount: totalAmount,
        }
      };
    });

    // 根據事務結果返回響應
    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    res.json(result);

  } catch (error) {
    console.error("創建訂單時出錯:", error);
    res.status(500).json({
      success: false,
      message: error.message || "創建訂單失敗"
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await knex('orders')
      .leftJoin('order_items', 'orders.order_id', 'order_items.order_id')
      .leftJoin('users', 'orders.user_id', 'users.user_id')
      .select(
        'orders.order_id',
        'orders.total_amount',
        'orders.status',
        'orders.created_at',
        'users.username',
        'users.user_id'
      )
      .count('order_items.id as item_count')
      .groupBy('orders.order_id', 'users.username', 'users.user_id')
      .orderBy('orders.created_at');

    // 將時間轉換為台灣時間 (UTC+8)
    orders.forEach((order) => {
      const createdAt = new Date(order.created_at);
      order.created_at = new Date(createdAt.getTime() + 8 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "獲取訂單列表失敗",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    // 獲取訂單基本信息
    const order = await knex('orders')
      .join('users', 'orders.user_id', 'users.user_id')
      .select(
        'orders.order_id',
        'orders.total_amount',
        'orders.status',
        'orders.created_at',
        'users.username',
        'users.mobilenum'
      )
      .where({
        'orders.order_id': req.params.orderId,
        'orders.user_id': req.user.user_id
      })
      .first();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "找不到該訂單",
      });
    }

    // 將時間轉換為台灣時間 (UTC+8)
    const createdAt = new Date(order.created_at);
    order.created_at = new Date(createdAt.getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // 獲取訂單商品詳情
    const orderItems = await knex('order_items')
      .join('products', 'order_items.product_id', 'products.product_id')
      .select(
        'order_items.product_id',
        'order_items.quantity',
        'order_items.unit_price',
        'products.name as product_name',
        'products.image_url'
      )
      .where('order_items.order_id', req.params.orderId)
      .select(knex.raw('(order_items.quantity * order_items.unit_price) as subtotal'));

    const orderDetail = {
      ...order,
      items: orderItems.map((item) => ({
        ...item,
        image_url: item.image_url ? `/api${item.image_url}` : null,
      })),
    };

    res.json({
      success: true,
      data: orderDetail,
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "獲取訂單詳情失敗",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    await knexTransaction(async (trx) => {
      const { orderId, status } = req.body;

      await trx('orders')
        .where('order_id', orderId)
        .update({
          status: status,
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: "訂單狀態已更新",
      });
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "更新訂單狀態失敗",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log("orderId", orderId);

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "訂單編號未提供",
      });
    }

    await knexTransaction(async (trx) => {
      await trx('orders')
        .where('order_id', orderId)
        .update({
          status: 'cancelled',
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: "訂單已取消",
      });
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "取消訂單失敗",
    });
  }
};

const getOrdersByNumberOrName = async (req, res) => {
  const { order_id, username } = req.query;

  try {
    let query = knex('orders')
      .join('users', 'orders.user_id', 'users.user_id')
      .select(
        'orders.order_id',
        'orders.total_amount',
        'orders.status',
        'orders.created_at',
        'users.username'
      );

    if (order_id) {
      query = query.where('orders.order_id', order_id);
    }

    if (username) {
      query = query.where('users.username', 'like', `%${username}%`);
    }

    const orders = await query;

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "找不到符合條件的訂單",
      });
    }

    // 將時間轉換為台灣時間 (UTC+8)
    orders.forEach((order) => {
      const createdAt = new Date(order.created_at);
      order.created_at = new Date(createdAt.getTime() + 8 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders by number or name error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "搜尋訂單失敗",
    });
  }
};

const getmemOrders = async (req, res) => {
  try {
    const orders = await knex('orders')
      .leftJoin('order_items', 'orders.order_id', 'order_items.order_id')
      .leftJoin('users', 'orders.user_id', 'users.user_id')
      .select(
        'orders.order_id',
        'orders.total_amount',
        'orders.status',
        'orders.created_at',
        'users.username'
      )
      .count('order_items.id as item_count')
      .where('orders.user_id', req.user.user_id)
      .groupBy('orders.order_id', 'users.username')
      .orderBy('orders.created_at');

    // 將時間轉換為台灣時間 (UTC+8)
    orders.forEach((order) => {
      const createdAt = new Date(order.created_at);
      order.created_at = new Date(createdAt.getTime() + 8 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "獲取訂單列表失敗",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrdersByNumberOrName,
  getmemOrders,
};