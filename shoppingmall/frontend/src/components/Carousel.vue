<template>
  <div class="carousel">
    <div class="carousel-container">
      <div
        class="carousel-inner"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="carousel-slide"
        >
          <img
            :src="slide.image"
            :alt="slide.alt"
            @load="onImageLoad"
            :class="{ loaded: true }"
          />
        </div>
      </div>

      <button
        class="carousel-control prev"
        @click="prevSlide"
        aria-label="Previous slide"
      >
        <span>❮</span>
      </button>
      <button
        class="carousel-control next"
        @click="nextSlide"
        aria-label="Next slide"
      >
        <span>❯</span>
      </button>

      <div class="carousel-indicators">
        <button
          v-for="(_, index) in slides"
          :key="index"
          :class="['carousel-indicator', { active: currentSlide === index }]"
          @click="goToSlide(index)"
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Carousel",

  props: {
    slides: {
      type: Array,
      required: true,
      default: () => [],
    },
    autoplay: {
      type: Boolean,
      default: true,
    },
    interval: {
      type: Number,
      default: 5000,
    },
  },

  data() {
    return {
      currentSlide: 0,
      autoplayInterval: null,
      isAutoplayPaused: false,
    };
  },

  mounted() {
    this.startAutoplay();
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    this.stopAutoplay();
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    startAutoplay() {
      if (this.autoplay && !this.autoplayInterval) {
        this.autoplayInterval = setInterval(() => {
          if (!this.isAutoplayPaused) {
            this.nextSlide();
          }
        }, this.interval);
      }
    },

    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    },

    pauseAutoplay() {
      this.isAutoplayPaused = true;
    },

    resumeAutoplay() {
      this.isAutoplayPaused = false;
    },

    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    },

    prevSlide() {
      this.currentSlide =
        (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    },

    goToSlide(index) {
      this.currentSlide = index;
    },

    handleResize() {
      // Add additional responsive logic if needed
    },

    onImageLoad(event) {
      event.target.classList.add("loaded");
    },
  },
};
</script>

<style lang="scss" scoped>
.carousel {
  position: relative;
  width: 100%;
  padding-top: 40%; // 16:9 寬高比 (可依需求調整)
  margin-bottom: 2rem;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;

  @include respond-to("sm") {
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  &-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &-inner {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease-in-out;
  }

  &-slide {
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    position: relative;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }

  &-control {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.3);
    border: none;
    width: min(50px, 10vw); // 使用 min 確保不會過大
    height: min(50px, 10vw);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: min(1.5rem, 4vw);
    transition: all 0.3s ease;
    z-index: 2;

    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    &.prev {
      left: min(20px, 4vw);
    }

    &.next {
      right: min(20px, 4vw);
    }
  }

  &-indicators {
    position: absolute;
    bottom: min(20px, 4vw);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: min(10px, 2vw);
    z-index: 2;
  }

  &-indicator {
    width: min(12px, 2.5vw);
    height: min(12px, 2.5vw);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    border: min(2px, 0.4vw) solid rgba(255, 255, 255, 0.8);
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: white;
      transform: scale(1.2);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
