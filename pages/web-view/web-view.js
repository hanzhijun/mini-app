// components/web-view/web-view.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let host = app.config.host;
        let {url} = options;
        let id = wx.getStorageSync('pgcTemplateId');
        let thisUrl = '';
        if(host.indexOf('net')!=-1) {
            thisUrl = url + '?token=' + wx.getStorageSync('token') + '&id=' + id + '&api=net';
        } else {
            thisUrl = url + '?token=' + wx.getStorageSync('token') + '&id=' + id;
        }
        this.setData({
            url: thisUrl
        });
        wx.removeStorageSync('pgcTemplateId');
        setTimeout(function () {
            wx.hideLoading();
        }, 1500);

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
        let return_url = options.webViewUrl; //分享的当前页面的路径
        var path = 'pages/web-view/web-view?url=' + return_url; //小程序存放分享页面的内嵌网页路径
        return {
            title: '贝划算，开始划算生活',
            path: path,
            success: function(res) {
                // 转发成功
                // console.log('Share success!');
            },
            fail: function(res) {
                // 转发失败
                // console.log(JSON.stringify(res));
            }
        }
    }
});