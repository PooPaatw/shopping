<template>
  <div class="registration-wrapper">
    <div class="registration-container">
      <h2 class="registration-title">會員註冊</h2>
      <form @submit.prevent="submitForm" class="registration-form">
        <div class="form-grid">
          <div class="form-column">
            <div class="form-group">
              <label for="username" class="required">帳號</label>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                v-model.trim="formData.username"
                required
              />
            </div>
            <div class="form-group">
              <label for="password" class="required">密碼</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                v-model.trim="formData.password"
                required
              />
            </div>
            <div class="form-group">
              <label for="confirmPassword" class="required"
                >再次輸入密碼</label
              >
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm password"
                v-model.trim="formData.confirmPassword"
                required
              />
            </div>
            <div class="form-group">
              <label for="email" class="required">信箱</label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                v-model.trim="formData.email"
                required
              />
            </div>
          </div>

          <div class="form-column">
            <div class="form-group">
              <label for="mobilenum" class="required">手機</label>
              <input
                type="tel"
                id="mobilenum"
                placeholder="Phone number"
                v-model.trim="formData.mobilenum"
                @input="validateMobileNumber"
                required
              />
            </div>
            <div class="form-group">
              <label for="referral">Referral (optional)</label>
              <input
                type="text"
                id="referral"
                placeholder="Enter referral code"
                v-model.trim="formData.referral"
              />
            </div>
            <div class="form-group">
              <label for="identityNo">推薦碼 (非必填)</label>
              <input
                type="text"
                id="identityNo"
                placeholder="Enter ID number"
                v-model.trim="formData.identityNo"
              />
            </div>
            <div class="form-group">
              <label for="verificationCode" class="required"
                >驗證碼</label
              >
              <div class="verification-input">
                <input
                  type="text"
                  id="verificationCode"
                  placeholder="Enter code"
                  v-model.trim="formData.verificationCode"
                  required
                />
                <span class="verification-code">{{ generatedCode }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="agreement-section">
          <label class="agreement-label">
            <input type="checkbox" v-model="formData.agreement" required />
            <span
              >I agree to the
              <a href="#" class="terms-link">Terms & Conditions</a></span
            >
          </label>
        </div>

        <div v-if="registrationError" class="error-message">
          {{ registrationError }}
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="!isFormValid">送出</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "@/api/axios";

export default {
  name: "Register",
  data() {
    return {
      formData: {
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        mobilenum: "",
        referral: "",
        identityNo: "",
        verificationCode: "",
        agreement: false,
      },
      registrationError: null,
      generatedCode: "",
    };
  },
  computed: {
    isFormValid() {
      return (
        this.formData.username &&
        this.formData.password &&
        this.formData.confirmPassword &&
        this.formData.email &&
        this.formData.mobilenum &&
        this.formData.mobilenum.length === 10 &&
        this.formData.verificationCode &&
        this.formData.agreement
      );
    },
  },
  methods: {
    validateMobileNumber() {
      // 移除非數字字符
      this.formData.mobilenum = this.formData.mobilenum.replace(/\D/g, "");

      // 限制長度為 10 位
      if (this.formData.mobilenum.length > 10) {
        this.formData.mobilenum = this.formData.mobilenum.slice(0, 10);
      }
    },
    async submitForm() {
      this.registrationError = null;

      if (!this.isFormValid) {
        this.registrationError =
          "請填寫所有必填欄位（包括10位數手機號碼）並同意條款和條件。";
        return;
      }

      if (this.formData.password !== this.formData.confirmPassword) {
        this.registrationError = "密碼和確認密碼不匹配。";
        return;
      }

      if (this.formData.verificationCode !== this.generatedCode) {
        this.registrationError = "驗證碼不正確。";
        return;
      }

      try {
        const response = await api.post("/users/register", this.formData);

        if (response.data.success) {
          console.log("註冊成功:", response.data.user);
          this.$router.push("/register-success");
        } else {
          this.registrationError =
            response.data.message || "註冊失敗，請稍後再試。";
        }
      } catch (error) {
        console.error("註冊錯誤:", error);
        this.registrationError =
          error.response?.data?.message || "註冊過程中發生錯誤，請稍後再試。";
      }
    },
    generateVerificationCode() {
      this.generatedCode = Math.floor(1 + Math.random() * 9).toString();
    },
  },
  created() {
    this.generateVerificationCode();
  },
};
</script>

<style lang="scss" scoped>
// Variables
$primary-color: #007bff;
$error-color: #dc3545;
$border-color: #dee2e6;
$text-color: #212529;
$background-color: #ffffff;
$disabled-color: #6c757d;

// Mixins
@mixin mobile {
  @media (max-width: 768px) {
    @content;
  }
}

.registration-wrapper {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.registration-container {
  background: $background-color;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: 70%;
  max-width: 900px;
  margin: 0 auto;

  @include mobile {
    padding: 1rem;
  }
}

.registration-title {
  text-align: center;
  color: $text-color;
  margin-bottom: 2rem;
  font-size: 1.75rem;
}

.registration-form {
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;

    @include mobile {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: $text-color;

      &.required::after {
        content: "*";
        color: $error-color;
        margin-left: 4px;
      }
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid $border-color;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
      }
    }
  }

  .verification-input {
    position: relative;

    input {
      padding-right: 80px;
    }

    .verification-code {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-left: 1px solid $border-color;
      border-radius: 0 4px 4px 0;
      font-size: 1.2rem;
      color: $error-color;
    }
  }

  .agreement-section {
    margin: 2rem 0;
    text-align: center;

    .agreement-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        margin: 0;
      }

      .terms-link {
        color: $primary-color;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .error-message {
    background-color: rgba($error-color, 0.1);
    color: $error-color;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    text-align: center;
  }

  .form-actions {
    text-align: center;
    margin-top: 2rem;

    button {
      background-color: $primary-color;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover:not(:disabled) {
        background-color: darken($primary-color, 10%);
      }

      &:disabled {
        background-color: $disabled-color;
        cursor: not-allowed;
      }
    }
  }
}
</style>
