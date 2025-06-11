<template>
  <div class="category-container">
    <div class="category-header">
      <h2>商品分类</h2>
    </div>
    
    <el-row :gutter="20">
      <!-- 左侧分类导航 -->
      <el-col :span="5">
        <div class="category-sidebar">
          <h3>全部分类</h3>
          <el-menu
            :default-active="activeCategory"
            @select="handleCategorySelect"
            class="category-menu"
          >
            <el-menu-item v-for="category in categories" :key="category.id" :index="category.id.toString()">
              {{ category.name }}
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>
      
      <!-- 右侧商品列表 -->
      <el-col :span="19">
        <div class="product-header">
          <div class="category-title">
            <h3>{{ currentCategoryName }}</h3>
          </div>
          
          <div class="product-filter">
            <el-radio-group v-model="sortType" size="small" @change="handleSortChange">
              <el-radio-button label="default">默认排序</el-radio-button>
              <el-radio-button label="sales">销量优先</el-radio-button>
              <el-radio-button label="price-asc">价格从低到高</el-radio-button>
              <el-radio-button label="price-desc">价格从高到低</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <div v-loading="loading" class="product-list">
          <product-card 
            v-for="product in products" 
            :key="product.id" 
            :product="product" 
          />
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
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/product'
import { getProductCategories, getProductList } from '../../api/product'
import { ElMessage } from 'element-plus'
import ProductCard from '../../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const categories = ref([])
const products = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const activeCategory = ref('')
const sortType = ref('default')

// 当前分类名称
const currentCategoryName = computed(() => {
  if (!activeCategory.value) return '全部商品'
  const category = categories.value.find(item => item.id.toString() === activeCategory.value)
  return category ? category.name : '全部商品'
})

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getProductCategories()
    if (res.code === 200) {
      categories.value = res.data
      
      // 如果URL中有分类ID，则选中对应分类
      const categoryId = route.query.id
      if (categoryId) {
        activeCategory.value = categoryId.toString()
      } else if (categories.value.length > 0) {
        // 否则默认选中第一个分类
        activeCategory.value = categories.value[0].id.toString()
      }
      
      fetchProducts()
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      categoryId: activeCategory.value || '',
      sort: sortType.value
    }
    
    const res = await getProductList(params)
    if (res.code === 200) {
      products.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 选择分类
const handleCategorySelect = (index) => {
  activeCategory.value = index
  currentPage.value = 1
  fetchProducts()
  
  // 更新URL参数
  router.push({
    path: '/category',
    query: { id: index }
  })
}

// 切换排序方式
const handleSortChange = () => {
  currentPage.value = 1
  fetchProducts()
}

// 翻页
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchProducts()
}

// 监听路由变化
watch(
  () => route.query.id,
  (newId) => {
    if (newId && newId !== activeCategory.value) {
      activeCategory.value = newId.toString()
      currentPage.value = 1
      fetchProducts()
    }
  }
)

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.category-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 20px;
}

.category-header {
  margin-bottom: 20px;
}

.category-header h2 {
  font-size: 24px;
  color: #333;
}

.category-sidebar {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.category-sidebar h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.category-menu {
  border-right: none;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-title h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.pagination-container {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 1400px) {
  .category-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .category-container {
    max-width: calc(100% - 100px);
  }

  .product-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .category-container {
    max-width: calc(100% - 40px);
  }

  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .product-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-filter {
    margin-top: 10px;
  }
}

@media (max-width: 576px) {
  .product-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style> 