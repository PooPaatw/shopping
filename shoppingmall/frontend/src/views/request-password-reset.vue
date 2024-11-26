<template>
  <div class="request-password-reset-page">
    <h2>Reset Password</h2>
    <form @submit.prevent="requestPasswordReset">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <button
        type="submit"
        :disabled="isLoading || !isFormValid"
        class="reset-button"
      >
        <span v-if="isLoading" class="spinner"></span>
        {{ isLoading ? "Sending..." : "Confirm" }}
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
  name: "PasswordResetRequest",
  data() {
    return {
      email: "",
      isLoading: false,
      message: "",
      messageType: "info",
    };
  },
  computed: {
    isFormValid() {
      return this.email.trim() !== "" && this.validateEmail(this.email);
    },
  },
  methods: {
    async requestPasswordReset() {
      this.isLoading = true;
      this.message = "";

      try {
        const response = await api.post("/users/request-password-reset", {
          email: this.email,
        });

        console.log("Password reset requested:", response.data);
        this.message = "已寄送重設密碼的連結到您的電子郵件。";
        this.messageType = "success";
      } catch (error) {
        console.error("Password reset request error:", error);
        this.message =
          error.response?.data?.message ||
          "An error occurred. Please try again.";
        this.messageType = "error";
      } finally {
        this.isLoading = false;
      }
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    backToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped lang="scss">
.request-password-reset-page {
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
