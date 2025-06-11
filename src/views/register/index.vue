<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-title">
        <h2>用户注册</h2>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="0"
        class="register-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="手机号"
            prefix-icon="Iphone"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="agreeTerms">我已阅读并同意<el-button link @click="showTerms">《用户协议》</el-button>和<el-button link @click="showPrivacy">《隐私政策》</el-button></el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="register-button"
            :disabled="!agreeTerms"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="login-options">
          <span>已有账号?</span>
          <el-button link @click="$router.push('/login')">立即登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Iphone, Message } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref(null)
const loading = ref(false)
const agreeTerms = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: ''
})

// 校验密码是否一致
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

// 校验手机号
const validatePhone = (rule, value, callback) => {
  if (value === '') {
    callback()
  } else {
    const reg = /^1[3-9]\d{9}$/
    if (!reg.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }
}

// 校验邮箱
const validateEmail = (rule, value, callback) => {
  if (value === '') {
    callback()
  } else {
    const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    if (!reg.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ]
}

// 处理注册
const handleRegister = () => {
  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }
  
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.register({
          username: registerForm.username,
          password: registerForm.password,
          phone: registerForm.phone,
          email: registerForm.email
        })
        
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error(error.message || '注册失败，请稍后再试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 显示用户协议
const showTerms = () => {
  ElMessageBox.alert(
    '这是用户协议内容...',
    '用户协议',
    {
      confirmButtonText: '我已阅读'
    }
  )
}

// 显示隐私政策
const showPrivacy = () => {
  ElMessageBox.alert(
    '这是隐私政策内容...',
    '隐私政策',
    {
      confirmButtonText: '我已阅读'
    }
  )
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

.register-box {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
}

.register-title h2 {
  font-size: 24px;
  color: #333;
}

.register-form {
  margin-top: 20px;
}

.register-button {
  width: 100%;
}

.login-options {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .register-box {
    width: 90%;
    padding: 20px;
  }
}
</style> 