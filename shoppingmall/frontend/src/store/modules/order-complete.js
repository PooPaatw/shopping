import axios from "@/api/axios";

export default {
  namespaced: true,

  state: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },

  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    SET_CURRENT_ORDER(state, order) {
      state.currentOrder = order;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_CURRENT_ORDER(state) {
      state.currentOrder = null;
    },
  },

  actions: {
    // 獲取所有訂單
    async getOrders({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await axios.get("/getmemOrders");
        commit("SET_ORDERS", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("Get orders error:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // 獲取單一訂單詳情
    async getOrderById({ commit }, orderId) {
      if (!orderId) return;

      commit("SET_LOADING", true);
      try {
        const response = await axios.get(`/orders/${orderId}`);
        console.log("response", response);
        commit("SET_CURRENT_ORDER", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("Get order detail error:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // 取消訂單
    async cancelOrder({ commit }, orderId) {
      commit("SET_LOADING", true);
      try {
        const response = await axios.put(`/orders/${orderId}/cancel`);
        return response.data;
      } catch (error) {
        console.error("Cancel order error:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    clearCurrentOrder({ commit }) {
      commit("CLEAR_CURRENT_ORDER");
    },
  },

  getters: {
    orderDetail: (state) => state.currentOrder,
  },
};
