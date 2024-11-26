<template>
    <mainlayout>
      <div class="query-model-container">
        <h1 class="title">查詢會員</h1>
        <div class="form-container">
          <form @submit.prevent="submitForm" class="model-form">
            <div class="form-group">
              <label for="formData.user_id">會員編號</label>
              <input
                type="text"
                id="user_id"
                v-model="formData.user_id"
                class="form-input"
                :class="{ error: errors.user_id }"
                placeholder="請輸入會員編號"
              />
              <span class="error-message" v-if="errors.user_id">
                {{ errors.user_id }}
              </span>
            </div>
  
            <div class="form-group">
              <label for="username">會員名稱</label>
              <input
                type="text"
                id="username"
                v-model="formData.username"
                class="form-input"
                :class="{ error: errors.username }"
                placeholder="請輸入會員名稱"
              />
              <span class="error-message" v-if="errors.username">
                {{ errors.username }}
              </span>
            </div>
  
            <div class="form-hint">* 可輸入會員編號或名稱進行查詢</div>
  
            <div class="button-group">
              <button type="submit" class="submit-btn">查詢會員</button>
              <button type="button" class="reset-btn" @click="resetForm">
                重置
              </button>
              <button type="button" class="query-all-btn" @click="getAllUsers">
                查詢全部
              </button>
            </div>
          </form>
  
          <div v-if="userList && userList.length > 0" class="model-list">
            <h2>查詢結果 (共 {{ userList.length }} 筆)</h2>
            <div
              v-for="(user, index) in userList"
              :key="index"
              class="model-card"
            >
              <div class="model-info">
                <div class="info-section">
                  <p><strong>會員編號:</strong> {{ user.user_id }}</p>
                  <p><strong>會員名稱:</strong> {{ user.username }}</p>
                  <p><strong>電子郵件:</strong> {{ user.email }}</p>
                  <p><strong>手機號碼:</strong> {{ user.mobilenum }}</p>
                  <p>
                    <strong>註冊日期:</strong>
                    {{ formatDate(user.created_at) }}
                  </p>
                  <p>
                    <strong>最近登入:</strong>
                    {{ formatDate(user.last_login) }}
                  </p>
                </div>
                <div class="action-section">
                  <button class="edit-btn" @click="editUser(user)">
                    修改資料
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="searchPerformed" class="no-results">
            <p>未找到符合條件的會員</p>
          </div>
        </div>
      </div>
  
      <!-- 修改資料的彈出框 -->
      <div class="modal" v-if="showEditModal" @click.self="closeEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>修改會員資料</h2>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitEdit" class="edit-form">
              <div class="form-group">
                <label>會員編號</label>
                <input
                  type="text"
                  v-model="editForm.user_id"
                  class="form-input"
                  disabled
                />
              </div>
  
              <div class="form-group">
                <label>會員名稱</label>
                <input
                  type="text"
                  v-model="editForm.username"
                  class="form-input"
                  :class="{ error: editErrors.username }"
                  disabled
                />
                <span class="error-message" v-if="editErrors.username">
                  {{ editErrors.username }}
                </span>
              </div>
  
              <div class="form-group">
                <label>電子郵件</label>
                <input
                  type="email"
                  v-model="editForm.email"
                  class="form-input"
                  :class="{ error: editErrors.email }"
                />
                <span class="error-message" v-if="editErrors.email">
                  {{ editErrors.email }}
                </span>
              </div>
  
              <div class="form-group">
                <label>手機號碼</label>
                <input
                  type="tel"
                  v-model="editForm.mobilenum"
                  class="form-input"
                  :class="{ error: editErrors.mobilenum }"
                />
                <span class="error-message" v-if="editErrors.mobilenum">
                  {{ editErrors.mobilenum }}
                </span>
              </div>
  
              <div class="modal-footer">
                <button type="submit" class="save-btn">保存</button>
                <button type="button" class="cancel-btn" @click="closeEditModal">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </mainlayout>
  </template>
  
  <script>
  import Mainlayout from "@/components/index/mainlayout.vue";
  import api from "@/api/axios";
  
  export default {
    name: "QueryUser",
    components: {
      Mainlayout,
    },
    data() {
      return {
        formData: {
          username: "",
          user_id: "",
        },
        errors: {
          username: "",
          user_id: "",
        },
        userList: [],
        searchPerformed: false,
        showEditModal: false,
        editForm: {
          user_id: "",
          username: "",
          email: "",
          mobilenum: "",
        },
        editErrors: {
          username: "",
          email: "",
          mobilenum: "",
        },
      };
    },
    methods: {
      validateForm() {
        let isValid = true;
        this.clearErrors();
  
        if (!this.formData.username.trim() && !this.formData.user_id.trim()) {
          this.errors.username = "請至少輸入一個查詢條件";
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
          const params = {};
          if (this.formData.username.trim()) {
            params.username = this.formData.username.trim();
          }
          if (this.formData.user_id.trim()) {
            params.user_id = this.formData.user_id.trim();
          }
  
          const response = await api.get("/users/getusername", { params });
          this.searchPerformed = true;
  
          if (response.status === 200 && response.data.userDetails) {
            this.userList = Array.isArray(response.data.userDetails)
              ? response.data.userDetails
              : [response.data.userDetails];
            console.log("User List:", this.userList);
          } else {
            this.userList = [];
          }
        } catch (error) {
          console.error("Error querying users:", error);
          this.searchPerformed = true;
          this.userList = [];
          if (error.response?.status === 404) {
            this.userList = [];
          }
        }
      },
  
      async getAllUsers() {
        try {
          this.searchPerformed = true;
          const response = await api.get("/users/getallusers");
  
          console.log("API Response:", response.data);
  
          if (response.status === 200 && response.data.data) {
            this.userList = response.data.data;
            console.log("Processed User List:", this.userList);
          } else {
            this.userList = [];
            console.error("Invalid response format:", response);
          }
        } catch (error) {
          console.error("Error querying all users:", error);
          this.searchPerformed = true;
          this.userList = [];
        }
      },
  
      resetForm() {
        this.formData.username = "";
        this.formData.user_id = "";
        this.clearErrors();
        this.userList = [];
        this.searchPerformed = false;
      },
  
      formatDate(dateString) {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            return "無效日期";
          }
          return date.toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (error) {
          console.error("Date formatting error:", error);
          return "日期格式錯誤";
        }
      },
  
      editUser(user) {
        this.editForm = {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          mobilenum: user.mobilenum,
        };
        this.showEditModal = true;
      },
  
      closeEditModal() {
        this.showEditModal = false;
        this.clearEditErrors();
      },
  
      clearEditErrors() {
        Object.keys(this.editErrors).forEach((key) => {
          this.editErrors[key] = "";
        });
      },
  
      validateEditForm() {
        let isValid = true;
        this.clearEditErrors();
  
        // 驗證電子郵件格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.editForm.email)) {
          this.editErrors.email = "請輸入有效的電子郵件地址";
          isValid = false;
        }
  
        // 驗證手機號碼格式
        const mobileRegex = /^09\d{8}$/;
        if (!mobileRegex.test(this.editForm.mobilenum)) {
          this.editErrors.mobilenum = "請輸入有效的手機號碼 (09開頭的10位數字)";
          isValid = false;
        }
  
        return isValid;
      },
  
      async submitEdit() {
        if (!this.validateEditForm()) {
          return;
        }
  
        try {
          const submitData = {
            user_id: this.editForm.user_id,
            email: this.editForm.email.trim(),
            mobilenum: this.editForm.mobilenum.trim(),
          };
  
          console.log("Submitting edit data:", submitData);
  
          const response = await api.put("/users/updateuser", submitData);
  
          if (response.status === 200) {
            await this.getAllUsers();
            alert("修改成功");
            this.closeEditModal();
          }
        } catch (error) {
          console.error("Error updating user:", error);
          alert("修改失敗: " + (error.response?.data?.message || error.message));
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .query-model-container {
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
  
  .model-form {
    display: grid;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  /* 列表樣式 */
  .model-list {
    margin-top: 30px;
  }
  
  .model-list h2 {
    font-size: 20px;
    color: #333;
    margin-bottom: 20px;
  }
  
  .model-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
  }
  
  .model-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }
  
  .info-section {
    flex: 1;
  }
  
  .info-section p {
    margin: 8px 0;
    color: #555;
    line-height: 1.5;
  }
  
  .action-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 8px;
  }
  
  .edit-btn {
    padding: 8px 16px;
    background-color: #ffc107;
    color: #000;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .edit-btn:hover {
    background-color: #e0a800;
    transform: translateY(-1px);
  }
  
  /* 響應式調整 */
  @media (max-width: 576px) {
    .model-info {
      flex-direction: column;
    }
  
    .action-section {
      width: 100%;
      flex-direction: row;
      justify-content: flex-end;
      padding-top: 15px;
    }
  }
  
  .no-results {
    text-align: center;
    padding: 20px;
    color: #666;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-top: 20px;
  }
  
  /* 表單元素樣式 */
  .form-group {
    display: flex;
    flex-direction: column;
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
  
  .form-hint {
    text-align: center;
    color: #666;
    font-size: 14px;
    margin-top: 10px;
    font-style: italic;
  }
  
  /* 按鈕樣式 */
  .button-group {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  
  .button-group button {
    flex: 1;
    min-width: 120px;
    max-width: 200px;
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
  
  .query-all-btn {
    background-color: #28a745;
    color: white;
  }
  
  .query-all-btn:hover {
    background-color: #218838;
  }
  
  /* 彈出框樣式 */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 20px;
  }
  
  .save-btn {
    padding: 8px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .save-btn:hover {
    background-color: #218838;
  }
  
  .cancel-btn {
    padding: 8px 20px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .cancel-btn:hover {
    background-color: #5a6268;
  }
  
  /* 表單組件間距 */
  .form-group + .form-group {
    margin-top: 20px;
  }
  
  /* 文本區域樣式 */
  textarea.form-input {
    min-height: 80px;
    resize: vertical;
    line-height: 1.5;
  }
  
  /* 狀態徽章 */
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .status-active {
    background-color: #28a745;
    color: white;
  }
  
  .status-inactive {
    background-color: #dc3545;
    color: white;
  }
  
  /* 表單驗證相關 */
  .form-input:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
  
  /* 增加會員列表的額外樣式 */
  .info-section .email,
  .info-section .mobile {
    word-break: break-all;
  }
  
  .info-section .created-date,
  .info-section .last-login {
    color: #666;
    font-size: 0.9em;
  }
  
  /* 移動設備優化 */
  @media (max-width: 768px) {
    .modal-content {
      width: 95%;
      margin: 10px;
    }
  
    .form-input,
    .button-group button {
      font-size: 14px;
    }
  
    .info-section p {
      font-size: 14px;
    }
  }
  </style>
  /* 使用與商品查詢相同的樣式 */
  .query-model-container {
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
  
  /* ... 其他樣式與商品查詢頁面相同 ... */
  
  .info-section p {
    margin: 8px 0;
    color: #555;
    line-height: 1.5;
  }
  
  /* ... 其餘樣式保持不變 ... */
  </style>