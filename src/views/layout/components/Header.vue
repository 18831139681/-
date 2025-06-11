<template>
  <div class="header">
    <div class="header-content">
      <div class="logo">
        <router-link to="/">
          <h1>万货通商城 Onemall</h1>
        </router-link>
      </div>
      
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
      
      <div class="nav-menu">
        <el-menu
          mode="horizontal"
          :ellipsis="false"
          router
          :default-active="activeMenu"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/category">全部分类</el-menu-item>
          <el-menu-item index="/new">新品上架</el-menu-item>
          <el-menu-item index="/hot">热销商品</el-menu-item>
        </el-menu>
      </div>
      
      <div class="user-actions">
        <el-dropdown v-if="userStore.isLogin" trigger="click">
          <div class="user-info">
            <el-avatar :size="32" :src="userStore.getUserData.avatar || defaultAvatar" />
            <span class="username">{{ userStore.getUserData.nickname || userStore.getUserData.username }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/user')">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="$router.push('/order')">
                <el-icon><List /></el-icon>我的订单
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <div v-if="userStore.isLogin" class="my-orders" @click="$router.push('/order')">
          <el-icon><List /></el-icon>
          <span>我的订单</span>
        </div>
        
        <div v-else class="login-actions">
          <el-button type="primary" @click="$router.push('/login')">登录</el-button>
          <el-button @click="$router.push('/register')">注册</el-button>
        </div>
        
        <div class="cart-icon" @click="$router.push('/cart')">
          <el-badge :value="cartStore.cartCount" :max="99" class="cart-badge">
            <el-icon :size="24"><ShoppingCart /></el-icon>
          </el-badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../../stores/user'
import { useCartStore } from '../../../stores/cart'
import { Search, User, List, SwitchButton, ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const searchKeyword = ref('')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 搜索商品
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('退出登录成功')
  }).catch(() => {})
}

onMounted(() => {
  // 获取购物车数据
  if (userStore.isLogin) {
    cartStore.getCart()
  }
})
</script>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.header-content {
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.logo {
  margin-right: 40px;
}

.logo a {
  text-decoration: none;
  color: #409EFF;
}

.search-box {
  width: 400px;
  margin-right: 40px;
}

.nav-menu {
  flex: 1;
}

.user-actions {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-orders {
  display: flex;
  align-items: center;
  margin-left: 40px;
  cursor: pointer;
  color: #606266;
}

.my-orders:hover {
  color: #409EFF;
}

.my-orders span {
  margin-left: 5px;
}

.login-actions {
  display: flex;
  gap: 10px;
}

.cart-icon {
  margin-left: 20px;
  cursor: pointer;
}

.cart-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
}

@media (max-width: 1400px) {
  .header-content {
    width: 100%;
  }
}

@media (max-width: 992px) {
  .header-content {
    width: 100%;
  }
  
  .search-box {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .header-content {
    width: 100%;
    flex-wrap: wrap;
    height: auto;
    padding: 10px 20px;
  }
  
  .search-box {
    order: 3;
    width: 100%;
    margin: 10px 0;
  }
  
  .nav-menu {
    order: 4;
    width: 100%;
  }
}
</style> 