const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        location: {},
        res_data: {},
        is_cash_coupon: 0,    // 显示更多代金券
        count: 0,
        page: 1,
        package_data: [],
        host: app.host,
        imgs_host: '',
        list_save_path: '',
        business_offline_id: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let {business_offline_id} = options;
        this.setData({
            business_offline_id
        })

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
        wx.showLoading();
        this.setData({
            count: 0,
            page: 1,
            package_data: []
        });
        let {res_data, business_offline_id} = this.data;
        app.getlocation((e) => {
            this.data.location = e;
            app.post('Mypackage/businessdetailByid', {
                id: business_offline_id
            }, (res) => {

                let {data} = res;
                var cash_coupon_list_str = JSON.stringify(res.data.cash_coupon_list);
                res_data = data;
                res_data.km = app.addressLimit(data.longitude_latitude.split(','), e);
                app.setTitle(data.name);
                res_data.cash_coupon_list = [];

                for (var i = 0; i < JSON.parse(cash_coupon_list_str).length; i++) {
                    var thisLi = JSON.parse(cash_coupon_list_str)[i];
                    thisLi.gold_price = Math.floor(thisLi.price / 100);
                    res_data.cash_coupon_list.push(thisLi);
                }

                this.setData({
                    res_data
                })

            })
        });
        this.getPackage();

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);
    },

    getPackage() {

        let {page, count, package_data, imgs_host, list_save_path, business_offline_id} = this.data;
        app.post('package/packagelists', {
            business_id: business_offline_id,
            page: page,
            limit: 10,
            package_type: 1
        }, (res) => {

            let newData = res.data.data;
            for (var i = 0; i < newData.length; i++) {
                var newDataLi = newData[i];
                newDataLi.gold_price = Math.floor(newData[i].price / 100);
                package_data.push(newDataLi);
            }

            count = res.data.count;
            list_save_path = res.data.list_save_path;
            imgs_host = res.data.imgs_host;
            this.setData({
                package_data, count, imgs_host, list_save_path
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        })
    },

    openPage(e) {
        let {type, id} = e.currentTarget.dataset;
        app.openPage(`taocan/detail/detail?id=${id}&type=${type}`);
    },

    lower() {

        let {count, page, package_data} = this.data;
        if (package_data.length >= count) return;
        page += 1;
        this.getPackage();

    },

    call(e) {
        let {res_data} = this.data;
        wx.makePhoneCall({
            phoneNumber: res_data.tel
        })
    },

    // 显示更多代金券
    showMore() {
        this.setData({
            is_cash_coupon: 1
        })
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