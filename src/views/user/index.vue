<template>
  <div class="user-container">
    <div class="user-header">
      <h2>个人中心</h2>
    </div>
    
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="user-sidebar">
          <div class="user-info">
            <el-avatar :size="100" :src="userStore.getUserData.avatar || defaultAvatar" />
            <h3>{{ userStore.getUserData.nickname || userStore.getUserData.username }}</h3>
            <p>{{ userStore.getUserData.email }}</p>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            class="user-menu"
            @select="handleSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>账号安全</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>
      
      <el-col :span="18">
        <div class="user-content">
          <!-- 个人资料 -->
          <div v-if="activeMenu === 'profile'" class="profile-section">
            <h3 class="section-title">个人资料</h3>
            
            <el-form
              :model="profileForm"
              :rules="profileRules"
              ref="profileFormRef"
              label-width="100px"
            >
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  action="/api/user/avatar"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                >
                  <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>
              
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" />
              </el-form-item>
              
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio :label="1">男</el-radio>
                  <el-radio :label="2">女</el-radio>
                  <el-radio :label="0">保密</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" />
              </el-form-item>
              
              <el-form-item label="生日" prop="birthday">
                <el-date-picker
                  v-model="profileForm.birthday"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="updateProfile" :loading="loading">保存</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 我的订单 -->
          <div v-if="activeMenu === 'orders'" class="orders-section">
            <h3 class="section-title">我的订单</h3>
            <el-button type="primary" @click="$router.push('/order')" class="view-all-btn">查看全部订单</el-button>
            
            <el-tabs v-model="orderTab">
              <el-tab-pane label="待付款" name="waitPay">
                <order-list :status="0" :limit="3" />
              </el-tab-pane>
              <el-tab-pane label="待发货" name="waitDeliver">
                <order-list :status="1" :limit="3" />
              </el-tab-pane>
              <el-tab-pane label="待收货" name="waitReceive">
                <order-list :status="3" :limit="3" />
              </el-tab-pane>
              <el-tab-pane label="已完成" name="received">
                <order-list :status="4" :limit="3" />
              </el-tab-pane>
            </el-tabs>
          </div>
          
          <!-- 收货地址 -->
          <div v-if="activeMenu === 'address'" class="address-section">
            <h3 class="section-title">收货地址</h3>
            <el-button type="primary" @click="addAddress" class="add-address-btn">新增地址</el-button>
            
            <div class="address-list">
              <el-empty v-if="addressList.length === 0" description="暂无收货地址" />
              
              <div v-for="(address, index) in addressList" :key="index" class="address-item">
                <div class="address-info">
                  <div class="address-name-phone">
                    <span class="address-name">{{ address.name }}</span>
                    <span class="address-phone">{{ address.phone }}</span>
                    <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
                  </div>
                  <div class="address-detail">
                    {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
                  </div>
                </div>
                
                <div class="address-actions">
                  <el-button type="primary" link @click="editAddress(address)">编辑</el-button>
                  <el-button type="danger" link @click="deleteAddress(address)">删除</el-button>
                  <el-button v-if="!address.isDefault" link @click="setDefaultAddress(address)">设为默认</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 账号安全 -->
          <div v-if="activeMenu === 'security'" class="security-section">
            <h3 class="section-title">账号安全</h3>
            
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">登录密码</div>
                <div class="security-desc">定期修改密码可以提高账号安全性</div>
              </div>
              <el-button @click="showChangePasswordDialog">修改</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">手机绑定</div>
                <div class="security-desc">已绑定: {{ userStore.getUserData.phone }}</div>
              </div>
              <el-button @click="showBindPhoneDialog">修改</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">邮箱绑定</div>
                <div class="security-desc">已绑定: {{ userStore.getUserData.email }}</div>
              </div>
              <el-button @click="showBindEmailDialog">修改</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">第三方账号绑定</div>
                <div class="security-desc">绑定第三方账号，快捷登录</div>
              </div>
              <div class="third-party-buttons">
                <el-button :type="isWechatBound ? '' : 'success'" :icon="ChatDotRound">
                  {{ isWechatBound ? '已绑定微信' : '绑定微信' }}
                </el-button>
                <el-button :type="isQQBound ? '' : 'primary'">
                  {{ isQQBound ? '已绑定QQ' : '绑定QQ' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="loading">确认</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 添加/编辑地址对话框 -->
    <el-dialog 
      v-model="addAddressDialogVisible" 
      :title="isEditingAddress ? '编辑地址' : '新增地址'" 
      width="500px"
    >
      <el-form :model="addressForm" ref="addressFormRef" label-width="100px" :rules="addressRules">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            placeholder="请选择所在地区"
          />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detail">
          <el-input 
            v-model="addressForm.detail" 
            type="textarea" 
            rows="3"
            placeholder="请输入详细地址，如街道、门牌号等" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addAddressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAddress" :loading="loading">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, List, Location, Lock, Plus, ChatDotRound } from '@element-plus/icons-vue'
import { updateUserInfo, changePassword as changePasswordApi } from '../../api/user'

// 组件需要单独创建
const OrderList = {
  props: {
    status: {
      type: Number,
      required: true
    },
    limit: {
      type: Number,
      default: 3
    }
  },
  template: `
    <div class="order-list">
      <el-empty v-if="!orderList.length" description="暂无订单" />
      <div v-else>
        <!-- 这里应该展示订单列表，但为了简化，我们只显示一个占位符 -->
        <div class="placeholder">这里将展示状态为{{ status }}的订单列表</div>
      </div>
    </div>
  `,
  setup(props) {
    const orderList = ref([])
    // 在实际项目中，应该从API获取订单列表
    return { orderList }
  }
}

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('profile')
const orderTab = ref('waitPay')
const loading = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 个人资料表单
const profileFormRef = ref(null)
const profileForm = reactive({
  username: '',
  nickname: '',
  avatar: '',
  gender: 0,
  phone: '',
  email: '',
  birthday: ''
})

// 表单验证规则
const profileRules = {
  nickname: [
    { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 收货地址列表
const addressList = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: 'XX路XX号XX小区XX栋XX单元XX号',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: 'XX路XX号XX小区XX栋XX单元XX号',
    isDefault: false
  }
])
const selectedAddressId = ref(null)
const addressDialogVisible = ref(false)
const addAddressDialogVisible = ref(false)
const isEditingAddress = ref(false)
const addressFormRef = ref(null)
const addressForm = reactive({
  id: null,
  name: '',
  phone: '',
  region: [],
  detail: '',
  isDefault: false
})

// 修改密码相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 校验两次密码是否一致
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 第三方账号绑定状态
const isWechatBound = ref(false)
const isQQBound = ref(false)

// 地址表单验证规则
const addressRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { max: 20, message: '姓名长度不能超过20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { max: 100, message: '地址长度不能超过100个字符', trigger: 'blur' }
  ]
}

// 简化版的地区选项
const regionOptions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '丰台区', label: '丰台区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' },
          { value: '静安区', label: '静安区' },
          { value: '浦东新区', label: '浦东新区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' },
          { value: '荔湾区', label: '荔湾区' },
          { value: '天河区', label: '天河区' },
          { value: '白云区', label: '白云区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '福田区', label: '福田区' },
          { value: '罗湖区', label: '罗湖区' },
          { value: '南山区', label: '南山区' },
          { value: '宝安区', label: '宝安区' },
          { value: '龙岗区', label: '龙岗区' }
        ]
      }
    ]
  },
  {
    value: '云南省',
    label: '云南省',
    children: [
      {
        value: '昆明市',
        label: '昆明市',
        children: [
          { value: '五华区', label: '五华区' },
          { value: '盘龙区', label: '盘龙区' },
          { value: '官渡区', label: '官渡区' },
          { value: '西山区', label: '西山区' },
          { value: '呈贡区', label: '呈贡区' }
        ]
      },
      {
        value: '大理白族自治州',
        label: '大理白族自治州',
        children: [
          { value: '大理市', label: '大理市' },
          { value: '漾濞县', label: '漾濞县' },
          { value: '祥云县', label: '祥云县' },
          { value: '宾川县', label: '宾川县' },
          { value: '弥渡县', label: '弥渡县' }
        ]
      }
    ]
  }
]

// 菜单选择
const handleSelect = (key) => {
  activeMenu.value = key
  if (key === 'orders') {
    router.push('/order')
  }
}

// 初始化表单数据
const initFormData = () => {
  const userInfo = userStore.getUserData
  profileForm.username = userInfo.username || ''
  profileForm.nickname = userInfo.nickname || ''
  profileForm.avatar = userInfo.avatar || ''
  profileForm.gender = userInfo.gender || 0
  profileForm.phone = userInfo.phone || ''
  profileForm.email = userInfo.email || ''
  profileForm.birthday = userInfo.birthday || ''
}

// 更新个人资料
const updateProfile = () => {
  profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.updateUserInfo(profileForm)
        ElMessage.success('更新成功')
      } catch (error) {
        ElMessage.error('更新失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  profileFormRef.value.resetFields()
  initFormData()
}

// 头像上传成功
const handleAvatarSuccess = (res) => {
  if (res.code === 200) {
    profileForm.avatar = res.data.url
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

// 头像上传前校验
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
  }
  return (isJPG || isPNG) && isLt2M
}

// 新增地址
const addAddress = () => {
  isEditingAddress.value = false
  addressForm.id = null
  addressForm.name = ''
  addressForm.phone = ''
  addressForm.region = []
  addressForm.detail = ''
  addressForm.isDefault = false
  
  addAddressDialogVisible.value = true
}

// 编辑地址
const editAddress = (address) => {
  isEditingAddress.value = true
  addressForm.id = address.id
  addressForm.name = address.name
  addressForm.phone = address.phone
  addressForm.region = [address.province, address.city, address.district]
  addressForm.detail = address.detail
  addressForm.isDefault = address.isDefault
  
  addAddressDialogVisible.value = true
}

// 删除地址
const deleteAddress = (address) => {
  ElMessageBox.confirm('确定要删除该收货地址吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从地址列表中删除
    addressList.value = addressList.value.filter(item => item.id !== address.id)
    // 保存到本地存储
    saveAddressesToLocalStorage()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 设为默认地址
const setDefaultAddress = (address) => {
  // 更新所有地址的默认状态
  addressList.value.forEach(item => {
    item.isDefault = item.id === address.id
  })
  // 保存到本地存储
  saveAddressesToLocalStorage()
  ElMessage.success('设置成功')
}

// 保存地址
const saveAddress = () => {
  addressFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 解析地区信息
        const [province, city, district] = addressForm.region
        
        if (isEditingAddress.value) {
          // 更新地址
          const index = addressList.value.findIndex(item => item.id === addressForm.id)
          if (index !== -1) {
            addressList.value[index] = {
              ...addressList.value[index],
              name: addressForm.name,
              phone: addressForm.phone,
              province,
              city,
              district,
              detail: addressForm.detail,
              isDefault: addressForm.isDefault
            }
            
            // 如果设为默认地址，更新其他地址
            if (addressForm.isDefault) {
              addressList.value.forEach((item, i) => {
                if (i !== index) {
                  item.isDefault = false
                }
              })
            }
          }
        } else {
          // 添加地址
          const newAddress = {
            id: Date.now(), // 使用时间戳作为唯一ID
            name: addressForm.name,
            phone: addressForm.phone,
            province,
            city,
            district,
            detail: addressForm.detail,
            isDefault: addressForm.isDefault
          }
          
          addressList.value.push(newAddress)
          
          // 如果设为默认地址，更新其他地址
          if (addressForm.isDefault) {
            addressList.value.forEach(item => {
              if (item.id !== newAddress.id) {
                item.isDefault = false
              }
            })
          }
        }
        
        // 保存到本地存储
        saveAddressesToLocalStorage()
        
        ElMessage.success(isEditingAddress.value ? '更新成功' : '添加成功')
        addAddressDialogVisible.value = false
      } catch (error) {
        ElMessage.error(isEditingAddress.value ? '更新失败' : '添加失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 保存地址到本地存储
const saveAddressesToLocalStorage = () => {
  localStorage.setItem('userAddresses', JSON.stringify(addressList.value))
}

// 从本地存储加载地址
const loadAddressesFromLocalStorage = () => {
  const savedAddresses = localStorage.getItem('userAddresses')
  if (savedAddresses) {
    try {
      addressList.value = JSON.parse(savedAddresses)
    } catch (error) {
      console.error('解析地址数据失败', error)
    }
  }
}

// 显示修改密码对话框
const showChangePasswordDialog = () => {
  passwordDialogVisible.value = true
}

// 修改密码
const changePassword = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await changePasswordApi({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功，请重新登录')
        passwordDialogVisible.value = false
        userStore.logout()
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 显示绑定手机对话框
const showBindPhoneDialog = () => {
  ElMessage.info('绑定手机功能开发中')
}

// 显示绑定邮箱对话框
const showBindEmailDialog = () => {
  ElMessage.info('绑定邮箱功能开发中')
}

onMounted(() => {
  // 检查登录状态
  if (userStore.isLogin) {
    // 如果已经有用户信息，直接初始化表单
    if (Object.keys(userStore.userInfo).length > 0) {
      initFormData()
    } else {
      // 获取用户信息
      userStore.getUserInfo().then(() => {
        initFormData()
      }).catch(error => {
        console.error('获取用户信息失败:', error)
        // 如果获取用户信息失败，跳转到登录页
        router.replace({
          path: '/login',
          query: { redirect: '/user' }
        })
      })
    }
    
    // 从本地存储加载地址列表
    loadAddressesFromLocalStorage()
  } else {
    // 如果未登录，跳转到登录页
    router.replace({
      path: '/login',
      query: { redirect: '/user' }
    })
  }
})
</script>

<style scoped>
.user-container {
  max-width: calc(100% - 360px);
  margin: 0 auto;
  padding: 20px;
}

.user-header {
  margin-bottom: 20px;
}

.user-header h2 {
  font-size: 24px;
  color: #333;
}

.user-sidebar {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-info {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.user-info h3 {
  margin: 15px 0 5px;
  font-size: 18px;
}

.user-info p {
  color: #999;
  font-size: 14px;
}

.user-menu {
  border-right: none;
}

.user-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 500px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.view-all-btn,
.add-address-btn {
  float: right;
  margin-top: -40px;
}

.address-list {
  margin-top: 20px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 15px;
}

.address-name-phone {
  margin-bottom: 5px;
}

.address-name {
  font-weight: bold;
  margin-right: 10px;
}

.address-phone {
  color: #666;
}

.address-detail {
  color: #666;
}

.security-item {
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.security-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: left;
}

.security-desc {
  color: #666;
}

.third-party-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 1400px) {
  .user-container {
    max-width: calc(100% - 200px);
  }
}

@media (max-width: 992px) {
  .user-container {
    max-width: calc(100% - 100px);
  }
  
  .user-sidebar {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .user-container {
    max-width: calc(100% - 40px);
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .security-info {
    width: 100%;
  }
  
  .third-party-buttons {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
  
  .third-party-buttons .el-button {
    width: 100%;
  }
}
</style> 