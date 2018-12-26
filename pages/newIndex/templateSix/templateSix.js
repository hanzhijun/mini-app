// pages/newIndex/templateSix/templateSix.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    operation_pages_id: '', // 运营模板id
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.showLoading();
    this.data.options = options;
    let {id} = options;
    this.setData({
      operation_pages_id: id
    });
    let {operation_pages_id} = this.data;
    app.data.operation_pages_id = operation_pages_id;
    app.getPagesOpt(operation_pages_id, data => {
      this.setData({
        list: data
      });

      setTimeout(function () {
        wx.hideLoading();
      }, 300);
    });

  },

  openPageTo: function (e) {

    let { jump_data, jump_type } = e.currentTarget.dataset;
    app.openPageTo(jump_data, jump_type);

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

    let {operation_pages_id} = this.data;
    app.data.operation_pages_id = operation_pages_id;

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
});