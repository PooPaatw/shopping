import axios from "axios";
import store from "@/store";
import router from "@/router"; // 添加 router 引入

const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
  withCredentials: true,
});

// 請求攔截器
instance.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// 響應攔截器
instance.interceptors.response.use(
  (response) => {
    store.commit("CLEAR_ERROR");
    return response;
  },
  async (error) => {
    console.error("Response error:", error);

    if (error.response) {
      // 處理 401 未授權錯誤
      if (error.response.status === 401) {
        await store.dispatch("auth/logout");
        router.push("/login");
        return Promise.reject(new Error("請重新登入"));
      }

      // 處理 403 權限不足
      if (error.response.status === 403) {
        router.push("/");
        return Promise.reject(new Error("權限不足"));
      }

      store.commit("SET_ERROR", error.response.data.message || "發生錯誤");
    } else if (error.request) {
      store.commit("SET_ERROR", "無法連接到伺服器");
    } else {
      store.commit("SET_ERROR", error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;
