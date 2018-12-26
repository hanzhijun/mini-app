const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        offDetail: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        var order_id = wx.getStorageSync('id');
        app.post('Mydownorder/downMyOrderdetial', {
            id: order_id
        }, (res) => {

            this.setData({
                offDetail: res.data
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