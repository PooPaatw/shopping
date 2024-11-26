import axios from "@/api/axios";

const API_BASE_URL = "/api";

const state = {
  product: {},
  loading: false,
  error: null,
};

const mutations = {
  SET_PRODUCT(state, product) {
    state.product = product;
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchProductById({ commit }, productId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const response = await axios.get(`/products/getproductbyid`, {
        params: {
          product_id: productId,
        },
      });

      if (response.data.success) {
        // 處理商品數據，確保與列表頁面格式一致
        const processedProduct = {
          ...response.data.data,
          price: parseFloat(response.data.data.price) || 0,
          original_price: parseFloat(response.data.data.original_price) || 0,
          // 處理圖片 URL
          image_url: response.data.data.image_url
            ? `${API_BASE_URL}${response.data.data.image_url.replace(
                "/public",
                ""
              )}`
            : null,
        };
        commit("SET_PRODUCT", processedProduct);
      } else {
        throw new Error(response.data.message || "獲取商品失敗");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      commit(
        "SET_ERROR",
        error.response?.data?.message || error.message || "獲取商品數據失敗"
      );
    } finally {
      commit("SET_LOADING", false);
    }
  },
};

const getters = {
  product: (state) => state.product,
  loading: (state) => state.loading,
  error: (state) => state.error,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
