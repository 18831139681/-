import { get, post } from '../utils/request'

// 用户登录
export function login(data) {
  return post('/user/login', data)
}

// 用户注册
export function register(data) {
  return post('/user/register', data)
}

// 获取用户信息
export function getUserInfo() {
  return get('/user/info')
}

// 更新用户信息
export function updateUserInfo(data) {
  return post('/user/update', data)
}

// 上传头像
export function uploadAvatar(data) {
  return post('/user/avatar', data)
}

// 修改密码
export function changePassword(data) {
  return post('/user/password', data)
}

// 第三方登录 - 微信
export function wechatLogin(code) {
  return post('/user/wechat/login', { code })
}

// 第三方登录 - QQ
export function qqLogin(code) {
  return post('/user/qq/login', { code })
} 