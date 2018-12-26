const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    outerInfo: [],
    timestamp: '',
    page: 1, // 当前页码
    pages: '', // 总页数
    shareList: []
  },

  onLoad: function(options) {

    this.data.options = options;
    this.getInfo(options, 'reach');
    // 获取当前时间
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    this.setData({
      timestamp
    })

  },

  // 获取列表
  getInfo(options, loadType) {

    wx.showLoading();
    let {
      page,
      shareList
    } = this.data;
    app.post('share/myshare', {
      limit: 10,
      page: page
    }, (res) => {
      for (let val of res.data.data) {
        val.create_at = new Date(val.create_at * 1000).format('yyyy-MM-dd hh:mm');
        shareList.push(val);
      }
      page++;
      // loadType == 'reach' ? (shareList = shareList.concat(res.data.data)) : (shareList = res.data.data);

      let all_count = res.data.all_count;
      this.setData({
        shareList,
        outerInfo: res.data,
        dead_time: res.data.data[0].dead_time,
        page,
        pages: Math.ceil(all_count / 10)
      });

      setTimeout(function() {
        wx.hideLoading();
      }, 300);

    });

    setTimeout(function() {
      wx.hideLoading();
    }, 3000);

  },

  // 立即领取
  commReceive(e) {
    let _this = this;
    let id = e.currentTarget.dataset.id;
    app.post('share/getgold', {
      share_id: id
    }, (res) => {
      if (res.code == 200) {
        app.alert('领取成功！', 'success', () => {});
        _this.setData({
          page: 1,
          pages: '',
          shareList: []
        });
        _this.getInfo()
      }else{
        app.alert(res.info, 'none')
      }
    })

  },
  
  // 再去助力
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
    }
    let id = e.currentTarget.dataset.id;
    return {
      title: '',
      path: `pages/helpPay/shareIndex/shareIndex?share_id=` + id,
      imageUrl: '',
      success: function () {
      }
    }
  },


  // 立即购买
  listClick(e) {
    let { goods_id, produc_name, price, need_num, spec_id, help_id, eid } = e.currentTarget.dataset;
      let json = {
        is_use_gold: 1,
        is_use_balance: 0
      };
      let spec_json = {
        goods_id,
        spec_id,
        num: 1,
        is_active: 0,
        cid: 0
      };
      json.param = [spec_json];
      json.share = 1;
      app.setStorageSync({
        ginfo: json
      });
    app.openPage(`shopCart/order/order?gid=${goods_id}`);
  },


  // 点击商品去分享主页
  gotoProduct:function(e){
    let { id } = e.currentTarget.dataset;
    app.openPage('helpPay/shareIndex/shareIndex?share_id=' + id);
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

    this.setData({
      page: 1,
      pages: 1,
      shareList: []
    });
    this.getInfo();
    wx.stopPullDownRefresh();

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let {page, pages} = this.data;
    if(page <= pages) {
      this.getInfo()
    }
  }

});