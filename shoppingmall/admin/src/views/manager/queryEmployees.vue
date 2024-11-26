<template>
  <mainlayout>
    <div class="query-employee-container">
      <h1 class="title">查詢員工</h1>
      <div class="form-container">
        <form @submit.prevent="submitForm" class="employee-form">
          <div class="form-group">
            <label for="employee_id">員工編號</label>
            <input
              type="text"
              id="employee_id"
              v-model="formData.employee_id"
              class="form-input"
              :class="{ error: errors.employee_id }"
              placeholder="請輸入員工編號"
            />
            <span class="error-message" v-if="errors.employee_id">
              {{ errors.employee_id }}
            </span>
          </div>

          <div class="form-group">
            <label for="staffname">名字</label>
            <input
              type="text"
              id="staffname"
              v-model="formData.staffname"
              class="form-input"
              :class="{ error: errors.staffname }"
              placeholder="請輸入員工名字"
            />
            <span class="error-message" v-if="errors.staffname">
              {{ errors.staffname }}
            </span>
          </div>

          <div class="form-hint">* 可輸入員工編號或名字進行查詢</div>

          <div class="button-group">
            <button type="submit" class="submit-btn">查詢員工</button>
            <button type="button" class="reset-btn" @click="resetForm">
              重置
            </button>
            <button
              type="button"
              class="query-all-btn"
              @click="queryAllEmployees"
            >
              查詢全部
            </button>
          </div>
        </form>

        <div
          v-if="employeeList && employeeList.length > 0"
          class="employee-list"
        >
          <h2>查詢結果 (共 {{ employeeList.length }} 筆)</h2>
          <div
            v-for="(employee, index) in employeeList"
            :key="index"
            class="employee-card"
          >
            <div class="employee-info">
              <div class="info-section">
                <p><strong>員工編號:</strong> {{ employee.employee_id }}</p>
                <p><strong>員工名字:</strong> {{ employee.staffname }}</p>
                <p><strong>手機號碼:</strong> {{ employee.mobilenum }}</p>
                <p><strong>職位:</strong> {{ employee.role }}</p>
                <p>
                  <strong>入職日期:</strong>
                  {{ formatDate(employee.hire_date) }}
                </p>
                <p>
                  <strong>狀態:</strong>
                  {{ employee.is_active === 1 ? "在職" : "離職" }}
                </p>
              </div>
              <div class="action-section">
                <button class="edit-btn" @click="editEmployee(employee)">
                  修改資料
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="searchPerformed" class="no-results">
          <p>未找到符合條件的員工</p>
        </div>
      </div>
    </div>

    <!-- 修改資料的彈出框 -->
    <div class="modal" v-if="showEditModal" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>修改員工資料</h2>
          <button class="close-btn" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEdit" class="edit-form">
            <div class="form-group">
              <label>員工編號</label>
              <input
                type="text"
                v-model="editForm.employee_id"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-group">
              <label>名字</label>
              <input
                type="text"
                v-model="editForm.staffname"
                class="form-input"
                :class="{ error: editErrors.staffname }"
              />
              <span class="error-message" v-if="editErrors.staffname">
                {{ editErrors.staffname }}
              </span>
            </div>

            <div class="form-group">
              <label>手機號碼</label>
              <input
                type="text"
                v-model="editForm.mobilenum"
                class="form-input"
                :class="{ error: editErrors.mobilenum }"
              />
              <span class="error-message" v-if="editErrors.mobilenum">
                {{ editErrors.mobilenum }}
              </span>
            </div>

            <div class="form-group">
              <label>職位</label>
              <input
                type="text"
                v-model="editForm.role"
                class="form-input"
                :class="{ error: editErrors.role }"
              />
              <span class="error-message" v-if="editErrors.role">
                {{ editErrors.role }}
              </span>
            </div>

            <div class="form-group">
              <label>入職日期</label>
              <input
                type="date"
                v-model="editForm.hire_date"
                class="form-input"
                :class="{ error: editErrors.hire_date }"
              />
              <span class="error-message" v-if="editErrors.hire_date">
                {{ editErrors.hire_date }}
              </span>
            </div>
            <div class="form-group">
              <label>員工狀態</label>
              <select
                v-model.number="editForm.is_active"
                class="form-input"
                :class="{ error: editErrors.is_active }"
              >
                <option :value="1">在職</option>
                <option :value="0">離職</option>
              </select>
              <span class="error-message" v-if="editErrors.is_active">
                {{ editErrors.is_active }}
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
  name: "QueryEmployees",
  components: {
    Mainlayout,
  },
  computed: {
    formatStatus() {
      return (status) => {
        if (
          status === 1 ||
          status === true ||
          status === "1" ||
          status === "true"
        ) {
          return "在職";
        }
        return "離職";
      };
    },
  },
  data() {
    return {
      formData: {
        staffname: "",
        employee_id: "",
      },
      errors: {
        staffname: "",
        employee_id: "",
      },
      employeeList: [],
      searchPerformed: false,
      showEditModal: false,
      editForm: {
        employee_id: "",
        staffname: "",
        mobilenum: "",
        role: "",
        hire_date: "",
        is_active: "",
      },
      editErrors: {
        staffname: "",
        mobilenum: "",
        role: "",
        hire_date: "",
        is_active: "",
      },
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.clearErrors();

      if (
        !this.formData.staffname.trim() &&
        !this.formData.employee_id.trim()
      ) {
        this.errors.staffname = "請至少輸入一個查詢條件";
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
        if (this.formData.staffname.trim()) {
          params.staffname = this.formData.staffname.trim();
        }
        if (this.formData.employee_id.trim()) {
          params.employee_id = this.formData.employee_id.trim();
        }

        const response = await api.get(`/employees/getemployee`, { params });
        this.searchPerformed = true;

        if (response.status === 200 && response.data.memberDetails) {
          this.employeeList = Array.isArray(response.data.memberDetails)
            ? response.data.memberDetails
            : [response.data.memberDetails];
        } else {
          this.employeeList = [];
        }
      } catch (error) {
        console.error("Error querying employee:", error);
        this.searchPerformed = true;
        this.employeeList = [];
        if (error.response?.status === 404) {
          this.employeeList = [];
        }
      }
    },

    async queryAllEmployees() {
      try {
        this.searchPerformed = true;
        const response = await api.get("/employees/getallemployees");

        if (response.status === 200 && response.data.data) {
          this.employeeList = response.data.data;
        } else {
          this.employeeList = [];
        }
      } catch (error) {
        console.error("Error querying all employees:", error);
        this.searchPerformed = true;
        this.employeeList = [];
      }
    },

    resetForm() {
      this.formData.staffname = "";
      this.formData.employee_id = "";
      this.clearErrors();
      this.employeeList = [];
      this.searchPerformed = false;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },

    // 修改相關方法
    editEmployee(employee) {
      const formattedDate = new Date(employee.hire_date)
        .toISOString()
        .split("T")[0];

      const activeStatus = employee.is_active === 1 ? 1 : 0;

      this.editForm = {
        employee_id: employee.employee_id,
        staffname: employee.staffname,
        mobilenum: employee.mobilenum,
        role: employee.role,
        hire_date: formattedDate,
        status: employee.status,
        is_active: activeStatus,
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

      if (!this.editForm.staffname.trim()) {
        this.editErrors.staffname = "請輸入員工名字";
        isValid = false;
      }

      if (!this.editForm.mobilenum.trim()) {
        this.editErrors.mobilenum = "請輸入手機號碼";
        isValid = false;
      } else if (!/^[0-9]{10}$/.test(this.editForm.mobilenum.trim())) {
        this.editErrors.mobilenum = "請輸入有效的10位手機號碼";
        isValid = false;
      }

      if (!this.editForm.role.trim()) {
        this.editErrors.role = "請輸入職位";
        isValid = false;
      }

      if (!this.editForm.hire_date) {
        this.editErrors.hire_date = "請選擇入職日期";
        isValid = false;
      }

      // 修改狀態驗證
      if (
        this.editForm.is_active === undefined ||
        this.editForm.is_active === null
      ) {
        this.editErrors.is_active = "請選擇員工狀態";
        isValid = false;
      }

      return isValid;
    },

    async submitEdit() {
      if (!this.validateEditForm()) {
        return;
      }

      try {
        // 整理提交的數據
        const submitData = {
          employee_id: this.editForm.employee_id,
          staffname: this.editForm.staffname.trim(),
          mobilenum: this.editForm.mobilenum.trim(),
          role: this.editForm.role.trim(),
          hire_date: this.editForm.hire_date,
          is_active: Number(this.editForm.is_active, 10), // 確保轉換為數字
        };

        // 添加日誌來檢查發送的數據
        console.log("Submitting data:", submitData);

        const response = await api.put("/employees/updatestaff", submitData);

        if (response.status === 200) {
          if (this.formData.staffname || this.formData.employee_id) {
            await this.submitForm();
          } else {
            await this.queryAllEmployees();
          }
          alert("修改成功");
          this.closeEditModal();
        }
      } catch (error) {
        console.error("Error updating employee:", error);
        // 添加更詳細的錯誤信息
        const errorMessage =
          error.response?.data?.message || error.message || "未知錯誤";
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage,
          requestData: submitData, // 添加請求數據到錯誤日誌
        });
        alert("修改失敗: " + errorMessage);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.query-employee-container {
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
  margin-bottom: 30px;
}

/* 新增的列表樣式 */
.employee-list {
  margin-top: 30px;
}

.employee-list h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.employee-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.employee-info {
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
  .employee-info {
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

/* 保留原有的其他樣式... */
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

/* 調整表單間距 */
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

/* 調整按鈕組的樣式以適應三個按鈕 */
.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap; /* 在小螢幕上自動換行 */
}

/* 讓按鈕在小螢幕上能夠自適應 */
.button-group button {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

/* 新增修改框相關樣式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
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

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
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
</style>
