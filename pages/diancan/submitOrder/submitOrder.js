// pages/submitOrder/submitOrder.js
let app = getApp();
Page({
  data: {
    showPop: true,      // 弹框属性
    shopcart: {},       // 购物车
    total_price: 0,     // 总价
    pay_type: 1 ,       // 支付方式
    businessid: 0,      // 商家
    desk_id: 0          // 桌号
  },

  onLoad: function (options) {
    let { businessid, desk_id } = options;
    this.setData({
      shopcart: wx.getStorageSync('shopcart'),
      total_price: wx.getStorageSync('total_price'),
      businessid,
      desk_id
    })
  },

  // 单选框
  radioChange: function (e) {
    this.setData({
      pay_type: e.detail.value
    })
  },

  // 提交订单弹出框
  submitOrder: function () {
    let { shopcart } = this.data;
    this.setData({
      showPop: !this.data.showPop
    })
  },

  // 备注
  note: function(e) {
    let {shopcart} = this.data;
    let {id} = e.currentTarget.dataset;
    let {value} = e.detail;
    shopcart[id].remakers = value;
    this.setData({
      shopcart
    })
  },

  // 确认支付跳转
  sure: function () {
    let { businessid, desk_id, total_price, shopcart, pay_type} = this.data;
    // console.log(total_price);
    let shopcartArr = [];
    for (let key in shopcart) {
      let goods = shopcart[key];
      delete goods.flavor_id
      shopcartArr.push(goods);
    }

    app.post('ordering/commitorder', {
      businessid,
      tablenum: desk_id,
      total_price,
      total_dishes: shopcartArr.length,
      pay_type,
      dishes: shopcartArr
    }, (res) => {
      if(res.code == 200) {
        let jasp_pay = res.data.jasp_pay;
        if (pay_type == 2) return app.openPage(`diancan/orderDetail/orderDetail?order_num=${res.data.ordernum}`);
        wx.requestPayment({
          'timeStamp': jasp_pay.timeStamp.toString(),
          'nonceStr': jasp_pay.nonceStr,
          'package': jasp_pay.package,
          'signType': jasp_pay.signType,
          'paySign': jasp_pay.paySign,
          'success': function (e) {
            app.post('ordering/wxorder', {
              order_num: jasp_pay.order_num
            })
            app.openPage(`diancan/orderDetail/orderDetail?order_num=${jasp_pay.order_num}`);
          },
          'fail': function () {
            // app.post('ordering/deleteOrder', {
            //   order_num: jasp_pay.order_num
            // })
          }
        })
      } else {
        app.alert('支付失败！', 'none');
      }
    })
    // wx.navigateTo({
    //   url: '/pages/diancan/orderDetail/orderDetail'
    // })
  },

})
