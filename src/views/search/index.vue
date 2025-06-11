<template>
  <div class="search-container">
    <div class="search-header">
      <h2>搜索结果</h2>
      <p class="search-info" v-if="keyword">关键词: <span class="keyword">{{ keyword }}</span></p>
    </div>
    
    <div class="filter-section">
      <div class="filter-options">
        <el-select v-model="categoryId" placeholder="商品分类" clearable @change="handleFilterChange">
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
        
        <el-select v-model="priceRange" placeholder="价格区间" clearable @change="handleFilterChange">
          <el-option label="0-100元" value="0-100" />
          <el-option label="100-500元" value="100-500" />
          <el-option label="500-1000元" value="500-1000" />
          <el-option label="1000元以上" value="1000-" />
        </el-select>
      </div>
      
      <el-radio-group v-model="sortType" size="small" @change="handleSortChange">
        <el-radio-button label="default">默认排序</el-radio-button>
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
      <el-empty :description="`未找到与${keyword}相关的商品`">
        <template #extra>
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </template>
      </el-empty>
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/product'
import { searchProducts, getProductCategories } from '../../api/product'
import { ElMessage } from 'element-plus'
import ProductCard from '../../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const keyword = ref('')
const products = ref([])
const categories = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const sortType = ref('default')
const categoryId = ref('')
const priceRange = ref('')

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getProductCategories()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取搜索结果
const fetchSearchResults = async () => {
  if (!keyword.value && !categoryId.value && !priceRange.value) {
    products.value = []
    total.value = 0
    return
  }
  
  loading.value = true
  try {
    // 解析价格区间
    let minPrice, maxPrice
    if (priceRange.value) {
      const [min, max] = priceRange.value.split('-')
      minPrice = min || 0
      maxPrice = max || ''
    }
    
    const params = {
      keyword: keyword.value,
      categoryId: categoryId.value,
      minPrice,
      maxPrice,
      page: currentPage.value,
      pageSize: pageSize.value,
      sort: sortType.value
    }
    
    const res = await searchProducts(params)
    if (res.code === 200) {
      if (Array.isArray(res.data)) {
        products.value = res.data
        total.value = res.data.length
      } else if (res.data && res.data.list) {
        products.value = res.data.list
        total.value = res.data.total
      }
    }
  } catch (error) {
    console.error('搜索商品失败:', error)
    ElMessage.error('搜索商品失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchSearchResults()
}

// 处理排序方式变化
const handleSortChange = () => {
  currentPage.value = 1
  fetchSearchResults()
}

// 翻页
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchSearchResults()
}

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword !== keyword.value) {
      keyword.value = newKeyword || ''
      currentPage.value = 1
      fetchSearchResults()
    }
  }
)

onMounted(() => {
  keyword.value = route.query.keyword || ''
  fetchCategories()
  fetchSearchResults()
})
</script>

<style scoped>
.search-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  margin-bottom: 20px;
}

.search-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.search-info {
  color: #666;
}

.keyword {
  color: #409EFF;
  font-weight: bold;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-options {
  display: flex;
  gap: 10px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.pagination-container {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 1400px) {
  .search-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .search-container {
    max-width: calc(100% - 100px);
  }
  
  .product-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .search-container {
    max-width: calc(100% - 40px);
  }
  
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-options {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .filter-options {
    flex-direction: column;
  }
  
  .product-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style> 