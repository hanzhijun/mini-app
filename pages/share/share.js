const app = getApp();
let T;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        start_x: 0,       // 控制进度条
        showPop: false,     //关闭弹框
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        e_data: 0,
        click_type: '',       // 分享者: share || 参与者： join
        alert_data: {         // 参与者弹窗信息
            join_status: '',    // 参与成功 || 失败 || 人数已满
            get_gold: 0,        // 参与者获得的金贝
            gid: 0
        },
        res_data: {},
        time: [],             // [时,分,秒]
        s: 0,
        join_info: [],        // 加入者信息
        btnText: ['激活成功，立即捞得', 0],
        goods_list: [],
        options: {},
        show_guize: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        this.data.options = options;
        let {e_data} = options;

        let {alert_data} = this.data;
        this.data.e_data = e_data;
        app.post('share/checkshare', {
            order_id: e_data
        }, (res) => {
            if (res.data.is_first_click == 1 && res.data.click_type == 'join') {
                app.post('share/shareclick', {
                    order_id: e_data
                }, (res) => {
                    if (res.code == 200) {
                        alert_data.get_gold = res.data.get_gold
                    }
                    alert_data.gid = res.data.goods_id;
                    alert_data.join_status = res.info;
                    this.setData({
                        alert_data,
                        showPop: true,
                        e_data
                    });
                    this.getDetail();
                })
            } else {
                this.getDetail();
            }

            this.setData({
                click_type: res.data.click_type
            })
        });

        app.post('share/sharegoodslist', {}, (res)=> {
            this.setData({
                goods_list: res.data
            })
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    onShareAppMessage: function (res) {
        let {e_data} = this.data;
        return app.shareArgs(e_data);
    },

    loginevent: function (e) {
        setTimeout(() => {
            this.onLoad(this.data.options);
        }, 1000)
    },

    getDetail() {

        let {e_data, btnText} = this.data;
        app.post('share/getsharedetail', {
            order_id: e_data
        }, (res) => {
            if (res.code == 200) {
                let res_data = res.data;
                let s = res_data.dead_time - parseInt(new Date().getTime() / 1000);
                this.setData({
                    s
                });
                if (s > 0) {
                    T = setInterval(() => {
                        s--;
                        this.formatTime(s);
                        if (s <= 0) {
                            clearInterval(T);
                        }
                    }, 1000)
                }
            }

            if (res.data.is_get) btnText = ['领取成功，已获得', 1];
            this.setData({
                res_data: res.data,
                btnText,
                start_x: res.data.have_get / res.data.all_gold * 630
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        })

    },

    // 格式化时间
    formatTime(s) {

        var secondTime = parseInt(s);// 秒
        var minuteTime = 0;// 分
        var hourTime = 0;// 小时
        if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            minuteTime = parseInt(secondTime / 60);
            secondTime = parseInt(secondTime % 60);
            if (minuteTime > 60) {
                hourTime = parseInt(minuteTime / 60);
                minuteTime = parseInt(minuteTime % 60);
            }
        }

        this.setData({
            time: [hourTime, minuteTime, secondTime]
        })

    },

    getGold() {

        let {e_data, btnText} = this.data;
        if (btnText[1]) return;
        app.post('share/getindirectgold', {order_id: e_data}, (res) => {
            if (res.code == 200) app.alert('领取成功！', 'success', () => {
                this.setData({
                    btnText: ['领取成功，已获得', 1]
                })
            });
            else app.alert('领取失败', 'none');
        })

    },

    openPage(e) {

        let {gid} = e.currentTarget.dataset;
        app.openPage(`shopCart/goodsDetail/goodsDetail?gid=` + gid);

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    rule: function (e) {

        let {guize} = e.currentTarget.dataset;
        let {show_guize} = this.data;
        show_guize = guize ? false : true;
        this.setData({
            show_guize
        })

    },


    // 关闭弹框
    closePop(e){

        let {type, gid} = e.currentTarget.dataset;
        this.setData({
            showPop: false
        });
        if (type == 'buy') {
            app.openPage('shopCart/goodsDetail/goodsDetail?gid=' + gid);
        }

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    }
});
