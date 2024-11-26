<template>
  <div class="home">
    <!-- 全局 Loading -->
    <loading :show="isLoading" />

    <!-- 輪播圖部分 -->
    <div class="carousel-wrapper">
      <carousel :slides="banners" :autoplay="true" :interval="5000" />
    </div>

    <!-- 商品系列部分 -->
    <section class="categories">
      <h2 class="center-text">商品系列</h2>
      <loading :show="loading" />
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <series-list
        v-else-if="!loading"
        :items="activeSeries"
        @item-click="handleSeriesClick"
      />
    </section>

    <!-- 精選商品部分 -->
    <section class="featured-products">
      <h2 class="center-text">精選商品</h2>
      <loading :show="productsLoading" />

      <!-- 無數據提示 -->
      <div
        v-if="
          !productsLoading &&
          (!featuredProducts || featuredProducts.length === 0)
        "
        class="error-message"
      >
        暫無商品數據
      </div>

      <!-- 錯誤提示 -->
      <div v-else-if="productsError" class="error-message">
        {{ productsError }}
      </div>

      <!-- 商品列表 -->
      <div
        v-else-if="!productsLoading && featuredProducts.length > 0"
        class="products-grid"
      >
        <div
          v-for="product in featuredProducts"
          :key="product.product_id"
          class="product-card"
          @click="handleProductClick(product)"
        >
          <div class="product-image">
            <img
              :src="
                product.image_url ||
                `https://placehold.co/800x800/CCCCCC/666666.png?text=Product`
              "
              :alt="product.name"
              @error="handleImageError"
            />
          </div>
          <div class="product-info">
            <h3>{{ product.name || "未命名商品" }}</h3>
            <p>${{ formatPrice(product.price || 0) }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Loading from "@/components/Loading.vue";
import Carousel from "@/components/Carousel.vue";
import SeriesList from "@/components/SeriesList.vue";

export default {
  name: "ShoppingHomepage",

  components: {
    Loading,
    Carousel,
    SeriesList,
  },

  data() {
    return {
      isLoading: false,
      imageLoadErrors: new Set(), // 初始化 imageLoadErrors
    };
  },

  computed: {
    ...mapState("series", {
      loading: (state) => state.loading,
      error: (state) => state.error,
      totalSeries: (state) => state.totalSeries,
    }),
    ...mapGetters("series", ["getActiveSeries"]),
    activeSeries() {
      return this.getActiveSeries || [];
    },
    ...mapGetters("banner", ["getAllBanners"]),
    banners() {
      return this.getAllBanners || [];
    },
    ...mapState("products", {
      productsLoading: (state) => state.loading,
      productsError: (state) => state.error,
    }),
    ...mapGetters("products", ["getFeaturedProducts"]),
    featuredProducts() {
      return this.getFeaturedProducts || [];
    },
  },

  async created() {
    await this.fetchInitialData();
  },

  methods: {
    ...mapActions("series", ["fetchSeries"]),
    ...mapActions("products", ["fetchFeaturedProducts"]),

    formatPrice(price) {
      return Number(price).toFixed(2);
    },

    handleImageError(event) {
      const originalSrc = event.target.src;
      console.log("Image load failed:", originalSrc); // 用於調試
      this.imageLoadErrors.add(originalSrc);
      event.target.src =
        "https://placehold.co/800x800/CCCCCC/666666.png?text=Product";
    },

    handleProductClick(product) {
      if (!product || !product.product_id) {
        console.error("Invalid product:", product);
        return;
      }

      this.$router.push({
        name: "ProductDetail",
        params: {
          id: product.product_id,
        },
      });
    },

    async fetchInitialData() {
      this.isLoading = true;
      try {
        // 並行獲取數據
        await Promise.all([this.fetchSeries(), this.fetchFeaturedProducts()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    handleSeriesClick(series) {
      if (!series || !series.series_id) {
        console.error("Invalid series:", series);
        return;
      }

      // 導航到商品頁面，並帶上系列 ID 的查詢參數
      this.$router.push({
        name: "Products",
        query: {
          series_id: series.series_id,
          series_name: series.seriesname,
        },
      });
    },
  },
};
</script>

<style lang="scss">
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;

  @include respond-to("md") {
    padding: 0.875rem;
  }

  @include respond-to("sm") {
    padding: 0.75rem;
  }

  .carousel-wrapper {
    width: 100%;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: center;

    @include respond-to("sm") {
      margin-bottom: 1.5rem;
    }

    :deep(.carousel) {
      border-radius: 8px;
      overflow: hidden;

      @include respond-to("sm") {
        border-radius: 4px;
      }
    }
  }

  section {
    margin-bottom: 3rem;
    padding: 0 1rem;

    @include respond-to("sm") {
      margin-bottom: 2rem;
      padding: 0 0.5rem;
    }

    h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: #333;
      text-align: center;

      @include respond-to("md") {
        font-size: 2rem;
        margin-bottom: 2rem;
      }

      @include respond-to("sm") {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;

    @include respond-to("sm") {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    @include respond-to("lg") {
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
  }

  .product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .product-image {
      width: 100%;
      aspect-ratio: 1/1;
      overflow: hidden;
      background: #f0f0f0;

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

      @include respond-to("sm") {
        padding: 0.75rem;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @include respond-to("sm") {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
      }

      p {
        margin: 0;
        color: #666;
        font-weight: bold;
        font-size: 1rem;

        @include respond-to("sm") {
          font-size: 0.9rem;
        }
      }
    }
  }

  .error-message {
    text-align: center;
    padding: 1rem;
    color: #dc3545;
    margin: 1rem 0;
    background-color: rgba(220, 53, 69, 0.1);
    border-radius: 4px;

    @include respond-to("sm") {
      padding: 0.75rem;
      margin: 0.75rem 0;
      font-size: 0.9rem;
    }
  }
}
</style>
