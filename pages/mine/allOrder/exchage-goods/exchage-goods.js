const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        res: {},
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        category_logo_url: '',
        items: [
            {name: '尺寸拍错/不喜欢/效果', value: '尺寸拍错/不喜欢/效果'},
            {name: '材质问题', value: '材质问题'},
            {name: '做工瑕疵问题', value: '做工瑕疵问题'},
            {name: '颜色/图案花色/款式不符', value: '颜色/图案花色/款式不符'},
            {name: '卖家发错货', value: '卖家发错货'},
            {name: '其他', value: '其他'},
        ],

        type: 'tuikuan',
        aterasale: [],         // 页面显示上传图片
        images: [],           // 传给后台的img
        isShowRadio: 0,        // 是否显示选择框  1: 显示  0：隐藏
        reason: '',           // 退款原因
        desc: '',             // 退款说明
        order_id: '',
        info_id: ''
    },

    onLoad: function (options) {

        wx.showLoading();
        let {type, order_id, info_id} = options;
        let title = type == 'tuikuan' ? "申请退款" : "申请换货"
        let {res} = this.data;
        wx.setNavigationBarTitle({
            title: title
        });

        app.post('Order/returnAfterSaleInfo', {
            order_id,
            info_id
        }, (res) => {
            if (res.code == 200) {
                this.setData({
                    category_logo_url: res.category_logo_url,
                    res: res.data,
                    order_id,
                    info_id
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

    preventTouchMove() {
        return this.data.isShowRadio ? true : false;
    },

    // 图片上传
    upload: function () {

        wx.showLoading();
        let {host, aterasale, images} = this.data;
        let _this = this;
        wx.chooseImage({
            count: 8, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                app.uploadFile({
                    url: 'Myorder/uploadAfterSaleImg',
                    filePath: tempFilePaths[0],
                    name: 'aterasale',
                    formData: {
                        token: wx.getStorageSync('token'),
                        source: 'client',
                    }
                }, (res) => {

                    if (res.code == 200) {
                        var upload = aterasale;
                        upload = app.arrayRemove(upload, 0);
                        upload = tempFilePaths;
                        upload.length % 2 != 0 && upload.push(0);
                        images.push(res.data);
                        _this.setData({
                            aterasale: upload,
                            images
                        });
                    }

                    setTimeout(function () {
                        wx.hideLoading();
                    }, 300);

                })
            }
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 删除图片
    delImage(e) {

        let {index} = e.currentTarget.dataset;
        let {aterasale, images} = this.data;
        aterasale.splice(index, 1);
        images.splice(index, 1);
        this.setData({
            aterasale, images
        })

    },

    // 获取单选结果
    getVal: function (e) {

        this.setData({
            reason: e.detail.value,
            isShowRadio: 0
        })

    },

    // 选择退款|退货原因
    checkRadio: function (event) {

        let type = event.currentTarget.dataset.type;
        this.setData({
            isShowRadio: +type
        })

    },

    // 退款原因
    explain: function (e) {

        this.setData({
            desc: e.detail.value
        })

    },

    submit: function (event) {

        let {desc, reason, order_id, info_id, images, host, type} = this.data;
        if (!desc) {
            return app.alert('请填写退款说明！', 'none');
        } else if (!reason) {
            return app.alert('请选择退款原因！', 'none');
        } else {
            app.post('Order/saveAfterSale', {
                desc, reason, order_id, info_id, aterasale: images
            }, (res) => {
                if (res.code == 200) {
                    app.openPage(`mine/allOrder/submit/submit?type=${type}&order_id=${order_id}&info_id=${info_id}`)
                } else {
                    app.alert(res.info, 'none');
                }
            })
        }

    }

});
