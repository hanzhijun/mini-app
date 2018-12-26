const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    height_1875: app.config.height_1875,
    imgUrl: app.config.imgUrl,
    host: app.config.host,
    res_data: {},
    location: {},
    show: 'list'   // msg: 商家信息  list:商家套餐列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { business_id, business_offline_id} = options;
    let { res_data } = this.data;
    app.getlocation((e) => {
      this.data.location = e;
      app.post('/Mypackage/businessdetailByid', {
        id: business_id || business_offline_id
      } ,(res) => {
        res_data = res.data;
        res_data.km = app.addressLimit(res_data.longitude_latitude.split(','), e);
        this.setData({
          res_data,
          imgUrls: res_data.img_master
        })
        wx.setNavigationBarTitle({
          title: res_data.name
        })
      })
    })
  },

  switchBar(e) {
    let {type} = e.currentTarget.dataset;
    this.setData({
      show: type
    })
  },

  openlocation() {
    let {res_data} = this.data;
    app.openlocation(res_data.longitude_latitude);
  },

  openPage(e) {
    let {id} = e.currentTarget.dataset;
    app.openPage(`index/offlineBusinessA/offlineBusinessA?package_id=${id}`)
  },

  callPhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel,
    })
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

})