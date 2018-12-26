// pages/newIndex/nearby/nearby.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        address: '',
        lat: '',
        lng: '',
        hotList: [],
        total: '',
        per_page: '',
        current_page: '',
        last_page: '',
        logo_path: '',
        web_url: '',
        list: [],
        location: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {

        var that = this;
        if (wx.getStorageSync('token')) {
            // that.init();
        } else {
            var timer = setInterval(function () {
                if (wx.getStorageSync('token')) {
                    clearInterval(timer);
                    that.init();
                }
            }, 1000);
        }

    },

    openPageTo: function (e) {

        let {jump_data, jump_type} = e.currentTarget.dataset;
        app.openPageTo(jump_data, jump_type);

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

        if (!wx.getStorageSync('token')) {
            let that = this.selectComponent("#loginBox");
            if (that) {
                that.setData({
                    hidden: false
                });
            }
        } else {
            let that = this.selectComponent("#loginBox");
            if (that) {
                that.setData({
                    hidden: 'hidden'
                });
            }
            this.init();
        }


    },
    /**
     * 初始化数据
     */
    init: function () {

        wx.showLoading();
        let {lat, lng, hotList} = this.data;
        if (lat=='' || lng=='') {
            this.getAddress();
        } else if (hotList == '') {
            this.getList();
        }
        app.getPagesOpt(10001, data => {
            this.setData({
                list: data
            });
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },
    /**
     * 获取地理位置
     */
    getAddress: function () {

        var that = this;
        app.getaddress((res) => {
            let address_json = res.address_component;
            let lat = res.location.lat;
            let lng = res.location.lng;
            this.setData({
                address: `${address_json.city}${address_json.district}`,
                lat,
                lng
            });
            that.getList();
        })

    },
    /**
     * 获取附近数据
     */
    getList: function () {

        let {lat, lng, current_page, last_page} = this.data;
        if (!lat || !lng || (current_page != '' && last_page != '' && current_page >= last_page)) return;
        app.post('Operation/nearby', {
            lat,
            lgn: lng,
            limit: 10,
            page: current_page + 1
        }, (res) => {

            let {logo_path, web_url} = res.data;
            let {total, per_page, current_page, last_page, data, i} = res.data.data;
            let {hotList} = this.data;
            let newJson = hotList;

            for (i = 0; i < data.length; i++) {
                let {name, expense_avg, address, desc_info, s, newDesc=[], logo, business_offline_id} = data[i];
                newDesc = desc_info.split('，');
                var obj = {
                    name: name,
                    expense_avg: expense_avg,
                    address: address,
                    s: parseInt(s / 100) / 10,
                    desc_info: newDesc,
                    logo: logo,
                    business_offline_id: business_offline_id
                };
                newJson.push(obj);
            }

            this.setData({
                total,
                per_page,
                current_page,
                last_page,
                logo_path,
                web_url,
                hotList: newJson
            });

        })

    },

    openPage: function (e) {

        let { id } = e.currentTarget.dataset;
        app.openPage(`index/offlineBusinessB/offlineBusinessB?business_offline_id=${id}`);

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

        if (!wx.getStorageSync('token')) {
            let that = this.selectComponent("#loginBox");
            if (that) {
                that.setData({
                    hidden: false
                });
            }
        } else {
            let that = this.selectComponent("#loginBox");
            if (that) {
                that.setData({
                    hidden: 'hidden'
                });
            }
            this.setData({
                hotList: [],
                current_page: ''
            });
            this.init();
        }
        wx.stopPullDownRefresh();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.getList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});