<template>
  <div id="app">
    <header></header>
    <router-view />
  </div>
</template>

<script>
import AdminHomepage from "@/views/index.vue";
import AdminLogin from "@/views/login.vue";

// manager
import AddEmployees from "@/views/manager/addEmployees.vue";
import QueryEmployees from "@/views/manager/queryEmployees.vue";

// product
import QueryProducts from "@/views/product/queryProducts.vue";
import QueryModel from "@/views/product/queryModel.vue";
import QuerySeries from "@/views/product/querySeries.vue";

// member
import QueryMembers from "@/views/member/queryMembers.vue";

// order
import QueryOrders from "@/views/orders/queryOrders.vue";

export default {
  name: "App",
  components: {
    AdminHomepage,
    AdminLogin,
    AddEmployees,
    QueryEmployees,
    QueryProducts,
    QueryOrders,
    QueryModel,
    QuerySeries,
    QueryMembers,
  },
};
</script>
