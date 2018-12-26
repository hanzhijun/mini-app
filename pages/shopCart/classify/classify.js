const {config} = getApp();
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        res: {
            parent_id: 0
        },
        imgUrl: app.config.imgUrl,
        host: config.host,
        current: 1,
        classify: [],
        classify_1: [],
        type: 0 // -1：金贝专区 1：银贝专区  0 // 首页
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let _this = this;
        let {type, cid = 0} = options;
        app.post('goods/category/getinfo', {}, (res) => {

            let data = res.data;
            let classify_1 = [];
            if (cid == 0) {
                cid = data[0].cid;
                classify_1 = data[0].data
            } else {
                for (let classify of data) {
                    if (classify.cid == cid) {
                        classify_1 = classify.data;
                        break;
                    }
                }
            }

            _this.setData({
                classify: res.data,
                current: cid,
                classify_1,
                type
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    getClassify: function (e) {

        let {dataset} = e.target;
        this.setData({
            classify_1: dataset.data,
            current: dataset.cid
        });

    }

});