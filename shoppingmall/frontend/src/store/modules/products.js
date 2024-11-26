import axios from "@/api/axios";

const API_BASE_URL = "/api";

const sortProducts = (products, sortType) => {
  const sortedProducts = [...products];

  switch (sortType) {
    case "price-asc":
      return sortedProducts.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sortedProducts.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sortedProducts.sort((a, b) =>
        a.modelname.localeCompare(b.modelname, "zh-TW")
      );
    case "name-desc":
      return sortedProducts.sort((a, b) =>
        b.modelname.localeCompare(a.modelname, "zh-TW")
      );
    case "date-desc":
    default:
      return sortedProducts.sort(
        (a, b) => new Date(b.releasedate) - new Date(a.releasedate)
      );
  }
};

export default {
  namespaced: true,

  state: {
    products: [],
    allProducts: [],
    featuredProducts: [],
    currentProduct: null,
    loading: false,
    error: null,
    lastSort: "date-desc", // 新增：記錄最後使用的排序方式
    pagination: {
      currentPage: 1,
      totalPages: 1,
      perPage: 12,
      total: 0,
    },
  },

  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    SET_ALL_PRODUCTS(state, products) {
      state.allProducts = products;
    },
    SET_FEATURED_PRODUCTS(state, products) {
      state.featuredProducts = products;
    },
    SET_CURRENT_PRODUCT(state, product) {
      state.currentProduct = product;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_PAGINATION(state, pagination) {
      state.pagination = { ...state.pagination, ...pagination };
    },
    SET_LAST_SORT(state, sortType) {
      // 新增：設置最後使用的排序方式
      state.lastSort = sortType;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },

  actions: {
    // products.vue 商品詳情
    async fetchProducts({ commit, state }, params = {}) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", params.page || state.pagination.currentPage);
        queryParams.append("limit", state.pagination.perPage);

        if (params.seriesId) {
          queryParams.append("series_id", params.seriesId);
        }

        const sortType = params.sort || state.lastSort;
        if (sortType) {
          queryParams.append("sort", sortType);
          commit("SET_LAST_SORT", sortType);
        }

        const response = await axios.get(
          `/products/getallproducts?${queryParams.toString()}`
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          let processedProducts = response.data.data.map((product) => ({
            product_id: product.product_id,
            modelname: product.modelname,
            series_id: product.series_id,
            series_name: product.series_name,
            price: parseFloat(product.price) || 0,
            original_price: parseFloat(product.original_price) || 0,
            image_url: product.image_url
              ? `${API_BASE_URL}${product.image_url.replace("/public", "")}`
              : null,
            stock_quantity: product.stock_quantity,
            description: product.description,
            is_active: product.is_active,
            releasedate: product.releasedate,
          }));

          // 排序所有商品
          const sortedProducts = sortType
            ? sortProducts(processedProducts, sortType)
            : processedProducts;

          // 更新 allProducts（只在必要時）
          if (!params.seriesId || !state.allProducts.length) {
            commit("SET_ALL_PRODUCTS", sortedProducts);
          }

          // 處理當前顯示的商品
          let displayProducts = params.seriesId
            ? sortedProducts.filter(
                (product) =>
                  Number(product.series_id) === Number(params.seriesId)
              )
            : sortedProducts;

          // 計算分頁
          const total = displayProducts.length;
          const totalPages = Math.ceil(total / state.pagination.perPage);
          const currentPage = params.page || state.pagination.currentPage;
          const perPage = state.pagination.perPage;

          const start = (currentPage - 1) * perPage;
          const end = start + perPage;
          const paginatedProducts = displayProducts.slice(start, end);

          commit("SET_PRODUCTS", paginatedProducts);
          commit("SET_PAGINATION", {
            total,
            totalPages,
            currentPage,
          });

          return {
            products: paginatedProducts,
            pagination: {
              total,
              totalPages,
              currentPage,
              perPage,
            },
          };
        } else {
          throw new Error(response.data.message || "獲取商品失敗");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        commit("SET_ERROR", error.message || "獲取商品數據失敗");
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchProductsBySeries({ dispatch }, { seriesId, page, sort }) {
      return dispatch("fetchProducts", {
        seriesId,
        page,
        sort,
      });
    },

    // index.vue 精選商品
    async fetchFeaturedProducts({ commit }) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const response = await axios.get("/products/getallproducts");

        if (response.data.success && Array.isArray(response.data.data)) {
          const processedProducts = response.data.data
            .filter((product) => product.is_active === 1)
            .map((product) => ({
              product_id: product.product_id,
              name: product.modelname,
              price: parseFloat(product.price) || 0,
              // 確保圖片 URL 正確
              image_url: product.image_url
                ? `${API_BASE_URL}${product.image_url.replace("/public", "")}`
                : null,
              stock_quantity: product.stock_quantity,
              description: product.description,
              is_active: product.is_active,
              releasedate: product.releasedate,
            }))
            .sort((a, b) => new Date(b.releasedate) - new Date(a.releasedate))
            .slice(0, 8);

          commit("SET_FEATURED_PRODUCTS", processedProducts);
          return processedProducts;
        } else {
          throw new Error("無效的數據格式");
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        commit("SET_ERROR", error.response?.data?.message || "獲取商品失敗");
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },

  getters: {
    getFeaturedProducts: (state) => state.featuredProducts || [],
    getCurrentProduct: (state) => state.currentProduct,
    getLoading: (state) => state.loading,
    getError: (state) => state.error,
    getProducts: (state) => state.products || [],
    getPagination: (state) => state.pagination,
    getLastSort: (state) => state.lastSort,
    getFilteredProducts: (state) => (seriesId) => {
      const products = state.allProducts || [];
      if (!seriesId) return products;
      return products.filter(
        (product) => Number(product.series_id) === Number(seriesId)
      );
    },
    getTotalProducts: (state) => (state.allProducts || []).length,
  },
};
