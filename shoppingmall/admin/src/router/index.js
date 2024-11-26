import Vue from "vue";
import Router from "vue-router";
import api from "@/api/axios";

import Index from "@/views/index.vue";
import Login from "@/views/login.vue";

// manager
import Charts from "@/views/manager/charts.vue";
import queryEmployees from "@/views/manager/queryemployees.vue";
import addEmployees from "@/views/manager/addemployees.vue";

// product
import queryProducts from "@/views/product/queryProducts.vue";
import querySeries from "@/views/product/querySeries.vue";
import queryModel from "@/views/product/queryModel.vue";

// member
import queryMembers from "@/views/member/queryMembers.vue";

// order
import queryOrders from "@/views/orders/queryOrders.vue";

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Index",
      component: Index,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/query-employees",
      name: "queryEmployees",
      component: queryEmployees,
      meta: {
        requiresAuth: true,
        requiresManager: true,
      },
    },
    {
      path: "/add-employees",
      name: "addEmployees",
      component: addEmployees,
      meta: {
        requiresAuth: true,
        requiresManager: true,
      },
    },
    {
      path: "/charts",
      name: "Charts",
      component: Charts,
      meta: {
        requiresAuth: true,
        requiresManager: true,
      },
    },
    {
      path: "/query-products",
      name: "queryProducts",
      component: queryProducts,
      meta: { requiresAuth: true },
    },
    {
      path: "/query-orders",
      name: "queryOrders",
      component: queryOrders,
      meta: { requiresAuth: true },
    },
    {
      path: "/query-model",
      name: "queryModel",
      component: queryModel,
      meta: { requiresAuth: true },
    },
    {
      path: "/query-series",
      name: "querySeries",
      component: querySeries,
      meta: { requiresAuth: true },
    },
    {
      path: "/query-members",
      name: "queryMembers",
      component: queryMembers,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  // 如果路由需要驗證
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      const response = await api.get("/employees/getstaffname", {
        withCredentials: true,
      });

      if (response.status === 200) {
        // 如果需要管理員權限，進行額外檢查
        if (to.matched.some((record) => record.meta.requiresManager)) {
          try {
            // 抓取session檢查是否為管理員
            const staffResponse = await api.get("/session");
            const staff = staffResponse.data;

            if (staff && staff.employeerole === "manager") {
              next();
            } else {
              alert("權限不足：此頁面僅限管理員訪問");
              next("/"); // 中止導航，留在當前頁面
            }
          } catch (error) {
            console.error("Error checking manager role:", error);
            alert("驗證管理員權限時發生錯誤");
            next(false);
          }
        } else {
          // 一般已登入員工可以訪問的頁面
          next();
        }
      } else {
        throw new Error("未登錄");
      }
    } catch (error) {
      alert("您尚未登入，請先登入");
      next("/login");
    }
  } else {
    // 不需要驗證的路由直接放行
    next();
  }
});

export default router;
