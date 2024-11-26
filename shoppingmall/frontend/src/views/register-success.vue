<template>
  <div class="register-wrapper">
    <div class="container">
      <div class="title-div">Registration</div>
      <div class="scan-login">註冊成功</div>
      <div class="logo"></div>
      <div class="button-wrapper">
        <button class="confirm-button" @click="goToIndex">Return Home</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RegisterSuccess",
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
  },
  computed: {
    wrapperStyle() {
      const scale = Math.min(this.windowWidth / 1920, this.windowHeight / 1080);
      return {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      };
    },
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    goToIndex() {
      const PORT = 8000; // 确保这与您的公共应用端口匹配
      window.location.href = `http://localhost:${PORT}/`;
    },
    onResize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    },
  },
};
</script>

<style scoped lang="scss">
.register-wrapper {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;

  .logo {
    font-size: 32px;
    line-height: 44px;
    background: rgba(255, 255, 255, 0.3);
    padding: 10px 40px;
    margin-bottom: 20px;
  }

  .title-div {
    color: black;
    font-size: 40px;
    font-weight: bold;
    font-family: "Roboto", sans-serif;
    line-height: 40px;
    margin-bottom: 20px;
  }

  .scan-login {
    font-family: "Inter", sans-serif;
    font-size: 30px;
    line-height: 36px;
    color: #000000;
    margin-bottom: 20px;
  }

  .button-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .confirm-button {
    width: 200px;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
    text-align: center;

    &:hover:not(:disabled) {
      background-color: #0056b3;
    }

    &:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  }
}
</style>
