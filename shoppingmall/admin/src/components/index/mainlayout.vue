<!-- components/index/mainlayout.vue -->
<template>
  <div class="main-layout">
    <Slidebar />
    <div class="main-content">
      <Topbar />
      <div class="content-area">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import Slidebar from "@/components/index/slidebar.vue";
import Topbar from "@/components/index/topbar.vue";

export default {
  name: "Mainlayout",
  components: {
    Slidebar,
    Topbar,
  },
};
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
}

.content-area {
  padding: 20px;
  padding-top: 97.5px; /* Topbar height + padding */
  background-color: #f5f5f5;
  min-height: calc(100vh - 77.5px);
}

@media screen and (max-width: 600px) {
  .main-content {
    margin-left: 0;
  }
  .content-area {
    padding-top: 77.5px; /* 調整 padding-top 以適應小螢幕 */
  }
}
</style>
