<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2>我的购物车</h2>
    </div>
    
    <div v-if="cartStore.cartList.length > 0" class="cart-content">
      <el-table
        ref="cartTable"
        :data="cartStore.cartList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="商品信息" min-width="400">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.imgUrl" :preview-src-list="[row.imgUrl]" class="product-image" />
              <div class="product-meta">
                <div class="product-title">{{ row.title }}</div>
                <div class="product-specs" v-if="row.specs">规格: {{ row.specs }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="单价" prop="price" width="120">
          <template #default="{ row }">
            <div class="product-price">¥{{ row.price.toFixed(2) }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="数量" width="200">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.count" 
              :min="1" 
              :max="row.stock" 
              size="small"
              @change="(value) => handleQuantityChange(row.id, value)" 
            />
          </template>
        </el-table-column>
        
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            <div class="product-subtotal">¥{{ (row.price * row.count).toFixed(2) }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" text @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="cart-footer">
        <div class="cart-actions">
          <!-- 功能在前端模拟中无法完成操作 -->
          <!-- <el-button @click="handleSelectAll(true)" size="small">全选</el-button>
          <el-button @click="handleSelectAll(false)" size="small">取消全选</el-button> -->
          <el-button type="danger" @click="handleBatchDelete" size="small">批量删除</el-button>
          <el-button @click="handleClearCart" size="small">清空购物车</el-button>
        </div>
        
        <div class="cart-checkout">
          <div class="checkout-info">
            <div class="selected-count">已选择 <span>{{ selectedCount }}</span> 件商品</div>
            <div class="total-price">
              合计: <span>¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
          <el-button type="primary" size="large" @click="handleCheckout" :disabled="selectedCount === 0">
            去结算
          </el-button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-cart">
      <el-empty description="购物车空空如也">
        <el-button type="primary" @click="$router.push('/')">去购物</el-button>
      </el-empty>
    </div>
    
    <div class="recommend-products" v-if="recommendProducts.length > 0">
      <div class="section-header">
        <h3>为您推荐</h3>
      </div>
      
      <div class="product-list">
        <product-card 
          v-for="(product, index) in recommendProducts" 
          :key="index" 
          :product="product" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRecommendProducts } from '../../api/product'
import ProductCard from '../../components/ProductCard.vue'

const router = useRouter()
const cartStore = useCartStore()

const selectedRows = ref([])
const recommendProducts = ref([])

// 已选商品数量
const selectedCount = computed(() => {
  return selectedRows.value.length
})

// 已选商品总价
const totalPrice = computed(() => {
  return selectedRows.value.reduce((total, item) => {
    return total + item.price * item.count
  }, 0)
})

// 表格选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 修改商品数量
const handleQuantityChange = async (id, count) => {
  try {
    await cartStore.updateCartItem(id, count)
    ElMessage.success('更新成功')
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 删除商品
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要从购物车中删除该商品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(
    async () => {
    try {
      await cartStore.removeFromCart(id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
  // async () => {
  //   try {
  //     await cartStore.removeFromCart(id)
  //     ElMessage.success('删除成功')
  //   } catch (error) {
  //     ElMessage.error('删除失败')
  //   }
  // }
}


// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择商品')
    return
  }
  
  ElMessageBox.confirm(`确定要删除已选择的${selectedRows.value.length}件商品吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const promises = selectedRows.value.map(item => cartStore.removeFromCart(item.id))
      await Promise.all(promises)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 全选/取消全选
const cartTableRef = ref(null)
const handleSelectAll = (isSelect) => {
  if (cartTableRef.value) {
    cartStore.cartList.forEach(row => {
      cartTableRef.value.toggleRowSelection(row, isSelect)
    })
  }
}

// 清空购物车
const handleClearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await cartStore.clearCart()
      ElMessage.success('清空成功')
    } catch (error) {
      ElMessage.error('清空失败')
    }
  }).catch(() => {})
}

// 结算
const handleCheckout = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择商品')
    return
  }
  
  // 跳转到订单确认页面
  router.push({
    path: '/order/confirm',
    query: {
      from: 'cart',
      ids: selectedRows.value.map(item => item.id).join(',')
    }
  })
}

// 获取推荐商品
const fetchRecommendProducts = async () => {
  try {
    const res = await getRecommendProducts({
      page: 1,
      pageSize: 4
    })
    
    if (res.code === 200) {
      recommendProducts.value = res.data.list
    }
  } catch (error) {
    console.error('获取推荐商品失败:', error)
  }
}

onMounted(async () => {
  // 获取购物车列表
  await cartStore.getCart()
  
  // 获取推荐商品
  fetchRecommendProducts()
})
</script>

<style scoped>
.cart-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 20px;
}

.cart-header {
  margin-bottom: 20px;
}

.cart-header h2 {
  font-size: 24px;
  color: #333;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
}

.product-meta {
  flex: 1;
}

.product-title {
  margin-bottom: 5px;
  color: #333;
}

.product-specs {
  font-size: 12px;
  color: #999;
}

.product-price,
.product-subtotal {
  font-weight: bold;
  color: #f56c6c;
}

.cart-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.cart-actions {
  display: flex;
  gap: 10px;
}

.cart-checkout {
  display: flex;
  align-items: center;
}

.checkout-info {
  margin-right: 20px;
}

.selected-count {
  margin-bottom: 5px;
}

.selected-count span {
  color: #f56c6c;
  font-weight: bold;
}

.total-price {
  font-size: 18px;
}

.total-price span {
  color: #f56c6c;
  font-weight: bold;
  font-size: 24px;
}

.empty-cart {
  padding: 60px 0;
  text-align: center;
}

.recommend-products {
  margin-top: 40px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 20px;
  color: #333;
  position: relative;
  padding-left: 15px;
}

.section-header h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: #409EFF;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1400px) {
  .cart-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .cart-container {
    max-width: calc(100% - 100px);
  }
  
  .product-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .cart-container {
    max-width: calc(100% - 40px);
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 20px;
  }
  
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 