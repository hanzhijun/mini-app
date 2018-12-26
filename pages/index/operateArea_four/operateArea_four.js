const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        current: '',    // 当前选中的分类id
        res_data_1: {},
        res_data_2: {}, // 分类bar
        data_list: [],  // 商品列表
        nums: 0,
        offline_type_od: 0,
        page: 1,
        location: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {res_data_1, res_data_2, current, location} = this.data;
        app.getlocation((e) => {
            app.post('/goods/activityodgetdetailed', {
                goods_activity_od_id: options.goods_activity_od_id,
                type: 4
            }, (res) => {
                res_data_1 = res.data;
                app.setTitle(res_data_1.name);
                app.post('/goods/activitycategorygetlist', {
                    parent_id: res_data_1.goods_activity_category_id,
                    type: 4
                }, (res) => {
                    res_data_2 = res.data;
                    this.setData({
                        res_data_2,
                        res_data_1,
                        current: res_data_2[0].goods_activity_category_id,
                        offline_type_od: res_data_2[0].offline_type_od,
                        location: e
                    });
                    this.init();
                })
            })
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    init: function () {

        wx.showLoading();
        let {current, offline_type_od, res_data_1, data_list, page, location} = this.data;
        let url = '';
        offline_type_od == 2 && (url = '/goods/activitybusinessgetlist');
        offline_type_od == 3 && (url = '/goods/activitypackagegetlist');
        if (!url) return app.alert('商品有误！');
        app.post(url, {
            goods_activity_category_id: res_data_1.goods_activity_category_id,
            filter_category_id: current,
            page
        }, (res) => {
            if (offline_type_od == 2) {
                for (let business of res.data.data) {
                    business.km = app.addressLimit(business.longitude_latitude.split(','), location);
                    data_list.push(business);
                }
            } else {
                data_list = data_list.concat(res.data.data);
            }

            this.setData({
                current: current,
                data_list,
                nums: res.data.total,
                offline_type_od
            });
            wx.stopPullDownRefresh();

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    switchBar(e) {

        let {goods_activity_category_id, offline_type_od} =e.currentTarget.dataset;
        this.data.page = 1;
        this.data.data_list = [];
        this.data.offline_type_od = offline_type_od;
        this.data.current = goods_activity_category_id;
        this.init();

    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.data.page = 1;
        this.data.data_list = [];
        this.nums = 0;
        this.init();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {data_list, nums} = this.data;
        if (data_list.length >= nums) return;
        this.data.page += 1;
        this.init();

    },


    openPage(e) {

        let {type, id} = e.currentTarget.dataset;
        if (type == 'package') { // 套餐
            app.openPage(`index/offlineBusinessA/goBuy/goBuy?package_id=${id}`);
        } else if (type == 'business') {
            app.openPage(`index/offlineBusinessB/offlineBusinessB?business_offline_id=${id}`);
        }

    }

});