<template>
  <div id="admin">
    <Slidebar />
    <div class="content"></div>
    <Topbar />
  </div>
</template>

<script>
import Slidebar from "@/components/index/slidebar.vue";
import Topbar from "@/components/index/topbar.vue";

export default {
  name: "Admin",
  components: {
    Slidebar,
    Topbar,
  },
};
</script>

<style lang="scss" scoped>
#admin {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 375px; /* 設定視窗的最小寬度 */
}

.content {
  margin-left: 250px; /* 側邊欄的寬度 */
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

@media screen and (max-width: 600px) {
  .content {
    margin-left: 0;
    width: 100%;
  }
}
</style>
