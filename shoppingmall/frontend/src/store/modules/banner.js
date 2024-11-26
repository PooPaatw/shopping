export default {
  namespaced: true,

  state: {
    banners: [
      {
        id: 1,
        image: "/assets/banners/carousel/輪播1.jpg",
        alt: "新品上市",
        link: "/",
      },
      {
        id: 2,
        image: "/assets/banners/carousel/輪播2.jpg",
        alt: "透明專區",
        link: "/",
      },
      {
        id: 3,
        image: "/assets/banners/carousel/輪播3.png",
        alt: "卡通款專區",
        link: "/",
      },
      {
        id: 4,
        image: "/assets/banners/carousel/輪播4.jpg",
        alt: "軍規專區",
        link: "/",
      },
      {
        id: 5,
        image: "/assets/banners/carousel/輪播5.jpg",
        alt: "周邊專區",
        link: "/",
      },
    ],
  },

  getters: {
    getAllBanners: (state) => state.banners,
  },

  mutations: {
    SET_BANNERS(state, banners) {
      state.banners = banners;
    },
  },

  actions: {
    // 如果之後需要從後端獲取 banner 數據
    async fetchBanners({ commit }) {
      try {
        // const response = await axios.get('/api/banners');
        // commit('SET_BANNERS', response.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    },
  },
};
