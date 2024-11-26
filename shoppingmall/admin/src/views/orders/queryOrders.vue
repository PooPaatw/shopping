<template>
  <mainlayout>
    <div class="query-order-container">
      <h1 class="title">查詢訂單</h1>
      <div class="form-container">
        <form @submit.prevent="submitForm" class="order-form">
          <div class="form-group">
            <label for="formData.order_id">訂單編號</label>
            <input
              type="text"
              id="order_id"
              v-model="formData.order_id"
              class="form-input"
              :class="{ error: errors.order_id }"
              placeholder="請輸入訂單編號"
            />
            <span class="error-message" v-if="errors.order_id">
              {{ errors.order_id }}
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

          <div class="form-hint">* 可輸入訂單編號或用戶名稱進行查詢</div>

          <div class="button-group">
            <button type="submit" class="submit-btn">查詢訂單</button>
            <button type="button" class="reset-btn" @click="resetForm">
              重置
            </button>
            <button type="button" class="query-all-btn" @click="getAllOrders">
              查詢全部
            </button>
            <button type="button" class="add-order-btn" @click="addOrder">
              新增訂單
            </button>
          </div>
        </form>

        <div v-if="orderList && orderList.length > 0" class="order-list">
          <h2>查詢結果 (共 {{ orderList.length }} 筆)</h2>
          <div
            v-for="(order, index) in orderList"
            :key="index"
            class="order-card"
          >
            <div class="order-info">
              <div class="info-section">
                <p><strong>訂單編號:</strong> {{ order.order_id }}</p>
                <p><strong>用戶名稱:</strong> {{ order.username }}</p>
                <p><strong>總金額:</strong> {{ order.total_amount }}</p>
                <p><strong>狀態:</strong> {{ getStatusText(order.status) }}</p>
                <p><strong>創建時間:</strong> {{ order.created_at }}</p>
              </div>
              <div class="action-section">
                <button
                  class="edit-btn"
                  @click="editOrder(order)"
                  :disabled="order.status === 'cancelled'"
                  :class="{ 'disabled-btn': order.status === 'cancelled' }"
                >
                  修改訂單
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="searchPerformed" class="no-results">
          <p>未找到符合條件的訂單</p>
        </div>
      </div>
    </div>

    <!-- 新增訂單的彈出框 -->
    <div class="modal" v-if="showAddModal" @click.self="closeAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>新增訂單</h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAddOrder" class="add-form">
            <div class="form-group">
              <label>會員名稱</label>
              <input
                type="text"
                v-model="addForm.username"
                class="form-input"
                placeholder="請輸入會員名稱"
                required
              />
            </div>

            <div class="form-group">
              <label>總金額</label>
              <input
                type="number"
                v-model="addForm.total_amount"
                class="form-input"
                placeholder="請輸入總金額"
                required
              />
            </div>

            <div class="form-group">
              <label>訂單狀態</label>
              <select v-model="addForm.status" class="form-input" required>
                <option value="pending">處理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="submit" class="save-btn">保存</button>
              <button type="button" class="cancel-btn" @click="closeAddModal">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 修改訂單的彈出框 -->
    <div class="modal" v-if="showEditModal" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>修改訂單</h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEdit" class="edit-form">
            <div class="form-group">
              <label>訂單編號</label>
              <input
                type="text"
                v-model="editForm.order_id"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-group">
              <label>訂單狀態</label>
              <select
                v-model="editForm.status"
                class="form-input"
                :class="{ error: editErrors.status }"
              >
                <option value="pending">處理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
              <span class="error-message" v-if="editErrors.status">
                {{ editErrors.status }}
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
  name: "QueryOrders",
  components: {
    Mainlayout,
  },
  data() {
    return {
      formData: {
        order_id: "",
        username: "",
      },
      errors: {
        order_id: "",
        username: "",
      },
      orderList: [],
      searchPerformed: false,
      showEditModal: false,
      showAddModal: false,
      editForm: {
        order_id: "",
        status: "",
      },
      editErrors: {
        status: "",
      },
      addForm: {
        username: "",
        total_amount: "",
        status: "pending",
      },
      statusMap: {
        pending: "處理中",
        completed: "已完成",
        cancelled: "已取消",
      },
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.clearErrors();

      if (!this.formData.order_id.trim() && !this.formData.username.trim()) {
        this.errors.order_id = "請至少輸入一個查詢條件";
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
        if (this.formData.order_id.trim()) {
          params.order_id = this.formData.order_id.trim();
        }
        if (this.formData.username.trim()) {
          params.username = this.formData.username.trim();
        }

        const response = await api.get("/getordersbynumberorname", { params });
        this.searchPerformed = true;

        if (response.status === 200 && response.data.data) {
          this.orderList = response.data.data;
          console.log("Order List:", this.orderList);
        } else {
          this.orderList = [];
        }
      } catch (error) {
        console.error("Error querying orders:", error);
        this.searchPerformed = true;
        this.orderList = [];
        if (error.response?.status === 404) {
          this.orderList = [];
        }
      }
    },

    async getAllOrders() {
      try {
        this.searchPerformed = true;
        const response = await api.get("/getallorders");

        if (response.status === 200 && response.data.data) {
          this.orderList = response.data.data;
          console.log("All orders:", this.orderList);
        } else {
          this.orderList = [];
        }
      } catch (error) {
        console.error("Error querying all orders:", error);
        this.searchPerformed = true;
        this.orderList = [];
        alert(error.response?.data?.message || "獲取訂單列表失敗");
      }
    },

    resetForm() {
      this.formData.order_id = "";
      this.formData.username = "";
      this.clearErrors();
      this.orderList = [];
      this.searchPerformed = false;
    },

    editOrder(order) {
      if (order.status === "cancelled") {
        alert("已取消的訂單無法修改狀態");
        return;
      }

      this.editForm = {
        order_id: order.order_id,
        status: order.status,
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

      if (!this.editForm.status) {
        this.editErrors.status = "請選擇訂單狀態";
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
          order_id: this.editForm.order_id,
          status: this.editForm.status,
        };

        const response = await api.put(
          `/orders/${this.editForm.order_id}/updateorderstatus`,
          submitData
        );

        if (response.status === 200) {
          await this.getAllOrders();
          alert("修改成功");
          this.closeEditModal();
        }
      } catch (error) {
        console.error("Error updating order:", error);
        alert("修改失敗: " + (error.response?.data?.message || error.message));
      }
    },

    addOrder() {
      this.showAddModal = true;
    },

    closeAddModal() {
      this.showAddModal = false;
      this.clearAddForm();
    },

    clearAddForm() {
      this.addForm = {
        username: "",
        total_amount: "",
        status: "pending",
      };
    },

    async submitAddOrder() {
      try {
        // 基本驗證
        if (
          !this.addForm.username.trim() ||
          !this.addForm.total_amount.trim() ||
          !this.addForm.status.trim()
        ) {
          alert("請填寫所有必要欄位");
          return;
        }

        // 準備提交的數據
        const submitData = {
          username: this.addForm.username.trim(),
          total_amount: Number(this.addForm.total_amount),
          status: this.addForm.status.trim(),
        };

        console.log("準備提交的數據:", submitData);

        const response = await api.post("/orders/addorder", submitData);

        if (response.data.success) {
          alert(response.data.message || "新增成功");
          this.closeAddModal();
          // 重置表單
          this.clearAddForm();
          // 重新獲取列表
          await this.getAllOrders();
        }
      } catch (error) {
        console.error("新增訂單錯誤:", error);
        alert(error.response?.data?.message || "新增失敗，請稍後再試");
      }
    },
    getStatusText(status) {
      return this.statusMap[status] || status;
    },
  },
};
</script>

<style lang="scss" scoped>
.query-order-container {
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

.order-form {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.order-list {
  margin-top: 30px;
}

.order-list h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.order-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.order-info {
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
  background-color: #ffc107; /* 黃色系 */
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
  .order-info {
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

.form-hint {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 10px;
  font-style: italic;
}

.form-group + .form-group {
  margin-top: 20px;
}

.query-all-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #28a745; /* 綠色系 */
  color: white;
}

.query-all-btn:hover {
  background-color: #218838;
}

.add-order-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #bdb324; /* 綠色背景 */
  color: white;
}

.add-order-btn:hover {
  background-color: #8d851c; /* 當滑鼠懸停時變深的綠色 */
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap; /* 在小螢幕上自動換行 */
}

.button-group button {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

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

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-button:hover {
  color: #ff0000;
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

.edit-form .form-group {
  margin-bottom: 15px;
}

.edit-form .form-input {
  width: 100%;
}

select.form-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}

select.form-input::-ms-expand {
  display: none;
}

select.form-input option {
  padding: 8px;
}

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed !important;
  background-color: #cccccc !important;
  &:hover {
    transform: none !important;
    background-color: #cccccc !important;
  }
}

.edit-btn {
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #cccccc;
    &:hover {
      transform: none;
      background-color: #cccccc;
    }
  }
}
</style>
