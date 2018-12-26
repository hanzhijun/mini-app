// pages/shareBuy/shareBuy.js
const app = getApp();
let T;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.config.imgUrl,
    host: app.config.host,
    e_data: 0,
    share_type: '',       // 分享者: 1 || 参与者： 0
    alert_data: {         // 参与者弹窗信息
      join_status: '',    // 参与成功 || 失败 || 人数已满
      get_gold: 0,        // 参与者获得的金贝
      gid: 0
    },
    res_data: {},
    time: [],             // [时,分,秒]
    s: 0,
    join_info: [],        // 加入者信息
    btnText: ['激活成功，立即捞得', 0],
    options: {},
    show_guize: false,
    tcType: -1, // 弹窗 -1关闭、1发起者成功、2参与者成功、3参与者失败、4规则弹窗
    joinGetCount: '',
    joinInfo: "" ,// 参与者错误提示
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { e_data, share_id} = options;
    this.setData({
      options,
      share_id
    });
    if (e_data) {
      this.setData({
        e_data
      })
    }
    let that = this.selectComponent("#loginBox");
    let _this = this;
    if (!wx.getStorageSync('token')) {
      if (that) {
        that.setData({
          hidden: false
        });
      }
    } else {
      if (that) {
        that.setData({
          hidden: 'hidden',
        });
      }
      _this.init();
    }
  },

  init: function () {

    this.getDetail()

  },

  moreGoods() {

    app.openPage(`newIndex/templateTwo/templateTwo?id=10036`);

  },

  loginevent: function (e) {
    setTimeout(() => {
      this.init();
    }, 500)
  },

  getDetail() {

    wx.showLoading();
    let { e_data, alert_data, share_id, shareImg} = this.data;
    app.post('share/helpbuydetail', {
      share_id: share_id
    }, (res) => {

      clearInterval(T);
      if (res.code == 200) {
        let res_data = res.data;
        let s = res_data.dead_time - parseInt(res_data.current_time);
        this.setData({
          s
        });
        if (s > 0) {
          T = setInterval(() => {
            s--;
            this.formatTime(s);
            if (s <= 0) {
              clearInterval(T);
              this.setData({
                s: -1
              });
              this.onLoad(this.data.options);
            }
          }, 1000)
        }

        let limit_num = res_data.limit_num;
        let num = res_data.share_record_info.length;
        let join_info = [];
        for (let i=0; i<limit_num*1; i++) {
          let obj = {}
          if (i < num) {
            obj = {
              b_avatar: res_data.share_record_info[i].b_avatar,
              b_nickname: res_data.share_record_info[i].b_nickname
            }
          } else {
            obj = {
              b_avatar: '/images/share/head_gray.png',
              b_nickname: ''
            }
          }
          join_info.push(obj);
        }

        this.setData({
          share_type: res.data.share_type,
          res_data: res.data,
          join_info,
          shareImg: res.data.img_url + res.data.list_url
        })
      }


    });


  },

  // 格式化时间
  formatTime(s) {

    var secondTime = parseInt(s);// 秒
    var minuteTime = 0;// 分
    var hourTime = 0;// 小时
    if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
      minuteTime = parseInt(secondTime / 60);
      secondTime = parseInt(secondTime % 60);
      if (minuteTime > 60) {
        hourTime = parseInt(minuteTime / 60);
        minuteTime = parseInt(minuteTime % 60);
      }
    }

    this.setData({
      time: [hourTime, minuteTime, secondTime]
    })

  },

  getGold() {

    let { e_data, btnText } = this.data;
    if (btnText[1]) return;
    app.post('share/getindirectgold', { order_id: e_data }, (res) => {
      if (res.code == 200) {
        // 领取成功
        this.setData({
          btnText: ['领取成功，已获得', 1],
          tcType: 1
        })
      } else {
        // 领取失败
        app.alert('领取失败', 'none');
      }
    })

  },

  openPage() {
    app.openPage(`helpPay/goodsDetail/goodsDetail?gid=` + this.data.res_data.goods_id);
  },

  gotoHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  openRule() {
    this.setData({
      tcType: 4
    })
  },

  isee() {
    this.setData({
      tcType: -1
    })
    this.init();
  },

  /**
   * 分享
   * @param res
   * @returns {{title: string, path: string, imageUrl: string, success: success}}
   * {{res_data.img_url}}{{res_data.list_path}}{{res_data.g_pic}} {{res_data.g_name}}
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
    }
    let { share_id, res_data, shareImg} = this.data;
    return {
      title: res_data.g_name,
      path: `pages/helpPay/shareIndex/shareIndex?share_id=` + share_id,
      imageUrl: shareImg,
      success: function () {
      }
    }
  },

  // 立即助力
  goHelp:function(){
    let {res_data} = this.data;
    app.post('share/help', {share_id: res_data.id}, (res) => {
      if (res.code == 200) {
        res_data.join = 1;
        this.setData({
          res_data
        });

        if (res_data.is_pay == 1){
          this.setData({
            tcType: 2
          })
        }else{
          this.setData({
            tcType: 3
          })
        }
      }
      if (res.code == 402) {
        app.alert(res.info, 'none');
      }
    })
  },


  // 立即领取
  immeReceive: function () {
    let {res_data} = this.data
    app.post('share/getgold', { share_id: res_data.id }, (res) => {
      if (res.code == 200) {
        // app.alert('领取成功', 'none');
        this.setData({
          tcType: 1
        })
      }
    })
  },


  // 马上支付
  listClick() {
    let { res_data } = this.data;

    let json = {
      is_use_gold: 1,
      is_use_balance: 0
    };
    let spec_json = {
      goods_id: res_data.goods_id,
      spec_id: res_data.spec_id,
      num: 1,
      is_active: 0,
      cid: 0
    };
    json.param = [spec_json];
    json.share = 1;
    app.setStorageSync({
      ginfo: json
    });
    app.openPage('shopCart/order/order?gid=' + res_data.goods_id);

  },


  // 下拉
  onPullDownRefresh() {
    this.setData({
      have_get: -1,
      tcType: -1,
      joinGetCount: "",
      joinInfo: ""
    });
    this.init();
    wx.stopPullDownRefresh();
  }
});