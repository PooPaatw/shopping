<template>
  <mainlayout>
    <div class="add-employee-container">
      <h1 class="title">新增員工</h1>
      <div class="form-container">
        <form @submit.prevent="submitForm" class="employee-form">
          <div class="form-group">
            <label for="staffname">名字</label>
            <input
              type="text"
              id="staffname"
              v-model="formData.staffname"
              class="form-input"
              :class="{ error: errors.staffname }"
              required
            />
            <span class="error-message" v-if="errors.staffname">{{
              errors.staffname
            }}</span>
          </div>

          <div class="form-group">
            <label for="password">密碼</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              class="form-input"
              :class="{ error: errors.password }"
              required
            />
            <span class="error-message" v-if="errors.password">{{
              errors.password
            }}</span>
          </div>

          <div class="form-group">
            <label for="phone">手機號碼</label>
            <input
              type="text"
              id="phone"
              v-model="formData.mobilenum"
              class="form-input"
              :class="{ error: errors.mobilenum }"
              required
            />
            <span class="error-message" v-if="errors.mobilenum">{{
              errors.mobilenum
            }}</span>
          </div>

          <div class="form-group">
            <label for="role">職位</label>
            <select
              id="role"
              v-model="formData.role"
              class="form-input"
              :class="{ error: errors.role }"
              required
            >
              <option value="" disabled>請選擇職位</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <span class="error-message" v-if="errors.role">{{
              errors.role
            }}</span>
          </div>

          <div class="form-group">
            <label for="hiredate">入職日期</label>
            <input
              type="date"
              id="hiredate"
              v-model="formData.hiredate"
              class="form-input"
              :class="{ error: errors.hiredate }"
              :min="minDate"
              :max="maxDate"
              required
            />
            <span class="error-message" v-if="errors.hiredate">
              {{ errors.hiredate }}
            </span>
          </div>

          <div class="button-group">
            <button type="submit" class="submit-btn">新增員工</button>
            <button type="button" class="reset-btn" @click="resetForm">
              重置
            </button>
          </div>
        </form>
      </div>
    </div>
  </mainlayout>
</template>

<script>
import Mainlayout from "@/components/index/mainlayout.vue";
import api from "@/api/axios";

export default {
  name: "AddEmployees",
  components: {
    Mainlayout,
  },
  computed: {
    // 設定日期選擇器的最小日期和最大日期
    minDate() {
      // 固定今天的日期
      const today = new Date();
      return today.toISOString().split("T")[0];

      // 固定從 1911 年開始
      // return "1911-01-01";
    },
    maxDate() {
      const today = new Date();
      today.setDate(today.getDate() + 60); // 允許選擇未來 60 天的日期
      return today.toISOString().split("T")[0];

      // 固定到 2099 年結束
      // return "2099-12-31";
    },
  },
  data() {
    return {
      formData: {
        staffname: "",
        password: "",
        mobilenum: "",
        role: "",
        hiredate: "",
      },
      errors: {
        staffname: "",
        password: "",
        mobilenum: "",
        role: "",
        hiredate: "",
      },
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.clearErrors();

      // 手機號碼驗證
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(this.formData.mobilenum)) {
        this.errors.mobilenum = "請輸入有效的10位數電話號碼";
        isValid = false;
      }

      // 職位驗證
      if (!this.formData.role) {
        this.errors.role = "請選擇職位";
        isValid = false;
      }

      // 入職日期驗證
      if (!this.formData.hiredate) {
        this.errors.hiredate = "請選擇入職日期";
        isValid = false;
      }

      return isValid;
    },

    clearErrors() {
      Object.keys(this.errors).forEach((key) => {
        this.errors[key] = "";
      });
    },

    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      try {
        console.log("Form Data:", this.formData); // 打印表單數據
        const response = await api.post(
          "/employees/createstaff",
          this.formData
        );
        console.log("Response:", response);

        if (response.status === 200) {
          alert("員工新增成功！");
          this.resetForm();
          // 刷新當前畫面
        }
      } catch (error) {
        console.error("Error adding employee:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert("新增員工失敗：" + error.response.data.message);
        } else {
          alert("新增員工失敗：手機已被註冊");
        }
      }
    },

    resetForm() {
      Object.keys(this.formData).forEach((key) => {
        this.formData[key] = "";
      });
      this.clearErrors();
    },
  },
};
</script>

<style scoped>
.add-employee-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.form-container {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.employee-form {
  display: grid;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.submit-btn,
.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn {
  background-color: #4a90e2;
  color: white;
}

.submit-btn:hover {
  background-color: #357abd;
}

.reset-btn {
  background-color: #6c757d;
  color: white;
}

.reset-btn:hover {
  background-color: #5a6268;
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1em;
}
</style>
