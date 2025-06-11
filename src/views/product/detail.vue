<template>
  <div class="product-detail-container" v-loading="loading">
    <div v-if="product" class="product-detail">
      <div class="product-gallery">
        <el-carousel :interval="4000" type="card" height="400px">
          <el-carousel-item v-for="(img, index) in product.images" :key="index">
            <el-image :src="img" fit="contain" :preview-src-list="product.images" />
          </el-carousel-item>
        </el-carousel>
      </div>
      
      <div class="product-info">
        <h1 class="product-title">{{ product.title }}</h1>
        <div class="product-desc">{{ product.description }}</div>
        
        <div class="product-price-info">
          <div class="price-box">
            <span class="price">¥{{ product.price.toFixed(2) }}</span>
            <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
            <span v-if="product.discount" class="discount-tag">{{ product.discount }}折</span>
          </div>
          <div class="sales-info">销量: {{ product.sales }}</div>
        </div>
        
        <div class="product-specs">
          <div v-for="(spec, index) in product.specs" :key="index" class="spec-item">
            <div class="spec-name">{{ spec.name }}:</div>
            <div class="spec-values">
              <el-radio-group v-model="selectedSpecs[spec.name]">
                <el-radio v-for="(value, i) in spec.values" :key="i" :label="value">{{ value }}</el-radio>
              </el-radio-group>
            </div>
          </div>
          
          <div class="quantity-selector">
            <div class="spec-name">数量:</div>
            <el-input-number v-model="quantity" :min="1" :max="product.stock" size="small" />
            <span class="stock-info">库存: {{ product.stock }}</span>
          </div>
        </div>
        
        <div class="product-actions">
          <el-button type="primary" size="large" @click="addToCart">加入购物车</el-button>
          <el-button type="danger" size="large" @click="buyNow">立即购买</el-button>
        </div>
      </div>
    </div>
    
    <div class="product-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="商品详情" name="detail">
          <div class="product-detail-content" v-html="product?.detail"></div>
        </el-tab-pane>
        
        <el-tab-pane label="规格参数" name="specs">
          <div class="product-specs-content">
            <el-table :data="specTableData" border>
              <el-table-column prop="name" label="参数名" width="180" />
              <el-table-column prop="value" label="参数值" />
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="用户评价" name="comments">
          <div class="product-comments">
            <div v-if="product?.comments && product.comments.length > 0">
              <div v-for="(comment, index) in product.comments" :key="index" class="comment-item">
                <div class="comment-header">
                  <el-avatar :src="comment.avatar" size="small" />
                  <span class="username">{{ comment.username }}</span>
                  <el-rate v-model="comment.rate" disabled text-color="#ff9900" />
                  <span class="comment-time">{{ comment.time }}</span>
                </div>
                
                <div class="comment-content">{{ comment.content }}</div>
                
                <div v-if="comment.images && comment.images.length > 0" class="comment-images">
                  <el-image 
                    v-for="(img, i) in comment.images" 
                    :key="i" 
                    :src="img" 
                    :preview-src-list="comment.images"
                    style="width: 100px; height: 100px; margin-right: 10px;"
                  />
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无评价" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/product'
import { useCartStore } from '../../stores/cart'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const product = ref(null)
const loading = ref(true)
const quantity = ref(1)
const selectedSpecs = reactive({})
const activeTab = ref('detail')

// 获取商品详情
const fetchProductDetail = async () => {
  const productId = route.params.id
  if (!productId) {
    ElMessage.error('商品ID不存在')
    router.push('/')
    return
  }
  
  loading.value = true
  try {
    await productStore.fetchProductDetail(productId)
    product.value = productStore.currentProduct
    
    // 初始化已选规格
    if (product.value && product.value.specs) {
      product.value.specs.forEach(spec => {
        selectedSpecs[spec.name] = spec.values[0]
      })
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 规格参数表格数据
const specTableData = computed(() => {
  if (!product.value) return []
  
  const data = []
  if (product.value.specs) {
    product.value.specs.forEach(spec => {
      data.push({
        name: spec.name,
        value: spec.values.join('、')
      })
    })
  }
  
  // 添加其他参数
  data.push({ name: '商品编号', value: product.value.id })
  data.push({ name: '商品分类', value: `分类${product.value.categoryId}` })
  
  return data
})

// 添加到购物车
const addToCart = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  // 收集已选规格
  const specs = Object.values(selectedSpecs).join(',')
  
  try {
    await cartStore.addToCart({
      productId: product.value.id,
      count: quantity.value,
      specs
    })
    ElMessage.success('已添加到购物车')
  } catch (error) {
    ElMessage.error('添加购物车失败')
    console.error('添加购物车失败:', error)
  }
}

// 立即购买
const buyNow = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  // 收集已选规格
  const specs = Object.values(selectedSpecs).join(',')
  
  // 跳转到确认订单页面
  router.push({
    path: '/order/confirm',
    query: {
      productId: product.value.id,
      count: quantity.value,
      specs
    }
  })
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 20px;
}

.product-detail {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.product-gallery {
  width: 500px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.product-desc {
  color: #666;
  margin-bottom: 20px;
}

.product-price-info {
  background-color: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.price-box {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.price {
  font-size: 28px;
  color: #f56c6c;
  font-weight: bold;
  margin-right: 10px;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
  margin-right: 10px;
}

.discount-tag {
  background-color: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.sales-info {
  color: #666;
}

.product-specs {
  margin-bottom: 30px;
}

.spec-item {
  margin-bottom: 15px;
}

.spec-name {
  font-weight: bold;
  margin-bottom: 10px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stock-info {
  color: #666;
  margin-left: 10px;
}

.product-actions {
  display: flex;
  gap: 20px;
}

.product-tabs {
  margin-top: 40px;
}

.product-detail-content {
  padding: 20px 0;
}

.product-specs-content {
  padding: 20px 0;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.username {
  margin: 0 10px;
  font-weight: bold;
}

.comment-time {
  color: #999;
  margin-left: auto;
}

.comment-content {
  margin-bottom: 10px;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 1400px) {
  .product-detail-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .product-detail-container {
    max-width: calc(100% - 100px);
  }
}

@media (max-width: 768px) {
  .product-detail-container {
    max-width: calc(100% - 40px);
  }
  
  .product-detail {
    flex-direction: column;
  }
  
  .product-gallery {
    width: 100%;
  }
}
</style> 