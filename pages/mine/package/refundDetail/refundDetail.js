const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    res_data:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {id} = options;
    let { res_data} = this.data
    app.post('Mypackage/returnrefunddetial', {
      package_order_id: id,
    }, (res) => {
      res_data = res.data;
      res_data.create_at_format = new Date((res_data.create_at + 7 * 86400) * 1000).format('yyyy-MM-dd')
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