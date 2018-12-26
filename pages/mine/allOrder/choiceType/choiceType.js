const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        res: '',             // 数据
        info_id: '',
        order_id: '',
        category_logo_url: '',
        imgUrl: app.config.imgUrl,
        host: app.config.host
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {info_id, order_id} = options;

        app.post('Order/returnAfterSaleInfo', {
            info_id,
            order_id
        }, (res) => {

            if (res.code == 200) {
                this.setData({
                    category_logo_url: res.category_logo_url,
                    res: res.data,
                    info_id,
                    order_id
                })
            }
            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    openPage: function () {

        let {order_id, info_id} = this.data;
        app.openPage(`mine/allOrder/exchage-goods/exchage-goods?type=tuikuan&order_id=${order_id}&info_id=${info_id}`);

    }
});