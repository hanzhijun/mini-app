// pages/home/ktv/ktv.js
const app = getApp();
let tempPage = 1;
let lastPage = 1;
let tempData = [];

Page({
    /**
     * 页面的初始数据
     */
    data: {
        list: {},
        province: {},
        city: {},
        county: {},
        hideBottom: true,
        loadMoreData: '加载更多……'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (e) {

        tempLoad(this, tempPage);

    },

    // 存储id
    saveId: function (e) {

        var id = e.currentTarget.id;
        wx.setStorageSync('id', id);

    },

    // 加载更多,刷新
    onPullDownRefresh: function () {

        tempPage = 1;
        tempData = [];
        wx.stopPullDownRefresh();//停止刷新
        this.setData({
            loadMoreData: '加载更多……',
            hideBottom: true
        });
        tempLoad(this, tempPage);

    },
    onReachBottom: function () {

        if (tempPage == lastPage) {
            this.setData({
                loadMoreData: '没有数据了',
                hideBottom: false
            });
            return false;
        }
        this.setData({
            hideBottom: false
        });
        tempPage++;
        tempLoad(this, tempPage);

    }

});

function tempLoad(temp, tempPage) {

    wx.showLoading();
    // 商家列表
    app.post('business/offlinegetlist', {
        page: tempPage
    }, (res) => {

        if (tempData.length > 0) {
            setTimeout(function () {
                temp.setData({
                    hideBottom: true
                });
                data(temp, res);
            }, 1000)
        } else {
            data(temp, res);
        }

        setTimeout(function () {
            wx.hideLoading();
        }, 300);

    });

    setTimeout(function () {
        wx.hideLoading();
    }, 3000);

}

function data(temp, res) {

    for (var i = 0; i < res.data.data.length; i++) {
        tempData.push(res.data.data[i]);
    }
    res.data.data = tempData;
    lastPage = res.data.last_page;
    tempPage = res.data.current_page;
    temp.setData({
        list: res.data
    })

}