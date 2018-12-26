const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: 0,
        package_order_id: 0,
        id: 0    // 套餐/代金券id  再次支付跳转使用
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        let {type, package_order_id = 0, id} = options;
        app.setTitle(type == 0 ? '支付失败' : '支付成功');
        this.setData({
            type, package_order_id, id
        })
        
    },

    openPage(e) {
        
        let {type} = e.currentTarget.dataset;
        let {package_order_id, id} = this.data;
        let url = '';
        if (type == 'home') {
            wx.switchTab({
                url: '/pages/index/index',
            })
        } else if (type == 'pay') {
            url = 'taocan/taocanPay/taocanPay?id=' + id
        } else if (type == 'detail') {
            url = `taocan/after_sale_detail/after_sale_detail?id=${package_order_id}`
        }
        app.openPage(url);
        
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