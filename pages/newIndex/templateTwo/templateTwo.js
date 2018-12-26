// pages/newIndex/templateTwo/templateTwo.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        autoCount: 2,  // 懒加载 - 当前加载到第几张图
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        operation_pages_id: '', // 运营模板id
        list: [],
        goodsList: [], // 商品列表
        active: 0, // 焦点状态nav
        operation_template_area_id: '', // 区域id
        operation_area_category_id: '',
        current_page: 1, // 页码
        last_page: '', // 总页码
        per_page: '', // 每页条数
        total: '', // 总商品数
        surplus_goldshells: 0 // 用户拥有的金贝数
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
        let that = this;
        let {operation_pages_id} = that.data;
        app.getPagesOpt(operation_pages_id, data => {
            var operation_template_area_id = that.data.operation_template_area_id;
            if (operation_template_area_id == '') {
                operation_template_area_id = wx.getStorageSync('operation_template_area_id')
            }
            that.setData({
                list: data, operation_template_area_id
            });
            setTimeout(function () {
                that.getgoodslist(0);
                wx.setNavigationBarTitle({
                    title: app.config.pages_name
                });
            }, 300);
        });
        //获取金贝数
        app.post('User/detial', {}, (res) => {
            if (res.data.user_info.surplus_goldshells) {
                this.setData({
                    surplus_goldshells: res.data.user_info.surplus_goldshells
                })
            }
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    changeNav: function (e) {

        let {sort, id} = e.currentTarget.dataset;
        let {operation_area_category_id} = this.data;
        if (id == operation_area_category_id) return;
        this.setData({
            current_page: 1,
            last_page: '',
            per_page: '',
            total: '',
            goodsList: [],
            active: sort,
            autoCount: 5,
            operation_area_category_id: id
        });
        this.getgoodslist(id);
    },

    getgoodslist: function (type) {

        var that = this;
        let {operation_template_area_id, operation_pages_id, list, current_page} = that.data;
        var operation_area_category_id = that.data.operation_area_category_id;
        if (operation_area_category_id == '') {
            operation_area_category_id = list[0][type].operation_area_category_id;
            that.setData({
                operation_area_category_id
            });
        }
        wx.removeStorageSync('operation_template_area_id');
        app.post('Operation/getgoodslist', {
            operation_area_category_id, operation_pages_id, operation_template_area_id,
            page: current_page
        }, (res) => {
            let {current_page, last_page, per_page, total, data} = res.data;
            let {goodsList} = that.data;
            for (let i = 0; i < data.length; i++) {
                goodsList.push(data[i]);
            }

            that.setData({
                current_page,
                last_page,
                per_page,
                total,
                goodsList
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        })

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

        let {current_page, last_page} = this.data;
        if (current_page < last_page) {
            this.setData({
                current_page: current_page + 1
            });
            this.getgoodslist(current_page + 1);
        }
        
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});