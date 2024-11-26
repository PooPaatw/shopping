<template>
  <div id="app">
    <Layout />
    <notifications group="foo" />
  </div>
</template>

<script>
import Layout from "@/components/Layout.vue";

export default {
  name: "App",
  components: {
    Layout,
  },
  async created() {
    try {
      // 初始化認證狀態
      await this.$store.dispatch("auth/initAuth");

      // 如果用戶已登入，初始化其他必要數據
      if (this.$store.getters["auth/isAuthenticated"]) {
        // 初始化購物車
        await this.$store.dispatch("cart/initializeCart");
      }
    } catch (error) {
      console.error("初始化失敗:", error);
    }
  },
};
</script>

<style lang="scss">
.vue-notification {
  padding: 10px;
  margin: 5px;
  font-size: 14px;
  color: #ffffff;
  border-radius: 4px;

  &.success {
    background: #48bb78;
    border-left: 5px solid #2f855a;
  }

  &.error {
    background: #e53e3e;
    border-left: 5px solid #c53030;
  }

  .notification-title {
    font-weight: 600;
  }

  .notification-content {
    margin-top: 4px;
  }
}
</style>
