import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store"; // 添加這行，引入 store

// User
import ShoppingHomepage from "@/views/index.vue";
import MemberLogin from "@/views/login.vue";
import Register from "@/views/register.vue";
import RegisterSuccess from "@/views/register-success.vue";
import PasswordResetRequest from "@/views/request-password-reset.vue";
import PasswordReset from "@/views/reset-password.vue";

// 商品
import Products from "@/views/products.vue";
import ProductDetail from "@/views/product-detail.vue";
import Cart from "../views/cart.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: ShoppingHomepage,
  },
  {
    path: "/login",
    name: "MemberLogin",
    component: MemberLogin,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/register-success",
    name: "Register-success",
    component: RegisterSuccess,
  },
  {
    path: "/request-password-reset",
    name: "PasswordResetRequest",
    component: PasswordResetRequest,
  },
  {
    path: "/reset-password",
    name: "PasswordReset",
    component: PasswordReset,
  },
  {
    path: "/products",
    name: "Products",
    component: Products,
  },
  {
    path: "/product/:id",
    name: "ProductDetail",
    component: ProductDetail,
  },
  {
    path: "/cart",
    name: "Cart",
    component: Cart,
    meta: { requiresAuth: true },
  },
  {
    path: "/order-complete/:orderId",
    name: "OrderComplete",
    component: () => import("@/views/order-complete.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ordershistory",
    name: "Ordershistory",
    component: () => import("@/views/order-history.vue"),
    meta: { requiresAuth: true, title: "訂單記錄" },
  },
  {
    path: "/orders/:orderId",
    name: "OrderDetail",
    component: () => import("@/components/OrderDetailModal.vue"),
    meta: {
      requiresAuth: true,
      title: "訂單詳情",
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: import.meta.env.BASE_URL,
  routes,
});

// 全局導航錯誤處理
router.onError((error) => {
  if (error.name === "NavigationDuplicated") {
    // 忽略重複導航錯誤
    return;
  }
  console.error("Router error:", error);
});

// 修改路由守衛
router.beforeEach((to, from, next) => {
  try {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const isAuthenticated = store.getters["auth/isAuthenticated"];

    if (requiresAuth && !isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else if (to.path === "/login" && isAuthenticated) {
      // 如果已登入且嘗試訪問登入頁，重定向到首頁
      if (from.path === "/") {
        next(false); // 取消導航
      } else {
        next("/");
      }
    } else {
      next();
    }
  } catch (error) {
    console.error("Navigation guard error:", error);
    next(false);
  }
});

export default router;
