<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>关于我们</h3>
        <ul>
          <li><a href="#">公司简介</a></li>
          <li><a href="#">联系我们</a></li>
          <li><a href="#">招聘信息</a></li>
          <li><a href="#">隐私政策</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>帮助中心</h3>
        <ul>
          <li><a href="#">购物指南</a></li>
          <li><a href="#">支付方式</a></li>
          <li><a href="#">配送方式</a></li>
          <li><a href="#">售后服务</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>商家合作</h3>
        <ul>
          <li><a href="#">商家入驻</a></li>
          <li><a href="#">营销中心</a></li>
          <li><a href="#">物流配送</a></li>
          <li><a href="#">广告服务</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>关注我们</h3>
        <div class="social-media">
          <a href="#"><el-icon><Message /></el-icon> 微信</a>
          <a href="#"><el-icon><Position /></el-icon> 微博</a>
          <a href="#"><el-icon><Promotion /></el-icon> 抖音</a>
        </div>
        <div class="qrcode">
          <img src="../../../assets/bottom_qrcode/ExampleQRcode.png" alt="二维码" />
          <p>扫码关注公众号</p>
        </div>
      </div>
    </div>
    
    <div class="copyright">
      <p>© {{ new Date().getFullYear() }} 电商平台 版权所有 ICP备案号：PLACEHOLDER</p>
    </div>
  </footer>
</template>

<script setup>
import { Message, Position, Promotion } from '@element-plus/icons-vue'
import { onMounted } from 'vue'
import { useOrderStore } from '../../../stores/order'
import { useUserStore } from '../../../stores/user'

const orderStore = useOrderStore()
const userStore = useUserStore()

onMounted(async () => {
  // 如果用户已登录，获取订单列表
  if (userStore.isLogin) {
    await orderStore.getOrderList()
  }
})
</script>

<style scoped>
.footer {
  background-color: #2c3e50;
  color: #fff;
  padding: 40px 0 20px;
  width: 100%;
}

.footer-content {
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.footer-section {
  flex: 1;
  margin-right: 20px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  margin-left: 199px;
  width: 40px;
  height: 2px;
  background-color: #409EFF;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #409EFF;
}

.social-media {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
  margin-left: 145px;
}

.social-media a {
  color: #ccc;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s;
  height: 24px;
  line-height: 24px;
  padding-left: 48PX;
}

.social-media a .el-icon {
  font-size: 16px;
}

.social-media a:hover {
  color: #409EFF;
}

.qrcode {
  margin-top: 15px;
  text-align: center;
}

.qrcode img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.qrcode p {
  margin-top: 5px;
  font-size: 12px;
  color: #ccc;
}

.copyright {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #3a4a5a;
  color: #ccc;
  font-size: 14px;
}

@media (max-width: 1400px) {
  .footer-content {
    width: 100%;
  }
}

@media (max-width: 992px) {
  .footer-content {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .footer-content {
    width: 100%;
    flex-direction: column;
  }
  
  .footer-section {
    margin-right: 0;
    margin-bottom: 30px;
  }
}
</style> 