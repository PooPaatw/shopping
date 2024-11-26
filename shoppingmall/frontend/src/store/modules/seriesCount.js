import axios from "@/api/axios";

export default {
  namespaced: true,

  state: {
    seriesList: [], // 儲存完整的系列資訊
    counts: {}, // 儲存系列商品數量
    loading: false,
    error: null,
  },

  mutations: {
    SET_SERIES_DATA(state, seriesData) {
      state.seriesList = seriesData;
      // 構建計數對象
      state.counts = seriesData.reduce((acc, curr) => {
        acc[curr.series_id] = curr.product_count;
        return acc;
      }, {});
    },

    SET_LOADING(state, status) {
      state.loading = status;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },

    CLEAR_ERROR(state) {
      state.error = null;
    },
  },

  actions: {
    async fetchSeriesCount({ commit }) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const response = await axios.get("/products/getallserieswithcounts");

        if (response.data.success) {
          commit("SET_SERIES_DATA", response.data.data);
          return response.data.data;
        } else {
          throw new Error(response.data.message || "獲取系列數據失敗");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "獲取系列數據時發生錯誤";
        commit("SET_ERROR", errorMessage);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },

  getters: {
    getCount: (state) => (seriesId) => {
      return state.counts[seriesId] || 0;
    },

    getAllSeries: (state) => state.seriesList,

    getActiveSeries: (state) => {
      return state.seriesList.filter((series) => series.is_active === 1);
    },

    getTotalCount: (state) => {
      return Object.values(state.counts).reduce(
        (total, count) => total + count,
        0
      );
    },

    getSeriesById: (state) => (seriesId) => {
      return state.seriesList.find((series) => series.series_id === seriesId);
    },
  },
};
