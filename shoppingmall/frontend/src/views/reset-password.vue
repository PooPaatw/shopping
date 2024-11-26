<template>
  <div class="reset-password-page">
    <h2>Reset Password</h2>
    <form @submit.prevent="resetPassword">
      <div class="form-group">
        <label for="password">New Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
        />
      </div>
      <button
        type="submit"
        :disabled="isLoading || !isFormValid"
        class="reset-button"
      >
        <span v-if="isLoading" class="spinner"></span>
        {{ isLoading ? "Resetting..." : "Reset Password" }}
      </button>
    </form>
    <p v-if="message" :class="['message', messageType]">{{ message }}</p>
    <p class="back-to-login">
      <a href="#" @click.prevent="backToLogin">Back to Login</a>
    </p>
  </div>
</template>

<script>
import api from "@/api/axios";

export default {
  name: "PasswordReset",
  data() {
    return {
      password: "",
      confirmPassword: "",
      isLoading: false,
      message: "",
      messageType: "info",
    };
  },
  computed: {
    isFormValid() {
      const isPasswordNotEmpty = this.password.trim() !== "";
      const isConfirmPasswordNotEmpty = this.confirmPassword.trim() !== "";
      const isPasswordsMatch = this.password === this.confirmPassword;
      const isPasswordValid = this.validatePassword(this.password);

      console.log({
        isPasswordNotEmpty,
        isConfirmPasswordNotEmpty,
        isPasswordsMatch,
        isPasswordValid,
      });

      return (
        isPasswordNotEmpty &&
        isConfirmPasswordNotEmpty &&
        isPasswordsMatch &&
        isPasswordValid
      );
    },
  },
  methods: {
    async resetPassword() {
      this.isLoading = true;
      this.message = "";

      try {
        const token = this.$route.query.token; // 從 URL 中獲取 token
        const response = await api.post("/users/reset-password", {
          token: token,
          newPassword: this.password,
        });

        console.log("Password reset successful:", response.data);
        this.message = "密碼重設成功。";
        this.messageType = "success";
      } catch (error) {
        console.error("Password reset error:", error);
        this.message =
          error.response?.data?.message ||
          "An error occurred. Please try again.";
        this.messageType = "error";
      } finally {
        this.isLoading = false;
      }
    },
    validatePassword(password) {
      // 確保密碼至少有 3 個字符
      return password.length >= 3;
    },
    backToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped lang="scss">
.reset-password-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
    }
  }

  .reset-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;

    &:hover:not(:disabled) {
      background-color: #218838;
    }

    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #ffffff;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 10px;
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

  .back-to-login {
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
