const app = getApp();
let T;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        loading: 1, // loading加载提示框
        toast: 0, // 提示文字
        title: '刮一刮记录',
        toastTxt: '',
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        operation_pages_id: 10000, // 运营模板id
        list: [],
        goodsList: [], // 商品列表
        active: 0, // 焦点状态nav
        operation_template_area_id: '', // 区域id
        current_page: 1, // 页码
        last_page: '', // 总页码
        per_page: '', // 每页条数
        total: '', // 总商品数
        surplus_goldshells: 0, // 用户拥有的金贝数
        userInfo: {},
        sliverInfo: 0,
        start_x: 0,
        top: 0,
        timestamp: Date.parse(new Date()),
        gamePop:0,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        if (wx.getStorageSync('token')) {
            this.setData({
                gamePop: 1
            });
        }
    },
    openPageTo: function (e) {
        let {jump_data, jump_type} = e.currentTarget.dataset;
        app.openPageTo(jump_data, jump_type);
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this.selectComponent("#loginBox");
        let _this = this;
        if (!wx.getStorageSync('token')) {
            if (that) {
                that.setData({
                    hidden: false
                });
            }
        } else {
            if (that) {
                that.setData({
                    hidden: 'hidden',
                });
            }
            _this.init();
        }
    },
    init: function () {
        app.getlocation((e) => {
            this.setData({
                location: e
            })
        });
        this.setData({
            loading: 1
        });
        this.homepage();
        this.getIconNum();
    },
    homepage: function () {
        app.post('operation/homepage', {}, (res) => {
            if (res.code = 200) {
                this.setData({
                    list: res.data,
                    goodsList: res.data[8].data.data,
                    loading: 0,
                    operation_template_area_id: res.data[8].operation_template_area_id,
                    operation_pages_id: res.data[8].operation_pages_id,
                    current_page: res.data[8].data.current_page,
                    last_page: res.data[8].data.last_page,
                    total: res.data[8].data.total,
                    per_page: res.data[8].data.per_page
                })
            }
        });
    },
    getgoodslist: function () {
        var _this = this;
        let {operation_template_area_id, operation_pages_id, current_page} = _this.data;
        let {operation_area_category_id} = "";
        wx.removeStorageSync('operation_template_area_id');
        app.post('Operation/getgoodslist', {
            operation_area_category_id: operation_area_category_id,
            operation_pages_id: operation_pages_id,
            operation_template_area_id: operation_template_area_id,
            page: current_page
        }, (res) => {
            let {current_page, last_page, per_page, total, data} = res.data;
            let {goodsList} = _this.data;
            for (let i = 0; i < data.length; i++) {
                goodsList.push(data[i]);
            }
            _this.setData({
                current_page,
                last_page,
                per_page,
                total,
                goodsList
            });
        })
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        let that = this.selectComponent("#loginBox");
        if (!wx.getStorageSync('token')) {
            if (that) {
                that.setData({
                    hidden: false
                });
            }
        } else {
            if (that) {
                that.setData({
                    hidden: 'hidden'
                });
            }
            this.init();
        }
        wx.stopPullDownRefresh();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {current_page, last_page} = this.data;
        if (current_page < last_page) {
            this.setData({
                current_page: current_page + 1
            });
            this.getgoodslist(current_page + 1);
        }
    },
    /**
     * 获取金贝银贝数量
     */
    getIconNum(){
        app.post('User/detial', {}, (res) => {
            if (res.data.length != 0) {
                this.setData({
                    userInfo: res.data.user_info,
                    sliverInfo: res.data.user_info.surplus_silvershells + res.data.user_info.surplus_business_silvershells,
                    surplus_goldshells: res.data.user_info.surplus_goldshells
                })
            }
        });
    },
    /**
     * 滚动设置
     */
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
    toFixed2: function (num) {
        return num.toFixed(2) * 1;
    },
    /**
     * 登录成功回执
     */
    loginevent: function (e) {
        this.init();
        this.setData({
          gamePop:1
        })
    },

    gotoGame: function() {
      app.openPage('onebuy/oneList/oneList');  // 刮一刮
      this.setData({
        gamePop: 0
      })
    },

    closeGamePop: function () {
        this.setData({
          gamePop:0
        })
      },

    openGame: function () {
        // app.openPage('game/index');  // 刮一刮
        // app.openPage('index/scanPay/scanPay?business_offline_id=528&business_name=指间炫丽美甲店');
        // wx.redirectTo({
        //     url: 'pages/shopCart/goodsDetail/goodsDetail?gid=11910&type=0'
        // });
        // app.openPage('onebuy/oneList/oneList');
    },
    /**
     * 分享
     * @param res
     * @returns {{title: string, path: string, imageUrl: string, success: success}}
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {}
        // 分享收集接口
        app.post('game/shareCount', {
            is_page: 0
        }, (res) => {
        });
        let {
            userInfo
        } = this.data;
        return {
            title: '贝划算，开始划算生活',
            path: `pages/index/index`,
            imageUrl: '',
            success: function () {}
        }
    }
});