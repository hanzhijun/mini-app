const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        res_data: {},
        package_id: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {package_id} = options;
        let {res_data} = this.data;
        app.post('/Offline/confirmComboOrder', {
            package_id
        }, (res) => {

            if (res.code == 200) {
                res_data = res.data;
                this.setData({
                    res_data,
                    package_id
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

    pay: function () {

        wx.showLoading();
        let {package_id} = this.data;
        app.post('/Offline/createComboOrder', {
            package_id,
            num: 1,
            is_use_gold: 1,
            is_use_balance: 0
        }, (res) => {

            if (res.code == 200) {
                app.alert('兑换成功', 'success', () => {
                    app.openPage(`shopCart/pay/pay?types=兑换&status=200&btn=1,2&order_id=${res.data.package_order_id}&buy_type=offline&order_no=${res.data.package_order_no}`);
                })
            } else {
                app.alert(res.info, 'none');
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

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