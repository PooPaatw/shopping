<template>
  <div class="product-detail-page">
    <loading v-if="loading" />
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else class="product-detail-container">
      <div class="product-image">
        <img
          :src="product.image_url || defaultImageUrl"
          :alt="product.modelname"
          @error="handleImageError"
          class="product-img"
        />
      </div>
      <div class="product-info">
        <h1 class="product-name">{{ product.modelname }}</h1>
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
          :class="{ 'low-stock': product.stock_quantity < 10 }"
        >
          {{ getStockStatus(product.stock_quantity) }}
        </div>

        <!-- 購買數量選擇器 -->
        <div class="quantity-selector">
          <label for="quantity">購買數量:</label>
          <div class="quantity-controls">
            <button
              @click="decreaseQuantity"
              :disabled="quantity <= 1 || product.stock_quantity <= 0"
              class="quantity-btn"
            >
              -
            </button>
            <input
              id="quantity"
              type="number"
              v-model.number="quantity"
              :max="product.stock_quantity"
              :min="1"
              :disabled="product.stock_quantity <= 0"
              class="quantity-input"
            />
            <button
              @click="increaseQuantity"
              :disabled="
                quantity >= product.stock_quantity ||
                product.stock_quantity <= 0
              "
              class="quantity-btn"
            >
              +
            </button>
          </div>
        </div>

        <div v-if="product.description" class="product-description">
          {{ product.description }}
        </div>

        <!-- 購買按鈕 -->
        <div class="action-buttons">
          <button
            @click="addToCart"
            :disabled="product.stock_quantity <= 0"
            class="add-to-cart-btn"
          >
            加入購物車
          </button>
          <button
            @click="buyNow"
            :disabled="product.stock_quantity <= 0"
            class="buy-now-btn"
          >
            立即購買
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  name: "ProductDetailPage",

  components: {
    Loading,
  },

  data() {
    return {
      imageLoadErrors: new Set(),
      defaultImageUrl:
        "https://placehold.co/800x800/CCCCCC/666666.png?text=Product",
      quantity: 1,
    };
  },

  computed: {
    ...mapState("productDetail", {
      product: (state) => state.product,
      loading: (state) => state.loading,
      error: (state) => state.error,
    }),
    ...mapGetters("auth", ["isAuthenticated"]),
    ...mapGetters("cart", ["cartItems"]),
  },

  methods: {
    ...mapActions("productDetail", ["fetchProductById"]),
    ...mapActions({
      addItemToCart: "cart/addItemToCart",
    }),

    // 添加缺少的方法
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

    getStockStatus(quantity) {
      if (quantity <= 0) return "售完";
      if (quantity < 10) return `目前僅剩 ${quantity} 件`;
      return `目前有${quantity}件`;
    },

    increaseQuantity() {
      if (this.quantity < this.product.stock_quantity) {
        this.quantity++;
      }
    },

    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },

    async checkAuthAndProceed() {
      if (!this.isAuthenticated) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "請先登入",
          text: "請先登入會員後再進行購物",
        });
        this.$router.push("/login");
        return false;
      }
      return true;
    },

    isProductInCart() {
      return this.cartItems.some(
        (item) => item.product_id === this.product.product_id
      );
    },

    async addToCart() {
      if (!(await this.checkAuthAndProceed())) return;

      if (this.isProductInCart()) {
        this.$notify({
          group: "foo",
          type: "warning",
          title: "購物車提醒",
          text: "此商品已在購物車中",
        });
        return;
      }

      try {
        const result = await this.addItemToCart({
          productId: this.product.product_id,
          quantity: this.quantity,
        });

        if (result.isExist) {
          this.$notify({
            group: "foo",
            type: "warning",
            title: "購物車提醒",
            text: "此商品已在購物車中",
          });
        } else if (result.success) {
          this.$notify({
            group: "foo",
            type: "success",
            title: "購物車",
            text: "成功加入購物車",
          });
        }
      } catch (error) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "錯誤",
          text: error.message || "加入購物車失敗",
        });
      }
    },

    async buyNow() {
      if (!(await this.checkAuthAndProceed())) return;

      if (this.isProductInCart()) {
        this.$notify({
          group: "foo",
          type: "warning",
          title: "購物車提醒",
          text: "此商品已在購物車中",
        });
        this.$router.push({ name: "Cart" });
        return;
      }

      try {
        await this.addToCart();
        this.$router.push({ name: "Cart" });
      } catch (error) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "錯誤",
          text: "處理訂單時發生錯誤",
        });
      }
    },
  },

  async created() {
    try {
      const productId = this.$route.params.id;
      if (!productId) {
        throw new Error("商品 ID 無效");
      }
      await this.fetchProductById(productId);
    } catch (error) {
      console.error("Error in created hook:", error);
    }
  },
};
</script>
<style lang="scss" scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 1024px) {
    padding: 1.5rem 1rem;
  }

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
}

.error-message {
  text-align: center;
  color: #e53e3e;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-detail-container {
  display: flex;
  gap: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;

  @media (max-width: 1024px) {
    gap: 1.5rem;
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
}

.product-image {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 1024px) {
    max-width: 400px;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    aspect-ratio: 1;
  }

  @media (max-width: 480px) {
    aspect-ratio: 4/3; // 手機版使用更適合的寬高比
  }
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;

  &:hover {
    @media (min-width: 769px) {
      // 只在桌面版顯示放大效果
      transform: scale(1.05);
    }
  }
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.8rem;
  }
}

.product-name {
  font-size: 2rem;
  margin: 0;
  line-height: 1.2;

  @media (max-width: 1024px) {
    font-size: 1.8rem;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
}

.product-series {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background: #626975;
  color: white;
  border-radius: 4px;
  font-size: 0.9rem;

  @media (max-width: 480px) {
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
  }
}

.product-price {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .original-price {
    color: #999;
    text-decoration: line-through;
    font-size: 1rem;

    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }

  .current-price {
    color: #e53e3e;
    font-size: 1.5rem;
    font-weight: bold;

    @media (max-width: 1024px) {
      font-size: 1.3rem;
    }

    @media (max-width: 480px) {
      font-size: 1.2rem;
    }
  }
}

.product-stock {
  font-size: 1rem;
  color: #2f855a;
  padding: 0.5rem 0;

  &.low-stock {
    color: #e53e3e;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
}

.product-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #4a5568;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.4;
  }
}

// 添加暗色模式支援
@media (prefers-color-scheme: dark) {
  .product-detail-container {
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .product-image {
    background: #2d3748;
  }

  .product-name {
    color: black;
  }

  .product-description {
    color: black;
    border-top-color: #4a5568;
  }

  .product-stock {
    &:not(.low-stock) {
      color: #48bb78;
    }
  }

  .error-message {
    background: #1a202c;
    color: #fc8181;
  }
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;

  label {
    font-size: 1rem;
    color: #4a5568;
  }

  .quantity-controls {
    display: flex;
    align-items: center;

    .quantity-btn {
      width: 36px;
      height: 36px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #f7fafc;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .quantity-input {
      width: 60px;
      height: 36px;
      text-align: center;
      border: 1px solid #e2e8f0;
      border-left: none;
      border-right: none;
      -moz-appearance: textfield;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &:disabled {
        background: #f7fafc;
      }
    }
  }
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;

  button {
    padding: 1rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .add-to-cart-btn {
    background: #626975;
    color: white;

    &:hover:not(:disabled) {
      background: #4a4f59;
    }
  }

  .buy-now-btn {
    background: #e53e3e;
    color: white;

    &:hover:not(:disabled) {
      background: #c53030;
    }
  }
}

// RWD for buttons
@media (max-width: 768px) {
  .action-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    margin: 0;
    z-index: 100;
  }

  // 為固定按鈕留出空間
  .product-detail-container {
    padding-bottom: calc(1rem + 72px);
  }
}

@media (max-width: 480px) {
  .quantity-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .action-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.8rem;
  }
}
</style>
