import { get, post, put, del } from '../utils/request'

// 获取购物车列表
export function getCartList() {
  return get('/cart/list')
}

// 添加商品到购物车
export function addToCart(data) {
  return post('/cart/add', data)
}

// 更新购物车商品数量
export function updateCartItem(id, count) {
  return put('/cart/update', { id, count })
}

// 从购物车中删除商品
export function removeFromCart(id) {
  return del('/cart/remove', { id })
}

// 清空购物车
export function clearCart() {
  return del('/cart/clear')
}

// 选择或取消选择购物车商品
export function toggleSelectCartItem(id, selected) {
  return put('/cart/select', { id, selected })
}

// 全选或取消全选购物车商品
export function toggleSelectAllCartItems(selected) {
  return put('/cart/select/all', { selected })
} 