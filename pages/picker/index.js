import initAreaPicker, {getSelectedAreaData} from '../../template/index';

Page({
    data: {
        areaPicker: {
            show: false
        },
        arr: [
            {code: "340000", fullName: "安徽省", fullNameDot: "安徽省"},
            {code: "340100", fullName: "合肥市", fullNameDot: "合肥市"},
            {code: "340104", fullName: "蜀山区", fullNameDot: "蜀山区"}
        ]
    },
    onShow: () => {
        initAreaPicker({
            // hideDistrict: true, // 是否隐藏区县选择栏，默认显示
        });
    },

    check: function () {
        this.setData({
            'areaPicker.show': true
        })
    },

    getSelecedData() {
        this.setData({
            arr: getSelectedAreaData()
        });
    }
});
