<template>
  <div class="hot-products-container">
    <div class="hot-products-header">
      <h2>热销商品</h2>
      <p class="subtitle">最受欢迎的精选商品</p>
    </div>
    
    <div class="banner-section">
      <el-carousel height="300px" indicator-position="outside">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <el-image :src="banner.imgUrl" fit="cover" class="banner-image" />
          <div class="banner-content">
            <h3>{{ banner.title }}</h3>
            <p>{{ banner.desc }}</p>
            <el-button type="primary" @click="goToDetail(banner.link)">查看详情</el-button>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    
    <div class="filter-section">
      <el-radio-group v-model="sortType" size="small" @change="handleSortChange">
        <el-radio-button label="sales">销量优先</el-radio-button>
        <el-radio-button label="price-asc">价格从低到高</el-radio-button>
        <el-radio-button label="price-desc">价格从高到低</el-radio-button>
      </el-radio-group>
    </div>
    
    <div v-loading="loading" class="product-list">
      <product-card 
        v-for="product in products" 
        :key="product.id" 
        :product="product" 
      />
    </div>
    
    <div v-if="products.length === 0 && !loading" class="empty-state">
      <el-empty description="暂无热销商品" />
    </div>
    
    <div class="pagination-container">
      <el-pagination
        v-if="total > pageSize"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../../stores/product'
import { getHotProducts } from '../../api/product'
import { ElMessage } from 'element-plus'
import ProductCard from '../../components/ProductCard.vue'

const router = useRouter()
const productStore = useProductStore()

const products = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const sortType = ref('sales')

// 热销商品轮播图
const banners = ref([
  {
    imgUrl: 'https://picsum.photos/1200/300?random=11',
    title: '爆款热销',
    desc: '限时特惠，抢购从速',
    link: '/product/1'
  },
  {
    imgUrl: 'https://picsum.photos/1200/300?random=12',
    title: '人气单品',
    desc: '好评如潮，品质保障',
    link: '/product/2'
  },
  {
    imgUrl: 'https://picsum.photos/1200/300?random=13',
    title: '季末清仓',
    desc: '折扣力度空前，错过再等一年',
    link: '/product/3'
  }
])

// 获取热销商品
const fetchHotProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      sort: sortType.value
    }
    
    const res = await getHotProducts(params)
    if (res.code === 200) {
      if (Array.isArray(res.data)) {
        // 如果返回的是数组，则直接使用
        products.value = res.data
        total.value = res.data.length
      } else if (res.data && res.data.list) {
        // 如果返回的是分页对象，则取list属性
        products.value = res.data.list
        total.value = res.data.total
      }
    }
  } catch (error) {
    console.error('获取热销商品失败:', error)
    ElMessage.error('获取热销商品失败')
  } finally {
    loading.value = false
  }
}

// 切换排序方式
const handleSortChange = () => {
  currentPage.value = 1
  fetchHotProducts()
}

// 翻页
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchHotProducts()
}

// 跳转到商品详情
const goToDetail = (link) => {
  router.push(link)
}

onMounted(() => {
  fetchHotProducts()
})
</script>

<style scoped>
.hot-products-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 20px;
}

.hot-products-header {
  text-align: center;
  margin-bottom: 20px;
}

.hot-products-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.banner-section {
  margin-bottom: 30px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  text-align: center;
  padding: 20px;
}

.banner-content h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.banner-content p {
  font-size: 16px;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.empty-state {
  padding: 40px 0;
}

.pagination-container {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 1400px) {
  .hot-products-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .hot-products-container {
    max-width: calc(100% - 100px);
  }
  
  .product-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hot-products-container {
    max-width: calc(100% - 40px);
  }
  
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .banner-content h3 {
    font-size: 20px;
  }
  
  .banner-content p {
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .product-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style> 