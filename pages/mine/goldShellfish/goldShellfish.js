// pages/mine/goldShellfish/goldShellfish.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        goldNum: [],
        goldList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {

        wx.showLoading();
        // 获取金贝列表
        app.post('User/myShellInfo', {}, (res) => {

            this.setData({
                goldNum: res.data,
                goldList: res.data.list
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