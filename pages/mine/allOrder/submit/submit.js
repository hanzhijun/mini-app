Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: 'tuikuan',
        info_id: 0,
        order_id: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let {info_id, order_id, type} = options
        this.setData({
            type,
            order_id,
            info_id
        })

    }
});