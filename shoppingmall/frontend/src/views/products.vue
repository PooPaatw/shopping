<template>
  <div class="products-page">
    <div class="products-container">
      <!-- 左側分類選單 -->
      <aside class="categories-sidebar">
        <h2 class="category-title">商品分類</h2>

        <loading v-if="loading" />

        <template v-else>
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <ul v-else class="category-list">
            <!-- 全部商品選項 -->
            <li
              class="category-item"
              :class="{ active: !selectedSeriesId }"
              @click="handleSeriesSelect(null)"
            >
              <span class="category-name">全部商品</span>
              <span class="category-count">{{ totalProducts }}</span>
            </li>

            <!-- 各系列選項 -->
            <li
              v-for="series in activeSeries"
              :key="series.series_id"
              class="category-item"
              :class="{ active: selectedSeriesId === series.series_id }"
              @click="handleSeriesSelect(series)"
            >
              <span class="category-name">{{ series.seriesname }}</span>
              <span class="category-count">{{
                seriesProductCount(series.series_id)
              }}</span>
            </li>
          </ul>
        </template>
      </aside>

      <!-- 右側商品展示區 -->
      <main class="products-content">
        <div class="content-header">
          <h2 class="product-section-title">
            {{ selectedSeriesName || "全部商品" }}
          </h2>

          <div class="filter-tools">
            <select
              v-model="sortOption"
              @change="handleSort"
              class="sort-select"
            >
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 商品列表區域 -->
        <loading v-if="productsLoading" />

        <div v-else-if="productsError" class="error-message">
          {{ productsError }}
        </div>

        <div
          v-else-if="!productsLoading && !products.length"
          class="no-products"
        >
          此分類暫無商品
        </div>

        <div v-else class="products-grid">
          <div
            v-for="product in displayProducts"
            :key="product.product_id"
            class="product-card"
            @click="handleProductClick(product)"
          >
            <div class="product-image">
              <img
                :src="product.image_url || defaultImageUrl"
                :alt="product.modelname"
                @error="handleImageError"
              />
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ product.modelname }}</h3>

              <div v-if="product.series_name" class="product-series">
                {{ product.series_name }}
              </div>

              <div class="product-price">
                <div v-if="product.original_price" class="original-price">
                  原價 {{ formatPrice(product.original_price) }} 元
                </div>
                <div class="current-price">
                  現在只要 {{ formatPrice(product.price) }} 元
                </div>
              </div>

              <div
                class="product-stock"
                :class="{ 'low-stock': product.stock_quantity < 5 }"
              >
                {{ getStockStatus(product.stock_quantity) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 分頁控制 -->
        <div v-if="pagination.totalPages > 1" class="pagination">
          <button
            :disabled="pagination.currentPage === 1"
            @click="handlePageChange(pagination.currentPage - 1)"
          >
            上一頁
          </button>

          <span>
            第 {{ pagination.currentPage }} 頁，共
            {{ pagination.totalPages }} 頁
          </span>

          <button
            :disabled="pagination.currentPage === pagination.totalPages"
            @click="handlePageChange(pagination.currentPage + 1)"
          >
            下一頁
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  name: "ProductsPage",

  components: {
    Loading,
  },

  data() {
    return {
      selectedSeriesId: null,
      selectedSeriesName: "",
      imageLoadErrors: new Set(),
      defaultImageUrl:
        "https://placehold.co/800x800/CCCCCC/666666.png?text=Product",
      sortOption: "date-desc",
      sortOptions: [
        { value: "date-desc", label: "最新上架" },
        { value: "price-asc", label: "價格由低到高" },
        { value: "price-desc", label: "價格由高到低" },
        { value: "name-asc", label: "名稱 A 到 Z" },
        { value: "name-desc", label: "名稱 Z 到 A" },
      ],
    };
  },

  computed: {
    ...mapState("series", {
      loading: (state) => state.loading,
      error: (state) => state.error,
    }),

    ...mapState("seriesCount", {
      seriesCounts: (state) => state.counts,
      seriesCountLoading: (state) => state.loading,
    }),

    ...mapGetters("series", ["getActiveSeries"]),
    ...mapGetters("seriesCount", ["getCount"]),

    activeSeries() {
      return this.getActiveSeries;
    },

    // 修改全部商品數量的計算
    totalActiveProducts() {
      return this.allProducts.filter((p) => p.is_active === 1).length;
    },

    ...mapState("products", {
      productsLoading: (state) => state.loading,
      productsError: (state) => state.error,
      products: (state) => state.products || [],
      allProducts: (state) => state.allProducts || [],
      pagination: (state) => state.pagination,
    }),

    displayProducts() {
      if (this.selectedSeriesId) {
        return this.products.filter(
          (product) =>
            Number(product.series_id) === Number(this.selectedSeriesId)
        );
      }
      return this.products;
    },

    // 全部商品數量
    totalProducts() {
      return (this.allProducts || []).filter((p) => p.is_active === 1).length;
    },

    // 各分類商品數量的緩存
    seriesProductsMap() {
      const productsMap = new Map();

      this.allProducts.forEach((product) => {
        if (product.is_active === 1) {
          const seriesId = Number(product.series_id);
          const currentCount = productsMap.get(seriesId) || 0;
          productsMap.set(seriesId, currentCount + 1);
        }
      });

      return productsMap;
    },
    // 各分類活躍商品的映射
    seriesActiveProductsMap() {
      const seriesMap = new Map();

      this.allProducts.forEach((product) => {
        if (product.is_active === 1) {
          const seriesId = Number(product.series_id);
          if (!seriesMap.has(seriesId)) {
            seriesMap.set(seriesId, []);
          }
          seriesMap.get(seriesId).push(product);
        }
      });

      return seriesMap;
    },

    currentSeriesCount() {
      if (!this.selectedSeriesId) {
        return this.totalActiveProducts;
      }
      const seriesProducts =
        this.seriesActiveProductsMap.get(Number(this.selectedSeriesId)) || [];
      return seriesProducts.length;
    },

    // 用於分類計數的計算屬性
    seriesProductCount() {
      return (seriesId) => {
        // 使用 seriesCount store 中的數量
        return this.getCount(seriesId);
      };
    },
  },

  watch: {
    // 保持原有的排序監聽
    "$route.query.sort"(newSort) {
      if (
        newSort &&
        this.sortOptions.some((option) => option.value === newSort)
      ) {
        this.sortOption = newSort;
      }
    },

    // 添加系列參數監聽
    "$route.query.series_id": {
      immediate: true, // 組件創建時就執行
      handler(newSeriesId) {
        if (newSeriesId) {
          const series = this.activeSeries.find(
            (s) => String(s.series_id) === String(newSeriesId)
          );
          if (series) {
            this.handleSeriesSelect({
              series_id: Number(newSeriesId),
              seriesname: this.$route.query.series_name,
            });
          }
        }
      },
    },
  },

  methods: {
    ...mapActions("series", ["fetchSeries"]),
    ...mapActions("products", ["fetchProducts"]),
    ...mapActions("seriesCount", ["fetchSeriesCount"]),

    formatPrice(price) {
      return Number(price).toLocaleString();
    },

    handleImageError(event) {
      const originalSrc = event.target.src;
      if (!this.imageLoadErrors.has(originalSrc)) {
        this.imageLoadErrors.add(originalSrc);
        event.target.src = this.defaultImageUrl;
      }
    },

    handleProductClick(product) {
      if (!product?.product_id) return;
      this.$router.push({
        name: "ProductDetail",
        params: { id: product.product_id },
      });
    },

    // 修改分類選擇處理方法
    async handleSeriesSelect(series) {
      // 如果當前已經是全部商品且再次點擊全部商品，則不需要重新加載
      if (!series && !this.selectedSeriesId) {
        return;
      }

      this.selectedSeriesId = series?.series_id || null;
      this.selectedSeriesName = series?.seriesname || "";

      // 更新分頁信息
      const seriesCount = series
        ? this.getCount(series.series_id)
        : this.totalProducts;
      this.$store.commit("products/SET_PAGINATION", {
        currentPage: 1,
        totalPages: Math.ceil(seriesCount / this.pagination.perPage),
      });

      // 保持當前的排序方式
      await this.fetchSeriesProducts();
    },

    handleSort() {
      if (this.pagination.currentPage !== 1) {
        this.$store.commit("products/SET_PAGINATION", { currentPage: 1 });
      }
      const query = { ...this.$route.query, sort: this.sortOption };
      this.$router.replace({ query }).catch(() => {});
      this.fetchSeriesProducts();
    },

    handlePageChange(page) {
      this.$store.commit("products/SET_PAGINATION", { currentPage: page });
      this.fetchSeriesProducts();
    },

    getStockStatus(quantity) {
      if (quantity <= 0) return "售完";
      if (quantity < 5) return `僅剩 ${quantity} 件`;
      return "現貨";
    },

    applySorting(products) {
      const sortedProducts = [...products];

      switch (this.sortOption) {
        case "price-asc":
          return sortedProducts.sort((a, b) => a.price - b.price);
        case "price-desc":
          return sortedProducts.sort((a, b) => b.price - a.price);
        case "name-asc":
          return sortedProducts.sort((a, b) =>
            a.modelname.localeCompare(b.modelname, "zh-TW")
          );
        case "name-desc":
          return sortedProducts.sort((a, b) =>
            b.modelname.localeCompare(a.modelname, "zh-TW")
          );
        default:
          return sortedProducts.sort(
            (a, b) => new Date(b.releasedate) - new Date(a.releasedate)
          );
      }
    },

    initializeSort() {
      const urlSort = this.$route.query.sort;
      if (
        urlSort &&
        this.sortOptions.some((option) => option.value === urlSort)
      ) {
        this.sortOption = urlSort;
      }
    },

    async fetchInitialData() {
      try {
        await Promise.all([
          this.fetchSeries(),
          this.fetchProducts(),
          this.fetchSeriesCount(), // 添加獲取分類數量的請求
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    },

    // 修改獲取分類商品的方法
    async fetchSeriesProducts() {
      try {
        await this.fetchProducts({
          seriesId: this.selectedSeriesId,
          page: this.pagination.currentPage,
          sort: this.sortOption,
          perPage: this.pagination.perPage,
        });
      } catch (error) {
        console.error("Error fetching series products:", error);
      }
    },
  },

  async created() {
    this.initializeSort();
    await this.fetchInitialData();
  },
};
</script>
<!-- scss -->
<style lang="scss" scoped>
.products-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  .products-container {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
  }

  // 左側分類選單
  .categories-sidebar {
    .category-title {
      font-size: 1.5rem;
      margin: 0 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #333;
    }

    .category-list {
      list-style: none;
      padding: 0;
      margin: 0;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        transition: all 0.2s ease;

        &:hover {
          background-color: #f5f5f5;
        }

        &.active {
          background-color: #626975;
          color: white;

          .category-count {
            background: white;
            color: #626975;
          }
        }

        .category-count {
          background: #626975;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.85rem;
          min-width: 2rem;
          text-align: center;
        }
      }
    }
  }

  // 右側商品展示區
  .products-content {
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      .product-section-title {
        font-size: 1.5rem;
        margin: 0;
      }

      .filter-tools {
        select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .product-image {
        aspect-ratio: 1;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;

          &:hover {
            transform: scale(1.05);
          }
        }
      }

      .product-info {
        padding: 1rem;

        .product-name {
          font-size: 1.1rem;
          margin: 0 0 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-series {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          background: #626975;
          color: white;
          border-radius: 4px;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }

        .product-price {
          margin: 0.5rem 0;

          .original-price {
            color: #999;
            text-decoration: line-through;
            font-size: 0.9rem;
          }

          .current-price {
            color: #e53e3e;
            font-size: 1.1rem;
            font-weight: bold;
          }
        }

        .product-stock {
          font-size: 0.9rem;
          color: #2f855a;

          &.low-stock {
            color: #e53e3e;
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    gap: 1rem;

    button {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #f5f5f5;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    span {
      color: #666;
    }
  }
}

// RWD
@media (max-width: 768px) {
  .products-page {
    padding: 1rem;

    .products-container {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .content-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .products-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
  }
}

@media (max-width: 480px) {
  .products-page {
    .products-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
