// map
// var QQMapWX = require('qqmap-wx-jssdk.js');
// var qqmapsdk;
const app = getApp();

Page({
    data: {
        busDetail: [],
        host: app.config.host,
        busImg: [],
        busIntroImg: [],
        // dis: "",
        longitude: "",
        latitude: "",
        curLongitude: "",
        curLatitude: "",
        towns: '',
        // 轮播
        indicatorDots: false,
        autoplay: true,
        interval: 5000,
        duration: 1000
    },

    //打电话
    tel: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.busTel
        })
    },

    onLoad: function (e) {

        wx.showLoading();
        let id = wx.getStorageSync('id');
        // 商家详情
        app.post('business/offlinegetdetailed', {
            business_offline_id: id
        }, (res) => {
            let province = res.data.province;
            let city = res.data.city;
            let town = res.data.county;
            this.setData({
                busDetail: res.data,
                busName: res.data.name,
                busTel: res.data.tel,
                busImg: res.data.img_master,
                busIntroImg: res.data.img_publicity,
                retention: res.data.is_retention,
                logo: res.data.logo,
                desc_info: res.data.desc_info,
                logo_path: res.data.logo_path,
                longitude_latitude: res.data.longitude_latitude,
                provinces: app.data.city[province].name,
                citys: app.data.city[province].child[city].name
            });
            let length = app.data.city[province].child[city].child.length;
            if (length != 0) {
                this.setData({
                    towns: app.data.city[province].child[city].child[town].name
                });
            }
            // 设置标题
            wx.setNavigationBarTitle({
                title: this.data.busName
            });

            // 经纬度
            var lalo = this.data.longitude_latitude.split(',');
            this.setData({
                longitude: lalo[0],
                latitude: lalo[1]
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        // 获取当前位置
        // longitude经度 latitude纬度
        var _this = this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                var latitude = res.latitude;
                var longitude = res.longitude;
                _this.setData({
                    curLongitude: longitude,
                    curLatitude: latitude
                });
                // 两地距离
                _this.distance(_this.data.curLatitude, _this.data.curLongitude, +_this.data.latitude, +_this.data.longitude)
            }
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    //计算当前位置到商家位置距离
    distance: function (la1, lo1, la2, lo2) {

        var La1 = la1 * Math.PI / 180.0;
        var La2 = la2 * Math.PI / 180.0;
        var La3 = La1 - La2;
        var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
        s = s * 6378.137;//地球半径
        s = Math.round(s * 10000) / 10000;
        this.setData({
            distance: s.toFixed(2)
        })

    },


    // 点击前往
    goToAdre: function () {

        wx.openLocation({
            latitude: parseFloat(this.data.latitude),
            longitude: parseFloat(this.data.longitude),
            name: this.data.busName,
            scale: 28
        })

    },

    // 判断是否能预约
    retention: function () {

        let retention = this.data.retention;
        if (retention == 1) {
            app.openPage('home/ktv/subscribe/subscribe');
            var name = this.data.busName;
            wx.setStorageSync('name', name);
            var logo = this.data.logo;
            wx.setStorageSync('logo', logo);
            var desc_info = this.data.desc_info;
            wx.setStorageSync('desc_info', desc_info);
            var logo_path = this.data.logo_path;
            wx.setStorageSync('logo_path', logo_path);
        } else {
            wx.showToast({
                title: '该商家不支持预约',
                icon: 'none'
            })
        }

    }

});

