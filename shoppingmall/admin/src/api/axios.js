import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
  withCredentials: true,
});

// 請求攔截器
instance.interceptors.request.use(
  (config) => {
    // 添加 token（如果存在）
    const token = localStorage.getItem("staffToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request config:", config);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error); // 直接返回原始錯誤
  }
);

// 響應攔截器
instance.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.error("Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error); // 直接返回原始錯誤
  }
);

export default instance;
