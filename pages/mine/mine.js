// pages/mine/mine.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        rawData: null,
        userInfo: []
    },

    onLoad: function () {
        // this.init();
    },

    onShow: function () {
        this.init();
    },

    getUserInfo: function (e) {

        if (this.data.rawData) return;
        let bhs = wx.getStorageSync('bhs');
        let {detail} = e;
        let {encryptedData, iv, rawData} = detail;

        // 缓存用户信息
        app.setStorageSync({rawData: rawData});
        this.setData({
            rawData: JSON.parse(rawData)
        });

        app.post('User/userregistorupdate', {
            source: 'client',
            encryptedData,
            iv,
            bhs
        })

    },

    loginevent: function () {
        setTimeout(() => {
            this.init();
        }, 1000)
    },

    init: function () {

        wx.showLoading();
        if (!wx.getStorageSync('token')) {
            let that = this.selectComponent("#loginBox");
            if (that) {
                that.setData({
                    hidden: false
                });
            }
            wx.hideLoading();
            return;
        } else {
            let that = this.selectComponent("#loginBox");
            if (that) {
                that.setData({
                    hidden: 'hidden'
                });
            }
        }

        let rawData = wx.getStorageSync('rawData');
        this.setData({
            rawData: rawData && JSON.parse(rawData)
        });

        //用户详情
        app.post('User/detial', {}, (res) => {
            this.setData({
                userInfo: res.data.user_info,
                sliverInfo: res.data.user_info.surplus_silvershells + res.data.user_info.surplus_business_silvershells
            });
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });

        //返回的数量
        app.post('Myorder/countStatusNums', {}, (res) => {
            this.setData({
                aftersale: res.data.aftersale,
                dcollect: res.data.dcollect,
                dpay: res.data.dpay,
                dtake: res.data.dtake,
                finish: res.data.finish
            })
        });

        app.clearStorageSync();
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.init();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    }

});