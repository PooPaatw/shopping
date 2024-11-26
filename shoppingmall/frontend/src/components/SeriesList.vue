<!-- SeriesList.vue -->
<template>
  <div class="series-container">
    <div class="scroll-controls" v-if="showControls">
      <button
        class="scroll-button prev"
        @click="scroll('prev')"
        :disabled="isAtStart"
        aria-label="Previous"
      >
        <span>&lt;</span>
      </button>
      <button
        class="scroll-button next"
        @click="scroll('next')"
        :disabled="isAtEnd"
        aria-label="Next"
      >
        <span>&gt;</span>
      </button>
    </div>

    <div class="series-scroll" ref="scrollContainer" @scroll="handleScroll">
      <div
        class="series-item"
        v-for="item in items"
        :key="item.series_id"
        @click="$emit('item-click', item)"
      >
        <h3>{{ item.seriesname }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SeriesList",

  props: {
    items: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      isAtStart: true,
      isAtEnd: false,
      showControls: false,
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.initializeScroll();
      window.addEventListener("resize", this.handleResize);
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    initializeScroll() {
      this.checkScrollability();
      this.updateScrollPosition();
    },

    handleResize() {
      // 使用防抖動來避免過多調用
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        this.initializeScroll();
      }, 150);
    },

    handleScroll() {
      this.updateScrollPosition();
    },

    checkScrollability() {
      const container = this.$refs.scrollContainer;
      if (container) {
        // 比較實際內容寬度和可見寬度
        this.showControls = container.scrollWidth > container.clientWidth;
        this.updateScrollPosition();
      }
    },

    scroll(direction) {
      const container = this.$refs.scrollContainer;
      if (!container) return;

      const scrollAmount = container.clientWidth * 0.8; // 改回0.8，讓滾動更平滑
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (direction === "next") {
        // 檢查是否真正到達最後
        if (currentScroll >= maxScroll - 20) {
          // 加入一個小的容差值
          // 回到開始
          container.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          // 正常向右滾動
          const targetScroll = Math.min(
            currentScroll + scrollAmount,
            maxScroll
          );
          container.scrollTo({
            left: targetScroll,
            behavior: "smooth",
          });
        }
      } else {
        // 檢查是否在開始位置
        if (currentScroll <= 20) {
          // 加入一個小的容差值
          // 跳到最後
          container.scrollTo({
            left: maxScroll,
            behavior: "smooth",
          });
        } else {
          // 正常向左滾動
          const targetScroll = Math.max(currentScroll - scrollAmount, 0);
          container.scrollTo({
            left: targetScroll,
            behavior: "smooth",
          });
        }
      }
    },

    updateScrollPosition() {
      const container = this.$refs.scrollContainer;
      if (container) {
        // 因為現在是循環的，所以不需要禁用按鈕
        this.isAtStart = false;
        this.isAtEnd = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.series-container {
  position: relative;
  padding: 0 40px;
  max-width: 90%; // 確保容器可以撐滿
  margin: 0 auto; // 容器本身置中

  @include respond-to("sm") {
    padding: 0 30px;
  }
}

.series-scroll {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  gap: 1rem;
  padding: 0.5rem 0; // 添加一些內邊距以確保陰影效果可見

  &::-webkit-scrollbar {
    display: none;
  }
}

.series-item {
  flex: 0 0 auto;
  width: 200px;
  background: #f8f9fa;
  padding: 0.7rem;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  // 使用 flexbox 來實現內容的垂直置中
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px; // 設定最小高度確保有足夠空間

  @include respond-to("md") {
    width: 180px;
    padding: 0.7rem;
    min-height: 90px; // 響應式調整高度
  }

  @include respond-to("sm") {
    width: 150px;
    padding: 0.7rem;
    min-height: 80px; // 響應式調整高度
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-3px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: 600;
    width: 100%; // 確保文字寬度佔滿容器
    line-height: 1.3; // 優化多行文字的間距

    @include respond-to("md") {
      font-size: 1rem;
    }

    @include respond-to("sm") {
      font-size: 0.9rem;
    }
  }
}

.scroll-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; // 讓控制按鈕不影響內容的點擊

  .scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: white;
    border: 1px solid #ddd;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    transition: all 0.3s ease;
    pointer-events: auto; // 恢復按鈕的點擊事件

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #ccc;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &.prev {
      left: 4px;
    }

    &.next {
      right: 4px;
    }

    span {
      font-size: 1.2rem;
      line-height: 1;
      color: #666;
      user-select: none;
    }
  }
}
</style>
