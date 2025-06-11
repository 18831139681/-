<template>
  <div class="new-products-container">
    <div class="new-products-header">
      <h2>新品上架</h2>
      <p class="subtitle">发现最新上架的精选商品</p>
    </div>
    
    <div class="filter-section">
      <el-radio-group v-model="sortType" size="small" @change="handleSortChange">
        <el-radio-button label="default">默认排序</el-radio-button>
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
      <el-empty description="暂无新品上架" />
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
import { useProductStore } from '../../stores/product'
import { getNewProducts } from '../../api/product'
import { ElMessage } from 'element-plus'
import ProductCard from '../../components/ProductCard.vue'

const productStore = useProductStore()

const products = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const sortType = ref('default')

// 获取新品上架商品
const fetchNewProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      sort: sortType.value
    }
    
    const res = await getNewProducts(params)
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
    console.error('获取新品上架商品失败:', error)
    ElMessage.error('获取新品上架商品失败')
  } finally {
    loading.value = false
  }
}

// 切换排序方式
const handleSortChange = () => {
  currentPage.value = 1
  fetchNewProducts()
}

// 翻页
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchNewProducts()
}

onMounted(() => {
  fetchNewProducts()
})
</script>

<style scoped>
.new-products-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 20px;
}

.new-products-header {
  text-align: center;
  margin-bottom: 30px;
}

.new-products-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 16px;
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
  .new-products-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .new-products-container {
    max-width: calc(100% - 100px);
  }
  
  .product-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .new-products-container {
    max-width: calc(100% - 40px);
  }
  
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .product-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style> 