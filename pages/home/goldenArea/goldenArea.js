const app = getApp();

Page({
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 2000,
        duration: 1000,
        total: 0,
        page: 1,
        recommendList: []
    },

    onLoad: function (options) {
        this.initPage();
    },

    openH5(e) {

        let {url, type, id} = e.currentTarget.dataset;
        app.swiperOpen(type, id, url);

    },

    initPage() {

        wx.showLoading();
        app.clearStorageSync();
        this.getBanner();
        this.getIcon();
        this.getFixOperation();
        this.getRecommendOperation();
        this.getRecommendList();
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.initPage();
        wx.stopPullDownRefresh();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {total, recommendList} = this.data;
        if (recommendList.length >= total) return;
        this.data.page += 1;
        this.getRecommendList();

    },

    // 跳转固定模块
    openPage: function (e) {

        let {id, type=''} = e.currentTarget.dataset;
        if (type == 'classify') {
            return app.openPage(`shopCart/classify/classify?cid=${id}&type=-1`);
        }
        var goods_activity_od_id = e.currentTarget.dataset.id;
        var goods_activity_category_id = e.currentTarget.dataset.cid;
        wx.setStorageSync('goods_activity_od_id', goods_activity_od_id);
        wx.setStorageSync('goods_activity_category_id', goods_activity_category_id);
        app.openPage('home/operation/operation');

    },

    // 跳转商品详情页
    goDetail: function (e) {

        var gid = e.currentTarget.dataset.gid;
        app.openPage('shopCart/goodsDetail/goodsDetail?gid=' + gid);

    },


    // 金贝商城 轮播图获取
    getBanner() {

        app.post('/goods/activitycarouselgetlist', {
            goods_activity_category_id: 3
        }, (res) => {
            this.setData({
                imgUrl: res.data
            })
        })

    },

    // 金贝商城 图标分类 获取
    getIcon() {

        app.post('/goods/activitycategorygetlist', {
            parent_id: 3,
            type: 2
        }, (res) => {
            this.setData({
                iconImg: res.data
            })
        })

    },


    // 金贝商城 固定运营位 列表
    getFixOperation() {

        app.post('/goods/activityodgetlist', {
            parent_id: 3,
            type: 3,
            is_fixed_od: 1
        }, (res) => {
            this.setData({
                fixImg_one: res.data[0],
                fixImg_two: res.data[1],
                fixImg_three: res.data[2],
                fixImg_four: res.data[3],
                fixImg_five: res.data[4],
                fixImg_six: res.data[5],
            })
        })

    },

    // 金贝商城 推荐运营位
    getRecommendOperation() {

        app.post('/goods/activityodgetlist', {
            parent_id: 3,
            type: 3,
            is_fixed_od: 0
        }, (res) => {
            this.setData({
                recommendImg: res.data
            })
        })

    },

    // 金贝商城 获取推荐商品列表
    getRecommendList() {

        let {page, recommendList} = this.data;
        app.post('/goods/activitygoodsgetlist', {
            goods_activity_category_id: 3,
            filter_category_id: 3,
            page
        }, (res) => {

            recommendList = recommendList.concat(res.data.data);
            this.setData({
                recommendList,
                total: res.data.total
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        })

    }

});