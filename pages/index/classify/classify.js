const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        res_data: [],
        goods_data: [],
        current_1: '',      // 当前选中的索引
        current_2: '',
        id_1: '',             // 当前选中的id
        id_2: '',
        page: 1,
        nums: 0,
        location: {},
        logo_path: '',
        scrollLeft: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {goods_category_id} = options;

        app.getlocation((res) => {
            this.setData({
                location: res
            });

            app.post('business/categorygettree', {goods_category_id}, (res) => {
                if (res.code == 200) {

                    if (goods_category_id != 0 && goods_category_id != 'undefined') {
                        for (let i = 0; i < res.data.length; i++) {
                            if (goods_category_id == res.data[i].business_category_id) {
                                this.setData({
                                    res_data: res.data,
                                    current_1: i,
                                    current_2: 0,
                                    id_1: res.data[i].business_category_id,
                                    id_2: res.data[i].child[0].business_category_id
                                });
                            }
                        }
                    } else {
                        this.setData({
                            res_data: res.data,
                            current_1: 0,
                            current_2: 0,
                            id_1: res.data[0].business_category_id,
                            id_2: res.data[0].child[0].business_category_id
                        });
                    }

                    this.getGoods();
                }
            })
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    openPage(e) {

        let {id} = e.currentTarget.dataset;
        app.openPage(`index/offlineBusinessA/offlineBusHome/offlineBusHome?business_offline_id=${id}`)

    },

    onIpItemClick(e) {

        let {type, index} = e.currentTarget.dataset;
        let {current_1, current_2, res_data, id_1, id_2} = this.data;
        if (type == 1) {
            current_1 = index;
            id_1 = res_data[index].business_category_id;
            current_2 = 0;
            id_2 = res_data[current_1].child[current_2].business_category_id
        } else if (type == 2) {
            current_2 = index;
            if (res_data[current_1].child) {
                id_2 = res_data[current_1].child[current_2].business_category_id
            }
        }

        this.data.goods_data = [];
        this.data.page = 1;
        this.setData({
            current_2, current_1, id_2, id_1
        });
        this.getGoods();

    },

    getGoods() {

        let {page, id_1, id_2, goods_data, location, res_data, current_1} = this.data;
        app.post('business/offlinegetlist', {
            first_category_id: id_1,
            second_category_id: id_2,
            type: 1,
            page
        }, (res) => {
            if (res.code == 200) {
                for (let goods of res.data.data) {
                    goods.km = app.addressLimit(goods.longitude_latitude.split(','), location);
                    goods_data.push(goods);
                }
                this.setData({
                    goods_data,
                    logo_path: res.data.logo_path,
                    nums: res.data.total
                })
            } else {
                this.setData({
                    goods_data: [],
                    logo_path: res.data.logo_path,
                    nums: res.data.total
                })
            }
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });
        this.setData({
            scrollLeft: current_1 * 70
        });

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        wx.showLoading();
        this.data.goods_data = [];
        this.data.page = 1;
        this.getGoods();
        wx.stopPullDownRefresh()

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log(123);
        let {goods_data, page, nums} = this.data;
        if (goods_data.length >= nums) return;
        this.setData({
            page: page + 1
        });
        this.getGoods();
    }

});