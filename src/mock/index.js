import Mock from 'mockjs'

// 设置延迟时间
Mock.setup({
  timeout: '50-240'
})

// 模拟用户数据库
const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '管理员',
    avatar: 'https://picsum.photos/200',
    phone: '13800138000',
    email: 'admin@example.com',
    gender: 1,
    birthday: '1990-01-01',
    address: '北京市朝阳区'
  }
]

// 模拟JWT验证
const generateToken = (user) => {
  // 简单模拟JWT，实际项目中应该使用真正的JWT库
  const payload = {
    id: user.id,
    username: user.username,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24小时过期
  }
  return 'Bearer ' + btoa(JSON.stringify(payload))
}

const verifyToken = (token) => {
  // 添加调试信息
  console.log('验证token:', token)
  
  // 如果是测试环境或开发环境，始终返回admin用户
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return users.find(u => u.username === 'admin');
  }
  
  if (!token || !token.startsWith('Bearer ')) {
    console.log('token格式不正确')
    return null
  }
  
  try {
    const payload = JSON.parse(atob(token.split(' ')[1]))
    
    // 检查是否过期
    if (payload.exp < Date.now()) {
      console.log('token已过期')
      return null
    }
    
    // 查找用户
    const user = users.find(u => u.id === payload.id)
    if (!user) {
      console.log('未找到用户')
      return null
    }
    
    console.log('token验证成功:', user.username)
    return user
  } catch (e) {
    console.error('Token验证错误:', e)
    return null
  }
}

// 用户相关接口
// 登录
Mock.mock('/api/user/login', 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  const user = users.find(u => u.username === username && u.password === password)
  
  if (user) {
    // 创建用户信息的副本，不包含密码
    const userInfo = { ...user }
    delete userInfo.password
    
    const token = generateToken(user)
    
    return {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: userInfo
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  }
})

// 注册
Mock.mock('/api/user/register', 'post', (options) => {
  const { username, password, phone, email } = JSON.parse(options.body)
  
  // 检查用户名是否已存在
  if (users.some(u => u.username === username)) {
    return {
      code: 400,
      message: '用户名已存在'
    }
  }
  
  // 创建新用户
  const newUser = {
    id: users.length + 1,
    username,
    password,
    nickname: username,
    avatar: 'https://picsum.photos/200',
    phone,
    email,
    gender: 0,
    birthday: '',
    address: ''
  }
  
  users.push(newUser)
  
  // 返回用户信息（不包含密码）
  const userInfo = { ...newUser }
  delete userInfo.password
  
  return {
    code: 200,
    message: '注册成功',
    data: userInfo
  }
})

// 获取用户信息
Mock.mock('/api/user/info', 'get', (options) => {
  try {
    const token = options.headers && options.headers.Authorization
    const user = verifyToken(token)
    
    if (user) {
      // 返回用户信息（不包含密码）
      const userInfo = { ...user }
      delete userInfo.password
      
      return {
        code: 200,
        message: '获取成功',
        data: userInfo
      }
    } else {
      return {
        code: 401,
        message: '未登录或登录已过期'
      }
    }
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return {
      code: 500,
      message: '服务器错误'
    }
  }
})

// 更新用户信息
Mock.mock('/api/user/update', 'post', (options) => {
  try {
    // 从请求头中获取token
    const token = options.headers && options.headers.Authorization
    console.log('更新用户信息接收到的token:', token)
    
    // 获取当前用户
    let user = null
    
    // 如果是开发环境，允许没有token也能更新用户信息
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      user = users.find(u => u.id === 1) // 默认使用admin用户
    } else {
      user = verifyToken(token)
    }
    
    if (user) {
      const updateData = JSON.parse(options.body)
      
      // 查找并更新用户信息
      const userIndex = users.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        // 更新除密码外的信息
        users[userIndex] = {
          ...users[userIndex],
          ...updateData,
          password: users[userIndex].password // 保持原密码不变
        }
        
        // 返回更新后的用户信息（不包含密码）
        const updatedUser = { ...users[userIndex] }
        delete updatedUser.password
        
        return {
          code: 200,
          message: '更新成功',
          data: updatedUser
        }
      }
    } else {
      console.log('更新用户信息时未验证通过token')
    }
    
    // 开发环境下不返回401，而是返回成功
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const adminUser = users.find(u => u.username === 'admin')
      if (adminUser) {
        const updatedUser = { ...adminUser }
        delete updatedUser.password
        return {
          code: 200,
          message: '更新成功',
          data: updatedUser
        }
      }
    }
    
    return {
      code: 401,
      message: '未登录或登录已过期'
    }
  } catch (error) {
    console.error('更新用户信息错误:', error)
    return {
      code: 500,
      message: '服务器错误'
    }
  }
})

// 商品相关接口
// 获取商品分类
Mock.mock('/api/product/categories', 'get', () => {
  const categories = [
    { id: 1, name: '手机数码', imgUrl: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1160&auto=format&fit=crop`, level: 1, parentId: 0, sort: 1 },
    { id: 2, name: '电脑办公', imgUrl: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1452&auto=format&fit=crop`, level: 1, parentId: 0, sort: 2 },
    { id: 3, name: '家用电器', imgUrl: `https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1470&auto=format&fit=crop`, level: 1, parentId: 0, sort: 3 },
    { id: 4, name: '服装鞋包', imgUrl: `https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1626&auto=format&fit=crop`, level: 1, parentId: 0, sort: 4 },
    { id: 5, name: '美妆护肤', imgUrl: `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1376&auto=format&fit=crop`, level: 1, parentId: 0, sort: 5 },
    { id: 6, name: '食品生鲜', imgUrl: `https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=1470&auto=format&fit=crop`, level: 1, parentId: 0, sort: 6 },
    { id: 7, name: '家居家装', imgUrl: `https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1470&auto=format&fit=crop`, level: 1, parentId: 0, sort: 7 },
    { id: 8, name: '运动户外', imgUrl: `https://images.unsplash.com/photo-1619551734325-81aaf323686c?q=80&w=1470&auto=format&fit=crop`, level: 1, parentId: 0, sort: 8 },
    { id: 9, name: '图书音像', imgUrl: `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1374&auto=format&fit=crop`, level: 1, parentId: 0, sort: 9 },
    { id: 10, name: '母婴玩具', imgUrl: `https://images.unsplash.com/photo-1575650772417-e6b418b0d106?q=80&w=1470&auto=format&fit=crop`, level: 1, parentId: 0, sort: 10 }
  ]
  
  return {
    code: 200,
    message: '获取成功',
    data: categories
  }
})

// 获取热门商品
Mock.mock('/api/product/hot', 'get', () => {
  const products = [
    {
      id: 1,
      title: '华为 Mate 60 Pro 5G手机',
      description: '华为最新旗舰手机，搭载麒麟9000S芯片，超感知徕卡摄像头',
      price: 6999,
      originalPrice: 7999,
      imgUrl: `https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1529&auto=format&fit=crop`,
      sales: 5650,
      stock: 100,
      discount: 8,
      categoryId: 1
    },
    {
      id: 2,
      title: '苹果 iPhone 15 Pro Max',
      description: '苹果新一代旗舰，搭载A17仿生芯片，专业级相机系统',
      price: 9599,
      originalPrice: 9999,
      imgUrl: `https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=1480&auto=format&fit=crop`,
      sales: 5234,
      stock: 100,
      discount: 8,
      categoryId: 1
    },
    {
      id: 3,
      title: '戴尔 XPS 13 超轻薄笔记本',
      description: '英特尔13代i7处理器，16GB内存，512GB固态硬盘，13.4英寸4K屏幕',
      price: 9999,
      originalPrice: 11999,
      imgUrl: `https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1632&auto=format&fit=crop`,
      sales: 2500,
      stock: 100,
      discount: 8,
      categoryId: 2
    },
    {
      id: 4,
      title: '小米智能电视6 65英寸',
      description: '量子点全面屏，4K超高清，AI智能语音，杜比视界',
      price: 4999,
      originalPrice: 5499,
      imgUrl: `https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1470&auto=format&fit=crop`,
      sales: 3300,
      stock: 100,
      discount: 8,
      categoryId: 3
    },
    {
      id: 5,
      title: '耐克 Air Jordan 1 高帮篮球鞋',
      description: '经典复古设计，舒适缓震，优质牛皮材质，专业球场表现',
      price: 1399,
      originalPrice: 1599,
      imgUrl: `https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=1421&auto=format&fit=crop`,
      sales: 4800,
      stock: 100,
      discount: 8,
      categoryId: 4
    },
    {
      id: 6,
      title: 'SK-II 神仙水 230ml',
      description: '日本进口，pitera成分，改善肤质，提亮肤色，改善细纹',
      price: 1550,
      originalPrice: 1700,
      imgUrl: `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1376&auto=format&fit=crop`,
      sales: 6800,
      stock: 100,
      discount: 8,
      categoryId: 5
    },
    {
      id: 7,
      title: '雅诗兰黛 DW粉底液',
      description: '持久遮瑕，自然妆感，不易脱妆，SPF10防晒',
      price: 450,
      originalPrice: 550,
      imgUrl: `https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=1470&auto=format&fit=crop`,
      sales: 9700,
      stock: 100,
      discount: 8,
      categoryId: 5
    },
    {
      id: 8,
      title: '法国红酒',
      description: '法国原瓶进口，口感醇厚，单宁柔顺，适合搭配各种美食',
      price: 299.9,
      originalPrice: 349.9,
      imgUrl: `https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1470&auto=format&fit=crop`,
      sales: 800,
      stock: 100,
      discount: 8,
      categoryId: 6
    }
  ]
  
  return {
    code: 200,
    message: '获取成功',
    data: products
  }
})

// 获取新品上架
Mock.mock('/api/product/new', 'get', () => {
  const products = [
    {
      id: 101,
      title: '三星 Galaxy Z Fold5 折叠屏手机',
      description: '7.6英寸大屏幕，骁龙8 Gen 2处理器，IPX8防水，S Pen支持',
      price: 12999,
      originalPrice: 13999,
      imgUrl: `https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?q=80&w=1471&auto=format&fit=crop`,
      sales: 1850,
      stock: 100,
      discount: 8,
      categoryId: 1
    },
    {
      id: 102,
      title: '索尼 WH-1000XM5 无线降噪耳机',
      description: '新一代旗舰降噪，8麦克风系统，30小时续航，LDAC高解析音频',
      price: 2999,
      originalPrice: 3199,
      imgUrl: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1470&auto=format&fit=crop`,
      sales: 1560,
      stock: 100,
      discount: 8,
      categoryId: 1
    },
    {
      id: 103,
      title: '联想 拯救者 Y9000P 游戏本',
      description: 'RTX 5090显卡，U9-275HX处理器，64GDDR5内存，8TB固态，18英寸4K屏',
      price: 16999,
      originalPrice: 17999,
      imgUrl: `https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1420&auto=format&fit=crop`,
      sales: 980,
      stock: 100,
      discount: 8,
      categoryId: 2
    },
    {
      id: 104,
      title: '科沃斯 T10 Plus 扫地机器人',
      description: '6000Pa大吸力，自动集尘，激光导航，智能规划路线，APP远程控制',
      price: 4499,
      originalPrice: 4799,
      imgUrl: `https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=1480&auto=format&fit=crop`,
      sales: 1250,
      stock: 100,
      discount: 8,
      categoryId: 3
    },
    {
      id: 105,
      title: 'LV Neverfull 手提包',
      description: '经典帆布配真皮，大容量设计，内置小袋，时尚百搭',
      price: 13500,
      originalPrice: 14000,
      imgUrl: `https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1470&auto=format&fit=crop`,
      sales: 820,
      stock: 100,
      discount: 8,
      categoryId: 4
    },
    {
      id: 106,
      title: '兰蔻菁纯面霜 50ml',
      description: '法国进口，奢华质地，滋润保湿，淡化细纹，紧致肌肤',
      price: 1199,
      originalPrice: 1399,
      imgUrl: `https://images.unsplash.com/photo-1567721913486-6585f069b332?q=80&w=1588&auto=format&fit=crop`,
      sales: 1600,
      stock: 100,
      discount: 8,
      categoryId: 5
    },
    {
      id: 107,
      title: '智米全直流变频空调 1.5匹',
      description: '1级能效，制冷制热双效合一，静音设计，智能控制',
      price: 3499,
      originalPrice: 3799,
      imgUrl: `https://images.unsplash.com/photo-1658480695000-0f54553b8c58?q=80&w=1335&auto=format&fit=crop`,
      sales: 1050,
      stock: 100,
      discount: 8,
      categoryId: 3
    },
    {
      id: 108,
      title: '双立人刀具七件套',
      description: '德国进口，不锈钢材质，锋利持久，厨房烹饪必备',
      price: 1899,
      originalPrice: 2099,
      imgUrl: `https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=1470&auto=format&fit=crop`,
      sales: 920,
      stock: 100,
      discount: 8,
      categoryId: 7
    }
  ]
  
  return {
    code: 200,
    message: '获取成功',
    data: products
  }
})

// 获取推荐商品
Mock.mock(RegExp('/api/product/recommend.*'), 'get', (options) => {
  const url = options.url
  const params = new URLSearchParams(url.split('?')[1])
  const page = parseInt(params.get('page')) || 1
  const pageSize = parseInt(params.get('pageSize')) || 10
  
  // 真实商品数据库
  const allRecommendProducts = [
    { id: 201, title: '小米13 Ultra 5G手机', description: '徕卡光学镜头，骁龙8 Gen 2处理器，2K OLED屏幕', price: 5999, originalPrice: 6499, imgUrl: `https://images.unsplash.com/photo-1598327105854-c8674faddf79?q=80&w=1227&auto=format&fit=crop`, sales: 4500, stock: 100, discount: 8, categoryId: 1 },
    { id: 202, title: 'iPad Pro 12.9英寸 M2芯片', description: 'Liquid视网膜XDR显示屏，M2芯片，雷雳/USB 4接口', price: 8999, originalPrice: 9299, imgUrl: `https://images.unsplash.com/photo-1527698266440-12104e498b76?q=80&w=1470&auto=format&fit=crop`, sales: 3800, stock: 100, discount: 8, categoryId: 2 },
    { id: 203, title: '松下 EH-NA98 纳米水离子吹风机', description: '日本进口，纳米水离子技术，护发养发不伤发', price: 1699, originalPrice: 1999, imgUrl: `https://images.unsplash.com/photo-1522338140262-f46f5913618a?q=80&w=1624&auto=format&fit=crop`, sales: 6200, stock: 100, discount: 8, categoryId: 3 },
    { id: 204, title: '美的空气炸锅 5.5L大容量', description: '无油低脂，8种预设菜单，可视化操作，自动断电', price: 399, originalPrice: 599, imgUrl: `https://images.unsplash.com/photo-1585237017125-24baf8d7406f?q=80&w=1470&auto=format&fit=crop`, sales: 7800, stock: 100, discount: 8, categoryId: 3 },
    { id: 205, title: '欧莱雅复颜玻尿酸水光充盈导入霜', description: '高浓度1.5%透明质酸，保湿补水，提拉紧致', price: 349, originalPrice: 449, imgUrl: `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1376&auto=format&fit=crop`, sales: 5100, stock: 100, discount: 8, categoryId: 5 },
    { id: 206, title: '安佳牛奶 250ml*24盒', description: '新西兰进口，全脂纯牛奶，高钙高蛋白', price: 88.9, originalPrice: 109.9, imgUrl: `https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1471&auto=format&fit=crop`, sales: 9200, stock: 100, discount: 8, categoryId: 6 },
    { id: 207, title: '智米无叶风扇 落地静音', description: '直流变频电机，智能遥控，12档风量调节，定时功能', price: 899, originalPrice: 1099, imgUrl: `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1413&auto=format&fit=crop`, sales: 3500, stock: 100, discount: 8, categoryId: 3 },
    { id: 208, title: 'MUJI 无印良品 四件套', description: '日本设计，100%精梳棉，柔软亲肤，透气排汗', price: 699, originalPrice: 899, imgUrl: `https://images.unsplash.com/photo-1592229505726-ca121723b8ef?q=80&w=1374&auto=format&fit=crop`, sales: 4600, stock: 100, discount: 8, categoryId: 7 },
    { id: 209, title: '胜利羽毛球拍 全碳素', description: '专业比赛用拍，高强度碳纤维，超轻设计，强力攻防', price: 599, originalPrice: 799, imgUrl: `https://images.unsplash.com/photo-1619551734325-81aaf323686c?q=80&w=1470&auto=format&fit=crop`, sales: 2800, stock: 100, discount: 8, categoryId: 8 },
    { id: 210, title: '《人类简史》中文版', description: '尤瓦尔·赫拉利著，讲述人类从史前猿人到智人的演化历程', price: 68, originalPrice: 88, imgUrl: `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1374&auto=format&fit=crop`, sales: 12000, stock: 100, discount: 8, categoryId: 9 },
    { id: 211, title: '乐高星球大战系列千年隼', description: '经典收藏版，1000+零件，高度还原电影场景', price: 899, originalPrice: 999, imgUrl: `https://images.unsplash.com/photo-1575650772417-e6b418b0d106?q=80&w=1470&auto=format&fit=crop`, sales: 3300, stock: 100, discount: 8, categoryId: 10 },
    { id: 212, title: '森海塞尔 MOMENTUM 4 无线耳机', description: '60小时超长续航，自适应降噪，高清音质，舒适佩戴', price: 2599, originalPrice: 2999, imgUrl: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1470&auto=format&fit=crop`, sales: 1800, stock: 100, discount: 8, categoryId: 1 },
    { id: 213, title: '雀巢咖啡胶囊套装', description: '30颗装，意式浓缩，口感醇厚，即插即用', price: 129, originalPrice: 169, imgUrl: `https://images.unsplash.com/photo-1579091750791-a419eaf97469?q=80&w=1470&auto=format&fit=crop`, sales: 4500, stock: 100, discount: 8, categoryId: 6 },
    { id: 214, title: '飞利浦智能电动牙刷', description: '声波震动技术，5种清洁模式，智能压力感应，续航3周', price: 799, originalPrice: 999, imgUrl: `https://images.unsplash.com/photo-1559591937-afbbb26d4b25?q=80&w=1470&auto=format&fit=crop`, sales: 5700, stock: 100, discount: 8, categoryId: 5 },
    { id: 215, title: '宜家简约书桌', description: '北欧风格设计，环保材质，组装便捷，空间利用率高', price: 599, originalPrice: 699, imgUrl: `https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1470&auto=format&fit=crop`, sales: 3900, stock: 100, discount: 8, categoryId: 7 },
    { id: 216, title: '优衣库男士衬衫', description: '棉麻混纺，透气舒适，修身剪裁，商务休闲两用', price: 199, originalPrice: 299, imgUrl: `https://images.unsplash.com/photo-1604695573706-53170668f6a6?q=80&w=1374&auto=format&fit=crop`, sales: 8500, stock: 100, discount: 8, categoryId: 4 },
    { id: 217, title: '三星 65英寸 QLED 4K电视', description: '量子点技术，HDR10+，智能语音助手，游戏模式', price: 6999, originalPrice: 7999, imgUrl: `https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1470&auto=format&fit=crop`, sales: 2100, stock: 100, discount: 8, categoryId: 3 },
    { id: 218, title: '戴森 V12 Detect Slim 无线吸尘器', description: '激光尘埃探测，强劲吸力，智能感应，60分钟续航', price: 4590, originalPrice: 4990, imgUrl: `https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1470&auto=format&fit=crop`, sales: 2700, stock: 100, discount: 8, categoryId: 3 },
    { id: 219, title: '华硕 ROG 电竞显示器 27英寸', description: '2K分辨率，170Hz刷新率，1ms响应，G-Sync技术', price: 3299, originalPrice: 3699, imgUrl: `https://images.unsplash.com/photo-1623126464548-efd5a67b2ce3?q=80&w=1470&auto=format&fit=crop`, sales: 1900, stock: 100, discount: 8, categoryId: 2 },
    { id: 220, title: '膳魔师保温杯 500ml', description: '316不锈钢内胆，真空保温，12小时保温保冷', price: 199, originalPrice: 249, imgUrl: `https://images.unsplash.com/photo-1575377625250-3cfa6877f621?q=80&w=1480&auto=format&fit=crop`, sales: 7200, stock: 100, discount: 8, categoryId: 7 },
  ]
  
  // 根据分页参数获取对应的产品
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const products = allRecommendProducts.slice(start, end)
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      list: products,
      total: allRecommendProducts.length,
      page,
      pageSize
    }
  }
})

// 获取商品详情
Mock.mock(RegExp('/api/product/detail/\\d+'), 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/product\/detail\/(\d+)/)[1])
  
  // 商品详情数据库
  const productDetails = {
    1: {
      id: 1,
      title: '华为 Mate 60 Pro 5G手机',
      description: '华为最新旗舰手机，搭载麒麟9000S芯片，超感知徕卡摄像头',
      detail: `<p><strong>华为 Mate 60 Pro 5G手机产品详情</strong></p>
              <p>尺寸：162.3mm × 75.8mm × 8.1mm</p>
              <p>重量：约220g（含电池）</p>
              <p>屏幕：6.82英寸 OLED 柔性屏，2720 x 1260分辨率</p>
              <p>处理器：麒麟9000S八核处理器</p>
              <p>内存：12GB LPDDR5</p>
              <p>存储：512GB</p>
              <p>电池：5000mAh（典型值）</p>
              <p>摄像头：后置5000万像素主摄+1300万像素超广角+1200万像素长焦，前置1300万像素</p>
              <p>系统：HarmonyOS 4.0</p>
              <p>特色功能：卫星通话、超感知徕卡影像、昆仑玻璃2.0</p>`,
      price: 6999,
      originalPrice: 7999,
      imgUrl: `https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1529&auto=format&fit=crop`,
      sales: 5650,
      stock: 100,
      discount: 8,
      categoryId: 1,
      images: [
        `https://picsum.photos/800/800?random=1`,
        `https://picsum.photos/800/800?random=2`,
        `https://picsum.photos/800/800?random=3`,
        `https://picsum.photos/800/800?random=4`
      ],
      specs: [
        {
          name: '颜色',
          values: ['曜金黑', '雅致白', '青山青', '紫色']
        },
        {
          name: '存储',
          values: ['256GB', '512GB', '1TB']
        }
      ],
      comments: [
        {
          id: 1,
          username: '科技爱好者',
          avatar: 'https://picsum.photos/50/50?random=1',
          content: '麒麟9000S性能惊人，信号强度超出预期，卫星通话功能实用性很强',
          rate: 5,
          time: '2023-10-01 12:00:00',
          images: [
            'https://picsum.photos/100/100?random=11',
            'https://picsum.photos/100/100?random=12'
          ]
        },
        {
          id: 2,
          username: '手机控',
          avatar: 'https://picsum.photos/50/50?random=2',
          content: '拍照效果出色，尤其是夜景模式，电池续航能力强',
          rate: 5,
          time: '2023-10-02 14:30:00',
          images: []
        }
      ]
    },
    // 苹果手机详情
    2: {
      id: 2,
      title: '苹果 iPhone 15 Pro Max',
      description: '苹果新一代旗舰，搭载A17仿生芯片，专业级相机系统',
      detail: `<p><strong>苹果 iPhone 15 Pro Max 产品详情</strong></p>
              <p>尺寸：159.9mm × 76.7mm × 8.25mm</p>
              <p>重量：约221g</p>
              <p>屏幕：6.7英寸 Super Retina XDR OLED全面屏，2796 x 1290分辨率</p>
              <p>处理器：A17 Pro仿生芯片</p>
              <p>内存：8GB</p>
              <p>存储：256GB/512GB/1TB</p>
              <p>电池：4422mAh</p>
              <p>摄像头：后置4800万像素主摄+1200万像素超广角+1200万像素长焦，前置1200万像素</p>
              <p>系统：iOS 17</p>
              <p>特色功能：动态岛、钛金属边框、USB-C接口、5倍光学变焦</p>`,
      price: 9599,
      originalPrice: 9999,
      imgUrl: `https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=1480&auto=format&fit=crop`,
      sales: 5234,
      stock: 100,
      discount: 8,
      categoryId: 1,
      images: [
        `https://picsum.photos/800/800?random=5`,
        `https://picsum.photos/800/800?random=6`,
        `https://picsum.photos/800/800?random=7`,
        `https://picsum.photos/800/800?random=8`
      ],
      specs: [
        {
          name: '颜色',
          values: ['自然钛色', '蓝色钛金属', '白色钛金属', '黑色钛金属']
        },
        {
          name: '存储',
          values: ['256GB', '512GB', '1TB']
        }
      ],
      comments: [
        {
          id: 1,
          username: '果粉一号',
          avatar: 'https://picsum.photos/50/50?random=3',
          content: 'A17 Pro性能强劲，拍照能力更上一层楼，尤其是在弱光环境下',
          rate: 5,
          time: '2023-09-28 10:20:00',
          images: [
            'https://picsum.photos/100/100?random=13',
            'https://picsum.photos/100/100?random=14'
          ]
        },
        {
          id: 2,
          username: '设计师小王',
          avatar: 'https://picsum.photos/50/50?random=4',
          content: '钛金属材质手感极佳，比不锈钢轻很多，屏幕显示效果出色',
          rate: 5,
          time: '2023-09-30 16:45:00',
          images: []
        }
      ]
    }
  }
  
  // 如果商品ID存在于预设数据中，返回对应的详情
  if (productDetails[id]) {
    return {
      code: 200,
      message: '获取成功',
      data: productDetails[id]
    }
  }
  
  // 否则生成通用商品详情
  // 使用固定价格 = 商品ID * 10
  const price = id * 10
  const originalPrice = price + 50
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      id,
      title: `商品${id}`,
      description: `这是商品${id}的简介，高品质精选商品`,
      detail: `<p><strong>商品${id} 详细介绍</strong></p>
              <p>这是一款高品质的商品，具有出色的性能和精美的外观设计</p>
              <p>主要特点：</p>
              <ul>
                <li>优质材料，坚固耐用</li>
                <li>时尚外观，精致做工</li>
                <li>多种功能，满足各种需求</li>
                <li>性价比高，物超所值</li>
              </ul>
              <p>适用场景：家庭、办公、户外等多种环境</p>
              <p>产品参数：</p>
              <p>尺寸：适中</p>
              <p>重量：轻便</p>
              <p>颜色：多色可选</p>`,
      price: price,
      originalPrice: originalPrice,
      imgUrl: `https://picsum.photos/300/300?random=${id}`,
      sales: 200 + id * 5,
      stock: 100,
      discount: 8,
      categoryId: (id % 10) + 1,
      images: [
        `https://picsum.photos/800/800?random=${id*4+1}`,
        `https://picsum.photos/800/800?random=${id*4+2}`,
        `https://picsum.photos/800/800?random=${id*4+3}`,
        `https://picsum.photos/800/800?random=${id*4+4}`
      ],
      specs: [
        {
          name: '颜色',
          values: ['红色', '蓝色', '黑色', '白色']
        },
        {
          name: '尺寸',
          values: ['S', 'M', 'L', 'XL', 'XXL']
        }
      ],
      comments: [
        {
          id: 1,
          username: '满意顾客',
          avatar: 'https://picsum.photos/50/50?random=1',
          content: '商品质量很好，物流很快，包装完好无损',
          rate: 5,
          time: '2023-01-01 12:00:00',
          images: [
            'https://picsum.photos/100/100?random=11',
            'https://picsum.photos/100/100?random=12'
          ]
        },
        {
          id: 2,
          username: '理性消费者',
          avatar: 'https://picsum.photos/50/50?random=2',
          content: '商品符合描述，性价比很高，值得购买',
          rate: 4,
          time: '2023-01-02 12:00:00',
          images: []
        }
      ]
    }
  }
})

// 模拟购物车数据
const cartItems = []

// 获取购物车列表
Mock.mock('/api/cart/list', 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: cartItems
  }
})

// 添加商品到购物车
Mock.mock('/api/cart/add', 'post', (options) => {
  const { productId, count, specs } = JSON.parse(options.body)
  
  // 检查商品是否已在购物车中
  const existingItemIndex = cartItems.findIndex(item => 
    item.productId === productId && item.specs === specs
  )
  
  if (existingItemIndex > -1) {
    // 如果已存在，增加数量
    cartItems[existingItemIndex].count += count
  } else {
    // 如果不存在，添加新商品
    // 使用固定价格 = 商品ID * 10
    const price = productId * 10
    
    cartItems.push({
      id: new Date().getTime(), // 使用时间戳作为唯一ID
      productId,
      title: `商品${productId}`,
      price: price,
      count,
      imgUrl: `https://picsum.photos/100/100?random=${productId}`,
      selected: true,
      stock: 100,
      specs
    })
  }
  
  return {
    code: 200,
    message: '添加成功',
    data: {
      id: cartItems[existingItemIndex > -1 ? existingItemIndex : cartItems.length - 1].id
    }
  }
})

// 更新购物车商品数量
Mock.mock('/api/cart/update', 'put', (options) => {
  const { id, count } = JSON.parse(options.body)
  
  const itemIndex = cartItems.findIndex(item => item.id === id)
  if (itemIndex > -1) {
    cartItems[itemIndex].count = count
  }
  
  return {
    code: 200,
    message: '更新成功'
  }
})

// 从购物车中删除商品
Mock.mock('/api/cart/remove', 'delete', (options) => {
  const { id } = JSON.parse(options.body)
  
  const itemIndex = cartItems.findIndex(item => item.id === id)
  if (itemIndex > -1) {
    cartItems.splice(itemIndex, 1)
  }
  
  return {
    code: 200,
    message: '删除成功'
  }
})

// 清空购物车
Mock.mock('/api/cart/clear', 'delete', () => {
  cartItems.length = 0
  
  return {
    code: 200,
    message: '清空成功'
  }
})

// 初始化全局订单列表
if (typeof window !== 'undefined' && !window.globalOrderList) {
  window.globalOrderList = []
}

// 获取订单列表
Mock.mock(RegExp('/api/order/list.*'), 'get', (options) => {
  console.log('获取订单列表请求:', options)
  
  const url = options.url
  const params = new URLSearchParams(url.split('?')[1] || '')
  
  // 尝试从URL参数中获取status
  let status = params.get('status')
  
  // 如果URL中没有status参数，尝试从请求体中获取
  if (status === null && options.body) {
    try {
      const body = JSON.parse(options.body)
      status = body.status
    } catch (e) {
      console.error('解析请求体失败:', e)
    }
  }
  
  // 如果status是字符串，转换为数字
  status = status !== null ? parseInt(status) : null
  
  console.log('处理的订单状态参数:', status)
  
  // 合并真实创建的订单和模拟订单
  let orderList = []
  
  // 添加真实创建的订单
  if (typeof window !== 'undefined' && window.globalOrderList && window.globalOrderList.length > 0) {
    // 如果指定了状态，则过滤
    if (status !== null && !isNaN(status)) {
      orderList = orderList.concat(window.globalOrderList.filter(order => order.status === status))
    } else {
      orderList = orderList.concat(window.globalOrderList)
    }
  }
  
  // 如果真实订单不足10个，添加模拟订单
  const neededCount = Math.max(0, 10 - orderList.length)
  
  if (neededCount > 0) {
    for (let i = 1; i <= neededCount; i++) {
      // 如果指定了状态，则所有模拟订单都使用该状态
      // 否则，默认使用已完成状态(4)
      const orderStatus = status !== null && !isNaN(status) ? status : 4
      
      // 生成合理的时间
      const now = new Date()
      // 创建时间为当前时间减去1-5天的随机时间
      const createTime = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
      const createTimeStr = createTime.toLocaleString()
      
      // 付款时间为创建时间后的30分钟
      let payTime = null
      if (orderStatus > 0) {
        const payTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000)
        payTime = payTimeDate.toLocaleString()
      }
      
      // 发货时间为付款时间后的1天
      let deliveryTime = null
      if (orderStatus > 1) {
        const deliveryTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000 + 24 * 60 * 60 * 1000)
        deliveryTime = deliveryTimeDate.toLocaleString()
      }
      
      // 收货时间为发货时间后的2天
      let receiveTime = null
      if (orderStatus > 3) {
        const receiveTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000)
        receiveTime = receiveTimeDate.toLocaleString()
      }
      
      // 固定总价 = 1000 + 订单序号 * 100
      const totalPrice = 1000 + i * 100
      
      const order = {
        id: `ORDER${createTime.getTime()}${i.toString().padStart(4, '0')}`,
        status: orderStatus,
        statusText: ['待付款', '待发货', '已发货', '待收货', '已完成'][orderStatus],
        totalPrice: totalPrice,
        createTime: createTimeStr,
        payTime: payTime,
        deliveryTime: deliveryTime,
        receiveTime: receiveTime,
        address: {
          name: `用户${i}`,
          phone: `1380013800${i}`,
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: `XX路XX号XX小区XX栋XX单元XX号`
        },
        products: []
      }
      
      // 生成固定数量的商品
      const productCount = i % 3 + 1 // 1-3个商品
      for (let j = 1; j <= productCount; j++) {
        const productId = i * 10 + j
        // 使用固定价格 = 商品ID * 10
        const price = productId * 10
        
        order.products.push({
          id: productId,
          title: `订单商品${j}`,
          price: price,
          count: j,
          imgUrl: `https://picsum.photos/100/100?random=${productId}`,
          specs: '红色,XL'
        })
      }
      
      orderList.push(order)
    }
  }
  
  console.log(`返回${orderList.length}个订单`)
  
  return {
    code: 200,
    message: '获取成功',
    data: orderList
  }
})

// 创建订单
Mock.mock('/api/order/create', 'post', (options) => {
  const orderData = JSON.parse(options.body)
  const now = new Date()
  // 使用时间戳和随机数生成唯一订单ID
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const orderId = `ORDER${now.getTime()}${randomNum}`
  
  // 计算订单总价
  let totalPrice = 0
  const products = []
  
  // 处理商品信息
  orderData.products.forEach((product) => {
    // 使用商品原始价格，不重新计算
    const price = product.price || product.id * 10
    totalPrice += price * product.count
    
    products.push({
      id: product.id,
      title: product.title || `商品${product.id}`,
      price: price,
      count: product.count,
      imgUrl: product.imgUrl || `https://picsum.photos/100/100?random=${product.id}`,
      specs: product.specs || '默认规格'
    })
  })
  
  // 创建订单对象
  const order = {
    id: orderId,
    status: 0, // 待付款
    statusText: '待付款',
    totalPrice: totalPrice,
    createTime: now.toLocaleString(),
    payTime: null,
    deliveryTime: null,
    receiveTime: null,
    address: orderData.address,
    products: products,
    deliveryType: orderData.deliveryType,
    paymentType: orderData.paymentType,
    remark: orderData.remark || ''
  }
  
  // 将新订单添加到订单列表中，以便在订单列表接口中能够查询到
  // 这里我们模拟一个全局订单列表
  if (!window.globalOrderList) {
    window.globalOrderList = []
  }
  window.globalOrderList.push(order)
  
  console.log('创建订单成功:', orderId)
  
  return {
    code: 200,
    message: '创建成功',
    data: order
  }
})

// 获取订单详情
Mock.mock(RegExp('/api/order/detail/.*'), 'get', (options) => {
  const id = options.url.split('/').pop()
  
  // 先从全局订单列表中查找
  if (typeof window !== 'undefined' && window.globalOrderList) {
    const existingOrder = window.globalOrderList.find(order => order.id === id)
    if (existingOrder) {
      console.log('找到已创建的订单:', id)
      return {
        code: 200,
        message: '获取成功',
        data: existingOrder
      }
    }
  }
  
  console.log('未找到已创建的订单，生成模拟订单:', id)
  
  // 如果没找到，则生成模拟订单
  // 从订单ID提取序号，如果无法提取则使用1
  const orderNum = parseInt(id.replace(/ORDER\d+(\d{4})$/, '$1')) || 1
  const status = orderNum % 5
  
  // 生成合理时间
  const now = new Date()
  
  // 创建时间为当前时间减去5天
  const createTime = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  const createTimeStr = createTime.toLocaleString()
  
  // 付款时间为创建时间后的30分钟
  let payTime = null
  if (status > 0) {
    const payTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000)
    payTime = payTimeDate.toLocaleString()
  }
  
  // 发货时间为付款时间后的1天
  let deliveryTime = null
  if (status > 1) {
    const deliveryTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000 + 24 * 60 * 60 * 1000)
    deliveryTime = deliveryTimeDate.toLocaleString()
  }
  
  // 收货时间为发货时间后的2天
  let receiveTime = null
  if (status > 3) {
    const receiveTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000)
    receiveTime = receiveTimeDate.toLocaleString()
  }
  
  // 固定总价 = 1000 + 订单序号 * 100
  const totalPrice = 1000 + orderNum * 100
  
  const order = {
    id,
    status,
    statusText: ['待付款', '待发货', '已发货', '待收货', '已完成'][status],
    totalPrice: totalPrice,
    createTime: createTimeStr,
    payTime: payTime,
    deliveryTime: deliveryTime,
    receiveTime: receiveTime,
    address: {
      name: `用户${orderNum}`,
      phone: `1380013800${orderNum}`,
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: `XX路XX号XX小区XX栋XX单元XX号`
    },
    products: []
  }
  
  // 生成固定数量的商品
  const productCount = orderNum % 3 + 1 // 1-3个商品
  for (let j = 1; j <= productCount; j++) {
    const productId = orderNum * 10 + j
    // 使用固定价格 = 商品ID * 10
    const price = productId * 10
    
    order.products.push({
      id: productId,
      title: `订单商品${j}`,
      price: price,
      count: j,
      imgUrl: `https://picsum.photos/100/100?random=${productId}`,
      specs: '红色,XL'
    })
  }
  
  return {
    code: 200,
    message: '获取成功',
    data: order
  }
})

// 支付订单
Mock.mock(RegExp('/api/order/pay/.*'), 'put', (options) => {
  const id = options.url.split('/').pop()
  const payTimeDate = new Date()
  const payTime = payTimeDate.toLocaleString()
  
  // 更新全局订单列表中的订单状态
  if (typeof window !== 'undefined' && window.globalOrderList) {
    const orderIndex = window.globalOrderList.findIndex(order => order.id === id)
    if (orderIndex !== -1) {
      window.globalOrderList[orderIndex].status = 1
      window.globalOrderList[orderIndex].statusText = '待发货'
      window.globalOrderList[orderIndex].payTime = payTime
      console.log('订单支付成功，状态已更新:', id)
    } else {
      // 如果在全局订单列表中找不到，创建一个新的已支付订单
      const newOrder = {
        id,
        status: 1,
        statusText: '待发货',
        totalPrice: 1000,
        createTime: new Date(payTimeDate.getTime() - 30 * 60 * 1000).toLocaleString(),
        payTime: payTime,
        deliveryTime: null,
        receiveTime: null,
        address: {
          name: '用户',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: 'XX路XX号XX小区XX栋XX单元XX号'
        },
        products: [{
          id: 1,
          title: '订单商品1',
          price: 1000,
          count: 1,
          imgUrl: 'https://picsum.photos/100/100?random=1',
          specs: '红色,XL'
        }]
      }
      
      if (!window.globalOrderList) {
        window.globalOrderList = []
      }
      
      window.globalOrderList.push(newOrder)
      console.log('创建并添加新的已支付订单:', id)
    }
  }
  
  return {
    code: 200,
    message: '支付成功',
    data: {
      id,
      status: 1,
      statusText: '待发货',
      payTime
    }
  }
})

// 取消订单
Mock.mock(RegExp('/api/order/cancel/.*'), 'put', (options) => {
  const id = options.url.split('/').pop()
  
  // 从全局订单列表中删除被取消的订单
  if (typeof window !== 'undefined' && window.globalOrderList) {
    const orderIndex = window.globalOrderList.findIndex(order => order.id === id)
    if (orderIndex !== -1) {
      window.globalOrderList.splice(orderIndex, 1)
      console.log('订单取消成功，已从列表中移除:', id)
    }
  }
  
  return {
    code: 200,
    message: '取消成功'
  }
})

// 获取商品列表
Mock.mock(RegExp('/api/product/list.*'), 'get', (options) => {
  const url = options.url
  const params = new URLSearchParams(url.split('?')[1])
  const page = parseInt(params.get('page')) || 1
  const pageSize = parseInt(params.get('pageSize')) || 10
  const categoryId = params.get('categoryId')
  const sort = params.get('sort') || 'default'
  
  // 根据分类ID筛选商品
  const categoryFilter = categoryId ? parseInt(categoryId) : null
  
  // 商品数据库 - 真实商品名称
  const allProducts = [
    // 手机数码 - categoryId = 1
    { id: 1, title: '华为 Mate 60 Pro 5G手机', description: '华为最新旗舰手机，搭载麒麟9000S芯片，超感知徕卡摄像头', price: 6999, originalPrice: 7999, imgUrl: `https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1529&auto=format&fit=crop`, sales: 5650, stock: 100, discount: 8, categoryId: 1 },
    { id: 2, title: '苹果 iPhone 15 Pro Max', description: '苹果新一代旗舰，搭载A17仿生芯片，专业级相机系统', price: 9599, originalPrice: 9999, imgUrl: `https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=1480&auto=format&fit=crop`, sales: 5234, stock: 100, discount: 8, categoryId: 1 },
    { id: 3, title: '小米14 Pro', description: '骁龙8 Gen 3处理器，徕卡认证四摄，2K分辨率屏幕', price: 4999, originalPrice: 5299, imgUrl: `https://images.unsplash.com/photo-1598327105854-c8674faddf79?q=80&w=1227&auto=format&fit=crop`, sales: 4820, stock: 100, discount: 8, categoryId: 1 },
    { id: 4, title: 'OPPO Find X7 Ultra', description: '哈苏影像系统，骁龙8 Gen 2处理器，120Hz屏幕', price: 5999, originalPrice: 6499, imgUrl: `https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=1481&auto=format&fit=crop`, sales: 3560, stock: 100, discount: 8, categoryId: 1 },
    { id: 5, title: 'vivo X100 Pro', description: '蔡司光学，5000mAh大电池，90W超级闪充', price: 5499, originalPrice: 5999, imgUrl: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1160&auto=format&fit=crop`, sales: 3210, stock: 100, discount: 8, categoryId: 1 },
    
    // 电脑办公 - categoryId = 2
    { id: 11, title: 'MacBook Pro 14英寸 M3 Pro', description: 'M3 Pro芯片，14核GPU，18小时续航，Liquid视网膜XDR显示屏', price: 14999, originalPrice: 15999, imgUrl: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1452&auto=format&fit=crop`, sales: 2150, stock: 100, discount: 8, categoryId: 2 },
    { id: 12, title: '戴尔 XPS 13 超轻薄笔记本', description: '英特尔13代i7处理器，16GB内存，512GB固态硬盘，13.4英寸4K屏幕', price: 9999, originalPrice: 11999, imgUrl: `https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1632&auto=format&fit=crop`, sales: 1840, stock: 100, discount: 8, categoryId: 2 },
    { id: 13, title: '联想 ThinkPad X1 Carbon', description: '英特尔Evo平台，i7-1365U处理器，16GB内存，1TB固态，14英寸2.8K屏', price: 12599, originalPrice: 13599, imgUrl: `https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1420&auto=format&fit=crop`, sales: 1760, stock: 100, discount: 8, categoryId: 2 },
    { id: 14, title: '华硕 ROG 枪神7 Plus', description: '酷睿i9-13980HX，RTX 4090显卡，32GB内存，2TB固态，17.3英寸屏幕', price: 29999, originalPrice: 31999, imgUrl: `https://images.unsplash.com/photo-1623126464548-efd5a67b2ce3?q=80&w=1470&auto=format&fit=crop`, sales: 980, stock: 100, discount: 8, categoryId: 2 },
    { id: 15, title: '罗技 MX Master 3S 鼠标', description: '8000DPI传感器，静音开关，多设备控制，USB-C充电', price: 799, originalPrice: 899, imgUrl: `https://images.unsplash.com/photo-1605773527852-c546a8584ea3?q=80&w=1374&auto=format&fit=crop`, sales: 3420, stock: 100, discount: 8, categoryId: 2 },
    
    // 家用电器 - categoryId = 3
    { id: 21, title: '戴森 V15 Detect 无线吸尘器', description: '激光探测技术，强力吸附，智能感应灰尘，多种吸头', price: 4990, originalPrice: 5490, imgUrl: `https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1470&auto=format&fit=crop`, sales: 2540, stock: 100, discount: 8, categoryId: 3 },
    { id: 22, title: '美的空气炸锅 5.5L大容量', description: '无油低脂，8种预设菜单，可视化操作，自动断电', price: 399, originalPrice: 599, imgUrl: `https://images.unsplash.com/photo-1585237017125-24baf8d7406f?q=80&w=1470&auto=format&fit=crop`, sales: 7800, stock: 100, discount: 8, categoryId: 3 },
    { id: 23, title: '松下 EH-NA98 纳米水离子吹风机', description: '日本进口，纳米水离子技术，护发养发不伤发', price: 1699, originalPrice: 1999, imgUrl: `https://images.unsplash.com/photo-1522338140262-f46f5913618a?q=80&w=1624&auto=format&fit=crop`, sales: 6200, stock: 100, discount: 8, categoryId: 3 },
    { id: 24, title: '西门子 610L 对开门冰箱', description: '风冷无霜，变频节能，智能控温，大容量', price: 6999, originalPrice: 7999, imgUrl: `https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1470&auto=format&fit=crop`, sales: 1250, stock: 100, discount: 8, categoryId: 3 },
    { id: 25, title: '小米智能电视6 65英寸', description: '量子点全面屏，4K超高清，AI智能语音，杜比视界', price: 4999, originalPrice: 5499, imgUrl: `https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1470&auto=format&fit=crop`, sales: 3300, stock: 100, discount: 8, categoryId: 3 },
    
    // 服装鞋包 - categoryId = 4
    { id: 31, title: '耐克 Air Jordan 1 高帮篮球鞋', description: '经典复古设计，舒适缓震，优质牛皮材质，专业球场表现', price: 1399, originalPrice: 1599, imgUrl: `https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=1421&auto=format&fit=crop`, sales: 4800, stock: 100, discount: 8, categoryId: 4 },
    { id: 32, title: '阿迪达斯 UltraBoost 23 跑鞋', description: '全新BOOST中底，Continental橡胶大底，编织鞋面，舒适透气', price: 1299, originalPrice: 1499, imgUrl: `https://images.unsplash.com/photo-1608379743498-63bc2e3c5508?q=80&w=1470&auto=format&fit=crop`, sales: 3850, stock: 100, discount: 8, categoryId: 4 },
    { id: 33, title: 'LV Neverfull 手提包', description: '经典帆布配真皮，大容量设计，内置小袋，时尚百搭', price: 13500, originalPrice: 14000, imgUrl: `https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1470&auto=format&fit=crop`, sales: 920, stock: 100, discount: 8, categoryId: 4 },
    { id: 34, title: '优衣库男士衬衫', description: '棉麻混纺，透气舒适，修身剪裁，商务休闲两用', price: 199, originalPrice: 299, imgUrl: `https://images.unsplash.com/photo-1604695573706-53170668f6a6?q=80&w=1374&auto=format&fit=crop`, sales: 8500, stock: 100, discount: 8, categoryId: 4 },
    { id: 35, title: 'Levi\'s 501 经典牛仔裤', description: '美国进口，经典直筒版型，高品质丹宁面料，耐穿舒适', price: 699, originalPrice: 899, imgUrl: `https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1626&auto=format&fit=crop`, sales: 5600, stock: 100, discount: 8, categoryId: 4 },
    
    // 美妆护肤 - categoryId = 5
    { id: 41, title: 'SK-II 神仙水 230ml', description: '日本进口，pitera成分，改善肤质，提亮肤色，改善细纹', price: 1550, originalPrice: 1700, imgUrl: `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1376&auto=format&fit=crop`, sales: 6800, stock: 100, discount: 8, categoryId: 5 },
    { id: 42, title: '雅诗兰黛 DW粉底液', description: '持久遮瑕，自然妆感，不易脱妆，SPF10防晒', price: 450, originalPrice: 550, imgUrl: `https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=1470&auto=format&fit=crop`, sales: 9700, stock: 100, discount: 8, categoryId: 5 },
    { id: 43, title: '兰蔻菁纯面霜 50ml', description: '法国进口，奢华质地，滋润保湿，淡化细纹，紧致肌肤', price: 1199, originalPrice: 1399, imgUrl: `https://images.unsplash.com/photo-1567721913486-6585f069b332?q=80&w=1588&auto=format&fit=crop`, sales: 3400, stock: 100, discount: 8, categoryId: 5 },
    { id: 44, title: '香奈儿可可小姐香水 50ml', description: '东方木质香调，前调柑橘，中调玫瑰茉莉，后调广藿香', price: 850, originalPrice: 950, imgUrl: `https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1408&auto=format&fit=crop`, sales: 4850, stock: 100, discount: 8, categoryId: 5 },
    { id: 45, title: '迪奥烈艳蓝金唇膏', description: '持久保湿，显色饱满，不易脱色，多色可选', price: 320, originalPrice: 380, imgUrl: `https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1515&auto=format&fit=crop`, sales: 11200, stock: 100, discount: 8, categoryId: 5 },
    
    // 食品生鲜 - categoryId = 6
    { id: 51, title: '新西兰奇异果', description: '新鲜多汁，富含维生素C，口感独特', price: 59.9, originalPrice: 69.9, imgUrl: `https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?q=80&w=1364&auto=format&fit=crop`, sales: 1500, stock: 100, discount: 8, categoryId: 6 },
    { id: 52, title: '澳洲和牛牛排', description: '澳洲进口，肉质鲜嫩，口感细腻，适合各种烹饪方式', price: 199.9, originalPrice: 249.9, imgUrl: `https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=1470&auto=format&fit=crop`, sales: 1000, stock: 100, discount: 8, categoryId: 6 },
    { id: 53, title: '法国红酒', description: '法国原瓶进口，口感醇厚，单宁柔顺，适合搭配各种美食', price: 299.9, originalPrice: 349.9, imgUrl: `https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1470&auto=format&fit=crop`, sales: 800, stock: 100, discount: 8, categoryId: 6 },
    { id: 54, title: '日本北海道牛奶', description: '日本进口，口感醇香，营养丰富，适合全家饮用', price: 39.9, originalPrice: 49.9, imgUrl: `https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1471&auto=format&fit=crop`, sales: 1200, stock: 100, discount: 8, categoryId: 6 },
    { id: 55, title: '泰国椰青', description: '泰国进口，新鲜椰青，椰汁清甜，适合解渴', price: 19.9, originalPrice: 24.9, imgUrl: `https://images.unsplash.com/photo-1551506448-074afa034c05?q=80&w=1374&auto=format&fit=crop`, sales: 1800, stock: 100, discount: 8, categoryId: 6 },
    
    // 家居家装 - categoryId = 7
    { id: 61, title: '宜家家居 简约书架', description: '北欧风格设计，环保材质，组装便捷，空间利用率高', price: 999, originalPrice: 1199, imgUrl: `https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1470&auto=format&fit=crop`, sales: 750, stock: 100, discount: 8, categoryId: 7 },
    { id: 62, title: '美的智能扫地机器人', description: '激光导航，智能规划，APP远程控制，吸拖一体', price: 1799, originalPrice: 2299, imgUrl: `https://images.unsplash.com/photo-1605263356049-a5c0034a3cd4?q=80&w=1472&auto=format&fit=crop`, sales: 350, stock: 100, discount: 8, categoryId: 7 },
    { id: 63, title: '飞利浦电动牙刷', description: '声波震动，多种清洁模式，智能压力感应，3种清洁强度', price: 199, originalPrice: 249, imgUrl: `https://images.unsplash.com/photo-1559591937-afbbb26d4b25?q=80&w=1470&auto=format&fit=crop`, sales: 600, stock: 100, discount: 8, categoryId: 7 },
    { id: 64, title: '松下智能马桶盖', description: '智能加热，座圈加热，暖风烘干，自动除臭，多种冲洗模式', price: 1499, originalPrice: 1799, imgUrl: `https://images.unsplash.com/photo-1584622650111-993a426bcf0c?q=80&w=1470&auto=format&fit=crop`, sales: 200, stock: 100, discount: 8, categoryId: 7 },
    { id: 65, title: '海尔智能洗衣机', description: '变频节能，智能投放，蒸汽除菌，大容量筒身，多种洗涤程序', price: 2999, originalPrice: 3599, imgUrl: `https://images.unsplash.com/photo-1626806787461-102c1a7f1c62?q=80&w=1470&auto=format&fit=crop`, sales: 150, stock: 100, discount: 8, categoryId: 7 },
    
    // 运动户外 - categoryId = 8
    { id: 71, title: '耐克 Air Jordan 1 高帮篮球鞋', description: '经典复古设计，舒适缓震，优质牛皮材质，专业球场表现', price: 1399, originalPrice: 1599, imgUrl: `https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=1421&auto=format&fit=crop`, sales: 4800, stock: 100, discount: 8, categoryId: 8 },
    { id: 72, title: '阿迪达斯 UltraBoost 23 跑鞋', description: '全新BOOST中底，Continental橡胶大底，编织鞋面，舒适透气', price: 1299, originalPrice: 1499, imgUrl: `https://images.unsplash.com/photo-1608379743498-63bc2e3c5508?q=80&w=1470&auto=format&fit=crop`, sales: 3850, stock: 100, discount: 8, categoryId: 8 },
    { id: 73, title: '新百伦 574系列 复古跑鞋', description: '经典复古设计，ENCAP缓震科技，舒适耐穿', price: 699, originalPrice: 899, imgUrl: `https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1471&auto=format&fit=crop`, sales: 4500, stock: 100, discount: 8, categoryId: 8 },
    { id: 74, title: '佳明 Fenix 7 运动手表', description: '多功能运动手表，心率监测，睡眠分析，消息提醒', price: 1999, originalPrice: 2499, imgUrl: `https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1527&auto=format&fit=crop`, sales: 300, stock: 100, discount: 8, categoryId: 8 },
    { id: 75, title: '迪卡侬 户外背包', description: '大容量设计，防雨透气，多功能口袋，适合户外活动', price: 149.9, originalPrice: 199.9, imgUrl: `https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1470&auto=format&fit=crop`, sales: 200, stock: 100, discount: 8, categoryId: 8 },
    
    // 图书音像 - categoryId = 9
    { id: 81, title: '《人类简史》中文版', description: '尤瓦尔·赫拉利著，讲述人类从史前猿人到智人的演化历程', price: 68, originalPrice: 88, imgUrl: `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1374&auto=format&fit=crop`, sales: 12000, stock: 100, discount: 8, categoryId: 9 },
    { id: 82, title: '《活着》余华著', description: '当代文学经典，讲述了农村人福贵悲惨的人生遭遇', price: 39.9, originalPrice: 45, imgUrl: `https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1374&auto=format&fit=crop`, sales: 8500, stock: 100, discount: 8, categoryId: 9 },
    { id: 83, title: '森海塞尔 MOMENTUM 4 无线耳机', description: '60小时超长续航，自适应降噪，高清音质，舒适佩戴', price: 2599, originalPrice: 2999, imgUrl: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1470&auto=format&fit=crop`, sales: 1800, stock: 100, discount: 8, categoryId: 9 },
    { id: 84, title: '《三体》全集', description: '刘慈欣著，中国科幻小说代表作，雨果奖获奖作品', price: 129, originalPrice: 169, imgUrl: `https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=1374&auto=format&fit=crop`, sales: 4500, stock: 100, discount: 8, categoryId: 9 },
    { id: 85, title: '《金字塔原理》', description: '麦肯锡40年经典培训教材，思考、表达和解决问题的逻辑', price: 59.9, originalPrice: 79.9, imgUrl: `https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1376&auto=format&fit=crop`, sales: 5700, stock: 100, discount: 8, categoryId: 9 },
    
    // 母婴玩具 - categoryId = 10
    { id: 91, title: '乐高星球大战系列千年隼', description: '经典收藏版，1000+零件，高度还原电影场景', price: 899, originalPrice: 999, imgUrl: `https://images.unsplash.com/photo-1575650772417-e6b418b0d106?q=80&w=1470&auto=format&fit=crop`, sales: 3300, stock: 100, discount: 8, categoryId: 10 },
    { id: 92, title: '迪士尼公主系列玩偶', description: '经典迪士尼形象，多种款式，适合不同年龄段的小朋友', price: 199, originalPrice: 249, imgUrl: `https://images.unsplash.com/photo-1585155967849-91c736589c84?q=80&w=1374&auto=format&fit=crop`, sales: 800, stock: 100, discount: 8, categoryId: 10 },
    { id: 93, title: '费雪 婴儿推车', description: '适合新生儿到幼儿期的推车，轻便易折叠，安全舒适', price: 1299, originalPrice: 1599, imgUrl: `https://images.unsplash.com/photo-1591421380821-3ff08d38dbfd?q=80&w=1470&auto=format&fit=crop`, sales: 300, stock: 100, discount: 8, categoryId: 10 },
    { id: 94, title: '贝亲 奶瓶', description: '适合新生儿使用的奶瓶，防胀气设计，易于清洗', price: 99, originalPrice: 129, imgUrl: `https://images.unsplash.com/photo-1613977514989-24b934e13d69?q=80&w=1374&auto=format&fit=crop`, sales: 700, stock: 100, discount: 8, categoryId: 10 },
    { id: 95, title: '迪士尼 儿童故事书', description: '适合3-6岁儿童阅读的故事书，图文并茂，寓教于乐', price: 49.9, originalPrice: 69.9, imgUrl: `https://images.unsplash.com/photo-1471970394675-613138e45da3?q=80&w=1524&auto=format&fit=crop`, sales: 500, stock: 100, discount: 8, categoryId: 10 }
  ]
  
  // 根据分类筛选
  let filteredProducts = [...allProducts]
  if (categoryFilter) {
    filteredProducts = allProducts.filter(item => item.categoryId === categoryFilter)
  }
  
  // 排序
  if (sort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price)
  } else if (sort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price)
  } else if (sort === 'sales') {
    filteredProducts.sort((a, b) => b.sales - a.sales)
  }
  
  // 分页
  const total = filteredProducts.length
  const start = (page - 1) * pageSize
  const end = Math.min(start + pageSize, total)
  const products = filteredProducts.slice(start, end)
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      list: products,
      total: total,
      page,
      pageSize
    }
  }
})

// 发货订单
Mock.mock(RegExp('/api/order/deliver/.*'), 'put', (options) => {
  const id = options.url.split('/').pop()
  const deliveryTime = new Date().toLocaleString()
  
  // 更新全局订单列表中的订单状态
  if (typeof window !== 'undefined' && window.globalOrderList) {
    const orderIndex = window.globalOrderList.findIndex(order => order.id === id)
    if (orderIndex !== -1) {
      // 修改为已发货状态(2)，而不是直接改为待收货状态(3)
      window.globalOrderList[orderIndex].status = 2
      window.globalOrderList[orderIndex].statusText = '已发货'
      window.globalOrderList[orderIndex].deliveryTime = deliveryTime
      console.log('订单发货成功，状态已更新为已发货:', id)
    }
  }
  
  return {
    code: 200,
    message: '发货成功',
    data: {
      id,
      status: 2,
      statusText: '已发货',
      deliveryTime
    }
  }
})

// 确认收货
Mock.mock(RegExp('/api/order/receive/.*'), 'put', (options) => {
  const id = options.url.split('/').pop()
  const receiveTime = new Date().toLocaleString()
  
  // 更新全局订单列表中的订单状态
  if (typeof window !== 'undefined' && window.globalOrderList) {
    // 找到已发货或待收货状态的订单
    const orderIndex = window.globalOrderList.findIndex(order => 
      order.id === id && (order.status === 2 || order.status === 3)
    )
    
    if (orderIndex !== -1) {
      window.globalOrderList[orderIndex].status = 4
      window.globalOrderList[orderIndex].statusText = '已完成'
      window.globalOrderList[orderIndex].receiveTime = receiveTime
      console.log('订单确认收货成功，状态已更新:', id)
      
      return {
        code: 200,
        message: '确认收货成功',
        data: {
          id,
          status: 4,
          statusText: '已完成',
          receiveTime
        }
      }
    }
  }
  
  // 如果找不到订单，模拟一个成功响应
  console.log('未找到订单，返回模拟成功响应:', id)
  return {
    code: 200,
    message: '确认收货成功',
    data: {
      id,
      status: 4,
      statusText: '已完成',
      receiveTime
    }
  }
})

// 将已发货订单改为待收货
Mock.mock(RegExp('/api/order/to-receive/.*'), 'put', (options) => {
  const id = options.url.split('/').pop()
  
  // 更新全局订单列表中的订单状态
  if (typeof window !== 'undefined' && window.globalOrderList) {
    // 找到任何状态的订单，只要ID匹配即可
    const orderIndex = window.globalOrderList.findIndex(order => order.id === id)
    if (orderIndex !== -1) {
      // 将状态更新为待收货
      window.globalOrderList[orderIndex].status = 3
      window.globalOrderList[orderIndex].statusText = '待收货'
      console.log('订单状态已更新为待收货:', id)
      
      return {
        code: 200,
        message: '更新成功',
        data: {
          id,
          status: 3,
          statusText: '待收货'
        }
      }
    }
  }
  
  // 如果找不到订单，模拟一个成功响应
  console.log('未找到订单，返回模拟成功响应:', id)
  return {
    code: 200,
    message: '更新成功',
    data: {
      id,
      status: 3,
      statusText: '待收货'
    }
  }
})

// 搜索商品
Mock.mock(RegExp('/api/product/search.*'), 'get', (options) => {
  const url = options.url
  const params = new URLSearchParams(url.split('?')[1])
  
  const keyword = params.get('keyword') || ''
  const categoryId = params.get('categoryId') ? parseInt(params.get('categoryId')) : null
  const minPrice = params.get('minPrice') ? parseInt(params.get('minPrice')) : null
  const maxPrice = params.get('maxPrice') ? parseInt(params.get('maxPrice')) : null
  const page = parseInt(params.get('page')) || 1
  const pageSize = parseInt(params.get('pageSize')) || 12
  const sort = params.get('sort') || 'default'
  
  // 搜索结果商品数据库 - 真实商品名称
  const searchProductsPool = [
    // 手机数码
    { id: 501, title: 'vivo iQOO Neo9 Pro', description: '第二代骁龙8处理器，独立显示芯片，4K超清录像，144Hz高刷屏', price: 3299, originalPrice: 3599, imgUrl: `https://picsum.photos/300/300?random=501`, sales: 3200, stock: 100, discount: 8, categoryId: 1 },
    { id: 502, title: '三星 Galaxy S24 Ultra', description: 'Galaxy AI人工智能，2亿像素主摄，骁龙8 Gen 3处理器，S Pen触控笔', price: 9999, originalPrice: 10999, imgUrl: `https://picsum.photos/300/300?random=502`, sales: 2850, stock: 100, discount: 8, categoryId: 1 },
    { id: 503, title: '荣耀 Magic6 Pro', description: '曲面屏设计，超感知摄像系统，高通骁龙8 Gen 3，100W超级快充', price: 5999, originalPrice: 6499, imgUrl: `https://picsum.photos/300/300?random=503`, sales: 3100, stock: 100, discount: 8, categoryId: 1 },
    { id: 504, title: 'Apple iPad Air 5', description: 'M1芯片，10.9英寸液态视网膜显示屏，支持第二代Apple Pencil', price: 4799, originalPrice: 5099, imgUrl: `https://picsum.photos/300/300?random=504`, sales: 2600, stock: 100, discount: 8, categoryId: 1 },
    { id: 505, title: 'Apple Watch Series 9', description: '全天候视网膜显示屏，血氧应用，心电图功能，GPS+蜂窝网络', price: 3799, originalPrice: 4099, imgUrl: `https://picsum.photos/300/300?random=505`, sales: 3400, stock: 100, discount: 8, categoryId: 1 },
    
    // 电脑办公
    { id: 511, title: '惠普 星 14 锐龙版', description: 'AMD Ryzen 7处理器，16GB内存，512GB固态，14英寸2.2K屏', price: 4999, originalPrice: 5499, imgUrl: `https://picsum.photos/300/300?random=511`, sales: 1850, stock: 100, discount: 8, categoryId: 2 },
    { id: 512, title: '微软 Surface Pro 9', description: '第12代英特尔酷睿i7，16GB内存，256GB固态，13英寸触控屏', price: 9988, originalPrice: 10999, imgUrl: `https://picsum.photos/300/300?random=512`, sales: 1250, stock: 100, discount: 8, categoryId: 2 },
    { id: 513, title: '惠普 LaserJet Pro M129系列打印机', description: '黑白激光多功能一体机，打印/复印/扫描，无线打印', price: 1499, originalPrice: 1799, imgUrl: `https://picsum.photos/300/300?random=513`, sales: 2200, stock: 100, discount: 8, categoryId: 2 },
    { id: 514, title: '飞利浦 27英寸 4K显示器', description: '4K UHD分辨率，IPS广视角，低蓝光护眼，HDR400认证', price: 2199, originalPrice: 2499, imgUrl: `https://picsum.photos/300/300?random=514`, sales: 1600, stock: 100, discount: 8, categoryId: 2 },
    { id: 515, title: 'HHKB Professional 静电容键盘', description: '日本进口，PBT键帽，蓝牙+USB双模，极简布局', price: 2380, originalPrice: 2580, imgUrl: `https://picsum.photos/300/300?random=515`, sales: 980, stock: 100, discount: 8, categoryId: 2 },
    
    // 家用电器
    { id: 521, title: '海尔 10公斤滚筒洗衣机', description: '变频节能，智能投放，蒸汽除菌，大容量筒身', price: 2999, originalPrice: 3599, imgUrl: `https://picsum.photos/300/300?random=521`, sales: 1560, stock: 100, discount: 8, categoryId: 3 },
    { id: 522, title: '格力 1.5匹 智能变频空调', description: '一级能效，智能控温，静音设计，远程控制', price: 2599, originalPrice: 3099, imgUrl: `https://picsum.photos/300/300?random=522`, sales: 2350, stock: 100, discount: 8, categoryId: 3 },
    { id: 523, title: '九阳破壁机料理机', description: '无人料理，智能预约，多功能一体，豆浆/榨汁/研磨', price: 799, originalPrice: 1099, imgUrl: `https://picsum.photos/300/300?random=523`, sales: 4100, stock: 100, discount: 8, categoryId: 3 },
    { id: 524, title: '博世 12套 洗碗机', description: '德国进口，嵌入式，智能除菌，节水节电', price: 5999, originalPrice: 7299, imgUrl: `https://picsum.photos/300/300?random=524`, sales: 980, stock: 100, discount: 8, categoryId: 3 },
    { id: 525, title: '米家智能扫地机器人', description: '激光导航，智能规划，APP远程控制，吸拖一体', price: 1799, originalPrice: 2299, imgUrl: `https://picsum.photos/300/300?random=525`, sales: 3500, stock: 100, discount: 8, categoryId: 3 },
    
    // 服装鞋包
    { id: 531, title: '北面三合一冲锋衣', description: '防风防水，保暖透气，可拆卸内胆，户外必备', price: 1999, originalPrice: 2399, imgUrl: `https://picsum.photos/300/300?random=531`, sales: 2700, stock: 100, discount: 8, categoryId: 4 },
    { id: 532, title: '新百伦 574系列 复古跑鞋', description: '经典复古设计，ENCAP缓震科技，舒适耐穿', price: 699, originalPrice: 899, imgUrl: `https://picsum.photos/300/300?random=532`, sales: 4500, stock: 100, discount: 8, categoryId: 4 },
    { id: 533, title: 'Coach Tabby 26手袋', description: '进口小牛皮，经典翻盖设计，可调节肩带，时尚百搭', price: 2980, originalPrice: 3580, imgUrl: `https://picsum.photos/300/300?random=533`, sales: 1800, stock: 100, discount: 8, categoryId: 4 },
    { id: 534, title: 'ZARA 女士风衣', description: '欧洲时尚设计，中长款版型，轻薄防风，春秋必备', price: 799, originalPrice: 999, imgUrl: `https://picsum.photos/300/300?random=534`, sales: 3200, stock: 100, discount: 8, categoryId: 4 },
    { id: 535, title: 'CK男士内裤三条装', description: '纯棉面料，弹力舒适，透气排汗，经典logo', price: 299, originalPrice: 399, imgUrl: `https://picsum.photos/300/300?random=535`, sales: 7800, stock: 100, discount: 8, categoryId: 4 },
    
    // 美妆护肤
    { id: 541, title: '香奈儿可可小姐香水 50ml', description: '法国进口，东方木质香调，持久留香，优雅迷人', price: 1250, originalPrice: 1450, imgUrl: `https://picsum.photos/300/300?random=541`, sales: 3600, stock: 100, discount: 8, categoryId: 5 },
    { id: 542, title: 'MAC 丝绒哑光唇膏', description: '专业彩妆，持久显色，不易脱妆，滋润不干', price: 199, originalPrice: 249, imgUrl: `https://picsum.photos/300/300?random=542`, sales: 6800, stock: 100, discount: 8, categoryId: 5 },
    { id: 543, title: '娇韵诗双萃精华 50ml', description: '法国进口，抗老紧致，淡化细纹，提亮肤色', price: 880, originalPrice: 980, imgUrl: `https://picsum.photos/300/300?random=543`, sales: 2900, stock: 100, discount: 8, categoryId: 5 },
    { id: 544, title: '科颜氏金盏花化妆水 250ml', description: '美国进口，无酒精配方，舒缓保湿，温和不刺激', price: 320, originalPrice: 390, imgUrl: `https://picsum.photos/300/300?random=544`, sales: 5200, stock: 100, discount: 8, categoryId: 5 },
    { id: 545, title: '欧莱雅男士洁面乳 100ml', description: '控油清爽，深层清洁，收缩毛孔，温和不紧绷', price: 59.9, originalPrice: 89.9, imgUrl: `https://picsum.photos/300/300?random=545`, sales: 8900, stock: 100, discount: 8, categoryId: 5 }
  ]
  
  // 按条件筛选
  let searchResults = [...searchProductsPool]
  
  if (keyword) {
    searchResults = searchResults.filter(item => 
      item.title.includes(keyword) || 
      item.description.includes(keyword)
    )
  }
  
  if (categoryId !== null) {
    searchResults = searchResults.filter(item => item.categoryId === categoryId)
  }
  
  if (minPrice !== null) {
    searchResults = searchResults.filter(item => item.price >= minPrice)
  }
  
  if (maxPrice !== null && maxPrice !== '') {
    searchResults = searchResults.filter(item => item.price <= maxPrice)
  }
  
  // 排序
  if (sort === 'price-asc') {
    searchResults.sort((a, b) => a.price - b.price)
  } else if (sort === 'price-desc') {
    searchResults.sort((a, b) => b.price - a.price)
  } else if (sort === 'sales') {
    searchResults.sort((a, b) => b.sales - a.sales)
  }
  
  // 分页
  const total = searchResults.length
  const start = (page - 1) * pageSize
  const end = Math.min(start + pageSize, total)
  const pagedResults = searchResults.slice(start, end)
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      list: pagedResults,
      total,
      page,
      pageSize
    }
  }
})

export default Mock 