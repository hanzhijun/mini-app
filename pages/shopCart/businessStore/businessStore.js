const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        page: 1,
        nums: 0,
        res_data: [],
        business_id: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let {business_id} = options;
        this.data.business_id = business_id;
        this.init();

    },

    init: function () {

        wx.showLoading();
        let {page, nums, res_data, business_id} = this.data;
        app.post('goods/goods/clientgetlists', {
            business_id,
            page,
            limit: 10
        }, (res) => {

            let {data} = res;
            app.setTitle(data.data[0].business_name);
            res_data = res_data.concat(data.data);
            if (res.code == 200) {
                this.setData({
                    nums: data.count,
                    res_data: res_data
                })
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    openPage(e) {

        let {gid, type} = e.currentTarget.dataset;
        app.openPage(`shopCart/goodsDetail/goodsDetail?type=${type}&gid=${gid}`)

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.data.page = 1;
        this.data.res_data = [];
        this.init();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {nums, res_data} = this.data;
        if (nums >= res_data.length) {
            this.data.page += 1;
            this.init();
        }

    }
});