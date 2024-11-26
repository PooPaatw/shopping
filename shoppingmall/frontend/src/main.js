import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/styles/main.scss";
import Notifications from "vue-notification";
import axios from "@/api/axios";

Vue.use(Notifications);
Vue.config.productionTip = false;

// 檢查並初始化認證狀態
const initializeAuth = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (user && token) {
      store.commit("auth/SET_USER", user);
      store.commit("auth/SET_TOKEN", token);
      // 設置 axios 的 Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    // 如果出錯，清除本地存儲
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
};

// 創建 Vue 實例
new Vue({
  router,
  store,
  render: (h) => h(App),
  created() {
    this.$store.dispatch("auth/initAuth");
  },
}).$mount("#app");

// 添加全局的 axios 請求攔截器
axios.interceptors.request.use(
  (config) => {
    const token = store.state.auth.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加響應攔截器處理認證錯誤
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 如果收到 401 錯誤，清除認證狀態並重定向到登入頁面
      await store.dispatch("auth/logout");
      router.push({
        path: "/login",
        query: { redirect: router.currentRoute.fullPath },
      });
    }
    return Promise.reject(error);
  }
);

// 全局路由守衛
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isAuthenticated = store.getters["auth/isAuthenticated"];

  if (requiresAuth && !isAuthenticated) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  } else if (to.path === "/login" && isAuthenticated) {
    next("/");
  } else {
    next();
  }
});
