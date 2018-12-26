// pages/mine/silverShellfish/silverShellfish.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        sliverNum: '',
        sliverList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {

        wx.showLoading();
        // 获取银贝列表
        app.post('User/returnUserSliverDetial', {}, (res) => {

            this.setData({
                sliverNum: res.data.user_info,
                sliverList: res.data.silver_list
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    }
});