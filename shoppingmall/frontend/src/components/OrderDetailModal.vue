<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <h2>訂單詳情</h2>
        <button @click="handleClose" class="close-btn">&times;</button>
      </div>

      <div class="modal-content">
        <div v-if="loading" class="loading">
          <Loading />
        </div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else-if="!orderDetail" class="error-message">找不到訂單資料</div>
        <div v-else class="order-info">
          <div class="order-header">
            <div class="info-row">
              <span class="label">訂單編號：</span>
              <span class="value">{{ orderDetail.order_id }}</span>
            </div>
            <div class="info-row">
              <span class="label">訂單狀態：</span>
              <span class="value" :class="orderDetail.status">
                {{ getStatusText(orderDetail.status) }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">建立時間：</span>
              <span class="value">{{
                formatDate(orderDetail.created_at)
              }}</span>
            </div>
          </div>

          <div
            v-if="orderDetail.items && orderDetail.items.length"
            class="order-items"
          >
            <h3>訂單商品</h3>
            <div v-for="item in orderDetail.items" :key="item.id" class="item">
              <div class="item-info">
                <h4>{{ item.product_name }}</h4>
                <div class="item-meta">
                  <span>數量：{{ item.quantity }}</span>
                  <span>單價：$ {{ formatPrice(item.unit_price) }}</span>
                  <span
                    >總計：$
                    {{ formatPrice(item.quantity * item.unit_price) }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="order-summary">
            <div class="total">
              總金額：$ {{ formatPrice(orderDetail.total_amount) }}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="btn-close">關閉</button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import Loading from "@/components/Loading.vue";

export default {
  name: "OrderDetailModal",

  components: {
    Loading,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
    orderId: {
      type: [Number, String],
      default: null,
    },
  },

  data() {
    return {
      isLoading: false,
      localError: null,
    };
  },

  computed: {
    ...mapState("orders", ["currentOrder"]),
    orderDetail() {
      return this.currentOrder;
    },
    loading() {
      return this.isLoading;
    },
    error() {
      return this.localError;
    },
  },

  methods: {
    ...mapActions("orders", ["getOrderById", "clearCurrentOrder"]),

    handleClose() {
      this.clearCurrentOrder();
      this.$emit("close");
    },

    formatPrice(price) {
      return Number(price).toLocaleString();
    },

    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString("zh-TW");
    },

    getStatusText(status) {
      const statusMap = {
        pending: "處理中",
        completed: "已完成",
        cancelled: "已取消",
      };
      return statusMap[status] || status;
    },

    async fetchOrderDetails() {
      if (!this.orderId) return;

      console.log(`Fetching details for order ID: ${this.orderId}`);

      this.isLoading = true;
      this.localError = null;

      try {
        await this.getOrderById(this.orderId);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        this.localError = error.message || "獲取訂單詳情失敗";
      } finally {
        this.isLoading = false;
      }
    },
  },

  watch: {
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchOrderDetails();
        } else {
          this.clearCurrentOrder();
        }
      },
    },
  },

  created() {
    if (this.show && this.orderId) {
      this.fetchOrderDetails();
    }
  },

  beforeDestroy() {
    this.clearCurrentOrder();
  },
};
</script>
<style lang="scss" scoped>
.modal-overlay {
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

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f9fafb;

    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #374151;
    }

    .close-btn {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: #6b7280;
      font-size: 1.5rem;

      &:hover {
        color: #374151;
      }
    }
  }

  .modal-content {
    padding: 1.5rem;
    overflow-y: auto;

    .info-section {
      margin-bottom: 1.5rem;

      .info-row {
        display: flex;
        margin-bottom: 0.5rem;

        .label {
          width: 100px;
          color: #6b7280;
          font-weight: bold;
        }

        .value {
          flex: 1;
          color: #374151;

          &.pending {
            color: #f59e0b;
          }
          &.completed {
            color: #10b981;
          }
          &.cancelled {
            color: #ef4444;
          }
        }
      }
    }

    .order-items {
      h3 {
        margin-bottom: 1rem;
        color: #374151;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 0.5rem;
      }

      .item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        margin-bottom: 1rem;
        background-color: #f9fafb;

        .item-info {
          flex: 1;

          h4 {
            margin: 0 0 0.5rem 0;
            color: #374151;
          }

          .item-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            color: #6b7280;
          }
        }
      }
    }

    .order-summary {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      text-align: right;

      .total {
        font-size: 1.25rem;
        font-weight: bold;
        color: #ef4444;
      }
    }
  }

  .modal-footer {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    background-color: #f9fafb;

    .btn-close {
      padding: 0.5rem 1rem;
      background-color: #6b7280;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;

      &:hover {
        background-color: #4b5563;
      }
    }
  }
}

.loading,
.error-message {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: #ef4444;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-width: 600px;
  }

  .modal-header {
    h2 {
      font-size: 1.25rem;
    }

    .close-btn {
      font-size: 1.25rem;
    }
  }

  .modal-content {
    padding: 1rem;

    .info-section {
      .info-row {
        flex-direction: column;
        align-items: flex-start;

        .label {
          width: auto;
          margin-bottom: 0.25rem;
        }
      }
    }

    .order-items {
      .item {
        flex-direction: column;
        align-items: flex-start;

        .item-meta {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    }

    .order-summary {
      text-align: left;
    }
  }

  .modal-footer {
    justify-content: center;
  }
}
</style>
