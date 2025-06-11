<template>
  <div class="order-container">
    <div class="order-header">
      <h2>我的订单</h2>
    </div>
    
    <div class="order-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部订单" name="all" />
        <el-tab-pane label="待付款" name="0">
          <template #label>
            <span>待付款</span>
            <el-badge v-if="orderStore.orderCount.waitPay > 0" :value="orderStore.orderCount.waitPay" class="order-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="待发货" name="1">
          <template #label>
            <span>待发货</span>
            <el-badge v-if="orderStore.orderCount.waitDeliver > 0" :value="orderStore.orderCount.waitDeliver" class="order-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="已发货" name="2">
          <template #label>
            <span>已发货</span>
            <el-badge v-if="orderStore.orderCount.delivered > 0" :value="orderStore.orderCount.delivered" class="order-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="待收货" name="3">
          <template #label>
            <span>待收货</span>
            <el-badge v-if="orderStore.orderCount.waitReceive > 0" :value="orderStore.orderCount.waitReceive" class="order-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="4" />
      </el-tabs>
    </div>
    
    <div class="order-search">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入订单号或商品名称"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="handleSearch"
      />
    </div>
    
    <div v-if="orderStore.orderList.length > 0" class="order-list">
      <div v-for="order in orderStore.orderList" :key="order.id" class="order-item">
        <div class="order-header-info">
          <div class="order-id">订单号: {{ order.id }}</div>
          <div class="order-time">下单时间: {{ order.createTime }}</div>
          <div class="order-status" :class="'status-' + order.status">{{ order.statusText }}</div>
        </div>
        
        <div class="order-products">
          <div v-for="(product, pIndex) in order.products" :key="pIndex" class="product-item">
            <el-image :src="product.imgUrl" :preview-src-list="[product.imgUrl]" class="product-image" />
            <div class="product-info">
              <div class="product-title">{{ product.title }}</div>
              <div class="product-specs" v-if="product.specs">规格: {{ product.specs }}</div>
              <div class="product-price-count">
                <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
                <span class="product-count">x{{ product.count }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            共 {{ getTotalCount(order.products) }} 件商品 合计: <span class="total-price">¥{{ order.totalPrice.toFixed(2) }}</span>
          </div>
          
          <div class="order-actions">
            <el-button v-if="order.status === 0" type="primary" size="small" @click="handlePay(order.id)">
              立即付款
            </el-button>
            <el-button v-if="order.status === 0" type="danger" plain size="small" @click="handleCancel(order.id)">
              取消订单
            </el-button>
            <el-button v-if="order.status === 2 || order.status === 3" type="success" size="small" @click="handleConfirmReceive(order.id)">
              确认收货
            </el-button>
            <el-button v-if="order.status === 4" type="primary" plain size="small" @click="handleReview(order.id)">
              评价
            </el-button>
            <el-button type="info" plain size="small" @click="handleViewDetail(order.id)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <div v-else class="empty-order">
      <el-empty description="暂无订单">
        <el-button type="primary" @click="$router.push('/')">去购物</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../../stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const orderStore = useOrderStore()

const activeTab = ref('all')
const searchKeyword = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取订单列表
const fetchOrderList = async () => {
  const status = activeTab.value === 'all' ? null : parseInt(activeTab.value)
  
  try {
    await orderStore.getOrderList(status)
    total.value = orderStore.orderList.length * 10 // 模拟总数，实际项目中应该从接口获取
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  }
}

// 切换标签页
const handleTabClick = () => {
  currentPage.value = 1
  fetchOrderList()
}

// 搜索订单
const handleSearch = () => {
  currentPage.value = 1
  fetchOrderList()
}

// 翻页
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchOrderList()
}

// 计算订单商品总数
const getTotalCount = (products) => {
  return products.reduce((total, product) => total + product.count, 0)
}

// 支付订单
const handlePay = async (orderId) => {
  try {
    await orderStore.payOrder(orderId)
    ElMessage.success('支付成功')
    fetchOrderList()
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

// 取消订单
const handleCancel = (orderId) => {
  ElMessageBox.confirm('确定要取消该订单吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await orderStore.cancelOrder(orderId)
      ElMessage.success('取消成功')
    } catch (error) {
      ElMessage.error('取消失败')
    }
  }).catch(() => {})
}

// 确认收货
const handleConfirmReceive = (orderId) => {
  ElMessageBox.confirm('确认已收到商品吗?', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await orderStore.confirmReceiveOrder(orderId)
      ElMessage.success('确认收货成功')
      fetchOrderList()
    } catch (error) {
      ElMessage.error('确认收货失败')
    }
  }).catch(() => {})
}

// 评价订单
const handleReview = (orderId) => {
  router.push(`/order/review/${orderId}`)
}

// 查看订单详情
const handleViewDetail = (orderId) => {
  router.push(`/order/detail/${orderId}`)
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style scoped>
.order-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 20px;
}

.order-header {
  margin-bottom: 20px;
}

.order-header h2 {
  font-size: 24px;
  color: #333;
}

.order-search {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.order-badge {
  margin-top: -2px;
  margin-left: 5px;
}

.order-list {
  margin-top: 20px;
}

.order-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.order-header-info {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: bold;
  margin-right: 20px;
}

.order-time {
  color: #666;
  margin-right: auto;
}

.order-status {
  font-weight: bold;
}

.status-0 {
  color: #e6a23c;
}

.status-1 {
  color: #409eff;
}

.status-2, .status-3 {
  color: #67c23a;
}

.status-4 {
  color: #909399;
}

.order-products {
  padding: 20px;
}

.product-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.product-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.product-title {
  margin-bottom: 5px;
  color: #333;
  text-align: left;
}

.product-specs {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
  text-align: left;
}

.product-price-count {
  margin-top: auto;
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
  margin-right: 15px;
}

.product-count {
  color: #666;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
}

.total-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 30px;
  text-align: center;
}

.empty-order {
  padding: 60px 0;
  text-align: center;
}

@media (max-width: 1400px) {
  .order-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .order-container {
    max-width: calc(100% - 100px);
  }
}

@media (max-width: 768px) {
  .order-container {
    max-width: calc(100% - 40px);
  }
  
  .order-search {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .order-header-info,
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 