import { get, post } from '../utils/request'

// 获取产品列表
export function getProductList(params) {
  return get('/product/list', params)
}

// 获取产品详情
export function getProductDetail(id) {
  return get(`/product/detail/${id}`)
}

// 获取产品分类
export function getProductCategories() {
  return get('/product/categories')
}

// 获取热门产品
export function getHotProducts() {
  return get('/product/hot')
}

// 获取推荐产品
export function getRecommendProducts() {
  return get('/product/recommend')
}

// 获取新品上架
export function getNewProducts() {
  return get('/product/new')
}

// 搜索产品
export function searchProducts(params) {
  return get('/product/search', params)
} 
 