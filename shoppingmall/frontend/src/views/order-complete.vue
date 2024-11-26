<template>
  <div class="order-complete-page">
    <div v-if="loading" class="loading">
      <loading />
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else class="success-message">
      <h1>訂單建立成功！</h1>
      <div class="order-info">
        <p>訂單編號：{{ orderId }}</p>
        <p>訂單金額：$ {{ formatPrice(orderAmount) }}</p>
      </div>

      <div class="action-buttons">
        <button
          @click="$router.push({ name: 'Ordershistory' })"
          class="view-orders-btn"
        >
          查看訂單記錄
        </button>
        <button
          @click="$router.push({ name: 'Products' })"
          class="continue-shopping-btn"
        >
          繼續購物
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  name: "OrderComplete",

  components: {
    Loading,
  },

  data() {
    return {
      orderAmount: 0,
    };
  },

  computed: {
    ...mapState("orders", ["loading", "error"]),
    orderId() {
      return this.$route.params.orderId;
    },
  },

  methods: {
    formatPrice(price) {
      return Number(price).toLocaleString();
    },

    async fetchOrderDetails() {
      // 先檢查是否有訂單ID
      if (!this.orderId) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "錯誤",
          text: "無效的訂單編號",
        });
        this.$router.push({ name: "Home" });
        return;
      }

      try {
        const orderData = await this.$store.dispatch(
          "orders/getallorders",
          this.orderId
        );
        if (orderData) {
          this.orderAmount = orderData.total_amount;
        }
      } catch (error) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "錯誤",
          text: error.message || "獲取訂單詳情失敗",
        });
        // 如果獲取失敗，可以選擇導航到其他頁面
        this.$router.push({ name: "Home" });
      }
    },
  },

  created() {
    // 如果有路由參數中的金額，直接使用
    if (this.$route.params.amount) {
      this.orderAmount = this.$route.params.amount;
    }
    // 仍然調用 API 以獲取完整訂單信息
    this.fetchOrderDetails();
  },
};
</script>

<style lang="scss" scoped>
.order-complete-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;

  .loading,
  .error-message {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .error-message {
    color: #dc2626;
  }

  .success-message {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h1 {
      color: #22c55e;
      margin-bottom: 2rem;
    }
  }

  .order-info {
    margin: 2rem 0;

    p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;

    button {
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;

      &.view-orders-btn {
        background: #4f46e5;
        color: white;

        &:hover {
          background: #4338ca;
        }
      }

      &.continue-shopping-btn {
        background: #626975;
        color: white;

        &:hover {
          background: #4a4f59;
        }
      }
    }
  }
}
</style>
