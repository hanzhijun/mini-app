// pages/newIndex/templateFive/templateFive.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        indicatorDots: false,
        autoplay: false,
        interval: 2000,
        duration: 750,
        operation_pages_id: '', // 运营模板id
        list: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        this.data.options = options;
        let {id} = options;
        this.setData({
            operation_pages_id: id
        });
        let {operation_pages_id} = this.data;
        app.data.operation_pages_id = operation_pages_id;
        app.getPagesOpt(operation_pages_id, data => {
            this.setData({
                list: data
            });

            setTimeout(function () {
                wx.hideLoading();
                wx.setNavigationBarTitle({
                    title: app.config.pages_name
                });
            }, 300);
        });

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
        
        let {operation_pages_id} = this.data;
        app.data.operation_pages_id = operation_pages_id;
        
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