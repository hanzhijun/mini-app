const app = getApp();
const WxParse = require('../../../wxParse/wxParse.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        res_data: {},
        current: 'unused',
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        id: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {id, type} = options;
        let {res_data} = this.data;
        app.getlocation((e) => {
            app.post('Mypackage/packagedetail', {
                id
            }, (res) => {

                res_data = res.data;
                res_data.km = app.addressLimit(res_data.longitude_latitude.split(','), e);
                res_data.expire_at_format = new Date(res_data.expire_at * 1000).format('yyyy-MM-dd');
                res_data.create_at_format = new Date(res_data.create_at * 1000).format('yyyy-MM-dd h:m');
                res_data.use_time_format = new Date(res_data.use_time * 1000).format('yyyy-MM-dd h:m');
                WxParse.wxParse('article', 'html', res_data.package_desc, this, 0);
                this.setData({
                    res_data: res.data,
                    id
                })
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    openPage(e){

        let {status} = e.currentTarget.dataset;
        let {id} = this.data;
        if (status == 1) { // 申请退款
            app.openPage('mine/package/applyRefund/applyRefund?id=' + id);
        } else {  // 查看详情
            app.openPage('mine/package/refundDetail/refundDetail?id=' + id)
        }

    },

    previewImg() {

        let {res_data, host} = this.data;
        if (res_data.status != 1) return;
        wx.previewImage({
            urls: [`${host}/${res_data.qr_url}`]
        })

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

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