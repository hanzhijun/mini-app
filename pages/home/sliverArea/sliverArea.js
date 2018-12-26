const app = getApp();

Page({
    data: {
        // 轮播
        indicatorDots: true,
        autoplay: true,
        interval: 2000,
        duration: 1000,
        template_id: 0,
        total: 0,
        page: 1,
        recomList: []
    },

    onLoad: function () {
        this.initPage();
    },

    openH5(e) {

        let {url, type, id} = e.currentTarget.dataset;
        app.swiperOpen(type, id, url);

    },
    initPage() {

        app.clearStorageSync();
        this.getClassfy();

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

        let {total, recomList} = this.data;
        if (recomList.length >= total) return;
        this.data.page += 1;
        this.init();

    },

    // 跳转固定模块
    openPage: function (e) {

        var goods_activity_od_id = e.currentTarget.dataset.id;
        wx.setStorageSync('goods_activity_od_id', goods_activity_od_id);
        app.openPage('home/operation/operation');

    },


    // 银贝商场 顶部分类
    getClassfy() {

        wx.showLoading();
        app.post('goods/activitycategorygetlist', {
            parent_id: 4,
            type: 1
        }, (res) => {

            this.setData({
                navbar: res.data,
                goods_activity_category_id: res.data[0].goods_activity_category_id,
                template_id: res.data[0].template_id
            });
            this.init();

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },


    init: function () {

        wx.showLoading();
        // 银贝商城 轮播图 获取
        let {goods_activity_category_id, template_id, page, recomList} = this.data;
        app.post('/goods/activitycarouselgetlist', {
            goods_activity_category_id: 4,
            filter_category_id: goods_activity_category_id
        }, (res) => {

            this.setData({
                imgUrl: res.data,
                template_id,
                goods_activity_category_id: goods_activity_category_id
            })

        });

        // 银贝商城 固定运营位 列表
        app.post('goods/activityodgetlist', {
            parent_id: 4,
            type: 3,
            is_fixed_od: 1,
            filter_category_id: goods_activity_category_id
        }, (res) => {

            this.setData({
                operationImg: res.data,
                img_one: res.data[0],
                img_two: res.data[1],
                img_three: res.data[2]
            })

        });

        // 银贝商城 获取推荐商品
        app.post('goods/activitygoodsgetlist', {
            goods_activity_category_id: 4,
            filter_category_id: goods_activity_category_id,
            page
        }, (res) => {

            recomList = recomList.concat(res.data.data);
            this.setData({
                recomList,
                total: res.data.total
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // tab点击切换
    navbarTap: function (e) {

        let {goods_activity_category_id, template_id} = e.currentTarget.dataset;
        this.data.goods_activity_category_id = goods_activity_category_id;
        this.data.template_id = template_id;
        this.setData({
            page: 1,
            recomList: [],
            total: 0
        });
        this.init();

    },

    // 跳转商品详情页
    goDetail: function (e) {

        var gid = e.currentTarget.dataset.gid;
        app.openPage('shopCart/goodsDetail/goodsDetail?gid=' + gid);

    }

});