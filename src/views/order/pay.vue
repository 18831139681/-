<template>
  <div class="pay-container">
    <div class="pay-header">
      <h2>订单支付</h2>
    </div>
    
    <div class="pay-content">
      <div class="pay-info">
        <div class="order-info">
          <div class="order-id">订单编号：{{ orderId }}</div>
          <div class="order-amount">支付金额：<span class="amount">¥{{ amount }}</span></div>
        </div>
        
        <div class="pay-methods">
          <h3 class="section-title">支付方式</h3>
          <el-radio-group v-model="payMethod">
            <el-radio label="wechat">
              <div class="pay-method-item">
                <img src="https://via.placeholder.com/30x30?text=WX" alt="微信支付" class="pay-icon" />
                <span>微信支付</span>
              </div>
            </el-radio>
            <el-radio label="alipay">
              <div class="pay-method-item">
                <img src="https://via.placeholder.com/30x30?text=ZFB" alt="支付宝" class="pay-icon" />
                <span>支付宝</span>
              </div>
            </el-radio>
            <el-radio label="unionpay">
              <div class="pay-method-item">
                <img src="https://via.placeholder.com/30x30?text=YL" alt="银联支付" class="pay-icon" />
                <span>银联支付</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
        
        <div class="qrcode-section" v-if="showQrCode">
          <div class="qrcode-container">
            <div class="qrcode-title">
              <img :src="payMethodIcon" alt="支付图标" class="pay-icon" />
              <span>{{ payMethodName }}扫码支付</span>
            </div>
            <div class="qrcode">
              <img src="https://via.placeholder.com/200x200?text=QR+Code" alt="支付二维码" />
            </div>
            <div class="qrcode-tips">
              <p>请使用{{ payMethodName }}扫一扫</p>
              <p>扫描二维码完成支付</p>
            </div>
          </div>
          
          <div class="countdown">
            <div class="countdown-title">支付剩余时间</div>
            <div class="countdown-time">{{ formatTime(countdown) }}</div>
          </div>
        </div>
        
        <div class="pay-actions">
          <el-button type="primary" @click="handlePay" :loading="loading" :disabled="!payMethod">立即支付</el-button>
          <el-button @click="$router.push('/order')">返回订单列表</el-button>
        </div>
      </div>
      
      <div class="pay-tips">
        <h4>安全提示：</h4>
        <p>1. 请核对支付金额是否正确</p>
        <p>2. 请确保在安全网络环境下支付</p>
        <p>3. 如有问题，请联系客服：400-123-4567</p>
      </div>
    </div>
    
    <!-- 支付结果对话框 -->
    <el-dialog v-model="resultDialogVisible" :title="paySuccess ? '支付成功' : '支付失败'" width="400px">
      <div class="pay-result">
        <div class="result-icon">
          <el-icon :size="64" :color="paySuccess ? '#67C23A' : '#F56C6C'">
            <component :is="paySuccess ? 'CircleCheck' : 'CircleClose'" />
          </el-icon>
        </div>
        <div class="result-message">{{ paySuccess ? '订单支付成功' : '订单支付失败' }}</div>
        <div class="result-actions">
          <el-button v-if="paySuccess" type="primary" @click="viewOrder">查看订单</el-button>
          <el-button v-else type="primary" @click="retryPay">重新支付</el-button>
          <el-button @click="$router.push('/home')">返回首页</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const orderId = ref('')
const amount = ref(0)
const payMethod = ref('')
const loading = ref(false)
const showQrCode = ref(false)
const countdown = ref(900) // 15分钟倒计时
const countdownTimer = ref(null)
const resultDialogVisible = ref(false)
const paySuccess = ref(false)

// 支付方式图标
const payMethodIcon = computed(() => {
  if (payMethod.value === 'wechat') return 'https://via.placeholder.com/30x30?text=WX'
  if (payMethod.value === 'alipay') return 'https://via.placeholder.com/30x30?text=ZFB'
  if (payMethod.value === 'unionpay') return 'https://via.placeholder.com/30x30?text=YL'
  return ''
})

// 支付方式名称
const payMethodName = computed(() => {
  if (payMethod.value === 'wechat') return '微信'
  if (payMethod.value === 'alipay') return '支付宝'
  if (payMethod.value === 'unionpay') return '银联'
  return ''
})

// 格式化时间
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 开始倒计时
const startCountdown = () => {
  countdownTimer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value)
      ElMessage.warning('支付超时，请重新下单')
      router.push('/order')
    }
  }, 1000)
}

// 处理支付
const handlePay = () => {
  if (!payMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  loading.value = true
  showQrCode.value = true
  startCountdown()
  
  // 模拟支付过程
  setTimeout(() => {
    loading.value = false
    
    // 模拟支付成功
    if (Math.random() > 0.2) {
      paySuccess.value = true
    } else {
      paySuccess.value = false
    }
    
    resultDialogVisible.value = true
    clearInterval(countdownTimer.value)
  }, 3000)
}

// 查看订单
const viewOrder = () => {
  router.push(`/order/detail/${orderId.value}`)
}

// 重新支付
const retryPay = () => {
  resultDialogVisible.value = false
  showQrCode.value = false
  countdown.value = 900
}

onMounted(() => {
  // 获取订单信息
  const { orderId: id, amount: amt } = route.query
  if (!id || !amt) {
    ElMessage.error('订单参数错误')
    router.push('/order')
    return
  }
  
  orderId.value = id
  amount.value = parseFloat(amt)
})

onBeforeUnmount(() => {
  // 清除倒计时
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})
</script>

<style scoped>
.pay-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.pay-header {
  margin-bottom: 20px;
}

.pay-header h2 {
  font-size: 24px;
  color: #333;
}

.pay-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.order-info {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.order-id {
  font-size: 16px;
  margin-bottom: 10px;
}

.order-amount {
  font-size: 18px;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.pay-methods {
  margin-bottom: 30px;
}

.pay-method-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pay-icon {
  width: 30px;
  height: 30px;
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.qrcode-container {
  text-align: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 20px;
}

.qrcode-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.qrcode {
  margin-bottom: 20px;
}

.qrcode-tips {
  color: #666;
  line-height: 1.5;
}

.countdown {
  text-align: center;
}

.countdown-title {
  margin-bottom: 10px;
  color: #666;
}

.countdown-time {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.pay-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.pay-tips {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #999;
}

.pay-tips h4 {
  margin-bottom: 10px;
  color: #666;
}

.pay-tips p {
  line-height: 1.8;
}

.pay-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.result-icon {
  margin-bottom: 20px;
}

.result-message {
  font-size: 18px;
  margin-bottom: 30px;
}

.result-actions {
  display: flex;
  gap: 20px;
}

@media (max-width: 768px) {
  .pay-actions,
  .result-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 