<template>
  <div class="order-confirm-container">
    <div class="order-confirm-header">
      <h2>确认订单</h2>
    </div>
    
    <div class="order-confirm-content">
      <!-- 收货地址 -->
      <div class="address-section">
        <h3 class="section-title">收货地址</h3>
        <div v-if="selectedAddress" class="selected-address">
          <div class="address-info">
            <div class="address-name-phone">
              <span class="address-name">{{ selectedAddress.name }}</span>
              <span class="address-phone">{{ selectedAddress.phone }}</span>
              <el-tag v-if="selectedAddress.isDefault" size="small" type="success">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}
            </div>
          </div>
          <el-button link type="primary" @click="showAddressDialog">修改</el-button>
        </div>
        <div v-else class="no-address">
          <el-empty description="暂无收货地址">
            <el-button type="primary" @click="showAddressDialog">添加收货地址</el-button>
          </el-empty>
        </div>
      </div>
      
      <!-- 商品信息 -->
      <div class="products-section">
        <h3 class="section-title">商品信息</h3>
        <el-table :data="orderProducts" style="width: 100%">
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
      
      <!-- 配送方式 -->
      <div class="delivery-section">
        <h3 class="section-title">配送方式</h3>
        <el-radio-group v-model="deliveryType">
          <el-radio :label="1">普通快递</el-radio>
          <el-radio :label="2">顺丰速运</el-radio>
          <el-radio :label="3">EMS</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 支付方式 -->
      <div class="payment-section">
        <h3 class="section-title">支付方式</h3>
        <el-radio-group v-model="paymentType">
          <el-radio :label="1">微信支付</el-radio>
          <el-radio :label="2">支付宝</el-radio>
          <el-radio :label="3">银联支付</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 订单备注 -->
      <div class="remark-section">
        <h3 class="section-title">订单备注</h3>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="请输入订单备注（选填）"
          maxlength="200"
          show-word-limit
        />
      </div>
      
      <!-- 订单金额 -->
      <div class="amount-section">
        <div class="amount-item">
          <span class="amount-label">商品金额：</span>
          <span class="amount-value">¥{{ getProductTotal().toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span class="amount-label">运费：</span>
          <span class="amount-value">¥{{ getDeliveryFee().toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span class="amount-label">优惠金额：</span>
          <span class="amount-value">-¥{{ getDiscountAmount().toFixed(2) }}</span>
        </div>
        <div class="amount-item total">
          <span class="amount-label">实付金额：</span>
          <span class="amount-value highlight">¥{{ getTotalAmount().toFixed(2) }}</span>
        </div>
      </div>
      
      <!-- 提交订单 -->
      <div class="submit-section">
        <div class="submit-info">
          共 <span class="highlight">{{ getTotalCount() }}</span> 件商品，
          合计：<span class="highlight">¥{{ getTotalAmount().toFixed(2) }}</span>
        </div>
        <el-button type="primary" size="large" @click="submitOrder" :loading="loading" :disabled="!selectedAddress">提交订单</el-button>
      </div>
    </div>
    
    <!-- 收货地址选择对话框 -->
    <el-dialog v-model="addressDialogVisible" title="选择收货地址" width="600px">
      <div class="address-list">
        <el-empty v-if="addressList.length === 0" description="暂无收货地址">
          <el-button type="primary" @click="showAddAddressDialog">添加收货地址</el-button>
        </el-empty>
        
        <el-radio-group v-model="selectedAddressId" v-else>
          <div v-for="address in addressList" :key="address.id" class="address-item">
            <el-radio :label="address.id">
              <div class="address-info">
                <div class="address-name-phone">
                  <span class="address-name">{{ address.name }}</span>
                  <span class="address-phone">{{ address.phone }}</span>
                  <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
                </div>
                <div class="address-detail">
                  {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
                </div>
              </div>
            </el-radio>
            <div class="address-actions">
              <el-button type="primary" link @click="editAddress(address)">编辑</el-button>
              <el-button type="danger" link @click="deleteAddress(address)">删除</el-button>
            </div>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelectAddress">确定</el-button>
          <el-button type="success" @click="showAddAddressDialog">添加新地址</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 添加/编辑地址对话框 -->
    <el-dialog v-model="addAddressDialogVisible" :title="isEditingAddress ? '编辑收货地址' : '添加收货地址'" width="500px">
      <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            placeholder="请选择所在地区"
          />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="addressForm.detail" placeholder="请输入详细地址" />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认收货地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addAddressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAddress" :loading="loading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../../stores/cart'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'
import { useProductStore } from '../../stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const productStore = useProductStore()

const loading = ref(false)
const orderProducts = ref([])
const deliveryType = ref(1)
const paymentType = ref(1)
const remark = ref('')

// 收货地址相关
const addressList = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: 'XX路XX号XX小区XX栋XX单元XX号',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: 'XX路XX号XX小区XX栋XX单元XX号',
    isDefault: false
  }
])
const selectedAddressId = ref(null)
const addressDialogVisible = ref(false)
const addAddressDialogVisible = ref(false)
const isEditingAddress = ref(false)

// 地址表单
const addressFormRef = ref(null)
const addressForm = reactive({
  id: null,
  name: '',
  phone: '',
  region: [],
  detail: '',
  isDefault: false
})

// 地址表单验证规则
const addressRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

// 地区选项（示例数据）
const regionOptions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '浦东新区', label: '浦东新区' },
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' }
        ]
      }
    ]
  }
]

// 计算当前选中的地址
const selectedAddress = computed(() => {
  return addressList.value.find(address => address.id === selectedAddressId.value)
})

// 初始化订单数据
const initOrderData = async () => {
  const { from, productId, count, specs, ids } = route.query
  
  if (from === 'cart' && ids) {
    // 从购物车结算
    const idList = ids.split(',').map(id => parseInt(id))
    await cartStore.getCart()
    orderProducts.value = cartStore.cartList.filter(item => idList.includes(item.id))
  } else if (productId) {
    // 直接购买
    try {
      // 获取商品详情以获取准确的价格
      await productStore.fetchProductDetail(productId)
      const productDetail = productStore.currentProduct
      
      if (productDetail) {
        orderProducts.value = [
          {
            id: parseInt(productId),
            title: productDetail.title,
            price: productDetail.price, // 使用从API获取的准确价格
            count: parseInt(count) || 1,
            imgUrl: productDetail.imgUrl,
            specs: specs || '默认规格'
          }
        ]
      } else {
        throw new Error('获取商品详情失败')
      }
    } catch (error) {
      console.error('获取商品详情失败:', error)
      ElMessage.error('获取商品详情失败')
      router.push('/')
    }
  } else {
    ElMessage.error('参数错误')
    router.push('/')
  }
  
  // 设置默认收货地址
  const defaultAddress = addressList.value.find(address => address.isDefault)
  if (defaultAddress) {
    selectedAddressId.value = defaultAddress.id
  } else if (addressList.value.length > 0) {
    selectedAddressId.value = addressList.value[0].id
  }
}

// 计算商品总数量
const getTotalCount = () => {
  return orderProducts.value.reduce((total, product) => {
    return total + product.count
  }, 0)
}

// 计算商品总金额
const getProductTotal = () => {
  return orderProducts.value.reduce((total, product) => {
    return total + product.price * product.count
  }, 0)
}

// 计算运费
const getDeliveryFee = () => {
  // 这里根据配送方式计算运费
  if (deliveryType.value === 1) return 0
  if (deliveryType.value === 2) return 10
  if (deliveryType.value === 3) return 15
  return 0
}

// 计算优惠金额（示例）
const getDiscountAmount = () => {
  // 这里只是一个示例，实际项目中应该根据订单数据计算
  return 0
}

// 计算订单总金额
const getTotalAmount = () => {
  return getProductTotal() + getDeliveryFee() - getDiscountAmount()
}

// 显示地址选择对话框
const showAddressDialog = () => {
  addressDialogVisible.value = true
}

// 确认选择地址
const confirmSelectAddress = () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  addressDialogVisible.value = false
}

// 显示添加地址对话框
const showAddAddressDialog = () => {
  isEditingAddress.value = false
  addressForm.id = null
  addressForm.name = ''
  addressForm.phone = ''
  addressForm.region = []
  addressForm.detail = ''
  addressForm.isDefault = false
  
  addAddressDialogVisible.value = true
  addressDialogVisible.value = false
}

// 编辑地址
const editAddress = (address) => {
  isEditingAddress.value = true
  addressForm.id = address.id
  addressForm.name = address.name
  addressForm.phone = address.phone
  addressForm.region = [address.province, address.city, address.district]
  addressForm.detail = address.detail
  addressForm.isDefault = address.isDefault
  
  addAddressDialogVisible.value = true
}

// 删除地址
const deleteAddress = (address) => {
  ElMessageBox.confirm('确定要删除该收货地址吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用API删除地址，但为了简化，我们直接修改本地数据
    addressList.value = addressList.value.filter(item => item.id !== address.id)
    ElMessage.success('删除成功')
    
    // 如果删除的是当前选中的地址，重新选择一个地址
    if (selectedAddressId.value === address.id) {
      const defaultAddress = addressList.value.find(addr => addr.isDefault)
      if (defaultAddress) {
        selectedAddressId.value = defaultAddress.id
      } else if (addressList.value.length > 0) {
        selectedAddressId.value = addressList.value[0].id
      } else {
        selectedAddressId.value = null
      }
    }
  }).catch(() => {})
}

// 保存地址
const saveAddress = () => {
  addressFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 这里应该调用API保存地址，但为了简化，我们直接修改本地数据
        const [province, city, district] = addressForm.region
        
        if (isEditingAddress.value) {
          // 更新地址
          const index = addressList.value.findIndex(item => item.id === addressForm.id)
          if (index !== -1) {
            addressList.value[index] = {
              ...addressList.value[index],
              name: addressForm.name,
              phone: addressForm.phone,
              province,
              city,
              district,
              detail: addressForm.detail,
              isDefault: addressForm.isDefault
            }
            
            // 如果设为默认地址，更新其他地址
            if (addressForm.isDefault) {
              addressList.value.forEach((item, i) => {
                if (i !== index) {
                  item.isDefault = false
                }
              })
            }
          }
        } else {
          // 添加地址
          const newAddress = {
            id: Date.now(), // 模拟ID生成
            name: addressForm.name,
            phone: addressForm.phone,
            province,
            city,
            district,
            detail: addressForm.detail,
            isDefault: addressForm.isDefault
          }
          
          addressList.value.push(newAddress)
          selectedAddressId.value = newAddress.id
          
          // 如果设为默认地址，更新其他地址
          if (addressForm.isDefault) {
            addressList.value.forEach(item => {
              if (item.id !== newAddress.id) {
                item.isDefault = false
              }
            })
          }
        }
        
        ElMessage.success(isEditingAddress.value ? '更新成功' : '添加成功')
        addAddressDialogVisible.value = false
      } catch (error) {
        ElMessage.error(isEditingAddress.value ? '更新失败' : '添加失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  loading.value = true
  
  try {
    // 准备订单数据
    const orderData = {
      products: orderProducts.value.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        count: product.count,
        imgUrl: product.imgUrl,
        specs: product.specs
      })),
      address: selectedAddress.value,
      deliveryType: deliveryType.value,
      paymentType: paymentType.value,
      remark: remark.value
    }
    
    // 创建订单
    const orderResult = await orderStore.createOrder(orderData)
    ElMessage.success('订单创建成功')
    
    // 跳转到订单详情页面
    router.push({
      path: `/order/detail/${orderResult.id}`
    })
  } catch (error) {
    ElMessage.error('订单创建失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 检查用户是否已登录
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  initOrderData()
})
</script>

<style scoped>
.order-confirm-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.order-confirm-header {
  margin-bottom: 20px;
}

.order-confirm-header h2 {
  font-size: 24px;
  color: #333;
}

.order-confirm-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.address-section,
.products-section,
.delivery-section,
.payment-section,
.remark-section,
.amount-section {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.selected-address {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.address-name-phone {
  margin-bottom: 5px;
}

.address-name {
  font-weight: bold;
  margin-right: 10px;
}

.address-phone {
  color: #666;
}

.address-detail {
  color: #666;
}

.no-address {
  padding: 30px 0;
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

.amount-section {
  border-bottom: none;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-right: 50px;
  text-align: right;
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

.highlight {
  color: #f56c6c;
  font-weight: bold;
}

.submit-section {
  background-color: #f5f5f5;
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.submit-info {
  margin-right: 20px;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 15px;
}

.address-item .el-radio {
  margin-right: 0;
  width: 100%;
}

.address-item .address-info {
  margin-left: 30px;
}

.address-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .submit-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .submit-info {
    margin-right: 0;
  }
  
  .amount-item {
    padding-right: 0;
  }
}
</style> 