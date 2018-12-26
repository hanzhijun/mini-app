// pages/newIndex/templateOne/templateOne.js
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
        operation_pages_id: '', // 运营模板id
        list: [],
        goodsList: [], // 商品列表
        active: 0, // 焦点状态nav
        operation_template_area_id: '', // 区域id
        navSort: 0, // nav 标记
        current_page: 1, // 页码
        last_page: '', // 总页码
        per_page: '', // 每页条数
        total: '' // 总商品数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        var _this = this;
        wx.showLoading();
        _this.data.options = options;
        let {id} = options;
        _this.setData({
            operation_pages_id: id
        });
        let {operation_pages_id} = _this.data;
        app.data.operation_pages_id = operation_pages_id;
        app.getPagesOpt(operation_pages_id, data => {

            _this.setData({
                operation_template_area_id: wx.getStorageSync('operation_template_area_id'),
                list: data
            });

            setTimeout(function () {
                _this.getgoodslist(0);
                wx.setNavigationBarTitle({
                    title: app.config.pages_name
                });
            }, 300);

        });

        _this.getIconNum();
        
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    changeNav: function (e) {

        let {sort} = e.currentTarget.dataset;
        let {active} = this.data;
        if (active != sort) {
            this.setData({
                current_page: 1,
                last_page: '',
                per_page: '',
                total: '',
                goodsList: [],
                active: sort
            });
            this.getgoodslist(sort);
        }

    },

    getgoodslist: function (type) {

        var _this = this;
        let {operation_template_area_id, operation_pages_id, list, current_page} = _this.data;
        let {operation_area_category_id} = list[3][type==undefined?0:type];

        wx.removeStorageSync('operation_template_area_id');
        app.post('Operation/getgoodslist', {
            operation_area_category_id: operation_area_category_id,
            operation_pages_id: operation_pages_id,
            operation_template_area_id: operation_template_area_id,
            page: current_page
        }, (res) => {
            let {current_page, last_page, per_page, total, data} = res.data;
            let {goodsList} = _this.data;
            for (let i = 0; i < data.length; i++) {
                goodsList.push(data[i]);
            }
            _this.setData({
                current_page,
                last_page,
                per_page,
                total,
                goodsList
            });
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
     * 获取金贝银贝数量
     */
    getIconNum(){

        app.post('User/detial', {}, (res) => {
            if (res.data.length != 0) {
                this.setData({
                    userInfo: res.data.user_info,
                    sliverInfo: res.data.user_info.surplus_silvershells + res.data.user_info.surplus_business_silvershells,
                    surplus_goldshells: res.data.user_info.surplus_goldshells
                })
            }
        });

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
        
        let {current_page, last_page, active} = this.data;
        if (current_page < last_page) {
            this.setData({
                current_page: current_page + 1
            });
            this.getgoodslist(active);
        }
        
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});