import initAreaPicker, {getSelectedAreaData} from '../../../../template/index';
const app = getApp();

Page({
    data: {
        host: app.config.host,
        history_page: '',
        num: 0,
        areaPicker: {
            show: false
        },
        flag: true,
        defalutVal: 0
    },
    
    onShow: () => {

        initAreaPicker({
            // hideDistrict: true, // 是否隐藏区县选择栏，默认显示
        });

    },

    regionChange: function () {

        this.setData({
            'areaPicker.show': true
        })

    },

    getSelecedData() {

        this.setData({
            flag: false,
            province: getSelectedAreaData()[0].code,
            city: getSelectedAreaData()[1].code,
            town: getSelectedAreaData()[2].code ? getSelectedAreaData()[2].code : 0,
            provinceName: getSelectedAreaData()[0].fullName,
            cityName: getSelectedAreaData()[1].fullName,
            townName: getSelectedAreaData()[2].fullName
        });

    },

    onLoad: function (options) {

        let {history_page} = options;
        this.data.history_page = history_page;
        let city = app.data.city;
        var title = "新增收货人";
        if (options.uid) {
            title = "修改收货人";
            var updateData = wx.getStorageSync('updateReciver');
            let provinceName = '';
            let cityName = '';
            let townName = '';
            if (updateData.province_id == updateData.city_id) {
                provinceName = cityName = city[updateData.province_id].name;
                townName = city[updateData.province_id].child[updateData.county_id].name
            } else {
                provinceName = city[updateData.province_id].name;
                cityName = city[updateData.province_id].child[updateData.city_id].name;
                townName = city[updateData.province_id].child[updateData.city_id].child[updateData.county_id].name
            }

            this.setData({
                flag: false,
                resiverName: updateData.receiver_name,
                resiverPhone: updateData.receiver_phone,
                receiverId: updateData.receiver_id,
                num: updateData.label,
                defalutVal: updateData.default_a,
                detailAdress: updateData.detail_address,
                provinceName,
                cityName,
                townName,
                province: updateData.province_id,
                city: updateData.city_id,
                town: updateData.county_id
            })
        }
        wx.setNavigationBarTitle({
            title: title
        })

    },

    // 获取收货人名称
    resiverName: function (e) {

        this.setData({
            resiverName: e.detail.value
        })

    },

    // 获取收货人电话
    resiverPhone: function (e) {

        this.setData({
            resiverPhone: e.detail.value
        })

    },

    // 获取详细地址
    detailAdress: function (e) {

        this.setData({
            detailAdress: e.detail.value
        })

    },

    // tab切换
    label: function (e) {

        this.setData({
            num: e.target.dataset.num
        })

    },

    // 设为默认
    setDefault: function (e) {

        let defalutVal = e.detail.value[0];
        if (undefined == defalutVal) {
            defalutVal = 0
        }
        else {
            defalutVal = 1
        }
        this.setData({
            defalutVal: defalutVal
        })

    },

    // 保存
    save: function (e) {

        wx.showLoading();
        // 获取参数
        let resiverName = this.data.resiverName;
        let resiverPhone = this.data.resiverPhone;
        let detailAdress = this.data.provinceName + this.data.cityName + this.data.townName + this.data.detailAdress;
        let adress = this.data.detailAdress;
        let province = this.data.province;
        let city = this.data.city;
        let town = this.data.town;
        let num = this.data.num;
        let defalutVal = this.data.defalutVal;
        let receiver_id = this.data.receiverId;
        let {history_page} = this.data;
        // 验证表单提交
        if (resiverName == "" || resiverName == null || resiverName == undefined) {
            wx.showToast({
                title: '请填写姓名',
                icon: 'none'
            })
        } else if (resiverPhone == "" || resiverPhone == null || resiverPhone == undefined) {
            wx.showToast({
                title: '请填写手机号',
                icon: 'none'
            })
        } else if (!(/^1(3|4|5|7|8|9)\d{9}$/.test(resiverPhone))) {
            wx.showToast({
                title: '手机号格式不正确',
                icon: 'none'
            })
        } else if (detailAdress == "" || detailAdress == null || detailAdress == undefined) {
            wx.showToast({
                title: '请填写详细地址',
                icon: 'none'
            })
        }

        // 保存
        app.post('Order/savereceiver', {
            receiver_name: resiverName,
            receiver_phone: resiverPhone,
            receiver_address: detailAdress,
            detail_address: adress,
            province_id: province,
            city_id: city,
            county_id: town,
            label: num,
            default_a: defalutVal,
            receiver_id: receiver_id
        }, (res) => {

            if (res.code == 200) {
                app.alert('保存成功', 'success', () => {
                    app.openPage(`mine/adress/adress?history_page=${history_page}`);
                });
            } else {
                app.alert(res.info, 'none');
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