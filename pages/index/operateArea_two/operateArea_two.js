const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    res_data_1: {},   // 模板信息
    res_data_2: {},   // 分类Bar
    res_data_3: {},   // 爆款
    res_data_3_len: 0,
    res_data_4: [],   // 精选
    current: 0,
    page: 1,
    nums: 0
  },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {res_data_1, res_data_2, current} = this.data;
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
                current = res_data_2[0].goods_activity_category_id;
                this.setData({
                    res_data_1,
                    res_data_2,
                    current
                });
                this.getHot();
                this.getJingXuan();
            })

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 获取爆品(有is_hot字段) || 获取商品列表
    getHot(){

        let {res_data_1, res_data_3, res_data_4, current} = this.data;

    // 爆款
    app.post('/goods/activitygoodsgetlist', {
      goods_activity_category_id: res_data_1.goods_activity_category_id,
      filter_category_id: current,
      is_hot: 1
    }, (res) => {
      res_data_3 = res.data;
      this.setData({
        res_data_3: res_data_3,
        res_data_3_len: res.data.length
      })
    })
  },

    // 精选
    getJingXuan() {

        let {res_data_1, res_data_3, res_data_4, current, page} = this.data;
        app.post('/goods/activitygoodsgetlist', {
            goods_activity_category_id: res_data_1.goods_activity_category_id,
            filter_category_id: current,
            page
        }, (res) => {

            res_data_4 = res_data_4.concat(res.data.data);
            this.setData({
                res_data_4,
                nums: res.data.total
            });
            wx.stopPullDownRefresh();

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        })

    },

    switchBar(e) {

        let {goods_activity_category_id} = e.currentTarget.dataset;
        this.setData({
            current: goods_activity_category_id,
            res_data_4: []
        });
        this.data.nums = 0;
        this.data.page = 1;
        this.getHot();
        this.getJingXuan();

    },

    // 下拉
    onPullDownRefresh: function () {

        this.data.page = 1;
        this.data.nums = 0;
        this.data.res_data_4 = [];
        this.getHot();
        this.getJingXuan();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {nums, res_data_4} = this.data;
        if (res_data_4.length >= nums) return;
        this.data.page += 1;
        this.getJingXuan();

    },

    openPage(e){

        let {id} = e.currentTarget.dataset;
        app.openPage('shopCart/goodsDetail/goodsDetail?gid=' + id);

    }
});
