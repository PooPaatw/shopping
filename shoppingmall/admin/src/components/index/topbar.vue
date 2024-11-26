<template>
  <div class="topbar">
    <div class="logo-container"></div>
    <div class="staff-info">
      <span class="staff-name">Hello {{ staffname }}</span>
      <div class="logout-container">
        <button @click="index" class="index-button">首頁</button>
        <button @click="logout" class="logout-button">登出</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/axios";

export default {
  name: "Topbar",
  data() {
    return {
      staffname: "員工名字",
    };
  },
  mounted() {
    this.fetchStaffName();
  },
  methods: {
    async fetchStaffName() {
      try {
        const response = await api.get("/employees/getstaffname", {
          withCredentials: true, // 確保請求包含憑證（如 cookies）
        });
        this.staffname = response.data.employeename;
      } catch (error) {
        console.error("獲取員工名稱時出錯:", error);
      }
    },
    async logout() {
      try {
        await api.post(
          "/employees/logout",
          {},
          {
            withCredentials: true, // 確保請求包含憑證（如 cookies）
          }
        );
        this.$router.push("/login").catch((err) => {
          if (err.name !== "NavigationDuplicated") {
            console.error(err);
          }
        });
      } catch (error) {
        console.error("登出時出錯:", error);
      }
    },
    index() {
      if (this.$router.currentRoute.path !== "/") {
        this.$router.push("/");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.topbar {
  width: calc(100% - 250px); /* 減去 sidebar 的寬度 */
  height: 77.5px;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 250px; /* 從 sidebar 的右邊開始 */
  z-index: 1000;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  max-width: 100%;
  height: auto;
  max-height: 40px;
  cursor: pointer;
}

.staff-info {
  display: flex;
  align-items: center;
}

.staff-name {
  color: white;
  margin-right: 20px;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  margin: 0 10px;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #ddd;
}

.logout-container {
  display: flex;
  align-items: center;
}

.index-button {
  background-color: #3761d3;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  margin-right: 10px; /* 添加間距 */
}

.index-button:hover {
  background-color: #0231b4;
}

.logout-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #d32f2f;
}

@media screen and (max-width: 600px) {
  .topbar {
    width: 100%;
    left: 0;
  }
  .nav-links {
    display: none;
  }
}
</style>
