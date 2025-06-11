import { defineStore } from 'pinia'
import { getProductList, getProductDetail, getProductCategories } from '../api/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    productList: [],
    currentProduct: null,
    categories: [],
    total: 0,
    loading: false,
    searchParams: {
      keyword: '',
      categoryId: '',
      page: 1,
      pageSize: 10,
      sort: 'default' // default, price-asc, price-desc, sales-desc
    }
  }),
  
  getters: {
    getProductList: (state) => state.productList,
    getCurrentProduct: (state) => state.currentProduct,
    getCategories: (state) => state.categories,
    getTotal: (state) => state.total,
    getLoading: (state) => state.loading,
    getSearchParams: (state) => state.searchParams
  },
  
  actions: {
    // 设置搜索参数
    setSearchParams(params) {
      this.searchParams = { ...this.searchParams, ...params }
    },
    
    // 重置搜索参数
    resetSearchParams() {
      this.searchParams = {
        keyword: '',
        categoryId: '',
        page: 1,
        pageSize: 10,
        sort: 'default'
      }
    },
    
    // 获取商品列表
    async fetchProductList() {
      this.loading = true
      try {
        const res = await getProductList(this.searchParams)
        if (res.code === 200) {
          this.productList = res.data.list
          this.total = res.data.total
        }
        return res
      } catch (error) {
        console.error('获取商品列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取商品详情
    async fetchProductDetail(id) {
      this.loading = true
      try {
        const res = await getProductDetail(id)
        if (res.code === 200) {
          this.currentProduct = res.data
        }
        return res
      } catch (error) {
        console.error('获取商品详情失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取商品分类
    async fetchCategories() {
      try {
        const res = await getProductCategories()
        if (res.code === 200) {
          this.categories = res.data
        }
        return res
      } catch (error) {
        console.error('获取商品分类失败:', error)
        throw error
      }
    }
  }
}) 