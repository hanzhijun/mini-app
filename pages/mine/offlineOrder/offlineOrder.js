const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        options: {},
        getList: [],
        offList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        this.data.options = options;
        this.getList(options, 'reach');

    },

    getList(options, loadType) {

        wx.showLoading();
        let {page, offList} = this.data;
        // 获取列表
        app.post('Mydownorder/downMyOrderList', {
            page: page
        }, (res) => {

            page++;
            loadType == 'reach' ? (offList = offList.concat(res.data.list)) : (offList = res.data.list);
            this.setData({
                offList,
                page
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 下拉
    onPullDownRefresh() {

        this.data.page = 1;
        wx.stopPullDownRefresh();
        this.getList(this.data.options, 'pull');

    },

    // 上拉
    onReachBottom: function () {

        this.getList(this.data.options, 'reach');

    },


    // 跳转详情页
    orderDetail: function (e) {

        var id = e.currentTarget.dataset.id;
        wx.setStorageSync('id', id);

    }

});