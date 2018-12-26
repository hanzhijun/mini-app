const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.config.imgUrl,
    host: app.config.host,
    res_data: {},
    items: [
      { name: '预约不上', value: '预约不上' },
      { name: '商家营业但不接待', value: '商家营业但不接待'},
      { name: '店里活动更优惠', value: '店里活动更优惠' },
      { name: '商家停业/装修/转让', value: '商家停业/装修/转让' },
      { name: '去过了，不满意', value: '去过了，不满意' },
      { name: '买多了/买错了', value: '买多了/买错了' },
      { name: '计划有变，没时间消费', value: '计划有变，没时间消费' },
      { name: '后悔了，不想要', value: '后悔了，不想要' },
      { name: '其他原因', value: '其他原因' },
    ],
    reason_arr: []
  },
  checkboxChange: function (e) {
    this.setData({
      reason_arr: e.detail.value
    })
  },

  // 申请退款
  submit() {
    let { reason_arr, res_data, items} = this.data;
    if (reason_arr.length <= 0) return app.alert('请选择退款原因！',' none');
    
    app.post('Mypackage/applyrefundpackageorder', {
      package_order_id: res_data.package_order_id,
      reason: reason_arr.join(';')
    },(res) =>{
      if(res.code == 200) {
        app.alert('申请成功！', 'success', () => {
          app.openPage('mine/package/refundDetail/refundDetail?id=' + res_data.package_order_id)
        })
      } else {
        app.alert(res.info,'none');
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {id} = options;
    let {res_data} = this.data;
    app.post('Mypackage/getrefundpackageorder',{
      package_order_id: id
    }, (res) => {
      res_data = res.data;
      res_data.expire_at_format = new Date(res_data.expire_at * 1000).format('yyyy-MM-dd');
      this.setData({
        res_data
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})