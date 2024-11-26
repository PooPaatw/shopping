<template>
  <div class="layout">
    <header>
      <div class="header-content">
        <div class="header-left">
          <router-link to="/" class="home-title">
            <img src="/favicon.ico" alt="摔不壞手機" class="logo-icon" />
            <h1>摔不壞手機</h1>
          </router-link>
        </div>
        <nav :class="{ 'nav-open': isMenuOpen }">
          <ul>
            <li>
              <router-link to="/products" class="products-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="nav-icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
                <span class="sr-only">商品</span>
              </router-link>
            </li>
            <li>
              <router-link to="/cart" class="cart-link">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="nav-icon"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.25 1.875c0-.345.28-.625.625-.625H3.75c.298 0 .554.21.613.502l.524 2.623h13.238a.625.625 0 0 1 .618.72l-1.25 8.125a.625.625 0 0 1-.618.53H5.625a.625.625 0 0 1-.618-.53L3.76 5.109 3.238 2.5H1.875a.625.625 0 0 1-.625-.625Zm3.854 3.75L6.16 12.5h10.18l1.058-6.875H5.104Zm2.709 10a.937.937 0 1 0 0 1.875.937.937 0 0 0 0-1.875Zm-2.188.938a2.188 2.188 0 1 1 4.375 0 2.188 2.188 0 0 1-4.375 0Zm9.688-.938a.937.937 0 1 0 0 1.875.937.937 0 0 0 0-1.875Zm-2.188.938a2.188 2.188 0 1 1 4.375 0 2.188 2.188 0 0 1-4.375 0Z"
                    fill="currentColor"
                  />
                </svg>
                <span class="sr-only">購物車</span>
                <span v-if="cartItemCount > 0" class="cart-badge">
                  {{ cartItemCount }}
                </span>
              </router-link>
            </li>
            <!-- 新增訂單查看按鈕 -->
            <li v-if="isAuthenticated">
              <router-link to="/ordershistory" class="orders-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="nav-icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3H21"
                  />
                </svg>
                <span class="sr-only">訂單查看</span>
              </router-link>
            </li>
            <li>
              <template v-if="isAuthenticated">
                <div class="user-info">
                  <span class="username">{{ currentUser.username }}</span>
                  <button @click="handleLogout" class="logout-btn">登出</button>
                </div>
              </template>
              <router-link v-else to="/login" class="login-link">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="nav-icon"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10 11.25a7.5 7.5 0 0 0-7.478 6.922.625.625 0 1 1-1.246-.094 8.75 8.75 0 0 1 17.449 0 .625.625 0 0 1-1.247.094A7.5 7.5 0 0 0 10 11.25Zm0-8.75a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6.25 5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z"
                    fill="currentColor"
                  />
                </svg>
                <span class="sr-only">會員</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer>
      <p>&copy; 2024 Our Shop. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Layout",

  data() {
    return {
      isMenuOpen: false,
    };
  },

  computed: {
    ...mapGetters("auth", ["isAuthenticated", "currentUser"]),
    cartItemCount() {
      return this.$store.state.cart.items.length;
    },
  },

  methods: {
    ...mapActions("auth", ["logout"]),
    ...mapActions("cart", ["clearCart"]),

    async handleLogout() {
      try {
        await this.logout();
        this.$notify({
          group: "foo",
          type: "success",
          title: "登出成功",
          text: "已成功登出",
        });

        this.$router.push("/");
      } catch (error) {
        console.error("Logout failed:", error);
        this.$notify({
          group: "foo",
          type: "error",
          title: "登出失敗",
          text: "請稍後再試",
        });
      }
    },
  },

  // 組件創建時檢查認證狀態
  async created() {
    if (this.$store.getters["auth/isAuthenticated"]) {
      await this.$store.dispatch("auth/checkAuth");
    }
  },
};
</script>
<style lang="scss" scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  header {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      @media (max-width: 768px) {
        padding: 0.75rem;
      }
    }

    .header-left {
      .home-title {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: inherit;
        cursor: pointer;

        @media (max-width: 768px) {
          gap: 6px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          object-fit: contain;
          transition: transform 0.3s ease;

          @media (max-width: 768px) {
            width: 28px;
            height: 28px;
          }
        }

        h1 {
          margin: 0;
          font-size: 1.5rem;
          transition: color 0.3s ease;

          @media (max-width: 768px) {
            font-size: 1.2rem;
          }

          @media (max-width: 360px) {
            display: none;
          }
        }

        &:hover {
          h1 {
            color: #007bff;
          }
          .logo-icon {
            transform: scale(1.05);
          }
        }
      }
    }

    nav {
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 2rem;

        @media (max-width: 768px) {
          gap: 0.5rem;
        }

        li {
          a {
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: color 0.3s ease;

            &:hover,
            &.router-link-active {
              color: #007bff;
            }
          }
        }
      }
    }
  }

  main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;

    @media (max-width: 768px) {
      padding: 1rem;
    }
  }

  footer {
    background-color: #474a4c;
    padding: 1rem;
    text-align: center;

    p {
      margin: 0;
      color: #bcc1c5;
    }
  }
}

.nav-icon {
  width: 30px;
  height: 24px;

  @media (max-width: 768px) {
    width: 24px;
    height: 20px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}


.products-link,
.cart-link,
.login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: inherit;
  text-decoration: none;
  position: relative;

  @media (max-width: 768px) {
    padding: 6px;
  }

  &:hover {
    color: #007bff;
  }
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff4444;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(50%, -50%);

  @media (max-width: 768px) {
    min-width: 14px;
    height: 14px;
    font-size: 10px;
    padding: 2px 4px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px; // 添加與其他導航項目相同的 padding
  height: 40px; // 設置固定高度，與 SVG 圖標容器一致

  @media (max-width: 768px) {
    padding: 6px; // 響應式調整，與其他導航項目保持一致
    height: 32px; // 響應式調整高度
  }

  .username {
    font-weight: 500;
    color: #333;
  }

  .logout-btn {
    padding: 0.25rem 0.5rem;
    background: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    line-height: 1;

    &:hover {
      background: #c53030;
    }
  }
}
.orders-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: inherit;
  text-decoration: none;

  @media (max-width: 768px) {
    padding: 6px;
  }

  &:hover {
    color: #007bff;
  }
}
</style>
