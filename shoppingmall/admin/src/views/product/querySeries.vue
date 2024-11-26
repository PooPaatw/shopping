<template>
  <mainlayout>
    <div class="query-model-container">
      <h1 class="title">查詢款式</h1>
      <div class="form-container">
        <form @submit.prevent="submitForm" class="model-form">
          <div class="form-group">
            <label for="formData.series_id">款式編號</label>
            <input
              type="text"
              id="series_id"
              v-model="formData.series_id"
              class="form-input"
              :class="{ error: errors.series_id }"
              placeholder="請輸入款式編號"
            />
            <span class="error-message" v-if="errors.series_id">
              {{ errors.series_id }}
            </span>
          </div>

          <div class="form-group">
            <label for="seriesname">款式名稱</label>
            <input
              type="text"
              id="seriesname"
              v-model="formData.seriesname"
              class="form-input"
              :class="{ error: errors.seriesname }"
              placeholder="請輸款式名稱"
            />
            <span class="error-message" v-if="errors.seriesname">
              {{ errors.seriesname }}
            </span>
          </div>

          <div class="form-hint">* 可輸入款式編號或名稱進行查詢</div>

          <div class="button-group">
            <button type="submit" class="submit-btn">查詢款式</button>
            <button type="button" class="reset-btn" @click="resetForm">
              重置
            </button>
            <button type="button" class="query-all-btn" @click="getAllSeries">
              查詢全部
            </button>
            <button type="button" class="add-model-btn" @click="addSeries">
              新增款式
            </button>
          </div>
        </form>

        <div v-if="modelList && modelList.length > 0" class="model-list">
          <h2>查詢結果 (共 {{ modelList.length }} 筆)</h2>
          <div
            v-for="(model, index) in modelList"
            :key="index"
            class="model-card"
          >
            <div class="model-info">
              <div class="info-section">
                <p><strong>款式編號:</strong> {{ model.series_id }}</p>
                <p><strong>款式名稱:</strong> {{ model.seriesname }}</p>
                <p>
                  <strong>狀態:</strong>
                  {{ model.is_active === 1 ? "上架" : "下架" }}
                </p>
                <p><strong>描述:</strong> {{ model.description }}</p>
              </div>
              <div class="action-section">
                <button class="edit-btn" @click="editModel(model)">
                  修改資料
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="searchPerformed" class="no-results">
          <p>未找到符合條件的款式</p>
        </div>
      </div>
    </div>

    <!-- 新增款式的彈出框 -->
    <div class="modal" v-if="showAddModal" @click.self="closeAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>新增款式</h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAddModel" class="add-form">
            <div class="form-group">
              <label>手機殼款式名稱</label>
              <input
                type="text"
                v-model="addForm.seriesname"
                class="form-input"
                placeholder="輸入格式為:ＸＸＸ系列"
                required
              />
            </div>

            <div class="form-group">
              <label>描述</label>
              <textarea
                v-model="addForm.description"
                class="form-input"
                required
                placeholder="輸入格式為:與ＸＸＸ聯名的限定款式，或是自己的特色"
              ></textarea>
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

    <!-- 修改資料的彈出框 -->
    <div class="modal" v-if="showEditModal" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>修改款式資料</h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEdit" class="edit-form">
            <div class="form-group">
              <label>款式編號</label>
              <input
                type="text"
                v-model="editForm.series_id"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-group">
              <label>款式名稱</label>
              <input
                type="text"
                v-model="editForm.seriesname"
                class="form-input"
                :class="{ error: editErrors.seriesname }"
              />
              <span class="error-message" v-if="editErrors.seriesname">
                {{ editErrors.seriesname }}
              </span>
            </div>

            <div class="form-group">
              <label>款式狀態</label>
              <select
                v-model.number="editForm.is_active"
                class="form-input"
                :class="{ error: editErrors.is_active }"
              >
                <option :value="1">上架</option>
                <option :value="0">下架</option>
              </select>
              <span class="error-message" v-if="editErrors.is_active">
                {{ editErrors.is_active }}
              </span>
            </div>
            <div class="form-group">
              <label>商品描述</label>
              <textarea
                v-model="editForm.description"
                class="form-input"
                :class="{ error: editErrors.description }"
                rows="3"
              ></textarea>
              <span class="error-message" v-if="editErrors.description">
                {{ editErrors.description }}
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
  name: "QueryModel",
  components: {
    Mainlayout,
  },
  data() {
    return {
      formData: {
        seriesname: "",
        series_id: "",
      },
      errors: {
        seriesname: "",
        series_id: "",
      },
      modelList: [],
      searchPerformed: false,
      showEditModal: false,
      editForm: {
        series_id: "",
        seriesname: "",
        is_active: "",
        description: "",
      },
      editErrors: {
        seriesname: "",
        is_active: "",
        description: "",
      },
      showAddModal: false,
      addForm: {
        seriesname: "",
        description: "",
      },
      brands: [], // 品牌列表
      brandMap: {}, // 用於存儲品牌名稱和ID的映射
    };
  },
  mounted() {
    this.fetchBrands(); // 在組件掛載時獲取品牌資料
  },
  methods: {
    async fetchBrands() {
      try {
        const response = await api.get("/products/getbrands");
        if (response.status === 200 && response.data.success) {
          this.brands = response.data.data;
          // 創建品牌名稱到ID的映射
          this.brands.forEach((brand) => {
            this.brandMap[brand.seriesname] = brand.brand_id;
          });
        } else {
          console.error("Error fetching brands:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    },
    validateForm() {
      let isValid = true;
      this.clearErrors();

      if (!this.formData.seriesname.trim() && !this.formData.series_id.trim()) {
        this.errors.seriesname = "請至少輸入一個查詢條件";
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
        if (this.formData.seriesname.trim()) {
          params.name = this.formData.seriesname.trim();
        }
        if (this.formData.series_id.trim()) {
          params.series_id = this.formData.series_id.trim();
        }

        const response = await api.get("/products/getseriesname", { params });
        this.searchPerformed = true;

        if (response.status === 200 && response.data.modelDetails) {
          this.modelList = Array.isArray(response.data.modelDetails)
            ? response.data.modelDetails
            : [response.data.modelDetails];
          console.log("Model List:", this.modelList);
        } else {
          this.modelList = [];
        }
      } catch (error) {
        console.error("Error querying series:", error);
        this.searchPerformed = true;
        this.modelList = [];
        if (error.response?.status === 404) {
          this.modelList = [];
        }
      }
    },

    async getAllSeries() {
      try {
        this.searchPerformed = true;
        const response = await api.get("/products/getallseries");

        // 添加數據檢查和日誌
        console.log("API Response:", response.data);

        if (response.status === 200 && response.data.data) {
          // 確保每個模型對象都有正確的屬性名稱
          this.modelList = response.data.data.map((model) => ({
            series_id: model.series_id || "",
            seriesname: model.seriesname || "",
            is_active: model.is_active || 0,
            description: model.description || "",
          }));

          // 添加數據映射後的日誌
          console.log("Processed Model List:", this.modelList);
        } else {
          this.modelList = [];
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Error querying all models:", error);
        this.searchPerformed = true;
        this.modelList = [];
      }
    },

    resetForm() {
      this.formData.seriesname = "";
      this.formData.series_id = "";
      this.clearErrors();
      this.modelList = [];
      this.searchPerformed = false;
    },

    editModel(model) {
      const activeStatus = model.is_active === 1 ? 1 : 0;

      this.editForm = {
        series_id: model.series_id,
        seriesname: model.seriesname,
        is_active: activeStatus,
        description: model.description,
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

      if (!this.editForm.seriesname?.trim()) {
        this.editErrors.seriesname = "款式名稱不能為空";
        isValid = false;
      }

      if (
        this.editForm.is_active === undefined ||
        this.editForm.is_active === null
      ) {
        this.editErrors.is_active = "請選擇款式狀態";
        isValid = false;
      }

      if (
        this.editForm.description !== undefined &&
        this.editForm.description !== null
      ) {
        // 如果描述存在但為空字串或只有空白字符
        if (this.editForm.description.trim() === "") {
          this.editErrors.description = "商品描述不能為空";
          isValid = false;
        }
        // 如果需要限制描述的長度
        else if (this.editForm.description.length > 300) {
          // 假設最大長度為 300
          this.editErrors.description = "商品描述不能超過 300 字";
          isValid = false;
        }
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
          series_id: this.editForm.series_id,
          name: this.editForm.seriesname.trim(),
          is_active: Number(this.editForm.is_active, 10), // 確保轉換為數字
          description: this.editForm.description.trim(),
        };

        // 添加日誌來檢查發送的數據
        console.log("Submitting data:", submitData);

        const response = await api.put("/products/updateseries", submitData);

        if (response.status === 200) {
          await this.getAllSeries(); // 重新獲取所有數據
          alert("修改成功");
          this.closeEditModal();
        }
      } catch (error) {
        console.error("Error updating model:", error);
        alert("修改失敗: " + (error.response?.data?.message || error.message));
      }
    },

    addSeries() {
      this.showAddModal = true;
    },

    closeAddModal() {
      this.showAddModal = false;
      this.clearAddForm();
    },

    clearAddForm() {
      this.addForm = {
        brand: "",
        seriesname: "",
        description: "",
      };
    },

    async submitAddModel() {
      try {
        // 基本驗證
        if (
          !this.addForm.seriesname.trim() ||
          !this.addForm.description.trim()
        ) {
          alert("請填寫所有必要欄位");
          return;
        }

        // 準備提交的數據 - 注意這裡改用 name 而不是 seriesname
        const submitData = {
          name: this.addForm.seriesname.trim(),
          description: this.addForm.description.trim(),
        };

        console.log("準備提交的數據:", submitData);

        const response = await api.post("/products/addseries", submitData);

        if (response.data.success) {
          alert(response.data.message || "新增成功");
          this.closeAddModal();
          // 重置表單
          this.addForm = {
            seriesname: "",
            description: "",
          };
          // 重新獲取列表
          await this.getAllSeries();
        }
      } catch (error) {
        console.error("新增款式錯誤:", error);
        alert(error.response?.data?.message || "新增失敗，請稍後再試");
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

/* 新增的列表樣式 */
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

.add-model-btn {
  padding: 12px 24px; /* 調整內邊距 */
  border: none; /* 無邊框 */
  border-radius: 4px; /* 圓角 */
  font-size: 16px; /* 字體大小 */
  cursor: pointer; /* 游標變成手指 */
  transition: background-color 0.3s; /* 背景色過渡效果 */
  background-color: #bdb324; /* 綠色背景 */
  color: white; /* 白色文字 */
}

.add-model-btn:hover {
  background-color: #8d851c; /* 當滑鼠懸停時變深的綠色 */
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

.add-form .form-group {
  margin-bottom: 15px;
}

.add-form .form-input {
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

textarea.form-input {
  min-height: 80px;
  resize: vertical;
  line-height: 1.5;
}

.info-section p.description {
  white-space: pre-line; /* 保留換行符 */
  margin: 12px 0;
  line-height: 1.6;
}
</style>
