<template>
  <div class="order-history-page">
    <h1 class="page-title">訂單記錄</h1>

    <div v-if="loading" class="loading">
      <loading />
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="!orders.length" class="empty-state">
      <div class="empty-message">目前還沒有訂單記錄</div>
      <button @click="$router.push({ name: 'Products' })" class="shop-now-btn">
        立即購物
      </button>
    </div>

    <template v-else>
      <div class="orders-list">
        <div v-for="order in orders" :key="order.order_id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">訂單編號：{{ order.order_id }}</span>
              <span class="order-date">
                {{ formatDate(order.created_at) }}
              </span>
            </div>
            <div class="order-status" :class="order.status">
              {{ getStatusText(order.status) }}
            </div>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-image">
                <img
                  :src="getImageUrl(item)"
                  :alt="item.product_name"
                  @error="(event) => handleImageError(event, item)"
                  class="product-img"
                />
              </div>
              <div class="item-details">
                <h3 class="item-name">{{ item.product_name }}</h3>
                <div class="item-quantity">數量：{{ item.quantity }}</div>
                <div class="item-price">
                  單價：$ {{ formatPrice(item.unit_price) }}
                </div>
                <div class="item-subtotal">
                  小計：$ {{ formatPrice(item.quantity * item.unit_price) }}
                </div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              總金額：$ {{ formatPrice(order.total_amount) }}
            </div>
            <div class="order-actions">
              <button
                v-if="order.status === 'pending'"
                @click="handleCancelOrder(order.order_id)"
                class="cancel-btn"
              >
                取消訂單
              </button>
              <button
                @click.prevent.stop="showOrderDetail(order.order_id)"
                class="detail-btn"
              >
                查看詳情
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分頁組件（如果需要的話） -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          class="page-btn"
        >
          上一頁
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="page-btn"
        >
          下一頁
        </button>
      </div>
    </template>
    <order-detail-modal
      :show="showDetailModal"
      :order-id="selectedOrderId"
      @close="closeDetailModal"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Loading from "@/components/Loading.vue";
import OrderDetailModal from "@/components/OrderDetailModal.vue";

export default {
  name: "OrdersHistory",

  components: {
    Loading,
    OrderDetailModal,
  },

  data() {
    return {
      showDetailModal: false,
      selectedOrderId: null,
      currentPage: 1,
      itemsPerPage: 10,
      defaultImageUrl:
        "https://placehold.co/800x800/CCCCCC/666666.png?text=Product",
      imageLoadErrors: new Set(),
    };
  },

  computed: {
    ...mapState("orders", ["orders", "loading", "error"]),
    totalPages() {
      return Math.ceil(this.orders.length / this.itemsPerPage);
    },
  },

  methods: {
    ...mapActions("orders", {
      fetchOrdersList: "getOrders", // 重命名 action
      cancelOrderAction: "cancelOrder", // 重命名 action
    }),

    formatPrice(price) {
      return Number(price).toLocaleString();
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    getStatusText(status) {
      const statusMap = {
        pending: "處理中",
        completed: "已完成",
        cancelled: "已取消",
      };
      return statusMap[status] || status;
    },

    getImageUrl(item) {
      if (this.imageLoadErrors.has(item.product_id)) {
        return this.defaultImageUrl;
      }
      return item.image_url || this.defaultImageUrl;
    },

    handleImageError(event, item) {
      this.imageLoadErrors.add(item.product_id);
      event.target.src = this.defaultImageUrl;
    },

    async changePage(page) {
      this.currentPage = page;
      await this.fetchOrders();
    },

    // 修改取消訂單方法
    async handleCancelOrder(orderId) {
      try {
        await this.cancelOrderAction(orderId); // 使用重命名後的 action
        this.$notify({
          group: "foo",
          type: "success",
          title: "成功",
          text: "訂單已取消",
        });
        await this.fetchOrders();
      } catch (error) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "錯誤",
          text: error.message || "取消訂單失敗",
        });
      }
    },

    // 修改獲取訂單方法
    async fetchOrders() {
      try {
        await this.fetchOrdersList({
          // 使用重命名後的 action
          page: this.currentPage,
          limit: this.itemsPerPage,
        });
      } catch (error) {
        this.$notify({
          group: "foo",
          type: "error",
          title: "錯誤",
          text: error.message || "獲取訂單列表失敗",
        });
      }
    },

    showOrderDetail(orderId) {
      this.selectedOrderId = orderId;
      this.showDetailModal = true;
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedOrderId = null;
    },
  },

  async created() {
    await this.fetchOrders();
  },
};
</script>
<style lang="scss" scoped>
.order-history-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  .page-title {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 2rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;

    .empty-message {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .shop-now-btn {
      padding: 0.8rem 1.5rem;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;

      &:hover {
        background: #4338ca;
      }
    }
  }

  .order-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
    overflow: hidden;

    .order-header {
      padding: 1rem;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e9ecef;

      .order-info {
        .order-number {
          font-weight: bold;
          margin-right: 1rem;
        }

        .order-date {
          color: #666;
        }
      }

      .order-status {
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.9rem;

        &.pending {
          background: #fff3cd;
          color: #856404;
        }

        &.completed {
          background: #d4edda;
          color: #155724;
        }

        &.cancelled {
          background: #f8d7da;
          color: #721c24;
        }
      }
    }

    .order-items {
      padding: 1rem;

      .order-item {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #e9ecef;

        &:last-child {
          border-bottom: none;
        }

        .item-image {
          aspect-ratio: 1;
          background: #f8f9fa;
          border-radius: 4px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }

        .item-details {
          .item-name {
            font-size: 1.1rem;
            margin: 0 0 0.5rem 0;
          }

          .item-quantity,
          .item-price {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
          }

          .item-subtotal {
            color: #e53e3e;
            font-weight: bold;
          }
        }
      }
    }

    .order-footer {
      padding: 1rem;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e9ecef;

      .order-total {
        font-size: 1.2rem;
        font-weight: bold;
        color: #e53e3e;
      }

      .order-actions {
        display: flex;
        gap: 0.5rem;

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;

          &.cancel-btn {
            background: #dc2626;
            color: white;

            &:hover {
              background: #b91c1c;
            }
          }

          &.detail-btn {
            background: #4f46e5;
            color: white;

            &:hover {
              background: #4338ca;
            }
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;

    .page-btn {
      padding: 0.5rem 1rem;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background: #4338ca;
      }
    }

    .page-info {
      font-size: 1rem;
      color: #666;
    }
  }
}

@media (max-width: 768px) {
  .order-history-page {
    padding: 1rem;

    .order-card {
      .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .order-items {
        .order-item {
          grid-template-columns: 80px 1fr;
        }
      }

      .order-footer {
        flex-direction: column;
        gap: 1rem;
        text-align: center;

        .order-actions {
          width: 100%;
          justify-content: center;
        }
      }
    }
  }
}
</style>
