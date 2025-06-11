import { defineStore } from 'pinia'
import { getCartList, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartList: [],
    cartCount: 0,
    totalPrice: 0
  }),
  
  getters: {
    getCartList: (state) => state.cartList,
    getCartCount: (state) => state.cartCount,
    getTotalPrice: (state) => state.totalPrice
  },
  
  actions: {
    // 计算购物车总价和商品数量
    calculateTotal() {
      this.cartCount = this.cartList.reduce((total, item) => total + item.count, 0)
      this.totalPrice = this.cartList.reduce((total, item) => total + item.price * item.count, 0)
    },
    
    // 获取购物车列表
    async getCart() {
      try {
        const res = await getCartList()
        if (res.code === 200) {
          this.cartList = res.data
          this.calculateTotal()
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 添加商品到购物车
    async addToCart(product) {
      try {
        const res = await addToCart(product)
        if (res.code === 200) {
          await this.getCart()
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 更新购物车商品数量
    async updateCartItem(id, count) {
      try {
        const res = await updateCartItem(id, count)
        if (res.code === 200) {
          await this.getCart()
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 从购物车中删除商品
    async removeFromCart(id) {
      try {
        const res = await removeFromCart(id)
        if (res.code === 200) {
          await this.getCart()
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 清空购物车
    async clearCart() {
      try {
        const res = await clearCart()
        if (res.code === 200) {
          this.cartList = []
          this.cartCount = 0
          this.totalPrice = 0
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }
}) 