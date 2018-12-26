// pages/mine/adress/adress.js
const app = getApp();
var tempData = [];

Page({

    /**
     * 页面的初始数据
     */
    data: {
        adressList: [],
        history_page: '',   // order: 去支付页面跳转过来的，修改地址
        type: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {history_page='', type} = options;
        this.setData({
            type: type == undefined ? '' : type
        });
        //地址列表
        app.post('Order/getreceiverlist', {}, (res) => {
            res.data.forEach(function (item, index) {
                tempData[item.receiver_id] = item;
            });
            this.setData({
                adressList: res.data,
                history_page
            });
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    onShow: function () {

        wx.showLoading();
        //地址列表
        app.post('Order/getreceiverlist', {}, (res) => {
            res.data.forEach(function (item, index) {
                tempData[item.receiver_id] = item;
            });
            this.setData({
                adressList: res.data
            });
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    addReciver: function () {

        let {history_page} = this.data;
        app.openPage(`mine/adress/addReciver/addReciver?history_page=${history_page}`);

    },

    //  跳转修改
    updateAdress: function (e) {

        var uid = e.currentTarget.dataset.id;
        var updateData = tempData[uid];
        app.openPage('mine/adress/addReciver/addReciver?uid=' + uid);
        wx.setStorageSync('updateReciver', updateData);

    },

    checkAddress: function (e) {

        let {history_page, adressList, type} = this.data;
        let {index} = e.currentTarget.dataset;
        switch (history_page) {
            case 'order':
                let address = adressList[index];
                wx.setStorageSync('changeAddress', JSON.stringify(address));
                if(type == 'game') {
                    app.openPage(`game/order/order?receiver_id=${address.receiver_id}&receiver_address=${address.receiver_address}&receiver_name=${address.receiver_name}&receiver_phone=${address.receiver_phone}`);
                } else if(type == 'one') {
                    app.openPage(`onebuy/order/order?receiver_id=${address.receiver_id}&receiver_address=${address.receiver_address}&receiver_name=${address.receiver_name}&receiver_phone=${address.receiver_phone}`);
                } else {
                    app.openPage(`shopCart/order/order?receiver_id=${address.receiver_id}&receiver_address=${address.receiver_address}&receiver_name=${address.receiver_name}&receiver_phone=${address.receiver_phone}`);
                }
                break;
        }

    }

});