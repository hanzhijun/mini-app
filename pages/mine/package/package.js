const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        current: 'unused',
        page: 1,
        opt_json: {
            unused: ['未消费', '查看券码'],
            done: ['已使用', '再来一单'],
            overdue: ['退款', '']
        },
        all_num: 0,
        list_data: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        this.init();
    },

    init: function () {

        wx.showLoading();
        let {current, page, list_data, all_num} = this.data;
        app.post('Mypackage/packagelist', {
            opt: current,
            page: page,
            pagelen: 10
        }, (res) => {
            if (res.code == 200) {
                for (let i = 0, len = res.data.list.length; i < len; i++) {
                    let data = res.data.list[i];
                    data.expire_at_format = new Date(data.expire_at * 1000).format('yyyy-MM-dd');
                    data.use_time_format = new Date(data.use_time * 1000).format('yyyy-MM-dd h:m');
                    list_data.push(data);
                }
                this.setData({
                    list_data,
                    all_num: res.data.all_num
                })
            }
            wx.stopPullDownRefresh();

            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);
    },

    // 切换tab
    switchBar(e) {

        let {type} = e.currentTarget.dataset;
        this.setData({
            page: 1,
            list_data: [],
            current: type
        });
        this.init();

    },

    // 按钮
    checkBtn(e) {

        let {type, id, package_id} = e.currentTarget.dataset;
        if (type == 'unused') { // 查看券码
            app.post('/Mypackage/packagedetail', {
                id
            }, (res) => {
                app.confirm(res.data.cdkey);
            })
        } else {  // 再来一单
            app.openPage(`index/offlineBusinessA/goBuy/goBuy?package_id=${package_id}`)
        }

    },

    openPage(e) {
        let {id} = e.currentTarget.dataset;
        app.openPage(`taocan/after_sale_detail/after_sale_detail?id=${id}`);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.data.page = 1;
        this.data.list_data = [];
        this.init();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {all_num, list_data} = this.data;
        if (list_data.length >= all_num) return;
        this.data.page += 1;
        this.init();

    }
});