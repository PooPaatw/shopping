<template>
  <div class="cart-page">
    <h1 class="cart-title">購物車</h1>

    <div v-if="loading" class="loading">
      <loading />
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="!cartItems.length" class="empty-cart">
      <div class="empty-message">購物車是空的</div>
      <button
        @click="$router.push({ name: 'Products' })"
        class="continue-shopping"
      >
        繼續購物
      </button>
    </div>

    <template v-else>
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.product_id" class="cart-item">
          <div class="item-image">
            <img
              :src="getImageUrl(item)"
              :alt="item.modelname"
              @error="(event) => handleImageError(event, item)"
              class="product-img"
            />
          </div>

          <div class="item-details">
            <h3 class="item-name">{{ item.modelname }}</h3>
            <div class="item-price">$ {{ formatPrice(item.price) }}</div>

            <div class="quantity-controls">
              <button
                @click="updateQuantity(item.product_id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="quantity-btn"
              >
                -
              </button>
              <input
                type="number"
                v-model.number="item.quantity"
                min="1"
                :max="item.stock_quantity"
                @change="validateAndUpdateQuantity(item)"
                class="quantity-input"
              />
              <button
                @click="updateQuantity(item.product_id, item.quantity + 1)"
                :disabled="item.quantity >= item.stock_quantity"
                class="quantity-btn"
              >
                +
              </button>
            </div>

            <div class="item-subtotal">
              小計：$ {{ formatPrice(item.price * item.quantity) }}
            </div>

            <button @click="removeItem(item.product_id)" class="remove-btn">
              移除
            </button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="total-items">總計 {{ itemCount }} 件商品</div>
        <div class="total-price">總金額：$ {{ formatPrice(cartTotal) }}</div>
        <button @click="checkout" :disabled="processing" class="checkout-btn">
          {{ processing ? "處理中..." : "前往結帳" }}
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  name: "CartPage",

  components: {
    Loading,
  },

  data() {
    return {
      defaultImageUrl:
        "https://placehold.co/800x800/CCCCCC/666666.png?text=Product",
      imageLoadErrors: new Set(),
      processing: false,
    };
  },

  computed: {
    ...mapState("cart", ["loading", "error"]),
    ...mapGetters("cart", ["cartTotal", "itemCount"]),
    cartItems() {
      const items = this.$store.state.cart.items;
      console.log("Cart items computed:", items);
      return items;
    },
  },

  methods: {
    ...mapActions("cart", ["updateQuantity", "removeFromCart", "createOrder"]),

    formatPrice(price) {
      return Number(price).toLocaleString();
    },

    getImageUrl(item) {
      if (this.imageLoadErrors.has(item.product_id)) {
        return this.defaultImageUrl;
      }

      if (!item.image_url) {
        return this.defaultImageUrl;
      }

      return item.image_url;
    },

    handleImageError(event, item) {
      this.imageLoadErrors.add(item.product_id);
      event.target.src = this.defaultImageUrl;
    },

    async validateAndUpdateQuantity(item) {
      try {
        let quantity = Math.min(
          Math.max(1, item.quantity),
          item.stock_quantity
        );
        await this.updateQuantity({
          productId: item.product_id,
          quantity: quantity,
        });

        this.$notify({
          group: "foo",
          type: "success",
          title: "更新成功",
          text: "商品數量已更新",
        });
      } catch (error) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "更新失敗",
          text: error.message || "更新商品數量失敗",
        });
      }
    },

    async removeItem(productId) {
      try {
        await this.removeFromCart(productId);
        this.$notify({
          group: "foo",
          type: "success",
          title: "移除成功",
          text: "商品已從購物車移除",
        });
      } catch (error) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "移除失敗",
          text: error.message || "移除商品失敗",
        });
      }
    },

    async checkout() {
      if (this.processing) return;

      this.processing = true;
      try {
        const result = await this.createOrder(); // 將 order 改為 result

        if (result.success) {
          this.$notify({
            group: "foo",
            type: "success",
            title: "訂單成功",
            text: "訂單已成功創建",
          });

          // 導航到訂單完成頁面，使用 result.data
          this.$router.push({
            name: "OrderComplete",
            params: {
              orderId: result.data.order_id,
              amount: result.data.total_amount,
            },
          });
        }
      } catch (error) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "結帳失敗",
          text: error.message || "創建訂單失敗",
        });
      } finally {
        this.processing = false;
      }
    },
  },

  // 組件創建時自動獲取購物車數據
  async created() {
    console.log("Component created, initializing cart...");
    await this.$store.dispatch("cart/initializeCart");
  },
};
</script>
<style lang="scss" scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.cart-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;

  .empty-message {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1.5rem;
  }

  .continue-shopping {
    padding: 0.8rem 1.5rem;
    background: #626975;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;

    &:hover {
      background: #4a4f59;
    }
  }
}

.cart-items {
  .cart-item {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 1rem;
    }

    .item-image {
      aspect-ratio: 1;
      background: #f5f5f5;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;

      .item-name {
        font-size: 1.2rem;
        margin: 0;
      }

      .item-price {
        font-size: 1.1rem;
        color: #e53e3e;
        font-weight: bold;
      }

      .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .quantity-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        .quantity-input {
          width: 60px;
          height: 32px;
          text-align: center;
          border: 1px solid #ddd;
        }
      }

      .remove-btn {
        align-self: flex-start;
        padding: 0.5rem 1rem;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #b91c1c;
        }
      }
    }
  }
}

.cart-summary {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .total-items {
    font-size: 1rem;
    color: #666;
  }

  .total-price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #e53e3e;
  }

  .checkout-btn {
    padding: 1rem;
    background: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1rem;
    cursor: pointer;

    &:hover {
      background: #c53030;
    }
  }
}

@media (max-width: 768px) {
  .cart-summary {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0;
    padding: 1rem;
    margin-top: 0;

    // 為固定的購物車總結留出空間
    & + .cart-items {
      margin-bottom: 180px;
    }
  }
}
</style>
