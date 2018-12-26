const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        page: 1,
        type: 0,
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        options: {},
        nums: -1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        this.data.options = options;
        this.loadData(options, 'reach');

    },

    /**
     * loadType: pull || reach, 下拉 || 上拉
     * @param options
     * @param loadType
     */
    loadData(options, loadType) {

        wx.showLoading();
        let {s_cid, type} = options;
        let {page, list} = this.data;
        app.post('goods/goods/clientgetlists', {
            type,
            client_search_s_cid: s_cid,
            limit: 6,
            page: page
        }, (res) => {

            if (res.code == 200) {
                let {data, count} = res.data;
                page++;
                loadType == 'reach' ? (list = list.concat(data)) : (list = data);
                this.setData({
                    type,
                    list,
                    page,
                    nums: count
                });
                setTimeout(function () {
                    wx.hideLoading();
                }, 300);
            }

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 下拉
    onPullDownRefresh() {

        this.data.page = 1;
        wx.stopPullDownRefresh();
        this.loadData(this.data.options, 'pull');

    },

    // 上拉
    onReachBottom: function () {

        this.loadData(this.data.options, 'reach');

    },

    goBack: function () {

        wx.navigateBack({
            delta: 1
        })

    }
});