const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ips: [],
        current: 0,
        goods_category_id: 0,
        goods_list: [],
        nums: 0,
        page: 1,
        img_master_path: '',
        location: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {goods_category_id, name} = options;
        app.setTitle(name);
        app.getlocation((e) => {
            this.data.location = e;
            app.post('business/categorygetlist', {
                parent_id: goods_category_id,
                is_all: 1
            }, (res) => {

                this.setData({
                    ips: res.data,
                    current: res.data[0].business_category_id,
                    goods_category_id
                });

                this.getGoods();
            })
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    getGoods() {

        wx.showLoading();
        let {current, goods_category_id, page, goods_list, location} = this.data;
        app.post('business/offlinegetlist', {
            first_category_id: goods_category_id,
            second_category_id: current,
            type: 1,
            page
        }, (res) => {

            for (let goods of res.data.data) {
                goods.km = app.addressLimit(goods.longitude_latitude.split(','), location);
                goods_list.push(goods);
            }
            this.setData({
                goods_list: res.data.data,
                nums: res.data.total,
                img_master_path: res.data.img_master_path,
                logo_path: res.data.logo_path,
                current
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },


    onIpItemClick(e) {

        let {id} = e.currentTarget.dataset;
        this.data.current = id;
        this.getGoods();

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.data.page = 1;
        this.nums = 0;
        this.goods_list = [];
        this.getGoods();
        wx.stopPullDownRefresh();

    },

    openPage(e) {

        let {business_offline_id, insert_package_status} = e.currentTarget.dataset;
        if (insert_package_status == 0) {//不允许创建套餐
            app.openPage(`index/offlineBusinessB/offlineBusinessB?business_offline_id=${business_offline_id}`);
        }
        if (insert_package_status == 1) {//允许创建套餐
            app.openPage(`index/offlineBusinessA/offlineBusHome/offlineBusHome?business_offline_id=${business_offline_id}`);
        }

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {nums, goods_list} = this.data;
        if (goods_list.length >= nums) return;
        this.getGoods();

    }

});