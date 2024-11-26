<template>
  <div>
    <!-- 移動設備上的小圖示 -->
    <div
      v-if="isMobile"
      @click="toggleMobileSidebar"
      class="mobile-icon"
      :class="{ active: isOpen }"
    >
      <span></span>
      <span></span>
      <span></span>
    </div>

    <!-- Sidebar 內容 -->
    <div class="sidebar" :class="{ mobile: isMobile, open: isOpen }">
      <div class="logo-container">
        <router-link to="/">
          <img src="/favicon.ico" alt="Logo" class="logo" />
        </router-link>
      </div>
      <nav>
        <div v-for="(category, key) in categories" :key="key" class="category">
          <h3 @click="toggleCategory(key)">
            {{ category.name }}
            <span :class="{ arrow: true, down: isExpanded[key] }">▶</span>
          </h3>
          <transition name="fade">
            <ul v-if="isExpanded[key]">
              <li v-for="item in category.items" :key="item.href">
                <a :href="item.href" @click="closeSidebarOnMobile">{{
                  item.name
                }}</a>
              </li>
            </ul>
          </transition>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import api from "@/api/axios";

export default {
  name: "Slidebar",
  data() {
    return {
      isExpanded: {
        product: true,
        order: true,
        member: true,
        employee: true,
        other: true,
      },
      isMobile: false,
      isOpen: false,
      categories: {
        product: {
          name: "商品管理",
          items: [
            { name: "查詢商品", href: "/query-products" },
            { name: "查詢機型", href: "/query-model" },
            { name: "查詢款式", href: "/query-series" },
          ],
        },
        order: {
          name: "訂單管理",
          items: [{ name: "查詢訂單", href: "/query-orders" }],
        },
        member: {
          name: "會員管理",
          items: [{ name: "查詢會員", href: "/query-members" }],
        },
      },
      role: "",
    };
  },
  methods: {
    toggleCategory(category) {
      this.isExpanded[category] = !this.isExpanded[category];
    },
    toggleMobileSidebar() {
      this.isOpen = !this.isOpen;
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 600;
    },
    closeSidebarOnMobile() {
      if (this.isMobile) {
        this.isOpen = false;
      }
    },
    fetchSessionData() {
      api
        .get("/session")
        .then((response) => {
          const staff = response.data;
          if (staff && staff.employeerole) {
            this.role = staff.employeerole;
            if (this.role === "manager") {
              this.$set(this.categories, "employee", {
                name: "員工管理",
                items: [
                  { name: "查詢員工", href: "/query-employees" },
                  { name: "新增員工", href: "/add-employees" },
                ],
              });
              this.$set(this.categories, "other", {
                name: "其他",
                items: [{ name: "圖表", href: "/charts" }],
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
        });
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
    this.fetchSessionData(); // 在組件掛載後獲取 session 資料
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
};
</script>

<style lang="scss" scoped>
.sidebar {
  width: 250px;
  height: 100%;
  background-color: #333;
  position: fixed;
  top: 0;
  left: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 1000;
}

.logo-container {
  padding: 20px;
  text-align: center;
  background-color: #444;
}

.logo {
  max-width: 100%;
  height: auto;
  max-height: 60px;
  cursor: pointer;
}

nav {
  flex-grow: 1;
  overflow-y: auto;
  padding-top: 20px;
}

.category {
  margin-bottom: 10px;
}

.category h3 {
  color: #fff;
  padding: 10px 16px;
  margin: 0;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category h3:hover {
  background-color: #444;
}

.arrow {
  transition: transform 0.3s ease;
}

.arrow.down {
  transform: rotate(90deg);
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar ul li {
  padding: 8px 16px 8px 32px;
  text-align: left;
}

.sidebar ul li a {
  color: white;
  text-decoration: none;
  display: block;
  transition: color 0.3s ease;
}

.sidebar ul li a:hover {
  color: #ddd;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}

/* 移動設備樣式 */
.mobile-icon {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #333;
  border-radius: 50%;
  z-index: 1001;
  cursor: pointer;
}

.mobile-icon span {
  display: block;
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 5px auto;
  transition: all 0.3s ease;
}

.mobile-icon.active span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.mobile-icon.active span:nth-child(2) {
  opacity: 0;
}

.mobile-icon.active span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

@media screen and (max-width: 600px) {
  .sidebar {
    width: 100%;
    height: 100%;
    left: -100%;
  }

  .sidebar.mobile {
    left: -100%;
  }

  .sidebar.mobile.open {
    left: 0;
  }

  .mobile-icon {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
</style>
