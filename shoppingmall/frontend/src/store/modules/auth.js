import axios from "@/api/axios";

const hasValidAuth = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

export default {
  namespaced: true,

  state: {
    token: localStorage.getItem("token") || "",
    user: JSON.parse(localStorage.getItem("user") || "null"),
    isAuthenticated: hasValidAuth(),
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      state.isAuthenticated = !!token;
      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      }
    },

    SET_USER(state, user) {
      state.user = user;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    },

    CLEAR_AUTH(state) {
      state.token = "";
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
    },
  },

  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post("/users/login", credentials);

        if (response.data.success && response.data.user) {
          const userData = response.data.user;
          const token = response.data.token || "session-token";

          commit("SET_USER", userData);
          commit("SET_TOKEN", token);

          return {
            success: true,
            message: response.data.message,
            user: userData,
          };
        }

        throw new Error(response.data.message || "登入失敗");
      } catch (error) {
        commit("CLEAR_AUTH");
        throw error.response?.data?.message || error.message || "登入失敗";
      }
    },

    async logout({ commit, dispatch }) {
      try {
        // 清除認證狀態
        commit("CLEAR_AUTH");

        // 只清除前端購物車顯示，不清除資料庫數據
        await dispatch("cart/clearFrontendCart", null, { root: true });

        return {
          success: true,
          message: "登出成功",
        };
      } catch (error) {
        console.error("登出過程中出錯:", error);
        // 確保即使出錯也清除認證狀態
        commit("CLEAR_AUTH");
        return {
          success: false,
          message: "登出時發生錯誤",
        };
      }
    },

    async checkAuth({ commit }) {
      try {
        const response = await axios.get("/users/profile");

        if (response.data.success && response.data.user) {
          commit("SET_USER", response.data.user);
          return response.data.user;
        }

        throw new Error("無法獲取用戶資料");
      } catch (error) {
        if (error.response && [401, 403, 404].includes(error.response.status)) {
          commit("CLEAR_AUTH");
        }
        throw error;
      }
    },

    async initAuth({ commit, dispatch }) {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        commit("SET_TOKEN", token);
        commit("SET_USER", JSON.parse(user));

        try {
          await dispatch("checkAuth");
          // 如果用戶已驗證，初始化購物車
          if (this.state.auth.isAuthenticated) {
            await dispatch("cart/initializeCart", null, { root: true });
          }
        } catch (error) {
          // 只在認證相關錯誤時清除狀態
          if (
            error.response &&
            [401, 403, 404].includes(error.response.status)
          ) {
            commit("CLEAR_AUTH");
          }
          console.error("初始化認證失敗:", error);
        }
      }
    },
  },

  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    token: (state) => state.token,
    username: (state) => state.user?.username,
    userId: (state) => state.user?.id,
    userRole: (state) => state.user?.role,
  },
};
