import { get, post, put, del } from '../utils/request'

// 获取订单列表
export function getOrderList(params) {
  // 确保params是对象类型
  const queryParams = typeof params === 'number' || params === null 
    ? { status: params } 
    : params || {}
  
  console.log('订单列表API调用参数:', queryParams)
  return get('/order/list', queryParams)
}

// 获取订单详情
export function getOrderDetail(id) {
  return get(`/order/detail/${id}`)
}

// 创建订单
export function createOrder(data) {
  return post('/order/create', data)
}

// 支付订单
export function payOrder(id) {
  return put(`/order/pay/${id}`)
}

// 取消订单
export function cancelOrder(id) {
  return put(`/order/cancel/${id}`)
}

// 确认收货
export function confirmReceive(id) {
  return put(`/order/receive/${id}`)
}

// 发货订单（管理员接口）
export function deliverOrder(id) {
  return put(`/order/deliver/${id}`)
}

// 将已发货订单改为待收货
export function toReceiveOrder(id) {
  return put(`/order/to-receive/${id}`)
}

// 评价订单
export function reviewOrder(id, data) {
  return post(`/order/review/${id}`, data)
}

// 申请退款
export function refundOrder(data) {
  return post('/order/refund', data)
} 