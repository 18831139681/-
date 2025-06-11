<template>
  <div class="home-container">
    <!-- 轮播图 -->
    <div class="banner-container">
      <el-carousel height="400px">
        <el-carousel-item v-for="(item, index) in banners" :key="index">
          <img :src="item.imgUrl" :alt="item.title" class="banner-image" />
        </el-carousel-item>
      </el-carousel>
    </div>
    
    <!-- 商品分类 -->
    <div class="section">
      <div class="section-header">
        <h2>商品分类</h2>
        <router-link to="/category" class="more-link">查看更多 <el-icon><ArrowRight /></el-icon></router-link>
      </div>
      
      <div class="category-list">
        <div v-for="(category, index) in categories" :key="index" class="category-item" @click="navigateToCategory(category.id)">
          <el-image :src="category.imgUrl" fit="cover" class="category-image" />
          <div class="category-name">{{ category.name }}</div>
        </div>
      </div>
    </div>
    
    <!-- 热门商品 -->
    <div class="section">
      <div class="section-header">
        <h2>热门商品</h2>
        <router-link to="/hot" class="more-link">查看更多 <el-icon><ArrowRight /></el-icon></router-link>
      </div>
      
      <div class="product-list">
        <product-card 
          v-for="(product, index) in hotProducts" 
          :key="index" 
          :product="product" 
        />
      </div>
    </div>
    
    <!-- 新品上架 -->
    <div class="section">
      <div class="section-header">
        <h2>新品上架</h2>
        <router-link to="/new" class="more-link">查看更多 <el-icon><ArrowRight /></el-icon></router-link>
      </div>
      
      <div class="product-list">
        <product-card 
          v-for="(product, index) in newProducts" 
          :key="index" 
          :product="product" 
        />
      </div>
    </div>
    
    <!-- 推荐商品 -->
    <div class="section">
      <div class="section-header">
        <h2>为您推荐</h2>
      </div>
      
      <div class="product-list">
        <product-card 
          v-for="(product, index) in recommendProducts" 
          :key="index" 
          :product="product" 
        />
      </div>
      
      <div class="load-more">
        <el-button v-if="hasMore" :loading="loading" @click="loadMore">加载更多</el-button>
        <p v-else class="no-more">没有更多商品了~</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { useProductStore } from '../../stores/product'
import ProductCard from '../../components/ProductCard.vue'
import { getHotProducts, getNewProducts, getRecommendProducts, getProductCategories } from '../../api/product'
import { ElMessage } from 'element-plus'

const router = useRouter()
const productStore = useProductStore()

const banners = ref([
  {
    imgUrl: 'https://picsum.photos/seed/banner1/1200/400',
    title: '促销活动1',
    link: '/promotion/1'
  },
  {
    imgUrl: 'https://picsum.photos/seed/banner2/1200/400',
    title: '促销活动2',
    link: '/promotion/2'
  },
  {
    imgUrl: 'https://picsum.photos/seed/banner3/1200/400',
    title: '促销活动3',
    link: '/promotion/3'
  }
])

const categories = ref([])
const hotProducts = ref([])
const newProducts = ref([])
const recommendProducts = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(8)

// 跳转到分类页面
const navigateToCategory = (categoryId) => {
  router.push({
    path: '/category',
    query: { id: categoryId }
  })
}

// 获取商品分类
const fetchCategories = async () => {
  try {
    const res = await getProductCategories()
    if (res.code === 200) {
      categories.value = res.data.slice(0, 10) // 只显示10个分类
    }
  } catch (error) {
    console.error('获取商品分类失败:', error)
    ElMessage.error('获取商品分类失败')
  }
}

// 获取热门商品
const fetchHotProducts = async () => {
  try {
    const res = await getHotProducts()
    if (res.code === 200) {
      hotProducts.value = res.data.slice(0, 4) // 只显示4个热门商品
    }
  } catch (error) {
    console.error('获取热门商品失败:', error)
    ElMessage.error('获取热门商品失败')
  }
}

// 获取新品上架
const fetchNewProducts = async () => {
  try {
    const res = await getNewProducts()
    if (res.code === 200) {
      newProducts.value = res.data.slice(0, 4) // 只显示4个新品
    }
  } catch (error) {
    console.error('获取新品上架失败:', error)
    ElMessage.error('获取新品上架失败')
  }
}

// 获取推荐商品
const fetchRecommendProducts = async () => {
  loading.value = true
  try {
    const res = await getRecommendProducts({
      page: page.value,
      pageSize: pageSize.value
    })
    
    if (res.code === 200) {
      if (page.value === 1) {
        recommendProducts.value = res.data.list
      } else {
        recommendProducts.value = [...recommendProducts.value, ...res.data.list]
      }
      
      // 判断是否还有更多数据
      hasMore.value = recommendProducts.value.length < res.data.total
    }
  } catch (error) {
    console.error('获取推荐商品失败:', error)
    ElMessage.error('获取推荐商品失败')
  } finally {
    loading.value = false
  }
}

// 加载更多推荐商品
const loadMore = () => {
  page.value++
  fetchRecommendProducts()
}

onMounted(() => {
  fetchCategories()
  fetchHotProducts()
  fetchNewProducts()
  fetchRecommendProducts()
})
</script>

<style scoped>
.home-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 0 20px;
}

.banner-container {
  margin-bottom: 30px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  color: #333;
  position: relative;
  padding-left: 15px;
}

.section-header h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: #409EFF;
}

.more-link {
  color: #409EFF;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s;
}

.more-link:hover {
  color: #337ecc;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.category-item {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.category-item:hover {
  transform: translateY(-5px);
}

.category-image {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.category-name {
  font-size: 14px;
  color: #333;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.load-more {
  margin-top: 30px;
  text-align: center;
}

.no-more {
  color: #999;
  font-size: 14px;
}

@media (max-width: 1400px) {
  .home-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .home-container {
    max-width: calc(100% - 100px);
  }
  
  .category-list {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .product-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .home-container {
    max-width: calc(100% - 40px);
  }
  
  .category-list {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .category-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .product-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style> 