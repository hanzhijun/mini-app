const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        res_data_1: {},
        res_data_2: {},
        goods_data: [],
        page: 1,
        nums: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {res_data_1, res_data_2} = this.data;
        app.post('/goods/activityodgetdetailed', {
            goods_activity_od_id: options.goods_activity_od_id,
            type: 4
        }, (res) => {
            res_data_1 = res.data;
            app.setTitle(res_data_1.name);

            // 滑动处
            app.post('/goods/activityarticlegetlist', {
                goods_activity_category_id: res_data_1.goods_activity_category_id
            }, (res) => {
                this.setData({
                    res_data_1,
                    res_data_2: res.data
                });
                this.getGoods();
            });

        });
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    getGoods() {
        
        let {res_data_1, page, goods_data} = this.data;
        // 商品
        app.post('/goods/activitygoodsgetlist', {
            goods_activity_category_id: res_data_1.goods_activity_category_id,
            filter_category_id: res_data_1.goods_activity_category_id,
            page
        }, (res) => {
            
            goods_data = goods_data.concat(res.data.data);
            this.setData({
                goods_data,
                nums: res.data.total
            });
            wx.stopPullDownRefresh();
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
            
        })
    },


    // 滑动出跳转，跳转到html5页面
    openPage(e){
        
        let {url, id, type} = e.currentTarget.dataset;
        if (type == 'h5') {

        } else {
            app.openPage('shopCart/goodsDetail/goodsDetail?gid=' + id);
        }
        
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        
        this.data.page = 1;
        this.data.goods_data = [];
        this.data.nums = 0;
        this.getGoods();
        
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        
        let {nums, goods_data} = this.data;
        if (goods_data.length >= nums) return;
        this.data.page += 1;
        this.getGoods();
        
    },
    linkH5: function (e) {
        
        const data = e.currentTarget.dataset;
        wx.navigateTo({url: '/pages/web-view/web-view?url=' + decodeURIComponent(data.url)});
        
    }
});