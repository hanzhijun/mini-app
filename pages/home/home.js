const app = getApp();
let T;

Page({
    data: {
        usersInfo: [],
        proList: [],
        host: app.config.host,
        // 轮播
        indicatorDots: true,
        autoplay: true,
        interval: 2000,
        duration: 1000,
        goods_activity_category_id: 0,
        offline_type_od: 0,
        phone_msg: '',
        more_id: 0,       // 更多按钮的id
        start_x: 0,
        total: 0,
        page: 1,
        list: []
    },

    onPageScroll() {

        if (!T) {
            this.setData({
                start_x: -120
            });
            T = setTimeout(() => {
                this.setData({
                    start_x: 0
                });
                T = '';
            }, 450)
        }

    },

    openH5(e) {

        let {url, type, id} = e.currentTarget.dataset;
        app.swiperOpen(type, id, url);

    },

    loginevent: function () {

        setTimeout(() => {
            this.onLoad();
        }, 1000)

    },

    onShow: function () {
        this.getIconNum();
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {

        wx.getSystemInfo({
            success: res => {
                let modelmes = res.model;
                if (modelmes.search('iPhone X') > -1) {
                    this.setData({
                        phone_msg: 'iphonex'
                    })
                }
            }
        });
        this.init();

    },

    init: function () {

        wx.showLoading();
        app.clearStorageSync();
        this.getBanner();
        this.getClassfyIcon();
        this.getOperateArea();
        this.getCategoryList();
        this.getIconNum();
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.init();
        wx.stopPullDownRefresh();

    },


    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {total, list} = this.data;
        if (list.length >= total) return;
        this.data.page += 1;
        this.getGoodsList();

    },

    // 获取金贝银贝数量
    getIconNum() {

        app.post('User/detial', {}, (res) => {
            this.setData({
                userInfo: res.data.user_info,
                sliverInfo: res.data.user_info.surplus_silvershells + res.data.user_info.surplus_business_silvershells
            })
        });

    },

    openPage(e) {

        let {id, type} = e.currentTarget.dataset;
        let {more_id} = this.data;
        if (more_id == id) id = 0;
        if (type == 'business') {
            app.openPage(`shopCart/businessStore/businessStore?business_id=${id}`);
        } else if (type == 'goods') {
            app.openPage(`shopCart/goodsDetail/goodsDetail?gid=${id}`);
        } else if (type == 'classify') {
            app.openPage(`shopCart/classify/classify?cid=${id}&type=0`);
        }

    },

    // 获取分类
    getClassify() {

        app.post('/goods/activitycategorygetlist', {
            parent_id: 1,
            type: 2
        }, (res) => {
            if (res.code == 200) {
                this.setData({
                    iconClassify: res.data
                })
            }
        })

    },

    // 获取轮播图
    getBanner() {

        app.post('/goods/activitycarouselgetlist', {
            goods_activity_category_id: 2
        }, (res) => {
            this.setData({
                banner: res.data
            })
        })

    },

    // 图标分类获取
    getClassfyIcon() {

        app.post('/goods/activitycategorygetlist', {
            parent_id: 2,
            type: 2
        }, (res) => {
            this.setData({
                categoryIcon: res.data,
                more_id: res.data[res.data.length - 1].goods_category_id
            })
        })

    },

    // 运营区图片
    // 商城 固定运营位 列表
    getOperateArea() {

        app.post('goods/activityodgetlist', {
            parent_id: 2,
            type: 3,
            is_fixed_od: 1
        }, (res) => {
            this.setData({
                operateArea: res.data
            })
        })

    },

    // 获取固定分类 列表
    getCategoryList() {

        app.post('/goods/activitycategorygetlist', {
            parent_id: 2,
            type: 4
        }, (res) => {
            this.setData({
                tabName: res.data,
                goods_activity_category_id: res.data[0].goods_activity_category_id
            });
            this.getGoodsList();
        })

    },


// 商城 固定运营二级栏目商品获取
    getGoodsList() {

        let {goods_activity_category_id, page, list} = this.data;
        app.post('goods/activitygoodsgetlist', {
            goods_activity_category_id: 2,
            filter_category_id: goods_activity_category_id,
            page
        }, (res) => {
            list = list.concat(res.data.data);
            this.setData({
                list,
                goods_activity_category_id: goods_activity_category_id,
                total: res.data.total
            });
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        })

    },


    // 通用 活动商品 列表
    getProList(e) {

        let {goods_activity_category_id} = e.currentTarget.dataset;
        this.data.goods_activity_category_id = goods_activity_category_id;
        this.setData({
            page: 1,
            list: [],
            total: 0
        });
        this.getGoodsList();

    },


    // 跳转运营区详情页
    operation: function (e) {
        var goods_activity_od_id = e.currentTarget.dataset.goods_activity_od_id;
        var type = e.currentTarget.dataset.type;
        var url = e.currentTarget.dataset.url;
        wx.setStorageSync('goods_activity_od_id', goods_activity_od_id);
        // type为2模板配置
        if (type == 2) {
            wx.navigateTo({
                url: 'operation/operation'
            })
        } else {
            //type为1自由配置 直接跳转地址
            wx.navigateTo({
                url: url
            })
        }
    }

});


