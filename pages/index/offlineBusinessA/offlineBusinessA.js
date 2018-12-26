const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        height: app.config.height,
        indicatorDots: true,
        autoplay: false,
        interval: 5000,
        duration: 1000,
        package_id: 0,
        location: {},
        toView: 'detail',
        res_data: {},
        collect_id: 0
    },

    toview(e) {

        let {msg} = e.currentTarget.dataset;
        this.setData({
            toView: msg
        })

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {package_id} = options;
        let {res_data} = this.data;
        app.getlocation((e) => {

            app.post('/package/packagedetail', {
                package_id
            }, (res) => {

                if (res.code == 200) {
                    res_data = res.data;
                    res_data.km = app.addressLimit(res.data.longitude_latitude.split(','), e);
                    this.setData({
                        res_data: res_data,
                        package_id,
                        collect_id: res_data.collect_id
                    })
                }

                setTimeout(function () {
                    wx.hideLoading();
                }, 300);

            });

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    callPhone(e) {

        let {tel} = e.currentTarget.dataset;
        wx.makePhoneCall({
            phoneNumber: tel
        })

    },

    openPage(e) {

        let {type, id} = e.currentTarget.dataset;
        if (type == 'business') {
            app.openPage(`index/offlineBusinessA/offlineBusHome/offlineBusHome?business_id=${id}`)
        } else {

        }

    },


    // 加入收藏
    joinCollect(e) {

        wx.showLoading();
        let {id} = e.currentTarget.dataset;
        app.post('Car/addmycollect', {
            package_id: id,
            opt: 'package'
        }, (res) => {

            if (res.code == 200) {
                app.alert('收藏成功！');
                this.setData({
                    collect_id: res.data.id
                })
            } else {
                app.alert('收藏失败！', 'none');
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 删除收藏
    deleteCollect() {

        wx.showLoading();
        let {collect_id} = this.data;
        app.post('Car/delCollectGoodsById', {
            midarr: [collect_id]
        }, (res) => {

            if (res.code == 200) {
                this.setData({
                    collect_id: 0
                })
            } else {
                app.alert('取消收藏失败！', 'none');
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    }

});