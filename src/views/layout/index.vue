<template>
  <div class="layout-container">
    <header-component />
    <div class="main-container">
      <div class="content-container">
        <router-view />
      </div>
    </div>
    <footer-component />
  </div>
</template>

<script setup>
import HeaderComponent from './components/Header.vue'
import FooterComponent from './components/Footer.vue'
import { useUserStore } from '../../stores/user'
import { useOrderStore } from '../../stores/order'
import { onMounted, onUnmounted } from 'vue'

const userStore = useUserStore()
const orderStore = useOrderStore()

onMounted(async () => {
  // 如果用户已登录，获取订单列表并启动发货通知
  if (userStore.isLogin) {
    await orderStore.getOrderList()
    orderStore.startDeliveryNotification()
  }
})

onUnmounted(() => {
  // 组件卸载时停止发货通知定时器
  orderStore.stopDeliveryNotification()
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  background-color: #f5f5f5;
}

.content-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style> 