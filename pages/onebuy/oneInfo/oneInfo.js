const app = getApp();
let T;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        loading: 0, // loading加载提示框
        toast: 0, // 提示文字
        title: '抢购详情',
        toastTxt: '',
        launch_id: '', // 活动id
        type: '', // share 发起者 join 参与者
        popAlert: 0,
        product: '',
        s: 0,
        autoTime: [], // 时间倒计时
        useTime: '', // 成功用时
        need_num: '', // 活动需要助力的人数
        help_num: '', // 已经助力的人数
        is_help: false ,// false未助力，true已助力
        onpurse_status: '', // 活动状态  0 参与中 1 参与成功 2 已购买，3 失败，4 失败(成功未领取)，null: 未参与
        expiry_time: '', // 助力结束时间
        server_time: '', // 服务器当前时间
        use_time: '' // 用时
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {launch_id} = options;
        this.setData({
            launch_id
        })
    },

    onShow() {
        this.init()
    },

    init() {
        this.setData({
            loading: 1
        });
      this.verificationOfIdentity()
    },

    // 获取助力商品
    /**
     * 助力首页信息
     */
    verificationOfIdentity() {
        let {is_first} = this.data;
        let _this = this;
        app.post('onebuy/helpIndex', {
            launch_id: this.data.launch_id
        }, (res) => {
            if (res.code == 200) {
                if (res.data.status == true) {
                    this.setData({
                        type: 'share'
                    })
                }
                if (res.data.status == false) {
                    this.setData({
                        type: 'join'
                    })
                }
                let {need_num,help_num,is_help,onpurse_status,expiry_time,server_time,use_time} = res.data;

                let endTime = expiry_time * 1000;
                let nowTime = server_time * 1000;
                this.setData({
                    product: res.data.goods_info,
                    helpInfo: res.data.help_info,
                    time: (new Date(expiry_time * 1000).format('yyyy-MM-dd hh:mm')),
                    is_first: res.data.active_num,
                    is_help,
                    need_num,
                    help_num,
                    onpurse_status,
                    expiry_time,
                    server_time,
                    use_time
                });
                if (is_help == false && res.data.status == false) {
                    this.onpurseHelp();
                }

                if (endTime > nowTime) {
                    let s = (endTime - nowTime) / 1000;
                    this.setData({
                        s
                    });
                    clearInterval(T);
                    if (s > 0) {
                        T = setInterval(() => {
                            s--;
                            this.formatTime(s);
                            if (s <= 0) {
                                clearInterval(T);
                                if(s == 0) {
                                    _this.setData({
                                        loading: 1
                                    });
                                    setTimeout(function () {
                                        _this.verificationOfIdentity()
                                    }, 3000);
                                }
                            }
                        }, 1000)
                    }
                }

                if (res.data.onpurse_status == 1 || res.data.onpurse_status == 2 || res.data.onpurse_status == 4) {
                    this.formatTimeEnd(use_time)
                }

            }
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 活动助力 - 参与者
     */
    onpurseHelp() {
        let {product, launch_id} = this.data;
        let rawData = JSON.parse(wx.getStorageSync('rawData'));
        let _this = this;
        app.post('onebuy/onpurseHelp', {
            produc_id: product.goods_id,
            launch_id: launch_id,
            logo: rawData.avatarUrl
        }, (res) => {
            if (res.code == 200) {
                if (this.data.is_first == 0) {//新用户
                    this.setData({
                        popAlert: 2
                    })
                }
                if (this.data.is_first == 1) {//老用户
                    this.setData({
                        popAlert: 1
                    })
                }
                setTimeout(function () {
                    _this.verificationOfIdentity()
                }, 200);
            } else if (res.info == '老用户无法助力') {
                this.setData({
                    popAlert: 1
                })
            }
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 立即1元领取
     */
    listClick() {
        let {product} = this.data;
        let json = {
            is_use_gold: 1,
            is_use_balance: 0
        };
        let spec_json = {
            goods_id: product.goods_id,
            spec_id: product.spec_id,
            num: 1,
            is_active: 0,
            cid: 0
        };
        json.param = [spec_json];
        json.share = 0;
        app.setStorageSync({
            ginfo: json
        });
        app.openPage('onebuy/order/order?gid=' + product.goods_id);

    },

    gotoProduct() {
        this.setData({
            popAlert: 0
            
        });
        app.openPage('onebuy/oneList/oneList', 'close');
    },

    close(){
        this.setData({
            popAlert: 0
        })
    },

    /**
     * 分享
     * @param res
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
        }
        let {launch_id, product} = this.data;
        return {
            title: '只要你帮我点一下！我就可以一元抢购这个心仪已久的东西！',
            path: 'pages/onebuy/oneInfo/oneInfo?launch_id=' + launch_id,
            imageUrl: product.img_path + product.list_url,
            success: function () {
            }
        }
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            bindTelBack: 0
        });
        this.init();
        wx.stopPullDownRefresh();
    },
    /**
     * 登录成功回执
     */
    loginevent: function () {
        this.init();
    },
    // 格式化时间
    formatTime(s) {
        var secondTime = parseInt(s) < 10 ? '0' + parseInt(s) : parseInt(s);// 秒
        var minuteTime = '00';// 分
        var hourTime = '00';// 小时
        if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            minuteTime = parseInt(secondTime / 60) < 10 ? '0' + parseInt(secondTime / 60) : parseInt(secondTime / 60);
            secondTime = parseInt(secondTime % 60) < 10 ? '0' + parseInt(secondTime % 60) : parseInt(secondTime % 60);
            if (minuteTime > 60) {
                hourTime = parseInt(minuteTime / 60) < 10 ? '0' + parseInt(minuteTime / 60) : parseInt(minuteTime / 60);
                minuteTime = parseInt(minuteTime % 60) < 10 ? '0' + parseInt(minuteTime % 60) : parseInt(minuteTime % 60);
            }
        }
        this.setData({
            autoTime: '剩余' + hourTime + ':' + minuteTime + ':' + secondTime + '结束'
        })
    },
    formatTimeEnd(s) {
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
        let str = '';
        if (hourTime) {
            str += hourTime + '小时'
        }
        if (minuteTime) {
            str += minuteTime + '分'
        }
        if (secondTime) {
            str += secondTime + '秒'
        }
        this.setData({
            // useTime: [hourTime, minuteTime, secondTime]
            useTime: str
        })
    }
});