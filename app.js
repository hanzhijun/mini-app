const QQMapWX = require('./lib/qqmap-wx-jssdk.min.js');
App({

    onShow: function () {
        if (!this.data.qqmapsdk) {
            this.data.qqmapsdk = new QQMapWX({
                key: this.config.qqsdk_key
            })
        }
    },

    // 初始化配置
    config: {
        vision: 'V2.4.2',
        qqsdk_key: 'HZFBZ-QLUCF-BYVJZ-N5Y6J-ELEZO-4CFPQ',
        height: wx.getSystemInfoSync().windowWidth,               // swiper 高度:宽度  1:1
        w_height: wx.getSystemInfoSync().windowHeight,            // 可视区域高度
        height_1875: wx.getSystemInfoSync().windowWidth / 1.875,  // 线下商家7.5:4
        host: 'https://api.duishangbao.cn', // 线上
        // host: 'https://api.duishangbao.net', // 测试线
        // host: 'http://192.168.100.200',    // 本地
        imgUrl: 'https://img.duishangbao.cn',
        imgAli: 'https://bhs-duishangbao.oss-cn-shenzhen.aliyuncs.com',
        category_logo_url: '',            // 图片拼接路径
        activity_host: 'https://img.duishangbao.cn/upload/activity', // 活动图片地址
        game_host:'https://img.duishangbao.cn/upload/game', //摇骰子活动地址

        order_status: {                   // 订单状态
            all: {name: '所有订单'},
            dpay: {name: '待付款', button: [1, 2]},
            dtake: {name: '待发货', button: [3]},
            dcollect: {name: '待收货', button: [4, 5]},
            finish: {name: '已完成', button: [3]},
            aftersale: {name: '售后', button: [3]}
        },

        btns: {                           // 按钮状态
            1: '取消订单',
            2: '立即付款',
            3: '查看详情',
            4: '查看物流',
            5: '确认收货',
            7: '重新购买',
            8: '申请售后'
        },

        location: {},        // 自己的定位信息

        pages_name: ''
    },

    data: {
        max_page: 10,
        city: {},
        qqmapsdk: '',
        templateId: '',
        operation_pages_id: ''
    },

    onLaunch: function () {
        let _this = this;
        wx.request({
            url: `https://api.duishangbao.cn/city.js`,
            success: function (res) {
                _this.data.city = res.data;
            }
        })
    },


    // 格式化时间
    // @type   type: num 返回时间戳    type: date  时间
    formatTime: function (d, type) {
        let date = new Date(d * 1000);

        const formatNumber = n => {
            n = n.toString();
            return n[1] ? n : '0' + n
        };

        if (type == 'num') {
            return parseInt(new Date(d).getTime() / 1000);
        } else {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
        }
    },

    // 处理立即购买 || 未付款 转给后台的参数
    // 原因：之前的方式  如果商品gid相同，不能区分
    // [[gid, 规格id, 规格]]
    formatGinfo: function (gid, spec_id) {
        let arr = spec_id;
        for (let i = 0, len = gid.length; i < len; i++) {
            arr[i].unshift(gid[i])
        }

        return arr;
    },

    // 秒转换成 [天，时，分，秒]
    secondsFormat(s) {
        var day = Math.floor(s / (24 * 3600)); // Math.floor()向下取整
        var hour = Math.floor((s - day * 24 * 3600) / 3600);
        var minute = Math.floor((s - day * 24 * 3600 - hour * 3600) / 60);
        var second = s - day * 24 * 3600 - hour * 3600 - minute * 60;
        return [day, hour, minute, second];
    },

    // 微信登录调用该接口
    getUserInfo: function (success, error) {
        let _this = this;

        wx.login({
            success: function (res) {
                // 获取bhs
                if (res.code) {
                    _this.post('User/returnWXCode', {
                        js_code: res.code
                    }, (res) => {
                        let bhs = res.data.bhs;
                        wx.setStorageSync('bhs', bhs);
                        // 获取用户信息
                        wx.getUserInfo({
                            success: function (userInfo) {
                                let {encryptedData, iv} = userInfo;
                                _this.post('User/userregistorupdate', {
                                    source: 'client',
                                    encryptedData,
                                    iv,
                                    bhs
                                }, () => {
                                    _this.alert('授权成功', 'success');

                                    _this.setStorageSync({rawData: userInfo.rawData});
                                    success && success(userInfo.rawData);
                                }, (e) => {
                                    _this.alert('授权失败', 'none');
                                    error && error(e);
                                })
                            },
                            fail: function (e) {
                                _this.alert('用户拒绝授权', 'none');
                                error && error(e);
                            }
                        })

                    })
                }
            }
        });
    },

  /**
   * @url  跳转地址   根目录 pages
   */
  openPage: function (url, close) {
    if (!url) return;
    // 套餐首页（以前商家店铺页面）
    if (url.indexOf('offlineBusinessB/offlineBusinessB') > -1 || url.indexOf('offlineBusinessA/offlineBusHome') > -1) {
      url = `taocan/home/home?${url.split('?')[1]}`
    }
    url = `pages/${url}`;
    console.log(url);
    var pages = getCurrentPages(),  //页面栈
      len = pages.length,
      dlt = '',
      max_page = this.data.max_page,
      target = '/' + url.replace(/^\//, '');

        if (close) return wx.redirectTo({
            url: target
        });

        for (var i = 0; i < len; i++) {
            var zhan_url = "/" + pages[i].route;
            if (zhan_url.indexOf(target.split('?')[0]) != -1) {
                dlt = i + 1;
                break;
            }
        }

        //页面不在栈中
        if (!dlt) {
            if (len < max_page) {
                wx.navigateTo({
                    url: target
                });
            } else {
                wx.redirectTo({
                    url: target
                });
            }
        } else {
            wx.navigateBack({
                delta: len - dlt
            });
        }
    },

    /**
     * 新版跳转页面设置
     * @jump_type 1.不跳转  2.h5  3.商品  4.区域  5.pgc页面  6.商品分类  7.运营位模板
     *
     * 10001首页、10002附近、10003A模板、10004B模板、10005C模板、10006D模板、10007E模板、10008F模板
     */
    openPageTo: function (jump_data, jump_type) {
        var app = getApp();

        if (jump_type == 2) {
            wx.navigateTo({url: '/pages/web-view/web-view?url=' + decodeURIComponent(jump_data)});
        } else if (jump_type == 3) {
            app.openPage('shopCart/goodsDetail/goodsDetail?gid=' + jump_data);
        } else if (jump_type == 4) {
            app.openPage(jump_data);
        } else if (jump_type == 5) {
            wx.setStorageSync('pgcTemplateId', jump_data);
            wx.navigateTo({url: '/pages/web-view/web-view?url=' + decodeURIComponent('https://www.bei-huasuan.cn/template-web/html/template.html?id=' + jump_data)});
        } else if (jump_type == 6) {
            app.openPage('shopCart/classify/classify?cid=' + jump_data + '&type=0');
        } else if (jump_type == 7) {
            let operation_pages_id = jump_data.split('_')[0];
            let operation_pages_type = jump_data.split('_')[1];

            let temp = ['templateOne', 'templateTwo', 'templateThree', 'templateFour', 'templateFive', 'templateSix'];
            let type = [10003, 10004, 10005, 10006, 10007, 10008];
            for (var i = 0; i < type.length; i++) {
                if (operation_pages_type == type[i]) {
                    var text = temp[i];
                    app.openPage('newIndex/' + text + '/' + text + '?id=' + operation_pages_id);
                    break;
                }
            }
        } else if(jump_type == 8) {
            app.openPage('index/classify/classify?goods_category_id=' + jump_data);
        }
    },

    // 返回上一级页面
    returnPage: function () {
        // var pages = getCurrentPages();
        // console.log(pages)
        // wx.navigateBack({
        //   delta: 0
        // })
    },

    /**
     * @content
     * @title     可不传
     * @fn        确定：false，取消：true
     */
    confirm: function (content, fn) {
        wx.showModal({
            content: content,
            confirmColor: '#f75d45',
            success: function (e) {
                fn && fn(e.cancel);
            },
            error: function (e) {
                fn && fn(e.cancel);
            }
        })
    },

    get: function (url, data, successs, error) {
        this.request({
            url,
            data,
            method: 'GET',
            success: (data) => {
                success && success(data);
            },
            error: (e) => {
                error && error(data);
            }
        })
    },

    post: function (url, data, successs, error) {
        this.request({
            url,
            data,
            method: 'POST',
            success: (res) => {
                successs && successs(res);
            },
            error: (e) => {
                error && error(e);
            }
        })
    },

    /**
     * 请求数据
     * json.url       接口地址
     * json.data      数据
     * json.method    请求方式
     * json.success   成功回调
     * json.error     失败
     */
    request: function (json) {

        let {url, data, method, success, error} = json;
        url = url.replace(/^\//, '');
        let token = wx.getStorageSync('token');
        token && (data.token = token);

        !data.source && (data.source = 'client');
        let _this = this;
        wx.request({
            url: `${this.config.host}/${url}`,
            data: data,
            method: method,
            success: function (res) {
                if (res.data.code == '1010') {
                    console.log(res.data.info);
                    wx.removeStorageSync('token');
                } else {
                    // 有token就保存token
                    let {token} = res.data;
                    token && _this.setStorageSync({token});
                    success && success(res.data);
                }
              wx.hideLoading();
            },
            // 失败
            fail: function (e) {
                wx.hideLoading();
                error && error(e);
            }
        })
    },

    /**
     * 弹窗
     * @title
     * @icon  success || loading || none
     */
    alert: function (title, icon, fn) {
        wx.showToast({
            title: title,
            icon: icon,
            duration: 2000,
            complete: () => {
                setTimeout(() => {
                    fn && fn();
                }, 2000)
            }
        })
    },

    uploadFile: function (json, success, fail) {
        let {url, filePath, formData, name} = json;
        let _this = this;
        let token = wx.getStorageSync('token');
        token && (formData.token = token);

        // formData.token = 'will';
        formData.source && (formData.source = 'client');
        wx.uploadFile({
            url: `${this.config.host}/${url}`,
            filePath,
            name,
            formData,
            success: function (res) {
                let data = JSON.parse(res.data);
                // 有token就保存token
                let token = data.token;
                token && _this.setStorageSync({token});
                success && success(data);
            },
            fail: function (e) {
                fail && fail(e);
            }
        })
    },

    /**
     * 本地存储   {key:value}
     */
    setStorageSync: function (json) {
        for (let key in json) {
            wx.setStorageSync(key, json[key]);
        }
    },

    // 清空本地存储数据 不包括 token
    clearStorageSync: function () {
        let {keys} = wx.getStorageInfoSync();
        let notClear = ['token', 'rawData', 'bhs'];
        for (let s of keys) {
            if (notClear.indexOf(s) > -1) continue;
            wx.removeStorageSync(s);
        }
    },

    // 处理图片地址
    spliceImg: function (a, b) {
        return `${this.config.host}/${a}${b}`
    },

    getTime: function () {
        return parseInt(new Date().getTime() / 1000)
    },

    getlocation(fn) {
        wx.getLocation({
            type: 'wgs84',
            altitude: true,
            success: function (res) {
                fn && fn(res);
            }
        })
    },

    // 获取中文地址(解析过后的)
    getaddress(fn) {
        let {qqmapsdk} = this.data;
        qqmapsdk.reverseGeocoder({
            success: (res) => {
                fn && fn(res.result);
            }
        })
    },

    // 计算两点之前距离
    addressLimit(arr, res) {
        if (!arr || !res) return 0;
        let [lo1, la1] = arr;
        let la2 = res.latitude;
        let lo2 = res.longitude;
        var La1 = la1 * Math.PI / 180.0;
        var La2 = la2 * Math.PI / 180.0;
        var La3 = La1 - La2;
        var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
        s = s * 6378.137;//地球半径
        s = Math.round(s * 10000) / 10000;
        return s.toFixed(2);
    },

    // 点击前往
    openlocation(str) {
        let address = str.split(',');
        wx.openLocation({
            latitude: +address[1],
            longitude: +address[0],
        })
    },

    // 设置title
    setTitle(name) {
        wx.setNavigationBarTitle({
            title: name
        })
    },

    // 轮播图跳转
    swiperOpen(type, id, url) {
        if (type == 1) {      // web;
            this.openPage(`webH5/webH5?url=${url}`);
        } else if (type == 2) {   // 商品
            this.openPage(`shopCart/goodsDetail/goodsDetail?gid=${id}`);
        } else if (type == 3) {   // 区域
            return '';
        } else if (type == 5) {   // 图文内容

        } else {                  // 不跳转
            return '';
        }
    },

    // 分享方法
    shareArgs(e_data, share) {
        let shareImg = wx.getStorageSync('shareImg');
        let shareTitle = wx.getStorageSync('shareTitle');
        let title = '嗨，朋友，帮我捞一下，我有金贝送给你！';
        let imageUrl = '/images/share/share.jpg';
        if(share == 'shareImg' && shareImg && shareTitle) {
            title = shareTitle;
            imageUrl = shareImg;
        }
        let _this = this;
        return {
            title,
            path: `pages/shareBuy/shareBuy?e_data=${e_data}`,
            imageUrl,
            success: function () {
                _this.post('share/changestatus', {
                    order_id: e_data
                }, () => {
                    _this.openPage('shareBuy/shareBuy?e_data=' + e_data);
                })
            }
        }
    },

    /**
     * data中添加 show字段，用于图片懒加载
     * @param data
     * @returns {Array}
     */
    insertDataImgState(data) {
        let n_data = [];
        for (let i = 0; i < data.length; i++) {
            data[i]['show'] = 0;
            n_data.push(data[i]);
        }
        return n_data;
    },

    /* 以下为运营区域公用方法 */
    // 获取页面属性
    getPagesOpt(pages_id, fn) {
        var app = getApp();
        let operation_pages_id = pages_id || 10000; // 首页默认10000
        let _this = this;
        this.post('Operation/returnPagesOption', {
            operation_pages_id
        }, (res) => {
            let {data} = res;
            app.config.pages_name = data[0].pages_name;
            let jsonData = {};
            let len = data.length;
            for (let i = 0; i < len; i++) {
                _this.getOptData(data[i], data => {
                    jsonData[i] = data;
                    len--;
                    len == 0 && fn && fn(jsonData);
                });
            }
        })
    },

    // 获取区域内容
    getOptData(opt, fn){
        if (opt.type == 5 || opt.type == 6 || opt.type == 7) {
            wx.setStorageSync('operation_template_area_id', opt.operation_template_area_id);
            this.post('operation/getareacategorylist', opt, res => {
                res.code == 200 && fn && fn(res.data)
            })
        } else {
            this.post('operation/getcontentlist', opt, res => {
                res.code == 200 && fn && fn(res.data)
            })
        }
    },
    /**
     * 移除数组中的元素
     * [1,2].remove(1) =>  [2]
     */
    arrayRemove(arr, val) {
        return arr.filter((value) => {
            return val != value;
        })
    },

    /**
     * toast提示弹窗
     * @param that
     * @param text 提示文案
     * @param time 弹窗展示时间 秒
     */
    showToast(that, text, time){
        let _this = that;
        _this.setData({
            toast: 1,
            toastTxt: text
        });
        setTimeout(function () {
            _this.setData({
                toast: 0,
                toastTxt: ''
            });
        }, !time ? 3000 : time * 1000)
    }
});

/**
 *  时间戳（毫秒）转时间
 * new Date(1232133).formate('yyyy-MM-dd');
 */
Date.prototype.format = function (format) {
    var args = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds()
    };
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var i in args) {
        var n = args[i];
        if (new RegExp("(" + i + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
    }
    return format;
};

/**
 * wx.getUpdateManager 在 1.9.90 才可用，请注意兼容
 * 异步更新 + 强制更新
 */
const updateManager = wx.getUpdateManager();

updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    // console.log(res.hasUpdate)
});

updateManager.onUpdateReady(function () {
    wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否马上重启小程序？',
        success: function (res) {
            if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
            }
        }
    })
});

updateManager.onUpdateFailed(function () {
    // 新的版本下载失败
    console.log('新的版本下载失败');
});
