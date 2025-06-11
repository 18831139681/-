import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // API的base_url
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 开启进度条
    NProgress.start()
    
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    // 如果有token则携带token
    if (token) {
      config.headers['Authorization'] = token
      console.log('发送请求携带token:', token)
    } else {
      console.log('发送请求无token')
    }
    
    return config
  },
  error => {
    NProgress.done()
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 关闭进度条
    NProgress.done()
    
    const res = response.data
    
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    if (res.code === 200) {
      return res
    }
    
    // 否则的话抛出错误
    ElMessage({
      message: res.message || '系统异常',
      type: 'error',
      duration: 5 * 1000
    })
    
    // 如果是401，则跳转到登录页面
    if (res.code === 401) {
      // 清除token
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      const currentPath = router.currentRoute.value.path
      if (currentPath !== '/login') {
        // 跳转到登录页面
        router.replace({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
    }
    
    return Promise.reject(res)
  },
  error => {
    // 关闭进度条
    NProgress.done()
    
    // 处理HTTP错误，并显示错误消息
    let message = '连接服务器失败'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          // 清除token
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          
          // 避免重复跳转到登录页面
          const currentPath = router.currentRoute.value.path
          if (currentPath !== '/login') {
            // 跳转到登录页面
            router.replace({
              path: '/login',
              query: { redirect: router.currentRoute.value.fullPath }
            })
          }
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误，未找到该资源'
          break
        case 500:
          message = '服务器端出错'
          break
        default:
          message = `连接错误${error.response.status}`
      }
    } else {
      message = '网络异常，请检查您的网络连接'
    }
    
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get(url, params = {}) {
  console.log(`发送GET请求: ${url}`, params)
  
  // 处理params为null的情况
  const queryParams = params === null ? {} : params
  
  return service({
    url,
    method: 'get',
    params: queryParams
  })
}

// 封装POST请求
export function post(url, data = {}) {
  return service({
    url,
    method: 'post',
    data
  })
}

// 封装PUT请求
export function put(url, data = {}) {
  return service({
    url,
    method: 'put',
    data
  })
}

// 封装DELETE请求
export function del(url, data = {}) {
  return service({
    url,
    method: 'delete',
    data
  })
}

export default service 