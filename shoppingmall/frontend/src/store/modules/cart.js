import axios from "@/api/axios";

const API_BASE_URL = "/api"; // 圖片顯示勿動

export default {
  namespaced: true,

  state: {
    items: [],
    loading: false,
    error: null,
  },

  mutations: {
    SET_ITEMS(state, items) {
      state.items = items;
    },

    SET_LOADING(state, status) {
      state.loading = status;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },

    CLEAR_FRONTEND_CART(state) {
      // 只清除前端狀態，不影響資料庫
      state.items = [];
    },
  },

  actions: {
    // 初始化購物車
    async initializeCart({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await axios.get("/cart/items");
        if (response.data.success) {
          const items = response.data.data.map((item) => ({
            ...item,
            quantity: parseInt(item.quantity),
            price: parseInt(item.price),
            stock_quantity: parseInt(item.stock_quantity),
            image_url: item.image_url
              ? `${API_BASE_URL}${item.image_url.replace("/public", "")}`
              : null,
          }));
          console.log("Fetched items:", items); // 加入日誌
          commit("SET_ITEMS", items);
        }
      } catch (error) {
        console.error("初始化購物車錯誤:", error);
        commit(
          "SET_ERROR",
          error.response?.data?.message || "獲取購物車數據失敗"
        );
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // 添加商品到購物車
    async addItemToCart({ commit, state }, { productId, quantity }) {
      commit("SET_LOADING", true);
      try {
        // 先檢查前端購物車是否已有此商品
        const existingItem = state.items.find(
          (item) => item.product_id === productId
        );
        if (existingItem) {
          commit("SET_ERROR", "商品已在購物車中");
          return { success: false, message: "商品已在購物車中", isExist: true };
        }

        const response = await axios.post("/cart/add", {
          product_id: productId,
          quantity: quantity,
        });

        if (response.data.success) {
          await this.dispatch("cart/initializeCart");
        }
        return response.data;
      } catch (error) {
        // 檢查是否是商品已存在的錯誤
        if (error.response?.status === 409) {
          commit("SET_ERROR", "商品已在購物車中");
          return { success: false, message: "商品已在購物車中", isExist: true };
        }
        const errorMessage = error.response?.data?.message || "加入購物車失敗";
        commit("SET_ERROR", errorMessage);
        throw new Error(errorMessage);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // 更新數量
    async updateQuantity({ dispatch }, { productId, quantity }) {
      try {
        await axios.put("/cart/update", {
          product_id: productId,
          quantity: quantity,
        });
        await dispatch("initializeCart");
      } catch (error) {
        throw error;
      }
    },

    // 移除商品
    async removeFromCart({ dispatch }, productId) {
      try {
        await axios.delete(`/cart/remove/${productId}`);
        await dispatch("initializeCart");
      } catch (error) {
        throw error;
      }
    },

    // 清空購物車 (現在只在創建訂單時使用)
    async clearCart({ commit }) {
      try {
        await axios.delete("/cart/clear");
        commit("SET_ITEMS", []);
      } catch (error) {
        throw error;
      }
    },

    // 當登出時只清除前端購物車顯示
    clearFrontendCart({ commit }) {
      commit("SET_ITEMS", []);
    },

    // 創建訂單
    async createOrder({ dispatch }) {
      try {
        const response = await axios.post("/orderscreate");
        if (response.data.success) {
          await dispatch("clearCart");
          return response.data; // 返回完整的 response.data，包含 order_id
        }
        throw new Error(response.data.message || "創建訂單失敗");
      } catch (error) {
        console.error("Create order error:", error);
        throw new Error(error.response?.data?.message || "創建訂單失敗");
      }
    },
  },
  getters: {
    cartItems: (state) => state.items,
    cartTotal: (state) =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    itemCount: (state) =>
      state.items.reduce((count, item) => count + item.quantity, 0),
  },
};
