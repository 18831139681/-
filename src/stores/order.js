import { defineStore } from 'pinia'
import { getOrderList, createOrder, getOrderDetail, payOrder, cancelOrder, deliverOrder, confirmReceive, toReceiveOrder } from '../api/order'
import { ElNotification } from 'element-plus'
import router from '../router'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orderList: [],
    currentOrder: null,
    orderCount: {
      waitPay: 0,    // 待付款
      waitDeliver: 0, // 待发货
      delivered: 0,   // 已发货
      waitReceive: 0, // 待收货
      received: 0     // 已收货
    },
    pendingDeliveryOrders: [], // 待发货订单列表
    notificationTimer: null    // 通知定时器
  }),
  
  getters: {
    getOrders: (state) => state.orderList,
    getCurrentOrder: (state) => state.currentOrder,
    getOrderCount: (state) => state.orderCount
  },
  
  actions: {
    // 统计各状态订单数量
    calculateOrderCount() {
      this.orderCount = {
        waitPay: 0,
        waitDeliver: 0,
        delivered: 0,
        waitReceive: 0,
        received: 0
      }
      
      this.orderList.forEach(order => {
        switch (order.status) {
          case 0: // 待付款
            this.orderCount.waitPay++
            break
          case 1: // 待发货
            this.orderCount.waitDeliver++
            break
          case 2: // 已发货
            this.orderCount.delivered++
            break
          case 3: // 待收货
            this.orderCount.waitReceive++
            break
          case 4: // 已收货
            this.orderCount.received++
            break
        }
      })
    },
    
    // 获取订单列表
    async getOrderList(status) {
      try {
        console.log('开始获取订单列表, 状态:', status)
        const res = await getOrderList({ status })
        
        if (res.code === 200) {
          console.log('获取订单列表成功:', res.data.length, '条订单')
          this.orderList = res.data
          this.calculateOrderCount()
          
          // 更新待发货订单列表
          this.updatePendingDeliveryOrders()
          
          return Promise.resolve(res.data)
        } else {
          console.error('获取订单列表失败, 状态码:', res.code, res.message)
          return Promise.reject(res)
        }
      } catch (error) {
        console.error('获取订单列表异常:', error)
        
        // 开发环境下，模拟一些订单数据
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          console.log('开发环境下模拟订单数据')
          
          // 生成模拟订单数据
          const mockOrders = []
          const orderStatus = status !== null && !isNaN(status) ? status : null
          
          for (let i = 1; i <= 10; i++) {
            // 如果指定了状态，则所有模拟订单都使用该状态
            // 否则，默认为已完成状态(4)
            const currentStatus = orderStatus !== null ? orderStatus : 4
            
            // 生成合理的时间
            const now = new Date()
            const createTime = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const createTimeStr = createTime.toLocaleString()
            
            // 付款时间为创建时间后的30分钟
            let payTime = null
            if (currentStatus > 0) {
              const payTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000)
              payTime = payTimeDate.toLocaleString()
            }
            
            // 发货时间为付款时间后的1天
            let deliveryTime = null
            if (currentStatus > 1) {
              const deliveryTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000 + 24 * 60 * 60 * 1000)
              deliveryTime = deliveryTimeDate.toLocaleString()
            }
            
            // 收货时间为发货时间后的2天
            let receiveTime = null
            if (currentStatus > 3) {
              const receiveTimeDate = new Date(createTime.getTime() + 30 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000)
              receiveTime = receiveTimeDate.toLocaleString()
            }
            
            mockOrders.push({
              id: `ORDER${createTime.getTime()}${i}`,
              status: currentStatus,
              statusText: ['待付款', '待发货', '已发货', '待收货', '已完成'][currentStatus],
              totalPrice: 1000 + i * 100,
              createTime: createTimeStr,
              payTime,
              deliveryTime,
              receiveTime,
              address: {
                name: `用户${i}`,
                phone: `1380013800${i}`,
                province: '北京市',
                city: '北京市',
                district: '朝阳区',
                detail: `解放东路15号玉海小区4231号`
              },
              products: [{
                id: i,
                title: `订单商品${i}`,
                price: i * 100,
                count: 1,
                imgUrl: `https://picsum.photos/100/100?random=${i}`,
                specs: '红色,XL'
              }]
            })
          }
          
          // 如果指定了状态，过滤订单
          const filteredOrders = orderStatus !== null 
            ? mockOrders.filter(order => order.status === orderStatus)
            : mockOrders
          
          this.orderList = filteredOrders
          this.calculateOrderCount()
          this.updatePendingDeliveryOrders()
          
          return Promise.resolve(filteredOrders)
        }
        
        return Promise.reject(error)
      }
    },
    
    // 创建订单
    async createOrder(orderData) {
      try {
        const res = await createOrder(orderData)
        if (res.code === 200) {
          // 创建成功后，获取最新的订单列表
          await this.getOrderList()
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 获取订单详情
    async getOrderDetail(orderId) {
      try {
        const res = await getOrderDetail(orderId)
        if (res.code === 200) {
          this.currentOrder = res.data
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 支付订单
    async payOrder(orderId) {
      try {
        const res = await payOrder(orderId)
        if (res.code === 200) {
          await this.getOrderList()
          
          // 如果当前正在查看的订单就是被支付的订单，更新其状态
          if (this.currentOrder && this.currentOrder.id === orderId) {
            this.currentOrder.status = 1
            this.currentOrder.statusText = '待发货'
            this.currentOrder.payTime = res.data.payTime
          }
          
          // 设置15秒后自动发货
          setTimeout(() => {
            // 找到刚支付的订单
            const paidOrder = this.orderList.find(order => order.id === orderId)
            if (paidOrder) {
              // 直接调用发货接口
              this.deliverOrder(orderId).then(() => {
                // 发货成功后3秒自动更新为待收货状态
                setTimeout(() => {
                  this.updateOrderToReceive(orderId)
                }, 3000)
              })
            }
          }, 15000)
          
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 取消订单
    async cancelOrder(orderId) {
      try {
        const res = await cancelOrder(orderId)
        if (res.code === 200) {
          // 从本地订单列表中删除被取消的订单
          this.orderList = this.orderList.filter(order => order.id !== orderId)
          
          // 重新计算各状态订单数量
          this.calculateOrderCount()
          
          // 如果当前正在查看的订单就是被取消的订单，清空它
          if (this.currentOrder && this.currentOrder.id === orderId) {
            this.currentOrder = null
          }
          
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 更新待发货订单列表
    updatePendingDeliveryOrders() {
      this.pendingDeliveryOrders = this.orderList.filter(order => order.status === 1)
    },
    
    // 更新订单状态为已发货
    updateOrderToDelivered(order) {
      // 调用发货接口
      deliverOrder(order.id).then(res => {
        if (res.code === 200) {
          // 更新订单状态
          order.status = 2 // 更新为已发货状态，而不是直接更新为待收货状态
          order.statusText = '已发货'
          order.deliveryTime = new Date().toLocaleString()
          
          // 如果当前正在查看的订单就是被发货的订单，更新其状态
          if (this.currentOrder && this.currentOrder.id === order.id) {
            this.currentOrder.status = 2
            this.currentOrder.statusText = '已发货'
            this.currentOrder.deliveryTime = order.deliveryTime
          }
          
          // 更新订单计数
          this.calculateOrderCount()
          
          // 从待发货列表中移除该订单
          this.pendingDeliveryOrders = this.pendingDeliveryOrders.filter(item => item.id !== order.id)
          
          // 显示发货通知
          this.showDeliveryNotification(order)
          
          // 发货通知定时器，15秒后自动将订单状态更新为待收货
          setTimeout(() => {
            this.updateOrderToReceive(order.id)
          }, 15000)
        }
      }).catch(error => {
        console.error('发货失败:', error)
      })
    },
    
    // 显示发货通知
    showDeliveryNotification(order) {
      ElNotification({
        title: '订单发货通知',
        message: `您的订单已发货！订单编号: ${order.id}`,
        type: 'success',
        duration: 10000, // 显示10秒
        position: 'bottom-right',
        showClose: true,
        onClick: () => {
          router.push(`/order/detail/${order.id}`)
        },
        customClass: 'order-delivery-notification'
      })
    },
    
    // 启动发货通知定时器
    startDeliveryNotification() {
      // 清除之前的定时器
      if (this.notificationTimer) {
        clearTimeout(this.notificationTimer)
      }
      
      // 如果有待发货订单，设置随机时间后发货
      if (this.pendingDeliveryOrders.length > 0) {
        const randomTime = Math.floor(Math.random() * 45 + 1) * 1000 // 1-45秒
        
        this.notificationTimer = setTimeout(() => {
          // 随机选择一个待发货订单
          const randomIndex = Math.floor(Math.random() * this.pendingDeliveryOrders.length)
          const orderToDeliver = this.pendingDeliveryOrders[randomIndex]
          
          if (orderToDeliver) {
            this.updateOrderToDelivered(orderToDeliver)
          }
          
          // 如果还有待发货订单，继续设置定时器
          if (this.pendingDeliveryOrders.length > 0) {
            this.startDeliveryNotification()
          }
        }, randomTime)
      }
    },
    
    // 停止发货通知定时器
    stopDeliveryNotification() {
      if (this.notificationTimer) {
        clearTimeout(this.notificationTimer)
        this.notificationTimer = null
      }
    },
    
    // 确认收货
    async confirmReceiveOrder(orderId) {
      try {
        const res = await confirmReceive(orderId)
        if (res.code === 200) {
          // 更新订单列表
          await this.getOrderList()
          
          // 如果当前正在查看的订单就是被确认收货的订单，更新其状态
          if (this.currentOrder && this.currentOrder.id === orderId) {
            this.currentOrder.status = 4
            this.currentOrder.statusText = '已完成'
            this.currentOrder.receiveTime = res.data.receiveTime
          }
          
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        console.error('确认收货失败:', error)
        
        // 如果API调用失败，但我们知道这是开发环境，则模拟一个成功的响应
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          // 找到订单并更新状态
          const orderIndex = this.orderList.findIndex(order => order.id === orderId)
          if (orderIndex !== -1) {
            this.orderList[orderIndex].status = 4
            this.orderList[orderIndex].statusText = '已完成'
            this.orderList[orderIndex].receiveTime = new Date().toLocaleString()
            
            // 如果当前正在查看的订单就是被确认收货的订单，更新其状态
            if (this.currentOrder && this.currentOrder.id === orderId) {
              this.currentOrder.status = 4
              this.currentOrder.statusText = '已完成'
              this.currentOrder.receiveTime = this.orderList[orderIndex].receiveTime
            }
            
            // 重新计算各状态订单数量
            this.calculateOrderCount()
            
            return Promise.resolve({
              code: 200,
              message: '确认收货成功',
              data: {
                id: orderId,
                status: 4,
                statusText: '已完成',
                receiveTime: this.orderList[orderIndex].receiveTime
              }
            })
          }
        }
        
        return Promise.reject(error)
      }
    },
    
    // 发货
    async deliverOrder(orderId) {
      try {
        const res = await deliverOrder(orderId)
        if (res.code === 200) {
          // 更新订单列表
          await this.getOrderList()
          
          // 如果当前正在查看的订单就是被发货的订单，更新其状态
          if (this.currentOrder && this.currentOrder.id === orderId) {
            this.currentOrder.status = 2
            this.currentOrder.statusText = '已发货'
            this.currentOrder.deliveryTime = res.data.deliveryTime
          }
          
          // 查找订单并显示通知
          const order = this.orderList.find(o => o.id === orderId)
          if (order) {
            this.showDeliveryNotification(order)
          }
          
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        console.error('发货失败:', error)
        
        // 开发环境下模拟成功
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          // 查找订单
          const orderIndex = this.orderList.findIndex(o => o.id === orderId)
          if (orderIndex !== -1) {
            // 更新订单状态
            this.orderList[orderIndex].status = 2
            this.orderList[orderIndex].statusText = '已发货'
            this.orderList[orderIndex].deliveryTime = new Date().toLocaleString()
            
            // 如果当前正在查看的订单就是被发货的订单，更新其状态
            if (this.currentOrder && this.currentOrder.id === orderId) {
              this.currentOrder.status = 2
              this.currentOrder.statusText = '已发货'
              this.currentOrder.deliveryTime = this.orderList[orderIndex].deliveryTime
            }
            
            // 显示通知
            this.showDeliveryNotification(this.orderList[orderIndex])
            
            // 更新订单计数
            this.calculateOrderCount()
            
            return Promise.resolve({
              code: 200,
              message: '发货成功',
              data: {
                id: orderId,
                status: 2,
                statusText: '已发货',
                deliveryTime: this.orderList[orderIndex].deliveryTime
              }
            })
          }
        }
        
        return Promise.reject(error)
      }
    },
    
    // 将已发货订单更新为待收货
    async updateOrderToReceive(orderId) {
      try {
        const res = await toReceiveOrder(orderId)
        if (res.code === 200) {
          // 更新订单列表
          await this.getOrderList()
          
          // 如果当前正在查看的订单就是被更新的订单，更新其状态
          if (this.currentOrder && this.currentOrder.id === orderId) {
            this.currentOrder.status = 3
            this.currentOrder.statusText = '待收货'
          }
          
          return Promise.resolve(res)
        } else {
          return Promise.reject(res)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }
})