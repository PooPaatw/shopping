// frontend/src/store/modules/series.js
import axios from "@/api/axios";

export default {
  namespaced: true,

  state: {
    series: [],
    loading: false,
    error: null,
    totalSeries: 0,
  },

  mutations: {
    SET_SERIES(state, { data, totalSeries }) {
      state.series = data.map((item) => ({
        series_id: Number(item.series_id),
        seriesname: item.seriesname,
        description: item.description,
        is_active: Number(item.is_active),
        product_count: Number(item.product_count) || 0,
      }));
      state.totalSeries = totalSeries;
    },

    SET_LOADING(state, status) {
      state.loading = status;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },
  },

  actions: {
    async fetchSeries({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await axios.get("/products/getallseries");
        if (response.data.success) {
          commit("SET_SERIES", {
            data: response.data.data,
            totalSeries: response.data.totalSeries,
          });
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchsingleSeries({ commit }) {
      commit("SET_LOADING", true);
      try {
        // 使用新的 API 端點
        const response = await axios.get("/products/getserieswithcounts");
        if (response.data.success) {
          commit("SET_SERIES", {
            data: response.data.data,
            totalSeries: response.data.totalSeries,
          });
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },

  getters: {
    getActiveSeries: (state) => {
      return state.series
        .filter((item) => item.is_active === 1)
        .map((item) => ({
          ...item,
          product_count: Number(item.product_count) || 0,
        }));
    },
  },
};
