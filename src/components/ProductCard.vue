<template>
  <div class="product-card" @click="navigateToDetail">
    <div class="product-image">
      <el-image :src="product.imgUrl" fit="cover" :preview-src-list="[product.imgUrl]">
        <template #error>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <div v-if="product.discount" class="discount-tag">{{ product.discount }}折</div>
    </div>
    
    <div class="product-info">
      <h3 class="product-title" :title="product.title">{{ product.title }}</h3>
      <p class="product-desc" :title="product.description">{{ product.description }}</p>
      
      <div class="product-price-row">
        <div class="product-price">
          <span class="price">¥{{ product.price.toFixed(2) }}</span>
          <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
        </div>
        <span class="product-sales">销量: {{ product.sales }}</span>
      </div>
      
      <div class="product-actions">
        <el-button type="primary" size="small" @click.stop="addToCart">加入购物车</el-button>
        <el-button type="danger" size="small" @click.stop="buyNow">立即购买</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// 跳转到商品详情页
const navigateToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

// 添加到购物车
const addToCart = async () => {
  // 检查是否已登录
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  try {
    await cartStore.addToCart({
      productId: props.product.id,
      count: 1
    })
    ElMessage.success('已添加到购物车')
  } catch (error) {
    ElMessage.error('添加购物车失败')
  }
}

// 立即购买
const buyNow = () => {
  // 检查是否已登录
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  // 跳转到确认订单页面
  router.push({
    path: '/order/confirm',
    query: {
      productId: props.product.id,
      count: 1
    }
  })
}
</script>

<style scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
}

.image-placeholder .el-icon {
  font-size: 32px;
  color: #909399;
}

.discount-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f56c6c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 15px;
}

.product-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  margin: 0 0 10px;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 18px;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.product-price {
  display: flex;
  align-items: center;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
  margin-right: 5px;
}

.original-price {
  font-size: 12px;
  color: #909399;
  text-decoration: line-through;
}

.product-sales {
  font-size: 12px;
  color: #909399;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.product-actions .el-button {
  flex: 1;
}
</style> 