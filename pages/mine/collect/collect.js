const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        opt: 'business',     // 当前选中的tab
        page: 1,
        all_num: 0,
        res_data: [],
        location: {},
        startX: 0,      //开始坐标
        del_type: 0    // 1: 左滑显示删除按钮  0: 右滑  || 隐藏删除按钮
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        // isTouchMove: false //默认全隐藏删除
        app.getlocation((res) => {
            this.data.location = res;
            this.init();
        })

    },

    // 删除收藏
    del: function (e) {

        var cid = e.currentTarget.dataset.cid;
        app.post('Car/delCollectGoodsById', {
            midarr: [cid]
        }, (res) => {
            if (res.code == 200) {
                app.alert('删除成功！', 'success', () => {
                    this.setData({
                        opt: this.data.opt,
                        page: 1,
                        res_data: []
                    });
                    this.init();
                });
            } else {
                app.alert('删除失败', 'none');
            }
        });

    },


    init: function () {

        wx.showLoading();
        let {opt, page, res_data, location, all_num} = this.data;
        app.post('/Car/myCollectList', {
            page,
            opt
        }, (res) => {
            
            if (res.code == 200) {
                all_num = res.data.all_num;
                if (opt == 'business') {
                    for (let data of res.data.list) {
                        let km = app.addressLimit(data.longitude_latitude.split(','), location);
                        data.km = km;
                        data.label += ',';
                        data.label = data.label.split(',');
                        data.label.splice(data.label.length - 1, 1);
                        res_data.push(data);
                    }
                } else if (opt == 'package') {
                    res_data = res.data.list;
                } else if (opt == 'goods') {
                    res_data = res.data.list;
                }

                this.setData({
                    res_data: res_data,
                    all_num
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

    switchBar(e) {

        let {type} = e.currentTarget.dataset;
        this.setData({
            opt: type,
            page: 1,
            res_data: []
        });
        this.init();

    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.data.page = 1;
        this.data.res_data = [];
        this.init();

    },

    openPage(e) {

        let {id} = e.currentTarget.dataset;
        let {opt} = this.data;
        let url = '';
        if (opt == 'business') {
            url = `index/offlineBusinessB/offlineBusinessB?business_offline_id=${id}`
        } else if (opt == 'package') {
            url = `index/offlineBusinessA/offlineBusinessA?package_id=${id}`
        } else if (opt == 'goods') {
            url = `shopCart/goodsDetail/goodsDetail?gid=${id}`
        }

        app.openPage(url);

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {all_num, list_data} = this.data;
        if (list_data.length >= all_num) return;
        this.data.page += 1;
        this.init();

    },


    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {

        let {index} = e.currentTarget.dataset;
        let {res_data} = this.data;
        res_data[index].startX = e.touches[0].clientX;
        res_data[index].del_type = 0;

    },


    //滑动事件处理
    touchmove: function (e) {

        let {index} = e.currentTarget.dataset;
        let {res_data} = this.data;
        let {startX, del_type} = res_data[index];

        let moveX = e.touches[0].clientX;
        startX - moveX > 30 && (del_type = 1);
        startX - moveX < -30 && (del_type = 0);
        res_data[index].startX = startX;
        res_data[index].del_type = del_type;
        this.setData({
            res_data
        })

    }
});

