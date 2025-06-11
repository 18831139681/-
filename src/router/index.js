import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/layout/index.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/home/index.vue'),
        meta: { title: '首页', requireAuth: false }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../views/category/index.vue'),
        meta: { title: '商品分类', requireAuth: false }
      },
      {
        path: 'new',
        name: 'New',
        component: () => import('../views/new/index.vue'),
        meta: { title: '新品上架', requireAuth: false }
      },
      {
        path: 'hot',
        name: 'Hot',
        component: () => import('../views/hot/index.vue'),
        meta: { title: '热销商品', requireAuth: false }
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('../views/search/index.vue'),
        meta: { title: '搜索结果', requireAuth: false }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/product/detail.vue'),
        meta: { title: '商品详情', requireAuth: false }
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('../views/cart/index.vue'),
        meta: { title: '购物车', requireAuth: true }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('../views/order/index.vue'),
        meta: { title: '我的订单', requireAuth: true }
      },
      {
        path: 'order/detail/:id',
        name: 'OrderDetail',
        component: () => import('../views/order/detail.vue'),
        meta: { title: '订单详情', requireAuth: true }
      },
      {
        path: 'order/confirm',
        name: 'OrderConfirm',
        component: () => import('../views/order/confirm.vue'),
        meta: { title: '确认订单', requireAuth: true }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/index.vue'),
        meta: { title: '个人中心', requireAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录', requireAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register/index.vue'),
    meta: { title: '注册', requireAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/404.vue'),
    meta: { title: '404', requireAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 电商平台` : '电商平台'
  
  // 判断是否需要登录权限
  if (to.meta.requireAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      next()
    } else {
      // 如果当前已经在登录页面，不要再次跳转到登录页面
      if (to.path === '/login') {
        next()
      } else {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    }
  } else {
    // 如果是登录页面，但已经登录了，直接跳转到首页
    if ((to.path === '/login' || to.path === '/register') && localStorage.getItem('token')) {
      next({ path: '/' })
    } else {
      next()
    }
  }
})

export default router 