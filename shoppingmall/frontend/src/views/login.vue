<template>
  <div class="login-page">
    <loading :show="isLoading" />

    <template v-if="isAuthenticated">
      <div class="message success">您已經登入，正在跳轉...</div>
    </template>

    <h2>會員登入</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">帳號:</label>
        <input
          type="text"
          id="username"
          v-model="loginForm.username"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">密碼:</label>
        <input
          type="password"
          id="password"
          v-model="loginForm.password"
          required
        />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Logging in..." : "Login" }}
      </button>
    </form>
    <p v-if="error" :class="['message', 'error']">{{ error }}</p>
    <p class="register-link">
      你沒有帳號密嗎?
      <router-link to="/register">從這裡註冊</router-link>
    </p>
    <p class="register-link">
      <router-link to="/request-password-reset">找回密碼</router-link>
    </p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  name: "MemberLogin",

  components: {
    Loading,
  },

  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
    };
  },

  computed: {
    ...mapState({
      isLoading: (state) => state.loading,
      error: (state) => state.error,
    }),
    ...mapGetters("auth", ["isAuthenticated"]),
  },

  methods: {
    ...mapActions("auth", ["login"]),

    async handleLogin() {
      try {
        this.$store.commit("SET_LOADING", true);
        this.$store.commit("CLEAR_ERROR");

        const result = await this.login(this.loginForm);

        if (result.success) {
          // 初始化購物車
          await this.$store.dispatch("cart/initializeCart");

          this.$notify({
            group: "foo",
            type: "success",
            title: "登入成功",
            text: "歡迎回來！",
            duration: 3000,
          });

          // 獲取重定向路徑
          const redirectPath = this.$route.query.redirect || "/";

          // 只有當目標路徑不是當前路徑時才進行導航
          if (this.$route.path !== redirectPath) {
            await this.$router.push(redirectPath).catch((err) => {
              if (err.name !== "NavigationDuplicated") {
                throw err;
              }
            });
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        this.$notify({
          group: "foo",
          type: "error",
          title: "登入失敗",
          text: typeof error === "string" ? error : "請檢查帳號密碼是否正確",
          duration: 5000,
        });
      } finally {
        this.$store.commit("SET_LOADING", false);
      }
    },
  },

  created() {
    if (this.isAuthenticated) {
      const redirectPath = this.$route.query.redirect || "/";
      this.$router.push(redirectPath);
    }
  },

  watch: {
    isAuthenticated(newValue) {
      if (newValue) {
        const redirectPath = this.$route.query.redirect || "/";
        this.$router.push(redirectPath);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.login-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;

    &:hover:not(:disabled) {
      background-color: #0056b3;
    }

    &:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  }

  .message {
    text-align: center;
    margin-top: 1rem;
    padding: 0.5rem;
    border-radius: 4px;

    &.error {
      background-color: #f8d7da;
      color: #721c24;
    }

    &.success {
      background-color: #d4edda;
      color: #155724;
    }

    &.info {
      background-color: #e2e3e5;
      color: #383d41;
    }
  }

  .register-link {
    text-align: center;
    margin-top: 1rem;

    a {
      color: #007bff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
