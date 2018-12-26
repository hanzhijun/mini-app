const app = getApp();
const WxParse = require('../../../wxParse/wxParse.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: '',
        res_data: {},
        id: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let {id, type} = options;
        this.setData({
            id,
            type
        });
    },

    onShow: function () {

        let that = this.selectComponent("#loginBox");
        if (!wx.getStorageSync('token')) {
            if (that) {
                that.setData({
                    hidden: false
                });
            }
        } else {
            if (that) {
                that.setData({
                    hidden: 'hidden'
                });
            }
            this.init();
        }
    },

    init: function () {

        let {id, res_data} = this.data;
        wx.showLoading();
        app.post('package/packagedetail', {
            package_id: id
        }, (res) => {
            res_data = res.data;
            app.setTitle(res_data.package_name);
            res_data.expire_time_format = new Date(res_data.expire_time * 1000).format('yyyy-MM-dd');
            res_data.price_len = (res_data.price / 100 * 1 + '').length; // 金额所点字符数
            WxParse.wxParse('article', 'html', res_data.package_desc, this, 0);
            this.setData({
                res_data
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);
    },

    openPage() {
        app.openPage(`taocan/taocanPay/taocanPay?id=${this.data.id}`)
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.init();
        wx.stopPullDownRefresh();
    },
    /**
     * 登录成功回执
     */
    loginevent: function () {
        this.init();
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