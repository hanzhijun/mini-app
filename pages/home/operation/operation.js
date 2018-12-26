const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category_name: '',
    total: 0,
    page: 1,
    proList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initPage();
  },


  initPage() {
    this.getIcon();
  },


  /**
     * 监听用户下拉动作
     */
  onPullDownRefresh: function () {
    this.initPage();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件
   */
  onReachBottom: function () {
    let { total, proList } = this.data;
    if (proList.length >= total) return;
    this.data.page += 1;
    this.init();
  },

  // tab文字获取
  getIcon(goods_activity_od_id) {
    // 商城 固定运营位详情
    var goods_activity_od_id = wx.getStorageSync('goods_activity_od_id');
    app.post('/goods/activityodgetdetailed', {
      goods_activity_od_id: goods_activity_od_id
    }, (res) => {
      if (res.code == 200) {
        let { category_info = [] } = res.data;
        app.setTitle(res.data.name);
        if (res.data.category_num == 0){
            this.setData({
              gid: res.data.goods_activity_category_id
            })
        }
        this.setData({
          category_info: category_info,
          imgUrl: res.data,
          category_num: res.data.category_num,
          category_name: category_info.length ? category_info[0].category_name : '',
          goods_activity_category_id: category_info.length ? category_info[0].goods_activity_category_id : ''
        })
      }
      this.init();
    })
  },


  // 商城 固定运营二级栏目商品获取
  init: function() {
    let { goods_activity_category_id, category_name, page, proList } = this.data;
    app.post('/goods/activitygoodsgetlist', {
      goods_activity_category_id: 2,
      filter_category_id: goods_activity_category_id || this.data.gid,
      page
    }, (res) => {
      if (res.code == 200) {
        proList = proList.concat(res.data.data);
        this.setData({
          proList,
          category_name,
          goods_activity_category_id: goods_activity_category_id,
          total: res.data.total
        })
      }

    })

  },


  // 二级栏目获取
  // tab点击切换
  tabList: function (e) {
    let { goods_activity_category_id, category_name } = e.currentTarget.dataset;
    this.data.goods_activity_category_id = goods_activity_category_id;
    this.data.category_name = category_name;
    this.setData({
      page: 1,
      proList: [],
      total: 0
    })
    this.init();
    
  },

  // 跳转商品详情页
  goDetail: function (e) {
    var gid = e.currentTarget.dataset.gid;
    app.openPage('shopCart/goodsDetail/goodsDetail?gid=' + gid);
  }
  

})