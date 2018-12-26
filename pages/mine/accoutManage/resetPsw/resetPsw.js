// pages/mine/accoutManage/resetPsw/resetPsw.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  sure: function () {
    wx.showToast({
      title: '重置成功',
      icon: 'succes',
      duration: 2000,
      mask: true
    })
  }
})