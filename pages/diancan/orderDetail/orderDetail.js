let app = getApp();

Page({
  data: {
    order_detail: {},
  },

  onLoad: function (options) {
    let {order_num} = options;
    app.post('ordering/orderdetail', {
      order_num
    }, (res) => {
      if(res.code == 200) {
        this.setData({
          order_detail: res.data
        })
      }
    })
  },
})