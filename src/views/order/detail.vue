<template>
  <div class="order-detail-container">
    <div class="order-detail-header">
      <h2>订单详情</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <div v-if="order" class="order-detail-content">
      <!-- 订单状态 -->
      <div class="order-status-section">
        <div class="order-status-info">
          <div class="order-status" :class="'status-' + order.status">{{ order.statusText }}</div>
          <div class="order-status-desc">
            <template v-if="order.status === 0">
              请在 <span class="highlight">24小时</span> 内完成支付，超时订单将自动取消
            </template>
            <template v-else-if="order.status === 1">
              商家正在备货中，请耐心等待
            </template>
            <template v-else-if="order.status === 2">
              商品已发货，正在运输中
              <span v-if="estimatedDeliveryTime" class="highlight">
                预计送达时间: {{ estimatedDeliveryTime }}
              </span>
            </template>
            <template v-else-if="order.status === 3">
              商品已送达，请确认收货
            </template>
            <template v-else-if="order.status === 4">
              订单已完成，感谢您的购买
            </template>
          </div>
        </div>

        <div class="order-timeline">
          <el-steps :active="getStepActive()" finish-status="success" align-center>
            <el-step title="提交订单" :description="order.createTime" />
            <el-step title="付款成功" :description="order.payTime || '-'" />
            <el-step title="商品发货" :description="order.deliveryTime || '-'" />
            <el-step title="确认收货" :description="order.receiveTime || '-'" />
          </el-steps>
        </div>
      </div>

      <!-- 物流地图 -->
      <div v-if="order.status === 2 || order.status === 3" class="order-section">
        <h3 class="section-title">物流跟踪</h3>
        <div class="logistics-map">
          <div id="logistics-container" style="height: 400px;"></div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="order-section">
        <h3 class="section-title">收货信息</h3>
        <div class="address-info">
          <div class="address-name-phone">
            <span class="address-name">{{ order.address.name }}</span>
            <span class="address-phone">{{ order.address.phone }}</span>
          </div>
          <div class="address-detail">
            {{ order.address.province }} {{ order.address.city }} {{ order.address.district }} {{ order.address.detail
            }}
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-section">
        <h3 class="section-title">订单信息</h3>
        <div class="order-info">
          <div class="info-item">
            <span class="info-label">订单编号：</span>
            <span class="info-value">{{ order.id }}</span>
            <el-button link type="primary" @click="copyOrderId">复制</el-button>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ order.createTime }}</span>
          </div>
          <div class="info-item" v-if="order.payTime">
            <span class="info-label">付款时间：</span>
            <span class="info-value">{{ order.payTime }}</span>
          </div>
          <div class="info-item" v-if="order.deliveryTime">
            <span class="info-label">发货时间：</span>
            <span class="info-value">{{ order.deliveryTime }}</span>
          </div>
          <div class="info-item" v-if="order.receiveTime">
            <span class="info-label">收货时间：</span>
            <span class="info-value">{{ order.receiveTime }}</span>
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="order-section">
        <h3 class="section-title">商品信息</h3>
        <el-table :data="order.products" style="width: 100%">
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

          <el-table-column label="数量" prop="count" width="80" />

          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <div class="product-subtotal">¥{{ (row.price * row.count).toFixed(2) }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 订单金额 -->
      <div class="order-section">
        <h3 class="section-title">订单金额</h3>
        <div class="order-amount">
          <div class="amount-item">
            <span class="amount-label">商品金额：</span>
            <span class="amount-value">¥{{ getProductTotal().toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span class="amount-label">运费：</span>
            <span class="amount-value">¥0.00</span>
          </div>
          <div class="amount-item">
            <span class="amount-label">优惠金额：</span>
            <span class="amount-value">-¥{{ getDiscountAmount().toFixed(2) }}</span>
          </div>
          <div class="amount-item total">
            <span class="amount-label">实付金额：</span>
            <span class="amount-value highlight">¥{{ order.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 订单操作 -->
      <div class="order-actions">
        <el-button v-if="order.status === 0" type="primary" @click="handlePay">立即付款</el-button>
        <el-button v-if="order.status === 0" type="danger" plain @click="handleCancel">取消订单</el-button>
        <el-button v-if="order.status === 2 || order.status === 3" type="success" @click="handleConfirmReceive">确认收货</el-button>
        <el-button v-if="order.status === 4" type="primary" plain @click="handleReview">评价</el-button>
        <el-button v-if="order.status === 4" type="warning" plain @click="handleBuyAgain">再次购买</el-button>
      </div>
    </div>

    <div v-else-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="empty-order">
      <el-empty description="订单不存在或已被删除">
        <el-button type="primary" @click="$router.push('/order')">返回订单列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '../../stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { payOrder, cancelOrder, confirmReceive } from '../../api/order'
import AMapLoader from '@amap/amap-jsapi-loader'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const order = ref(null)
const loading = ref(true)
const mapInstance = ref(null)
const marker = ref(null)
const logisticsPosition = ref(null)
const estimatedDeliveryTime = ref(null)
const estimatedArrivalTime = ref(null)

// 云南省各地级市坐标
const yunnanCities = [
  { name: '昆明市', position: [102.832891, 24.880095] },
  { name: '大理市', position: [100.225668, 25.589449] },
  { name: '丽江市', position: [100.233026, 26.872108] },
  { name: '西双版纳', position: [100.797941, 22.001724] },
  { name: '曲靖市', position: [103.797851, 25.501557] },
  { name: '保山市', position: [99.161761, 25.112046] },
  { name: '玉溪市', position: [102.543907, 24.350461] },
  { name: '楚雄市', position: [101.546046, 25.041988] },
  { name: '红河州', position: [103.384182, 23.366775] },
  { name: '文山州', position: [104.24401, 23.36951] },
  { name: '普洱市', position: [100.972344, 22.777321] },
  { name: '德宏州', position: [98.578363, 24.436694] },
  { name: '怒江州', position: [98.854304, 25.850949] },
  { name: '迪庆州', position: [99.706463, 27.826853] },
  { name: '临沧市', position: [100.08697, 23.886567] },
  { name: '昭通市', position: [103.717216, 27.33817] }
]

// 监听当前订单变化
watch(() => orderStore.currentOrder, (newOrder) => {
  if (newOrder && order.value && newOrder.id === order.value.id) {
    order.value = newOrder
    
    // 如果订单状态为已发货或待收货，初始化物流地图
    if (newOrder.status === 2 || newOrder.status === 3) {
      initLogisticsMap()
    }
  }
}, { deep: true })

// 获取订单详情
const fetchOrderDetail = async () => {
  const orderId = route.params.id
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    router.push('/order')
    return
  }
  
  loading.value = true
  try {
    await orderStore.getOrderDetail(orderId)
    order.value = orderStore.currentOrder
    
    // 如果订单状态为已发货或待收货，初始化物流地图
    if (order.value && (order.value.status === 2 || order.value.status === 3)) {
      initLogisticsMap()
    }
  } catch (error) {
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 初始化物流地图
const initLogisticsMap = () => {
  if (!order.value || !order.value.deliveryTime) return

  // 生成随机物流位置（云南省内某城市）
  const randomCityIndex = Math.floor(Math.random() * yunnanCities.length)
  logisticsPosition.value = yunnanCities[randomCityIndex]

  // 计算预计到达时间（发货时间后的2天）
  const deliveryDate = new Date(order.value.deliveryTime)
  const arrivalDate = new Date(deliveryDate.getTime() + 2 * 24 * 60 * 60 * 1000)
  
  // 根据订单状态设置不同的时间
  if (order.value.status === 2) {
    // 已发货状态，显示预计送达时间
    estimatedDeliveryTime.value = arrivalDate.toLocaleString()
  } else if (order.value.status === 3) {
    // 待收货状态，显示已送达时间
    estimatedArrivalTime.value = new Date().toLocaleString()
  }

  // 延迟加载地图，确保DOM已经渲染
  setTimeout(() => {
    loadAMap()
  }, 500)
}

// 加载高德地图
const loadAMap = () => {
  // 确保地图容器已存在
  const container = document.getElementById('logistics-container')
  if (!container) return

  // 加载高德地图API
  AMapLoader.load({
    key: import.meta.env.VITE_AMAP_API_KEY, // 高德地图API密钥
    version: '2.0',
    plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.HawkEye', 'AMap.MapType', 'AMap.Geolocation']
  }).then((AMap) => {
    // 创建地图实例
    mapInstance.value = new AMap.Map('logistics-container', {
      zoom: 7,
      center: logisticsPosition.value.position,
      viewMode: '2D',
      showIndoorMap: false, // 不显示室内地图
      showBuildingBlock: false, // 不显示3D楼块
      showLabel: true, // 显示地图标注
      features: ['bg', 'road', 'building', 'point'], // 添加默认显示的要素，包括路网
      mapStyle: 'amap://styles/normal' // 使用标准地图样式
    })

    // 添加控件
    mapInstance.value.addControl(new AMap.ToolBar())
    mapInstance.value.addControl(new AMap.Scale())
    mapInstance.value.addControl(new AMap.MapType())
    
    // 路网图层
    const roadNet = new AMap.TileLayer.RoadNet({
      zIndex: 10,
      opacity: 1
    })
    mapInstance.value.add(roadNet)
    
    // 实时交通图层，不用这个，难看
    // const trafficLayer = new AMap.TileLayer.Traffic({
    //   zIndex: 10,
    //   opacity: 0.8,
    //   autoRefresh: true, // 自动刷新
    //   interval: 180 // 刷新间隔，单位：秒
    // })
    // mapInstance.value.add(trafficLayer)

    // 自定义物流车图标
    const icon = new AMap.Icon({
      size: new AMap.Size(40, 40),    // 图标尺寸
      image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',  // 图标的取图地址
      imageSize: new AMap.Size(40, 40),   // 图标所用图片大小
      imageOffset: new AMap.Pixel(0, 0)   // 图标取图偏移量
    });
    
    // 添加标记点
    marker.value = new AMap.Marker({
      position: logisticsPosition.value.position,
      title: '当前物流位置: ' + logisticsPosition.value.name,
      icon: icon,  // 使用自定义图标
      animation: 'AMAP_ANIMATION_BOUNCE',
      offset: new AMap.Pixel(0, 0), // 设置标记点偏移量
      anchor: 'bottom-center' // 设置锚点为底部中心
    })

    // 将标记点添加到地图
    mapInstance.value.add(marker.value)

    // 添加信息窗体
    const infoWindow = new AMap.InfoWindow({
      content: `
        <div style="padding:10px;">
          <h4>物流信息</h4>
          <p>当前位置: ${logisticsPosition.value.name}</p>
          <p>预计送达: ${estimatedArrivalTime.value}</p>
        </div>
      `,
      offset: new AMap.Pixel(0, -40), // 调整信息窗体的偏移量
      autoMove: true, // 自动调整窗体到视野内
      closeWhenClickMap: true // 点击地图关闭信息窗体
    })

    // 点击标记点时打开信息窗体
    marker.value.on('click', () => {
      infoWindow.open(mapInstance.value, marker.value.getPosition())
    })

    // 默认打开信息窗体
    infoWindow.open(mapInstance.value, marker.value.getPosition())
  }).catch(e => {
    console.error('高德地图加载失败', e)
  })
}

// 清理地图资源
const cleanupMap = () => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
}

// 获取步骤条激活状态
const getStepActive = () => {
  if (!order.value) return 0

  const status = order.value.status
  if (status === 0) return 1 // 已提交订单，未付款
  if (status === 1) return 2 // 已付款，未发货
  if (status === 2 || status === 3) return 3 // 已发货或待收货
  if (status === 4) return 4 // 已完成

  return 0
}

// 计算商品总金额
const getProductTotal = () => {
  if (!order.value || !order.value.products) return 0

  return order.value.products.reduce((total, product) => {
    return total + product.price * product.count
  }, 0)
}

// 计算优惠金额（示例）
const getDiscountAmount = () => {
  const productTotal = getProductTotal()
  const actualTotal = order.value ? order.value.totalPrice : 0
  return Math.max(0, productTotal - actualTotal)
}

// 复制订单号
const copyOrderId = () => {
  if (!order.value) return

  // 创建一个临时输入框
  const input = document.createElement('input')
  input.value = order.value.id
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)

  ElMessage.success('订单号已复制')
}

// 支付订单
const handlePay = async () => {
  if (!order.value) return

  try {
    await payOrder(order.value.id)
    ElMessage.success('支付成功')
    fetchOrderDetail()
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

// 取消订单
const handleCancel = () => {
  if (!order.value) return

  ElMessageBox.confirm('确定要取消该订单吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await cancelOrder(order.value.id)
      ElMessage.success('取消成功')
      fetchOrderDetail()
    } catch (error) {
      ElMessage.error('取消失败')
    }
  }).catch(() => { })
}

// 确认收货
const handleConfirmReceive = () => {
  ElMessageBox.confirm('确认已收到商品吗?', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await orderStore.confirmReceiveOrder(order.value.id)
      ElMessage.success('确认收货成功')
    } catch (error) {
      ElMessage.error('确认收货失败')
    }
  }).catch(() => { })
}

// 评价
const handleReview = () => {
  if (!order.value) return
  router.push(`/order/review/${order.value.id}`)
}

// 再次购买
const handleBuyAgain = () => {
  if (!order.value || !order.value.products || order.value.products.length === 0) return

  // 将第一个商品添加到购物车
  const firstProduct = order.value.products[0]
  router.push(`/product/${firstProduct.id}`)
}

onMounted(() => {
  fetchOrderDetail()
})

// 组件卸载时清理地图资源
onUnmounted(() => {
  cleanupMap()
})
</script>

<style scoped>
.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.order-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-detail-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.order-detail-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-status-section {
  background-color: #f5f5f5;
  padding: 20px;
}

.order-status-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.order-status {
  font-size: 20px;
  font-weight: bold;
  margin-right: 20px;
}

.status-0 {
  color: #e6a23c;
}

.status-1 {
  color: #409eff;
}

.status-2,
.status-3 {
  color: #67c23a;
}

.status-4 {
  color: #909399;
}

.order-status-desc {
  color: #666;
}

.highlight {
  color: #f56c6c;
  font-weight: bold;
}

.order-timeline {
  margin-top: 20px;
}

.order-section {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.address-name-phone {
  margin-bottom: 10px;
}

.address-name {
  font-weight: bold;
  margin-right: 20px;
}

.address-phone {
  color: #666;
}

.address-detail {
  color: #666;
}

.order-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  color: #666;
  width: 100px;
}

.info-value {
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

.order-amount {
  max-width: 400px;
  margin-left: auto;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.amount-item.total {
  font-size: 18px;
  font-weight: bold;
  border-top: 1px solid #eee;
  padding-top: 10px;
  margin-top: 10px;
}

.amount-label {
  color: #666;
}

.order-actions {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.empty-order {
  padding: 60px 0;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .order-info {
    grid-template-columns: 1fr;
  }
}
</style>