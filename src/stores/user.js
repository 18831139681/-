import { defineStore } from 'pinia'
import { login, register, getUserInfo, updateUserInfo } from '../api/user'
import router from '../router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || {},
    isLogin: !!localStorage.getItem('token')
  }),
  
  getters: {
    getToken: (state) => state.token,
    getUserData: (state) => state.userInfo,
    getLoginStatus: (state) => state.isLogin
  },
  
  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await login(loginForm)
        if (res.code === 200) {
          this.token = res.data.token
          this.userInfo = res.data.user
          this.isLogin = true
          
          // 存储到本地
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userInfo', JSON.stringify(res.data.user))
          
          console.log('登录成功，保存token:', res.data.token)
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 注册
    async register(registerForm) {
      try {
        const res = await register(registerForm)
        if (res.code === 200) {
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 获取用户信息
    async getUserInfo() {
      // 如果已经有用户信息，直接返回
      if (this.isLogin && Object.keys(this.userInfo).length > 0) {
        console.log('已有用户信息，直接返回')
        return Promise.resolve(this.userInfo)
      }
      
      // 如果没有token，则不发送请求
      if (!this.token) {
        console.log('没有token，不发送请求')
        return Promise.reject({ code: 401, message: '未登录' })
      }
      
      try {
        console.log('发送获取用户信息请求')
        const res = await getUserInfo()
        if (res.code === 200) {
          this.userInfo = res.data
          this.isLogin = true
          localStorage.setItem('userInfo', JSON.stringify(res.data))
          return Promise.resolve(res.data)
        } else {
          // 如果返回401，清除登录状态
          if (res.code === 401) {
            console.log('获取用户信息返回401，清除登录状态')
            this.logout()
          }
          return Promise.reject(res)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return Promise.reject(error)
      }
    },
    
    // 更新用户信息
    async updateUserInfo(userData) {
      try {
        console.log('开始更新用户信息，当前token:', this.token)
        const res = await updateUserInfo(userData)
        if (res.code === 200) {
          // 更新本地存储的用户信息
          this.userInfo = res.data
          localStorage.setItem('userInfo', JSON.stringify(res.data))
          return Promise.resolve(res.data)
        } else {
          // 如果不是401错误，不要清除登录状态
          if (res.code !== 401) {
            return Promise.reject(res)
          } else {
            console.log('更新用户信息返回401，清除登录状态')
            this.logout()
            return Promise.reject(res)
          }
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        // 如果不是401错误，不要清除登录状态
        if (error.code !== 401) {
          return Promise.reject(error)
        } else {
          console.log('更新用户信息失败返回401，清除登录状态')
          this.logout()
          return Promise.reject(error)
        }
      }
    },
    
    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = {}
      this.isLogin = false
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      // 跳转到登录页
      router.push('/login')
    },
    
    // 检查登录状态
    checkLogin() {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')
      
      if (token && userInfo) {
        this.token = token
        this.userInfo = JSON.parse(userInfo)
        this.isLogin = true
        return true
      }
      
      return false
    }
  }
}) 