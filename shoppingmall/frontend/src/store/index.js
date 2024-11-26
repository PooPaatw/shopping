import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import auth from "./modules/auth";
import products from "./modules/products";
import cart from "./modules/cart";
import banner from "./modules/banner";
import series from "./modules/series";
import seriesCount from "./modules/seriesCount";
import productDetail from "./modules/product-detail";
import orders from "./modules/order-complete";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loading: false,
    error: null,
  },
  mutations: {
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
  getters: {
    isLoading: (state) => state.loading,
    error: (state) => state.error,
  },
  modules: {
    auth,
    products,
    cart,
    banner,
    series,
    seriesCount,
    productDetail,
    orders,
  },
  plugins: [
    createPersistedState({
      paths: ["auth", "cart"],
      storage: window.localStorage,
      key: "vuex-shop",
      reducer(state) {
        return {
          auth: {
            token: state.auth.token,
            user: state.auth.user,
            isAuthenticated: state.auth.isAuthenticated,
          },
          cart: {
            items: state.cart.items,
          },
        };
      },
    }),
  ],
});
