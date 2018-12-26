const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        res_data: {},
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        type: '',
        erweima: 0,     // 是否显示二维码
        location: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let {id, type} = options;
        app.getlocation((e) => {
            this.data.location = e;
            this.init(id, type);
        })

    },

    openPage() {

        let {res_data} = this.data;
        app.openPage(`index/offlineBusinessA/goBuy/goBuy?package_id=${res_data.package_id}`);

    },

    init(id, type) {

        wx.showLoading();
        let {location} = this.data;
        app.post('/Mypackage/packagedetail', {id}, (res) => {
            
            if (res.code == 200) {
                res.data.expire_at = res.data.expire_at.split(' ')[0];
                res.data.km = app.addressLimit(res.data.longitude_latitude.split(','), location);
                this.setData({
                    res_data: res.data,
                    type
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

    // 拨打电话
    callPhone(e) {

        let {tel} = e.currentTarget.dataset;
        wx.makePhoneCall({
            phoneNumber: tel
        })

    },

    catCode(e) {

        let {type} = e.currentTarget.dataset;
        if (type == 0) {
            this.setData({
                erweima: 0
            })
        } else {
            this.setData({
                erweima: type
            })
        }

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