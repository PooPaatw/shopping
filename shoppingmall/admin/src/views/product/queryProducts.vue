<template>
  <mainlayout>
    <div class="query-model-container">
      <h1 class="title">查詢商品</h1>
      <div class="form-container">
        <form @submit.prevent="submitForm" class="model-form">
          <div class="form-group">
            <label for="formData.product_id">商品編號</label>
            <input
              type="text"
              id="product_id"
              v-model="formData.product_id"
              class="form-input"
              :class="{ error: errors.product_id }"
              placeholder="請輸入商品編號"
            />
            <span class="error-message" v-if="errors.product_id">
              {{ errors.product_id }}
            </span>
          </div>

          <div class="form-group">
            <label for="modelname">商品名稱</label>
            <input
              type="text"
              id="modelname"
              v-model="formData.modelname"
              class="form-input"
              :class="{ error: errors.modelname }"
              placeholder="請輸商品名稱"
            />
            <span class="error-message" v-if="errors.modelname">
              {{ errors.modelname }}
            </span>
          </div>

          <div class="form-hint">* 可輸入商品編號或名稱進行查詢</div>

          <div class="button-group">
            <button type="submit" class="submit-btn">查詢商品</button>
            <button type="button" class="reset-btn" @click="resetForm">
              重置
            </button>
            <button type="button" class="query-all-btn" @click="getAllProducts">
              查詢全部
            </button>
            <button type="button" class="add-model-btn" @click="addProducts">
              新增商品
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
              <div class="image-section" v-if="model.image_url">
                <img
                  :src="getImageUrl(model.image_url)"
                  :alt="model.modelname"
                  @error="handleImageError"
                />
              </div>
              <div class="info-section">
                <p><strong>商品編號:</strong> {{ model.product_id }}</p>
                <p><strong>商品名稱:</strong> {{ model.modelname }}</p>
                <p><strong>價格:</strong> {{ model.price }}</p>
                <p><strong>數量:</strong> {{ model.stock_quantity }}</p>
                <p>
                  <strong>發售日期:</strong>
                  {{ formatDate(model.releasedate) }}
                </p>
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
          <p>未找到符合條件的商品</p>
        </div>
      </div>
    </div>

    <!-- 新增商品的彈出框 -->
    <div class="modal" v-if="showAddModal" @click.self="closeAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>新增商品</h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAddModel" class="add-form">
            <div class="form-group">
              <label for="model">型號</label>
              <select
                id="model"
                v-model="addForm.model"
                class="form-input"
                :class="{ error: addFormErrors.model }"
                required
              >
                <option value="" disabled selected>請選擇型號</option>
                <option
                  v-for="model in models"
                  :key="model.model_id"
                  :value="model.model_id"
                >
                  {{ model.model_name }}
                </option>
              </select>
              <span class="error-message" v-if="addFormErrors.model">
                {{ addFormErrors.model }}
              </span>
            </div>

            <div class="form-group">
              <label for="category">手機殼款式</label>
              <select
                id="category"
                v-model="addForm.category"
                class="form-input"
                :class="{ error: addFormErrors.category }"
                required
              >
                <option value="" disabled selected>請選擇款式</option>
                <option
                  v-for="category in categories"
                  :key="category.series_id"
                  :value="category.series_id"
                >
                  {{ category.series_name }}
                </option>
              </select>
              <span class="error-message" v-if="addFormErrors.category">
                {{ addFormErrors.category }}
              </span>
            </div>

            <div class="form-group">
              <label for="price">價格</label>
              <input
                type="number"
                id="price"
                v-model="addForm.price"
                class="form-input"
                :class="{ error: addFormErrors.price }"
                required
              />
              <span class="error-message" v-if="addFormErrors.price">
                {{ addFormErrors.price }}
              </span>
            </div>

            <div class="form-group">
              <label for="quantity">數量</label>
              <input
                type="number"
                id="quantity"
                v-model="addForm.quantity"
                class="form-input"
                :class="{ error: addFormErrors.quantity }"
                required
              />
              <span class="error-message" v-if="addFormErrors.quantity">
                {{ addFormErrors.quantity }}
              </span>
            </div>

            <div class="form-group">
              <label for="description">商品描述</label>
              <textarea
                id="description"
                v-model="addForm.description"
                class="form-input"
                :class="{ error: addFormErrors.description }"
                required
              ></textarea>
              <span class="error-message" v-if="addFormErrors.description">
                {{ addFormErrors.description }}
              </span>
            </div>

            <div class="form-group">
              <label for="releasedate">上架日期</label>
              <input
                type="date"
                id="releasedate"
                v-model="addForm.releasedate"
                class="form-input"
                :class="{ error: addFormErrors.releasedate }"
                :min="minDate"
                required
              />
              <span class="error-message" v-if="addFormErrors.releasedate">
                {{ addFormErrors.releasedate }}
              </span>
            </div>

            <div class="form-group">
              <label for="image">商品圖片</label>
              <div class="image-upload-container">
                <input
                  type="file"
                  id="image"
                  @change="handleImageUpload"
                  accept="image/*"
                  class="form-input"
                  :class="{ error: addFormErrors.image }"
                />
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="預覽圖" />
                </div>
              </div>
              <span class="error-message" v-if="addFormErrors.image">
                {{ addFormErrors.image }}
              </span>
            </div>

            <div class="modal-footer">
              <button type="submit" class="save-btn">新增商品</button>
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
          <h2>修改商品資料</h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEdit" class="edit-form">
            <div class="form-group">
              <label>商品編號</label>
              <input
                type="text"
                v-model="editForm.product_id"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-group">
              <label>商品名稱</label>
              <input
                type="text"
                v-model="editForm.modelname"
                class="form-input"
                :class="{ error: editErrors.modelname }"
                disabled
              />
              <span class="error-message" v-if="editErrors.modelname">
                {{ editErrors.modelname }}
              </span>
            </div>

            <div class="form-group">
              <label>價格</label>
              <input
                type="number"
                v-model="editForm.price"
                class="form-input"
                :class="{ error: editErrors.price }"
              />
              <span class="error-message" v-if="editErrors.price">
                {{ editErrors.price }}
              </span>
            </div>

            <div class="form-group">
              <label>數量</label>
              <input
                type="number"
                v-model="editForm.stock_quantity"
                class="form-input"
                :class="{ error: editErrors.stock_quantity }"
              />
              <span class="error-message" v-if="editErrors.stock_quantity">
                {{ editErrors.stock_quantity }}
              </span>
            </div>

            <div class="form-group">
              <label>發售日期</label>
              <input
                type="date"
                v-model="editForm.releasedate"
                class="form-input"
                :class="{ error: editErrors.releasedate }"
                disabled
              />
              <span class="error-message" v-if="editErrors.releasedate">
                {{ editErrors.releasedate }}
              </span>
            </div>
            <div class="form-group">
              <label>商品狀態</label>
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
            <div class="form-group">
              <label>原商品圖片</label>
              <div class="image-upload-container">
                <div v-if="editForm.image_url" class="current-image">
                  <img :src="getImageUrl(editForm.image_url)" alt="當前圖片" />
                </div>
                <div><label>預修改的商品圖片</label></div>
                <input
                  type="file"
                  @change="handleEditImageUpload"
                  accept="image/*"
                  class="form-input"
                  :class="{ error: editErrors.image }"
                />
                <div v-if="editImagePreview" class="image-preview">
                  <img :src="editImagePreview" alt="新圖片預覽" />
                </div>
              </div>
              <span class="error-message" v-if="editErrors.image">
                {{ editErrors.image }}
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
  computed: {
    minDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },
    maxDate() {
      const today = new Date();
      today.setDate(today.getDate() + 90);
      return today.toISOString().split("T")[0];
    },
  },
  data() {
    return {
      formData: {
        modelname: "",
        product_id: "",
      },
      errors: {
        modelname: "",
        product_id: "",
      },
      modelList: [],
      searchPerformed: false,
      showEditModal: false,
      editForm: {
        product_id: "",
        modelname: "",
        price: "",
        stock_quantity: "",
        releasedate: "",
        is_active: "",
        description: "",
        image_url: "",
        newImage: null, // 新增這個欄位用於存儲要上傳的新圖片
      },
      editImagePreview: null,
      editErrors: {
        modelname: "",
        price: "",
        stock_quantity: "",
        releasedate: "",
        is_active: "",
        description: "",
      },
      showAddModal: false,
      addForm: {
        productname: "",
        model: "",
        category: "",
        price: "",
        quantity: "",
        description: "",
        releasedate: "",
        image: null,
      },
      addFormErrors: {
        productname: "",
        model: "",
        category: "",
        price: "",
        quantity: "",
        description: "",
        releasedate: "",
        image: "",
      },
      models: [],
      categories: [],
      isLoading: {
        models: false,
        categories: false,
      },
      imagePreview: null,
    };
  },
  methods: {
    async fetchModels() {
      if (this.isLoading.models) return;

      this.isLoading.models = true;
      try {
        const response = await api.get("/products/getallmodels");
        console.log("Raw models response:", response.data);

        if (response.data.success) {
          // 添加 filter 來過濾掉 is_active 為 0 的項目
          this.models = response.data.data
            .filter((model) => model.is_active === 1) // 只保留 is_active 為 1 的項目
            .map((model) => ({
              model_id: model.model_id,
              model_name:
                model.model_name || model.name || model.modelname || "未知型號",
            }));

          console.log("Processed models:", this.models);
        } else {
          console.error("Error in fetchModels:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        this.isLoading.models = false;
      }
    },

    async fetchCategories() {
      if (this.isLoading.categories) return;

      this.isLoading.categories = true;
      try {
        const response = await api.get("/products/getallseries");
        console.log("Raw categories response:", response.data);

        if (response.data.success) {
          // 添加 filter 來過濾掉 is_active 為 0 的項目
          this.categories = response.data.data
            .filter((category) => category.is_active === 1) // 只保留 is_active 為 1 的項目
            .map((category) => ({
              series_id: category.series_id,
              series_name:
                category.series_name ||
                category.name ||
                category.seriesname ||
                "未知款式",
            }));

          console.log("Processed categories:", this.categories);
        } else {
          console.error("Error in fetchCategories:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        this.isLoading.categories = false;
      }
    },

    validateForm() {
      let isValid = true;
      this.clearErrors();

      if (!this.formData.modelname.trim() && !this.formData.product_id.trim()) {
        this.errors.modelname = "請至少輸入一個查詢條件";
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
        if (this.formData.modelname.trim()) {
          params.name = this.formData.modelname.trim();
        }
        if (this.formData.product_id.trim()) {
          params.product_id = this.formData.product_id.trim();
        }

        const response = await api.get("/products/getproductname", { params });
        this.searchPerformed = true;

        if (response.status === 200 && response.data.modelDetails) {
          this.modelList = Array.isArray(response.data.modelDetails)
            ? response.data.modelDetails.map((model) => ({
                ...model,
                image_url: model.image_url || "",
              }))
            : [
                {
                  ...response.data.modelDetails,
                  image_url: response.data.modelDetails.image_url || "",
                },
              ];
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

    async getAllProducts() {
      try {
        this.searchPerformed = true;
        const response = await api.get("/products/getallproducts");

        console.log("API Response:", response.data);

        if (response.status === 200 && response.data.data) {
          this.modelList = response.data.data.map((model) => ({
            product_id: model.product_id || "",
            modelname: model.modelname || "",
            price: model.price || 0,
            stock_quantity: model.stock_quantity || 0,
            releasedate: model.releasedate || "",
            is_active: model.is_active || 0,
            description: model.description || "",
            image_url: model.image_url || "", // 添加這行
          }));

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
      this.formData.modelname = "";
      this.formData.product_id = "";
      this.clearErrors();
      this.modelList = [];
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
        });
      } catch (error) {
        console.error("Date formatting error:", error);
        return "日期格式錯誤";
      }
    },

    // 修改編輯模型的方法
    editModel(model) {
      const formattedDate = new Date(model.releasedate)
        .toISOString()
        .split("T")[0];

      const activeStatus = model.is_active === 1 ? 1 : 0;

      this.editForm = {
        product_id: model.product_id,
        modelname: model.modelname,
        price: model.price,
        stock_quantity: model.stock_quantity,
        releasedate: formattedDate,
        is_active: activeStatus,
        description: model.description,
        image_url: model.image_url || "", // 確保有 image_url
        newImage: null,
      };
      this.editImagePreview = null;
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editImagePreview = null;
      this.editForm = {
        product_id: "",
        modelname: "",
        price: "",
        stock_quantity: "",
        releasedate: "",
        is_active: "",
        description: "",
        image_url: "",
        newImage: null,
      };
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

      if (!this.editForm.price || this.editForm.price <= 0) {
        this.editErrors.price = "請輸入有效的價格";
        isValid = false;
      }

      if (!this.editForm.stock_quantity || this.editForm.stock_quantity < 0) {
        this.editErrors.stock_quantity = "請輸入有效的數量";
        isValid = false;
      }

      if (
        this.editForm.is_active === undefined ||
        this.editForm.is_active === null
      ) {
        this.editErrors.is_active = "請選擇商品狀態";
        isValid = false;
      }

      if (
        this.editForm.description !== undefined &&
        this.editForm.description !== null
      ) {
        if (this.editForm.description.trim() === "") {
          this.editErrors.description = "商品描述不能為空";
          isValid = false;
        } else if (this.editForm.description.length > 300) {
          this.editErrors.description = "商品描述不能超過 300 字";
          isValid = false;
        }
      }

      return isValid;
    },
    // 修改提交表單的方法
    async submitEdit() {
      if (!this.validateEditForm()) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append("product_id", this.editForm.product_id);
        formData.append("price", this.editForm.price);
        formData.append("stock_quantity", this.editForm.stock_quantity);
        formData.append("is_active", this.editForm.is_active);
        formData.append("description", this.editForm.description.trim());

        // 如果有新圖片，添加到 formData
        if (this.editForm.newImage) {
          formData.append("image", this.editForm.newImage);
        }

        const response = await api.put("/products/updateproducts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 200) {
          await this.getAllProducts();
          alert("修改成功");
          this.closeEditModal();
        }
      } catch (error) {
        console.error("Error updating model:", error);
        alert("修改失敗: " + (error.response?.data?.message || error.message));
      }
    },

    async addProducts() {
      // 在打開模態框之前確保數據已加載
      await Promise.all([this.fetchModels(), this.fetchCategories()]);

      if (this.models.length === 0 || this.categories.length === 0) {
        alert("無法載入必要數據，請稍後再試");
        return;
      }

      this.showAddModal = true;
    },

    closeAddModal() {
      this.showAddModal = false;
      this.addForm = {
        model: "",
        category: "",
        price: "",
        quantity: "",
        description: "",
        releasedate: "",
        image: null,
      };
      this.imagePreview = null;
      this.clearAddFormErrors();
    },

    clearAddFormErrors() {
      Object.keys(this.addFormErrors).forEach((key) => {
        this.addFormErrors[key] = "";
      });
    },

    validateAddForm() {
      let isValid = true;
      this.clearAddFormErrors();

      if (!this.addForm.model) {
        this.addFormErrors.model = "請選擇型號";
        isValid = false;
      }

      if (!this.addForm.category) {
        this.addFormErrors.category = "請選擇款式";
        isValid = false;
      }

      if (!this.addForm.price || this.addForm.price <= 0) {
        this.addFormErrors.price = "請輸入有效的價格";
        isValid = false;
      }

      if (!this.addForm.quantity || this.addForm.quantity < 0) {
        this.addFormErrors.quantity = "請輸入有效的數量";
        isValid = false;
      }

      if (!this.addForm.description?.trim()) {
        this.addFormErrors.description = "請輸入商品描述";
        isValid = false;
      }

      // 新增上架日期驗證
      if (!this.addForm.releasedate) {
        this.addFormErrors.releasedate = "請選擇上架日期";
        isValid = false;
      }

      // 圖片驗證
      if (!this.addForm.image) {
        this.addFormErrors.image = "請選擇商品圖片";
        isValid = false;
      } else {
        // 檢查檔案大小
        if (this.addForm.image.size > 5 * 1024 * 1024) {
          // 5MB
          this.addFormErrors.image = "圖片大小不能超過 5MB";
          isValid = false;
        }
        // 檢查檔案類型
        if (!this.addForm.image.type.startsWith("image/")) {
          this.addFormErrors.image = "請上傳圖片檔案";
          isValid = false;
        }
      }

      return isValid;
    },

    async submitAddModel() {
      if (!this.validateAddForm()) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append("model", this.addForm.model);
        formData.append("category", this.addForm.category);
        formData.append("price", this.addForm.price);
        formData.append("quantity", this.addForm.quantity);
        formData.append("description", this.addForm.description);
        formData.append("releasedate", this.addForm.releasedate);

        // 如果有選擇圖片，添加到 FormData
        if (this.addForm.image) {
          formData.append("image", this.addForm.image);
        }

        const response = await api.post("/products/addproducts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          alert("商品新增成功");
          this.closeAddModal();
          await this.getAllProducts();
        } else {
          throw new Error(response.data.message || "新增失敗");
        }
      } catch (error) {
        console.error("Error adding product:", error);
        alert(
          "新增商品失敗: " + (error.response?.data?.message || error.message)
        );
      }
    },
    // 處理圖片上傳
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // 檢查檔案大小
        if (file.size > 5 * 1024 * 1024) {
          this.addFormErrors.image = "圖片大小不能超過 5MB";
          return;
        }

        // 檢查檔案類型
        if (!file.type.startsWith("image/")) {
          this.addFormErrors.image = "請上傳圖片檔案";
          return;
        }

        // 預覽圖片
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);

        this.addForm.image = file;
        this.addFormErrors.image = "";
      }
    },
    // 獲取圖片完整 URL
    getImageUrl(imagePath) {
      if (!imagePath) return "";
      // 根據你的後端設定返回完整的圖片URL
      return `http://localhost:3000${imagePath}`;
    },
    // 處理編輯時的圖片上傳
    handleEditImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // 檢查檔案大小
        if (file.size > 5 * 1024 * 1024) {
          this.editErrors.image = "圖片大小不能超過 5MB";
          return;
        }

        // 檢查檔案類型
        if (!file.type.startsWith("image/")) {
          this.editErrors.image = "請上傳圖片檔案";
          return;
        }

        // 預覽新圖片
        const reader = new FileReader();
        reader.onload = (e) => {
          this.editImagePreview = e.target.result;
        };
        reader.readAsDataURL(file);

        this.editForm.newImage = file;
        this.editErrors.image = "";
      }
    },
    // 處理圖片載入失敗
    handleImageError(e) {
      console.error("圖片載入失敗");
      e.target.src = "/path/to/fallback/image.jpg"; // 可以設置一個預設圖片
    },
  },
  async mounted() {
    try {
      await Promise.all([this.fetchModels(), this.fetchCategories()]);
    } catch (error) {
      console.error("Error during initial data loading:", error);
    }
  },
  watch: {
    showAddModal(newVal) {
      if (newVal) {
        if (this.models.length === 0) {
          this.fetchModels();
        }
        if (this.categories.length === 0) {
          this.fetchCategories();
        }
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

.image-upload-container {
  margin: 10px 0;
}

.image-preview {
  margin-top: 10px;
  max-width: 200px;
  max-height: 200px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-section {
  width: 150px;
  height: 150px;
  margin-right: 20px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.image-section img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.current-image {
  margin-bottom: 10px;
  max-width: 200px;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.current-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.model-info {
  display: flex;
  align-items: flex-start;
}

/* 調整響應式布局 */
@media (max-width: 768px) {
  .model-info {
    flex-direction: column;
  }

  .image-section {
    width: 100%;
    margin-right: 0;
    margin-bottom: 15px;
  }
}
</style>
