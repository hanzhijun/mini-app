// pages/horizontal-scroll_tab/horizontal-scroll_tab.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ips: [
            {id: "1", title: "甜点饮品", isSelect: true},
            {id: "2", title: "营养沙拉", isSelect: false},
            {id: "3", title: "新鲜水果", isSelect: false},
            {id: "4", title: "精品小吃", isSelect: false},
            {id: "5", title: "旅行", isSelect: false}
        ],
        content: "全部"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * item点击事件
     */
    onIpItemClick: function (event) {

        var id = event.currentTarget.dataset.item.id;
        var curIndex = 0;
        for (var i = 0; i < this.data.ips.length; i++) {
            if (id == this.data.ips[i].id) {
                this.data.ips[i].isSelect = true;
                curIndex = i;
            } else {
                this.data.ips[i].isSelect = false;
            }
        }

        this.setData({
            ips: this.data.ips
        });
    }

});