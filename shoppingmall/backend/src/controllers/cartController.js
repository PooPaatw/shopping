const {knex, knexQuery, knexTransaction } = require("../config/database");

// 獲取購物車內容
const getCart = async (req, res) => {
  try {
    const items = await knex("shopping_carts as sc")
      .join("cart_items as ci", "sc.cart_id", "ci.cart_id")
      .join("products as p", "ci.product_id", "p.product_id")
      .select(
        "ci.product_id",
        "ci.quantity",
        "p.name as modelname",
        "p.price",
        "p.stock_quantity",
        "p.image_url"
      )
      .where("sc.user_id", req.user.user_id);

    res.json({
      success: true,
      data: items.map(item => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10),
        modelname: item.modelname,
        price: parseFloat(item.price),
        stock_quantity: parseInt(item.stock_quantity, 10),
        image_url: item.image_url ? `/api${item.image_url}` : null,
      })),
    });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ success: false, message: "無法獲取購物車內容" });
  }
};

// 添加到購物車
const addToCart = async (req, res) => {
  try {
    await knexTransaction(async (trx) => {
      const { product_id, quantity } = req.body;
      const user_id = req.user.user_id;

      const product = await trx("products")
        .select("stock_quantity")
        .where("product_id", product_id)
        .forUpdate();

      if (!product.length) throw new Error("商品不存在");
      if (product[0].stock_quantity < quantity) throw new Error("庫存不足");

      const cart = await trx("shopping_carts")
        .select("cart_id")
        .where("user_id", user_id);

      const cart_id = cart.length
        ? cart[0].cart_id
        : (
            await trx("shopping_carts")
              .insert({ user_id })
          )[0];

      const cartItem = await trx("cart_items")
        .select("quantity")
        .where({ cart_id, product_id });

      if (cartItem.length) {
        const updatedQuantity = cartItem[0].quantity + quantity;
        if (updatedQuantity > product[0].stock_quantity) {
          throw new Error("庫存不足，無法添加更多商品");
        }
        await trx("cart_items")
          .where({ cart_id, product_id })
          .update({ quantity: updatedQuantity });
      } else {
        if (quantity > product[0].stock_quantity) {
          throw new Error("庫存不足，無法添加商品");
        }
        await trx("cart_items")
          .insert({ cart_id, product_id, quantity });
      }
    });

    res.json({ success: true, message: "成功加入購物車" });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "加入購物車失敗",
    });
  }
};

// 更新購物車商品數量
const updateCartItem = async (req, res) => {
  try {
    await knexTransaction(async (trx) => {
      const { product_id, quantity } = req.body;
      const user_id = req.user.user_id;

      const product = await trx("products")
        .select("stock_quantity")
        .where("product_id", product_id)
        .forUpdate();

      if (!product.length) throw new Error("商品不存在");
      if (product[0].stock_quantity < quantity) throw new Error("庫存不足");

      const cart = await trx("shopping_carts")
        .select("cart_id")
        .where("user_id", user_id);

      if (!cart.length) throw new Error("購物車不存在");

      await trx("cart_items")
        .where({ cart_id: cart[0].cart_id, product_id })
        .update({ quantity });
    });

    res.json({ success: true, message: "更新成功" });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "更新失敗",
    });
  }
};

// 移除購物車商品
const removeCartItem = async (req, res) => {
  try {
    const cart = await knex("shopping_carts")
      .select("cart_id")
      .where("user_id", req.user.user_id)
      .first();

    if (cart) {
      await knex("cart_items")
        .where({
          cart_id: cart.cart_id,
          product_id: req.params.productId
        })
        .delete();
    }

    res.json({ success: true, message: "商品已移除" });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({
      success: false,
      message: "移除商品失敗",
    });
  }
};

// 清空購物車
const clearCart = async (req, res) => {
  try {
    const cart = await knex("shopping_carts")
      .select("cart_id")
      .where("user_id", req.user.user_id)
      .first();

    if (!cart) {
      return res.status(400).json({ success: false, message: "購物車不存在" });
    }

    await knex("cart_items")
      .where("cart_id", cart.cart_id)
      .delete();

    res.json({ success: true, message: "購物車已清空" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "清空購物車失敗",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
