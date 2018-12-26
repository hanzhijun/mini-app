// pages/mine/accoutManage/updateAssetPsw/updateAssetPsw.js
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

  sureUpdate: function () {
    wx.showToast({
      title: '修改成功',
      icon: 'succes',
      duration: 2000,
      mask: true
    })
  }
})