const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: 0, // loading加载提示框
    toast: 0, // 提示文字
    toastTxt: '',
    imgUrl: app.config.imgUrl,
    host: app.config.host,
    imgs_url: [],
    gid: 0,
    goods: {},
    height: app.config.height,
    toPage: 'goods', //  滚动到哪里
    tabType: 'goods',
    // 规格json
    spec: {
      first: {}, // id1: value
      second: {} // id2: value
    },
    // 当前选中的
    current_info: {
      first_attr_id: 0,
      second_attr_id: 0,
      first_attr_name: '',
      second_attr_name: '',
      base_return: 0,               // 返回金贝
      sale_price: 0,                // 价格
      silver_price: 0,              // 银贝价格
      copper_price: 0,              // 铜贝
      gold_price: 0,                // 金贝价格 活动商品使用
      nums: 0,                      // 库存
      spec_id: 0,                   // 规格id
      num: 1,                     // 选择数量

    },
    buy_limit: '',
    bought: 0,
    is_active: 0,     // 判断是否是活动商品 1：是 0：不是
    // 规格
    sepc_id_info: {
      /*
       id1-id2: {
       spec_id: 0,
       sale_price: 1,      // 人民币
       silver_price: 0,    // 银贝价格
       base_return: 0,     // 返回金贝
       nums: 0,            // 库存
       }
       */
    },
    surplus_goldshells: 0,
    tcType: -1,
    shareImageUrl: '' // 分享使用图片
  },

  onUnload: function () {
    app.returnPage();
  },

  openPage: function () {

    wx.switchTab({
      url: '/pages/shopCart/shopCart',
      success: function (e) {
        var page = getCurrentPages().pop();
        if (page == undefined || page == null) return;
        page.onLoad();
      }
    })

  },

  deleteCollect() {

    let { goods } = this.data;
    app.post('Car/delCollectGoodsById', {
      midarr: [goods.collect]
    }, (res) => {
      if (res.code == 200) {
        app.alert('取消收藏成功！');
        this.setData({
          'goods.collect': 0
        })
      } else {
        app.alert(res.info);
      }

    })

  },

  // 加入收藏
  joinCollect: function (e) {

    let { current_info, gid, goods } = this.data;
    if (!current_info.first_attr_id || !current_info.second_attr_id) {
      return app.alert('请选择规格！', 'none');
    } else if (!current_info.nums) {
      return app.alert('库存不足！', 'none');
    } else if (!gid || !current_info.spec_id) {
      return app.alert('请选择规格！', 'none');
    }
    app.post('Car/addmycollect', {
      idarr: [`${gid}: ${current_info.spec_id}`],
      opt: 'goods',
    }, (res) => {
      if (res.code == 200) {
        app.alert('收藏成功！');
        this.setData({
          'goods.collect': res.data.id
        })
      } else {
        app.alert(res.info, 'none')
      }
    })

  },

  // 加入购物车
  joinShopCart: function (e) {
    if (this.data.buy_limit > 0 && this.data.buy_limit == this.data.bought) {
      app.alert('您已达到购买上限~', 'none');
      return;
    }
    let { current_info, gid } = this.data;
    app.post('Car/addcar', {
      goods_id: gid,
      spec_id: current_info.spec_id,
      num: current_info.num
    }, (res) => {
      if (res.code == 200) {
        app.alert(res.info);
      } else {
        app.alert(res.info, 'none')
      }
    })

  },

  switchPage: function (e) {

    this.setData({
      toPage: e.currentTarget.dataset.type
    })

  },

  // 数量操作
  checkNumber: function (e) {

    app.showToast(this, '助力购商品每人限购一件');
    return;

    let { type } = e.currentTarget.dataset;
    let { current_info, goods } = this.data;
    if (this.data.buy_limit > 0) {
      if ((this.data.buy_limit - this.data.bought) <= current_info.num) {
        app.alert(' 您已达到购买上限~', 'none');
        return;
      }
    }
    current_info.num += +type;
    if (current_info.num > +current_info.nums) return current_info.num = +current_info.nums;
    else if (current_info.num < 1) return current_info.num = 1;

    this.setData({
      current_info
    })

  },

  // 选择规格
  checkSpec: function (e) {

    let { first_attr_id, second_attr_id, first_attr_name, second_attr_name } = e.currentTarget.dataset;
    let { current_info, sepc_id_info, is_active, goods } = this.data;

    first_attr_id && (current_info.first_attr_id = first_attr_id);
    second_attr_id && (current_info.second_attr_id = second_attr_id);
    first_attr_name && (current_info.first_attr_name = first_attr_name);
    second_attr_name && (current_info.second_attr_name = second_attr_name);

    // 得到规格key
    let id = `${current_info.first_attr_id}-${current_info.second_attr_id}`;

    try {
      let info = sepc_id_info[id];
      // 初始化
      current_info.spec_id = info.spec_id;
      current_info.num = 1;
      if (is_active) {  // 活动商品
        current_info.nums = +info.activity_nums;
        if (goods.payment == 1) {   // 金贝+现金
          current_info.sale_price = info.price;
        } else if (goods.payment == 2) { // 金贝+铜贝
          current_info.gold_price = info.gold_price;
          current_info.copper_price = info.copper_price;
        } else if (goods.payment == 3) { // 银贝
          current_info.silver_price = info.price
        }
      } else {
        current_info.sale_price = info.sale_price;
        current_info.silver_price = info.silver_price;
        current_info.base_return = info.base_return;
        current_info.nums = +info.nums;
      }
      current_info.extra_gold = +info.extra_gold
    } catch (e) {

    }
    this.setData({
      current_info
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { gid } = options;
    this.setData({
      gid,
      options,
    });
  },

  onShow:function(){
    this.init();
    this.setData({
      tcType: -1,
    })
  },

  init: function () {

    wx.showLoading();
    var that = this;
    let { is_active, gid } = this.data;
    app.post('/goods/goods/detailsinfo', {
      gid
    }, (res) => {
      if (res.code == 200) {
        let goods = res.data;
        is_active = goods.goods_activity_id && goods.activity_status == 1 ? 1 : 0;
        let { spec_info } = res.data;
        let { spec, sepc_id_info, imgs_url, current_info } = this.data;
        imgs_url = goods.imgs_url;

        for (let s of spec_info) {
          spec.first[s.first_attr_id] = s.first_attr_value;
          spec.second[s.second_attr_id] = s.second_attr_value;
          sepc_id_info[`${s.first_attr_id}-${s.second_attr_id}`] = s;
        }

        let s = sepc_id_info[Object.keys(sepc_id_info)[0]];
        current_info = {
          first_attr_id: s.first_attr_id,
          second_attr_id: s.second_attr_id,
          first_attr_name: s.first_attr_value,
          second_attr_name: s.second_attr_value,
          spec_id: s.spec_id,
          sale_price: is_active ? s.price : s.sale_price,
          silver_price: is_active ? s.price : s.silver_price,
          gold_price: s.gold_price || 0,
          copper_price: s.copper_price || 0,
          base_return: s.base_return,
          nums: is_active ? s.activity_nums || 0 : s.nums || 0,
          num: 1,
          extra_gold: s.extra_gold
        };

        this.setData({
          goods: res.data,
          gid,
          spec,
          sepc_id_info,
          imgs_url,
          current_info,
          is_active,
          buy_limit: res.data.buy_limit
        });

        if (res.data.buy_limit > 0) {
          this.setData({
            bought: res.data.bought
          });
        }

        setTimeout(function () {
          wx.hideLoading();
        }, 300);

      } else if (res.code == 402) {
        app.alert(res.info, 'none');
        setTimeout(function () {
          that.goBack();
        }, 3000);
      } else {
        app.alert(res.info, 'none');
      }
    });

    this.getIconNum();

    setTimeout(function () {
      wx.hideLoading();
    }, 3000);

  },

  pay: function (e) {

    if (this.data.buy_limit > 0 && this.data.buy_limit == this.data.bought) {
      app.alert('您已达到购买上限~', 'none');
      return;
    }
    let { is_share } = e.currentTarget.dataset;       // 判断是否是分享
    let { current_info, gid, is_active } = this.data;
    if (!current_info.first_attr_id || !current_info.second_attr_id) {
      return app.alert('请选择规格！', 'none');
    } else if (!current_info.nums) {
      return app.alert('库存不足！', 'none');
    } else if (!gid || !current_info.spec_id) {
      return app.alert('请选择规格！', 'none');
    }

    let json = {
      is_use_gold: 1,
      is_use_balance: 0
    };

    let spec_json = {
      goods_id: gid,
      spec_id: current_info.spec_id,
      num: current_info.num,
      is_active,
      cid: 0
    };

    json.param = [spec_json];
    // json.share = +is_share;
    json.share = 1

    app.setStorageSync({
      ginfo: json
    });

    if (is_share == 1) {
      if (current_info.num > 1) {
        this.setData({
          toastTxt: '分享购买每次只能购买一个',
          toast: 1
        });
        let _this = this;
        setTimeout(function () {
          _this.setData({
            toast: 0
          });
        }, 2500);
        return;
      }


      let { goods, imgUrl } = this.data;
      wx.setStorageSync('shareImg', imgUrl + '/' + goods.list_url);
      wx.setStorageSync('shareTitle', goods.goods_name);
    }

    app.openPage(`shopCart/order/order?gid=${gid}`);

  },

  //滚动监听
  scroll: function (e) {

    if (e.detail.scrollTop > 630) {
      this.setData({
        tabType: 'msg'
      });
    } else {
      this.setData({
        tabType: 'goods'
      });
    }

  },

  onShareAppMessage: function (res) {

    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    // console.log(this.host + '/' + this.data.goods.imgs_url[0]);
    return {
      title: this.data.goods.goods_name,
      desc: '贝划算，开始划算生活',
      path: '/pages/shopCart/goodsDetail/goodsDetail?gid=' + this.data.gid,
      imageUrl: this.data.imgUrl + '/' + this.data.goods.imgs_url[0]
    }

  },

  goBack: function () {

    wx.switchTab({
      url: '/pages/index/index'
    });

  },

  /**
   * 获取金贝银贝数量
   */
  getIconNum() {
    /*
    
            app.post('User/detial', {}, (res) => {
                if (res.data.length != 0) {
                    this.setData({
                        surplus_goldshells: res.data.user_info.surplus_goldshells
                    })
                }
            });
    */

    app.post('Dispatch/getUsergold', {}, (res) => {
      if (res.code = 200) {
        this.setData({
          surplus_goldshells: res.data.gold
        })
      }
    });

  },

  imageLoad: function () {

  },

  loginevent: function () {

    setTimeout(() => {
      this.init();
    }, 1000)

  },

  helpbuy: function (e) {
    let _this = this;
    let { gid, tc_type, current_info} = this.data;
    // let json = {
    //   is_use_gold: 1,
    //   is_use_balance: 0
    // };
    // let spec_json = {
    //   goods_id: gid,
    //   spec_id: current_info.spec_id,
    //   num: 1,
    //   is_active: 0,
    //   cid: 0
    // };
    // json.param = [spec_json];
    // json.share = 1;
    // app.setStorageSync({
    //   ginfo: json
    // });

    app.post('share/helpbuyshare', {
      goods_id: gid,
      spec_id: current_info.spec_id
    }, (res) => {
      if (res.code == 200) {
        _this.setData({
          info: res.data,
          shareImageUrl: res.data.web_url + res.data.img,
          share_id: res.data.share_id
        })
        let tc_type = res.data.type
        let is_get = res.data.is_get
        if (tc_type == 1) { //用户第一次点击
          _this.setData({
            tcType: 9
          })
        }
        if (tc_type == 2) { //进行中 未支付
          _this.setData({
            tcType: 5
          })
        }
        if (tc_type == 3) { //进行中 已支付
          _this.setData({
            tcType: 6
          })
        }
        // 发起者助力成功且下单成功，时间到期，未领取金贝的状态，进入到商品详情，点击助力购按钮弹出提示用户领取金贝弹窗（用户领取之后才可重新发起）
        if (tc_type == 4 && is_get == 0) { //助力人数已满 已支付
          _this.setData({
            tcType: 7
          })
        }
        if (tc_type == 5) { //助力人数已满 未支付
          _this.setData({
            tcType: 8
          })
        }
      }
      if (res.code == 402){
        setTimeout(function () {
          app.alert(res.info, 'none');
        }, 300);
      }
    });

  },

  isee() {
    this.setData({
      tcType: -1
    })
  },

  // 助力购分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
    }
    let { shareImageUrl, share_id } = this.data;
    return {
      title: this.data.goods.goods_name, 
      path: 'pages/helpPay/shareIndex/shareIndex?share_id=' + share_id,
      imageUrl: shareImageUrl,
      success: function () {
        
      }
    }
   
  },

  // 马上领取
    getGold(e) {
      let { share_id } = this.data;
      app.post('share/getgold', {
        share_id: share_id
      }, (res) => {
        if (res.code == 200) {
          this.setData({
            tcType: -1
          })
          app.alert('恭喜你获得' + this.data.info.activity_indirect_return + '金贝', 'none');
        } else {
          app.alert(res.info, 'none')
        }
      })

    },


});