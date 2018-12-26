const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        copperNum: [],
        copperList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */

    onLoad: function (options) {

        this.data.options = options;
        this.init(options, 'reach');

    },

    init(options, loadType){

        wx.showLoading();
        let {page, copperList} = this.data;
        // 获取列表
        app.post('copper/copperDetail', {
            page: page
        }, (res) => {

            page++;
            loadType == 'reach' ? (copperList = copperList.concat(res.data.data.data)) : (offList = res.data.data.data);
            this.setData({
                copperNum: res.data,
                copperList: res.data.data.data
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
        this.init(this.data.options, 'pull');

    },

    // 上拉
    onReachBottom: function () {

        this.init(this.data.options, 'reach');

    }

});