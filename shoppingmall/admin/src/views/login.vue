<template>
  <div class="login-page">
    <h2>Staff Login</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="employeeid">Staff ID:</label>
        <input type="text" id="employeeid" v-model="employeeid" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Logging in..." : "Login" }}
      </button>
    </form>
    <p v-if="errorMessage" :class="['message', 'error']">{{ errorMessage }}</p>
  </div>
</template>

<script>
import api from "@/api/axios";

export default {
  name: "AdminLogin",
  data() {
    return {
      employeeid: "",
      password: "",
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async login() {
      this.isLoading = true;
      this.errorMessage = "";

      try {
        const response = await api.post("/employees/login", {
          employeeid: this.employeeid,
          password: this.password,
        });

        // 登入成功
        localStorage.setItem("staffToken", response.data.token);
        this.$router.push("/");
      } catch (error) {
        console.error("Login error:", error);

        if (error.response) {
          // 服務器回應錯誤
          switch (error.response.status) {
            case 401:
              this.errorMessage =
                error.response.data.message || "員工編號或密碼錯誤";
              break;
            case 403:
              this.errorMessage =
                error.response.data.message || "非在職員工請勿使用系統";
              break;
            case 429:
              this.errorMessage = "登入嘗試次數過多，請稍後再試";
              break;
            default:
              this.errorMessage = "登入失敗，請稍後再試";
          }
        } else if (error.request) {
          // 請求發出但未收到回應
          this.errorMessage = "無法連接到伺服器，請檢查網路連線";
        } else {
          // 設置請求時發生錯誤
          this.errorMessage = "系統發生錯誤，請稍後再試";
        }

        if (this.errorMessage) {
          alert(this.errorMessage);
        }
      } finally {
        this.isLoading = false;
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
}
</style>
