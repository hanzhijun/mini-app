let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        height_1875: app.config.height_1875,
        res_data: {},
        location: {},
        collect_id: 0,
        height: app.config.height
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {business_offline_id} = options;
        app.getlocation((e) => {
            this.data.location = e;
            app.post('/business/offlinegetdetailed', {
                business_offline_id
            }, (res) => {

                let {data} = res;
                app.setTitle(data.name);
                data.km = app.addressLimit(data.longitude_latitude.split(','), e);
                this.setData({
                    res_data: data,
                    collect_id: data.collect_id,
                    imgUrls: res.data.img_master
                });
                setTimeout(function () {
                    wx.hideLoading();
                }, 300);
                
            })
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

    // 加入收藏
    joinCollect(e) {

        wx.showLoading();
        let {id} = e.currentTarget.dataset;
        app.post('Car/addmycollect', {
            business_id: id,
            opt: 'business'
        }, (res) => {

            if (res.code == 200) {
                app.alert('收藏成功！');
                this.setData({
                    collect_id: res.data.id
                })
            } else {
                app.alert('收藏失败！');
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
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    openlocation() {

        let {res_data} = this.data;
        app.openlocation(res_data.longitude_latitude);

    }
});